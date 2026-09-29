import { test, expect } from '@playwright/test';
import { LoginPage } from "../pages/login.page";

let loginPage: LoginPage;

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.acessarSite();
});

test('Login como sucesso', async ({ page }) => {
    await loginPage.login("standard_user", "secret_sauce");
    // Confere que o site levou para a página de produtos
    await expect(page).toHaveURL(/inventory/);
});

test('Login com falha', async () => {
    await loginPage.login("usuario_errado", "secret_sauce");
    await expect(loginPage.alert).toHaveText("Epic sadface: Username and password do not match any user in this service");
});