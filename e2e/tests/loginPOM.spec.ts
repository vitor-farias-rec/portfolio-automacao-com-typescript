import {test, expect} from '@playwright/test';
import {LoginPage} from '../pages/login.page.ts';

test.describe('Login Tests com Page Object Model', () =>{
    let loginPage: LoginPage;

    test.beforeEach(async ({page}) =>{
        loginPage = new LoginPage({page});
        await loginPage.goto();
    })

    test('Login Admin com Sucesso via POM', async({page}) =>{
        await loginPage.login('admin@system.com', 'AdminPassword123');
        await expect(loginPage.statusMessage).toBeVisible();
        await expect(loginPage.statusMessage).toContainText(/Login bem-sucedido/i);
        await expect(page).toHaveURL(/painel\.html/);
    });

    test('Testar visibilidade do botão de login', async ({page}) =>{
        await expect(loginPage.loginButton).toBeDisable();
    })
});