import type { Locator, Page } from '@playwright/test';
import { MELI_CART_PATH, redact } from '../utils/env';
import { firstVisible, isHiddenWithin, isVisibleWithin } from '../utils/locators';
import { BasePage, SessionRequiredError } from './BasePage';

/**
 * Carrinho de compras.
 *
 * Rota `/gz/cart` confirmada na investigação: visitante anônimo recebe redirect 302
 * para /jms/mlb/lgz/login?go=.../gz/cart (rota existente e protegida).
 *
 * IMPORTANTE: este Page Object só adiciona/remove itens. Não há método de checkout,
 * "Comprar agora" ou finalização de pedido — fora do escopo do projeto.
 */
export class CartPage extends BasePage {
  private static readonly DEFAULT_TIMEOUT = 30_000;

  constructor(page: Page) {
    super(page, MELI_CART_PATH);
  }

  override async open(): Promise<void> {
    await super.open();
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    const loaded = this.page
      .getByRole('heading', { name: /carrinho/i })
      .first()
      .or(this.page.getByText(/seu carrinho est[áa] vazio|esvaziar carrinho/i).first())
      .or(this.itemLinkById('MLB').first());

    const visible = await isVisibleWithin(loaded, CartPage.DEFAULT_TIMEOUT);
    if (!visible) {
      if (await this.isLoginScreen()) {
        throw new SessionRequiredError(
          'O carrinho exigiu login. Gere a sessão com "npm run auth:save" usando a mesma conta do token OAuth.',
        );
      }
      throw new Error('A página do carrinho não carregou nenhum título, estado vazio ou item.');
    }
  }

  itemLinkById(itemId: string): Locator {
    return this.page.locator(`a[href*="${itemId}"]`);
  }

  async isItemVisible(itemId: string, timeout = CartPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return isVisibleWithin(this.itemLinkById(itemId).first(), timeout);
  }

  async containsText(text: string, timeout = 10_000): Promise<boolean> {
    return isVisibleWithin(this.page.getByText(text, { exact: false }).first(), timeout);
  }

  async getVisibleItemTitles(): Promise<string[]> {
    const links = this.page.getByRole('main').getByRole('link');
    const texts = await links.allInnerTexts();
    return texts.map((text) => text.trim()).filter((text) => text.length > 0);
  }

  /** Remove o item do carrinho pela interface (limpeza do cenário, sem finalizar compra). */
  async removeItemById(itemId: string, timeout = CartPage.DEFAULT_TIMEOUT): Promise<void> {
    const link = this.itemLinkById(itemId).first();
    await link.waitFor({ state: 'visible', timeout });
    await link.hover();

    const removeControls = this.page
      .getByRole('button', { name: /^(excluir|remover|remover item)$/i })
      .or(this.page.getByRole('button', { name: /excluir|remover/i }))
      .or(this.page.locator('button[aria-label*="Excluir" i]'));

    const target = await firstVisible(removeControls);
    if (!target) {
      console.log('[UI] Controle "Excluir" não localizado no carrinho; a limpeza será registrada como pendente.');
      return;
    }

    await target.click();

    if (!(await isHiddenWithin(this.itemLinkById(itemId).first(), 10_000))) {
      const confirm = this.page.getByRole('button', { name: /^(sim|excluir|remover|confirmar)$/i }).first();
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      }
    }

    const removed = await isHiddenWithin(this.itemLinkById(itemId).first(), timeout);
    console.log(
      redact(
        removed
          ? `[UI] Item ${itemId} removido do carrinho.`
          : `[UI] Item ${itemId} não pôde ser removido automaticamente do carrinho.`,
      ),
    );
  }

  async isEmpty(): Promise<boolean> {
    const emptyState = this.page.getByText(/seu carrinho est[áa] vazio/i).first();
    return emptyState.isVisible().catch(() => false);
  }
}
