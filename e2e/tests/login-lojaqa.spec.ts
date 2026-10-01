import { test, expect } from '@playwright/test';

const BASE_URL = 'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login';

test.describe('Ato 1 - validar carregamento e visibilidade de elementos', async () => {

  test('Validar titulo e carregamento da pagina', async ({ page }) => {
    //Navegar ate pagina de login
    await page.goto(`${BASE_URL}/login.html`)
    //Validar titulo
    await expect(page).toHaveTitle(/LojaQA | Entrar/i);
  });
  test('Verificar exibicao dos campos do form de login', async ({ page }) => {

    //Navegar ate pagina de login
    await page.goto(`${BASE_URL}/login.html`)

    //Validar campos
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#loginBtn')).toBeVisible();
    //Verificar se btn esta desativado
    await expect(page.locator('#loginBtn')).toBeDisabled();

  });

});

test.describe('Ato 2 - Caminho Feliz', ()=>{
  test('validar acesso e redicionar ao painel',async({page})=>{
    //Navegar ate pagina de login
    await page.goto(`${BASE_URL}/login.html`)
    // Preencher campoos utilizando o fill()
    await page.fill('#email','admin@system.com');
    await page.fill('#password', 'AdminPassword123');
    //Validar botao ativo
    await expect(page.locator('#loginBtn')).toBeEnabled();
    // Ação de clique no btn
    await page.click('#loginBtn');
    //Validar o redirecioamento para a pagina /painel
    await expect(page).toHaveURL(/painel\.html/);
  });
});