import type { Locator, Page } from '@playwright/test';
import { MELI_BASE_URL, redact } from '../utils/env';
import { isVisibleWithin } from '../utils/locators';
import { BasePage, SessionRequiredError } from './BasePage';

/**
 * Página de anúncio (produto).
 *
 * Seletores: o rótulo acessível dos botões de favorito foi confirmado no bundle
 * de i18n público do Mercado Livre ("Adicionar aos favoritos" / "Excluir dos favoritos").
 * O CSS com `aria-label` é usado apenas como fallback do mesmo controle.
 */
export class ProductPage extends BasePage {
  private static readonly DEFAULT_TIMEOUT = 20_000;

  constructor(page: Page) {
    super(page, '/');
  }

  private favoriteToggle(active: boolean): Locator {
    const accessibleName = active
      ? /(excluir|remover)\s+(dos\s+)?favoritos?/i
      : /(adicionar|incluir)\s+(aos\s+)?favoritos?|favoritar/i;
    const cssFallback = active
      ? 'button[aria-label*="Excluir dos favoritos" i], button[aria-label*="Remover dos favoritos" i]'
      : 'button[aria-label*="Adicionar aos favoritos" i]';

    return this.page
      .getByRole('button', { name: accessibleName })
      .or(this.page.locator(cssFallback));
  }

  /**
   * Resolve a URL do anúncio a partir do item id.
   * 1) catálogo: /p/{ITEM_ID}  2) anúncio direto: produto.mercadolivre.com.br/{ITEM_ID}
   * A tentativa alternativa só ocorre quando a primeira não renderiza o título.
   */
  async openItem(itemId: string): Promise<void> {
    const candidates = [`${MELI_BASE_URL}/p/${itemId}`, `https://produto.mercadolivre.com.br/${itemId}`];
    let lastError: unknown;

    for (const candidate of candidates) {
      try {
        console.log(redact(`[UI] Abrindo anúncio: ${candidate}`));
        await this.page.goto(candidate, { waitUntil: 'domcontentloaded' });
        await this.acceptCookieConsent();
        await this.ensureAuthenticatedSession();

        if (await isVisibleWithin(this.mainHeading(), 15_000)) {
          console.log(redact(`[UI] Anúncio carregado em ${this.page.url()}`));
          return;
        }
        lastError = new Error('A página do anúncio não exibiu o título do produto.');
      } catch (error) {
        if (error instanceof SessionRequiredError) {
          throw error;
        }
        lastError = error;
      }
    }

    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Não foi possível abrir o anúncio ${itemId}. Último erro: ${reason}`);
  }

  async waitForLoaded(): Promise<void> {
    await this.mainHeading().waitFor({ state: 'visible', timeout: ProductPage.DEFAULT_TIMEOUT });
  }

  /** Título do anúncio (usado como identificador legível nas asserções). */
  async getTitle(): Promise<string> {
    await this.waitForLoaded();
    return (await this.mainHeading().innerText()).trim();
  }

  async isFavorite(): Promise<boolean> {
    return this.favoriteToggle(true).first().isVisible().catch(() => false);
  }

  async addToFavorites(): Promise<void> {
    if (await this.isFavorite()) {
      console.log('[UI] O anúncio já estava favoritado nesta conta.');
      return;
    }

    const button = this.favoriteToggle(false).first();
    await button.waitFor({ state: 'visible', timeout: ProductPage.DEFAULT_TIMEOUT });
    await button.click();

    const confirmed = await isVisibleWithin(this.favoriteToggle(true).first(), ProductPage.DEFAULT_TIMEOUT);
    if (!confirmed) {
      throw new Error(
        'O clique em "Adicionar aos favoritos" não confirmou o estado favoritado. ' +
          'Causas prováveis: sessão expirada, captcha/verificação de conta ou mudança de rótulo acessível. ' +
          'Rode "npm run ui:inspect" para inspecionar os controles reais da página.',
      );
    }
    console.log('[UI] Favorito incluído pela interface.');
  }

  async removeFromFavorites(): Promise<void> {
    if (!(await this.isFavorite())) {
      console.log('[UI] O anúncio não estava favoritado; nada a remover.');
      return;
    }

    const button = this.favoriteToggle(true).first();
    await button.click();

    const confirmed = await isVisibleWithin(this.favoriteToggle(false).first(), ProductPage.DEFAULT_TIMEOUT);
    if (!confirmed) {
      throw new Error('O clique em "Excluir dos favoritos" não confirmou a remoção pela interface.');
    }
    console.log('[UI] Favorito removido pela interface.');
  }

  /**
   * Adiciona ao carrinho. Nunca clica em "Comprar agora" nem em nada de checkout:
   * o escopo do projeto proíbe finalizar compra.
   */
  async addToCart(): Promise<void> {
    const button = this.page.getByRole('button', { name: /adicionar ao carrinho/i }).first();
    await button.waitFor({ state: 'visible', timeout: ProductPage.DEFAULT_TIMEOUT });
    await button.click();

    const feedback = this.page
      .getByRole('heading', { name: /adicionado ao carrinho|produto adicionado/i })
      .or(this.page.getByText(/adicionado ao carrinho/i))
      .first();
    const shown = await isVisibleWithin(feedback, ProductPage.DEFAULT_TIMEOUT);
    console.log(
      shown
        ? '[UI] Confirmação "adicionado ao carrinho" exibida.'
        : '[UI] Confirmação visual não apareceu; a presença no carrinho será validada na página do carrinho.',
    );
  }

  /** Clique no ícone/link do carrinho no cabeçalho (fluxo real de interface). */
  async openCartFromHeader(): Promise<void> {
    const cartLink = this.page
      .getByRole('link', { name: /carrinho/i })
      .or(this.page.getByRole('button', { name: /carrinho/i }))
      .first();
    await cartLink.waitFor({ state: 'visible', timeout: ProductPage.DEFAULT_TIMEOUT });
    await cartLink.click();
    await this.page.waitForURL(/\/gz\/cart/i, { timeout: ProductPage.DEFAULT_TIMEOUT });
  }
}
