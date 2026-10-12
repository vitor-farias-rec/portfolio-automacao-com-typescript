import { test, expect } from '@playwright/test';

const BASE_URL = 'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login';

test.describe('', () => {

  test.beforeEach(async ({ page }) => {
    // Acessa a aplicação de prática
    await page.goto(`${BASE_URL}/login.html`);
  });

  test('Fazer login como Administrador'), async ({page})=>{
    
  }
};