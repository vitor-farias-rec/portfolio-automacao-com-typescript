import { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly url =
    'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login/login.html';
  private readonly emailInput = '#email';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#loginBtn';
  private readonly errorMessage = '#errorMessage';
  private readonly statusMessage = '#statusMessage';

  constructor(private page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.locator(this.emailInput).fill(email);
    await this.page.locator(this.passwordInput).fill(password);
    await this.page.locator(this.loginButton).click();
  }

  getLoginButton(): Locator {
    return this.page.locator(this.loginButton);
  }

  getErrorMessage(): Locator {
    return this.page.locator(this.errorMessage);
  }

  getStatusMessage(): Locator {
    return this.page.locator(this.statusMessage);
  }
}