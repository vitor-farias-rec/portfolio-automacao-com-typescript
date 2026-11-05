import type { Locator, Page } from '@playwright/test';
import { MELI_BASE_URL, redact } from '../utils/env';

/** Erro específico para deixar explícito que o problema é sessão, não seletor. */
export class SessionRequiredError extends Error {
  override name = 'SessionRequiredError';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Base dos Page Objects.
 *
 * Regras do projeto aplicadas aqui:
 *  - Nenhum `expect` (asserção vive só em testes/setup de teste).
 *  - Nenhum `waitForTimeout`: as esperas são sempre por estado real do DOM/URL.
 *  - Seletores semânticos primeiro (`getByRole`/`getByLabel`); CSS só como fallback justificado.
 */
export abstract class BasePage {
  protected constructor(
    protected readonly page: Page,
    protected readonly path: string,
  ) {}

  get url(): string {
    return `${MELI_BASE_URL}${this.path}`;
  }

  /** Abre a página e trata consentimento de cookies + verificação de sessão. */
  async open(): Promise<void> {
    console.log(redact(`[UI] Abrindo ${this.url}`));
    const response = await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    if (response && response.status() >= 400) {
      throw new Error(
        `Falha ao abrir ${this.url}: HTTP ${response.status()}. ` +
          'Se o status for 403, o Mercado Livre pode estar exigindo sessão autenticada ou bloqueando o ambiente.',
      );
    }
    await this.acceptCookieConsent();
    await this.ensureAuthenticatedSession();
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.acceptCookieConsent();
  }

  async acceptCookieConsent(): Promise<void> {
    const acceptButton = this.page
      .getByRole('button', { name: /^(aceitar cookies|aceitar todos|aceitar)$/i })
      .first();
    try {
      if (await acceptButton.isVisible()) {
        await acceptButton.click();
        await acceptButton.waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => undefined);
      }
    } catch {
      // banner ausente ou já dispensado: nada a fazer
    }
  }

  /** O Mercado Livre redireciona para login/verificação quando não há sessão válida. */
  async isLoginScreen(): Promise<boolean> {
    const currentUrl = this.page.url();
    if (/(\/jms\/[^?]*login|account-verification|auth\.mercadolivre\.com\.br)/i.test(currentUrl)) {
      return true;
    }
    const loginEntry = this.page
      .getByRole('link', { name: /^(entre|entrar)$/i })
      .or(this.page.getByRole('button', { name: /^(entre|entrar)$/i }))
      .first();
    return loginEntry.isVisible().catch(() => false);
  }

  protected async ensureAuthenticatedSession(): Promise<void> {
    if (await this.isLoginScreen()) {
      throw new SessionRequiredError(
        'Sessão web não autenticada: o Mercado Livre exigiu login ou verificação de conta. ' +
          'Execute "npm run auth:save" para gerar playwright/.auth/meli-user.json usando a MESMA conta do token OAuth ' +
          'e conclua manualmente captcha/2FA, se aparecerem.',
      );
    }
  }

  /** Cabeçalho principal (evita casar com elementos de rodapé). */
  protected mainHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }
}
