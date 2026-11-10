import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const tempoDeEspera = 20000;

test.describe('Testes da tela de login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Login de cliente com credenciais válidas', async ({ page }) => {
    await loginPage.login('user@system.com', 'UserPassword123');

    await expect(page).toHaveURL(/painel\.html/, { timeout: tempoDeEspera });
  });

  test('Mensagem de erro com senha incorreta', async () => {
    await loginPage.login('user@system.com', 'SenhaErrada123');

    await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: tempoDeEspera });
    await expect(loginPage.getErrorMessage()).toContainText('Tentativa 1 de 3');
  });

  test('Botão de entrar começa desabilitado', async () => {
    await expect(loginPage.getLoginButton()).toBeDisabled();
  });
});