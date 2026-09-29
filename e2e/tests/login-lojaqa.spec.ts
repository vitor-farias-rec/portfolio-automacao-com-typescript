import {test, expect} from '@playwright/test';

const BASE_URL = 'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login';

test.describe('Ato 1 - validar carregamento e visibilidade de elementos', async () =>{
test('Validar titulo e carregamento da pagina', async ({page}) =>{
// Navegar ate pagina de login
await page.goto(`${BASE_URL}/login.html`)
// Validar titulo
await expect(page).toHaveTitle(/LojaQA | Entrar/i);
});
test('Verificar exibicao dos campos do form de login', async({page}) =>{
// Navegar ate pagina de login
await page.goto(`${BASE_URL}/login.html`)

// Validar campos
await expect(page.locator('#email')).toBeVisible();
await expect(page.locator('#password')).toBeVisible();
await expect(page.locator('#loginBtn')).toBeVisible();
// Verificar se btn está desativado
await expect(page.locator('#loginBtn')).toBeDisabled(); 

});

});

test.describe('Ato 2 - Caminho Feliz', ()=>{
test('Validar acesso e redirecionamento ao painel', async ({page})=>{
// Navegar ate pagina de login
await page.goto(`${BASE_URL}/login.html`)
// preencher campos utilizando o fill()
await page.fill('#email','admin@system.com');
await page.fill('#password', 'AdminPassword123');
// Validar botão ativo
await expect(page.locator('#loginBtn')).toBeEnabled();
// Ação de clique
await page.click('#loginBtn');
// Validar o redirecionamento para a página /painel
await expect(page).toHaveURL(/painel\.html/);
})
})
