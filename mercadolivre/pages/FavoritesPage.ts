import type { Locator, Page } from '@playwright/test';
import { MELI_BASE_URL, MELI_FAVORITES_PATH, redact } from '../utils/env';
import { firstVisible, isHiddenWithin, isVisibleWithin } from '../utils/locators';
import { BasePage, SessionRequiredError } from './BasePage';

/**
 * Área de Favoritos ("Meus favoritos" / bookmarks).
 *
 * A rota `/bookmarks` foi confirmada na investigação: responde 403 para visitante
 * anônimo (rota existente e protegida) enquanto rotas inexistentes respondem 404.
 * Como fallback de descoberta, `openViaHeader()` navega pelo menu do cabeçalho
 * ("Favoritos" → "Ver todos os favoritos e listas"), que é o fluxo real do usuário.
 */
export class FavoritesPage extends BasePage {
  private static readonly DEFAULT_TIMEOUT = 30_000;

  constructor(page: Page) {
    super(page, MELI_FAVORITES_PATH);
  }

  override async open(): Promise<void> {
    await super.open();
    await this.waitForLoaded();
  }

  /** Alternativa ao link direto: descoberta via interface do cabeçalho. */
  async openViaHeader(): Promise<void> {
    await this.page.goto(MELI_BASE_URL, { waitUntil: 'domcontentloaded' });
    await this.acceptCookieConsent();
    await this.ensureAuthenticatedSession();

    const headerEntry = this.page
      .getByRole('link', { name: /^favoritos$/i })
      .or(this.page.getByRole('button', { name: /^favoritos$/i }))
      .first();
    await headerEntry.waitFor({ state: 'visible', timeout: FavoritesPage.DEFAULT_TIMEOUT });
    await headerEntry.hover();

    const seeAll = this.page
      .getByRole('link', { name: /ver todos os favoritos|todos os favoritos e listas/i })
      .first();
    await seeAll.waitFor({ state: 'visible', timeout: FavoritesPage.DEFAULT_TIMEOUT });
    await seeAll.click();
    await this.waitForLoaded();
  }

  async waitForLoaded(): Promise<void> {
    const loaded = this.page
      .getByRole('heading', { name: /favoritos/i })
      .first()
      .or(this.page.getByText(/ainda n[ãa]o (tem|possui|adicionou).*favoritos/i).first())
      .or(this.itemLinkById('MLB').first());

    const visible = await isVisibleWithin(loaded, FavoritesPage.DEFAULT_TIMEOUT);
    if (!visible) {
      if (await this.isLoginScreen()) {
        throw new SessionRequiredError(
          'A área de Favoritos exigiu login. Gere a sessão com "npm run auth:save" usando a mesma conta do token OAuth.',
        );
      }
      throw new Error(
        'A área de Favoritos não carregou: nenhum título, estado vazio ou item foi localizado. ' +
          'Verifique a rota atual e os seletores com "npm run ui:inspect".',
      );
    }
    console.log(redact(`[UI] Área de Favoritos carregada: ${this.page.url()}`));
  }

  /**
   * Link do produto na listagem. O item id aparece na própria URL do anúncio,
   * por isso o atributo href é o identificador mais estável (CSS como fallback justificado).
   */
  itemLinkById(itemId: string): Locator {
    return this.page.locator(`a[href*="${itemId}"]`);
  }

  async isItemVisible(itemId: string, timeout = FavoritesPage.DEFAULT_TIMEOUT): Promise<boolean> {
    return isVisibleWithin(this.itemLinkById(itemId).first(), timeout);
  }

  async getVisibleItemTitles(): Promise<string[]> {
    const links = this.page.getByRole('main').getByRole('link');
    const texts = await links.allInnerTexts();
    return texts.map((text) => text.trim()).filter((text) => text.length > 0);
  }

  async openItemById(itemId: string): Promise<void> {
    const link = this.itemLinkById(itemId).first();
    await link.waitFor({ state: 'visible', timeout: FavoritesPage.DEFAULT_TIMEOUT });
    await link.click();
    await this.page.waitForURL(new RegExp(itemId), { timeout: FavoritesPage.DEFAULT_TIMEOUT });
    console.log(redact(`[UI] Anúncio aberto a partir dos Favoritos: ${this.page.url()}`));
  }

  /**
   * Remove um favorito pela interface.
   * O controle "Excluir" aparece no hover do cartão do produto, por isso o hover é parte do fluxo.
   */
  async removeItemById(itemId: string, timeout = FavoritesPage.DEFAULT_TIMEOUT): Promise<void> {
    const link = this.itemLinkById(itemId).first();
    await link.waitFor({ state: 'visible', timeout });
    await link.hover();

    const removeControls = this.page
      .getByRole('button', { name: /^(excluir|remover)(\s+dos\s+favoritos)?$/i })
      .or(this.page.getByRole('link', { name: /^(excluir|remover)(\s+dos\s+favoritos)?$/i }))
      .or(this.page.locator('button[aria-label*="Excluir dos favoritos" i]'));

    const target = await firstVisible(removeControls);
    if (!target) {
      throw new Error(
        'Não foi possível localizar o controle "Excluir" na área de Favoritos. ' +
          'Rode "npm run ui:inspect" para registrar os rótulos reais dos controles.',
      );
    }

    await target.click();

    if (!(await isHiddenWithin(this.itemLinkById(itemId).first(), 10_000))) {
      const confirm = this.page
        .getByRole('button', { name: /^(sim|excluir|remover|confirmar)$/i })
        .first();
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
      }
      const removed = await isHiddenWithin(this.itemLinkById(itemId).first(), timeout);
      if (!removed) {
        throw new Error(`O anúncio ${itemId} continuou visível na área de Favoritos após a exclusão.`);
      }
    }
    console.log(`[UI] Favorito ${itemId} removido pela interface.`);
  }

  async isEmpty(): Promise<boolean> {
    const emptyState = this.page.getByText(/ainda n[ãa]o (tem|possui|adicionou).*favoritos/i).first();
    return emptyState.isVisible().catch(() => false);
  }
}
