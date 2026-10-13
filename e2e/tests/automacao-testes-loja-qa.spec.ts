import { expect, test } from '@playwright/test';

const BASE_URL =
  'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login';

const CLIENTE = { email: 'user@system.com', password: 'UserPassword123' };
const ADMIN = { email: 'admin@system.com', password: 'AdminPassword123' };

const paraNumero = (texto: string) =>
  Number(texto.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.'));

test.describe('LojaQA — Desafio "automatizar ou não" (cenários automatizados: 1 e 5)', () => {
  // Cenário 1 (automatizado)
  test('Login com e-mail e senha válidos', async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);

    const areaLogin = page.locator('#section-login');
    await areaLogin.getByLabel('E-mail', { exact: true }).fill(CLIENTE.email);
    await areaLogin.getByLabel('Senha', { exact: true }).fill(CLIENTE.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL(/painel\.html/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Minha Conta' })
    ).toBeVisible();
  });

  // Cenários 2, 3 e 4 (senha errada, cadastro de loja e busca/filtros da vitrine)
  // NÃO são automatizados — decisão e justificativa em docs/cenarios-lojaqa.md.

  // Cenário 5 (automatizado)
  test('Adicionar ao carrinho e conferir o total', async ({ page }) => {
    await page.goto(`${BASE_URL}/loja.html`);

    const primeiroCard = page.locator('#productGrid .product-card').first();
    await expect(primeiroCard).toBeVisible();

    const nome = await primeiroCard.locator('h3').innerText();
    const preco = paraNumero(await primeiroCard.locator('.product-bottom strong').innerText());

    await primeiroCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.locator('#toast')).toContainText(/adicionado ao carrinho/);
    await expect(page.locator('#cartCount')).toHaveText('1');

    // O total do carrinho tem que bater com o preço do produto (1 unidade)
    await page.locator('#cartButton').click();
    const carrinho = page.locator('#cartDrawer');
    await expect(carrinho).toHaveClass(/is-open/);
    await expect(carrinho.locator('.cart-item strong')).toHaveText(nome);
    expect(paraNumero(await page.locator('#cartTotal').innerText())).toBe(preco);

    // Dobrando a quantidade, o total dobra
    await carrinho.locator('.cart-item .quantity button').last().click(); // botão "+"
    await expect(page.locator('#cartCount')).toHaveText('2');
    expect(paraNumero(await page.locator('#cartTotal').innerText())).toBeCloseTo(preco * 2, 2);
  });
});

test.describe('LojaQA — Desafio: Painel Administrativo (localizadores)', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Acessar a aplicação
    await page.goto(`${BASE_URL}/login.html`);

    // 2. Autenticação com credenciais válidas de Administrador
    const areaLogin = page.locator('#section-login');
    await areaLogin.getByLabel('E-mail', { exact: true }).fill(ADMIN.email);
    await areaLogin.getByLabel('Senha', { exact: true }).fill(ADMIN.password);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // 3. Validar o redirecionamento para o Painel
    await expect(page).toHaveURL(/painel\.html/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { level: 1, name: 'Painel Administrativo' })
    ).toBeVisible();
  });

  // Cenário 6 — [CT 01]
  test('[CT 01] Validar exibição da lista de Usuários', async ({ page }) => {
    // Acessar o filtro/aba de "Usuários"
    await page.getByRole('button', { name: 'Usuários' }).click();

    // Validar a renderização de ao menos um usuário listado
    const usuariosListados = page.locator('#adminUsersList .user-card');
    await expect(usuariosListados.first()).toBeVisible();
    await expect(usuariosListados.first().locator('.user-card-toggle strong')).toBeVisible();
    await expect(usuariosListados.first().locator('.user-card-email')).toBeVisible();
  });

  // Cenário 7 — [CT 02]
  test('[CT 02] Validar listagem e filtros de Produtos', async ({ page }) => {
    // Acessar o filtro/aba de "Produtos"
    await page.getByRole('button', { name: 'Produtos' }).click();
    const abaProdutos = page.locator('#adminTabProducts');

    // Validar a visibilidade do campo de pesquisa de produtos
    await expect(abaProdutos.getByRole('searchbox')).toBeVisible();

    // Validar a visibilidade do seletor (dropdown) de categorias
    await expect(
      abaProdutos.getByRole('combobox').filter({ hasText: 'Todas as categorias' })
    ).toBeVisible();

    // Validar a renderização de ao menos um produto na lista
    const primeiroProduto = page.locator('#adminProductsList .user-card').first();
    await expect(primeiroProduto).toBeVisible();
    await expect(primeiroProduto.locator('.product-id-tag')).toContainText(/PRD-\d{5}/);
    await expect(primeiroProduto.locator('.user-card-email')).toContainText(/Categoria:/);
  });

  // Cenário 8 — [CT 03]
  test('[CT 03] Validar informações na lista de Lojas', async ({ page }) => {
    // Acessar o filtro/aba de "Lojas"
    await page.getByRole('button', { name: 'Lojas' }).click();

    const primeiraLoja = page.locator('#adminStoresList .user-card').first();
    await expect(primeiraLoja).toBeVisible();

    // Localizar e validar a exibição do título/nome da loja
    const nomeDaLoja = primeiraLoja.locator('.user-card-toggle strong').first();
    await expect(nomeDaLoja).toContainText(/\S/);

    // Validar a renderização dos dados e informações detalhadas da loja
    await expect(primeiraLoja.locator('.user-card-email')).toContainText(
      /Responsável:[\s\S]*produto\(s\)/
    );
    await expect(primeiraLoja.locator('.user-card-meta .badge')).toContainText(/ATIVA|BLOQUEADA/);

    // ...e, abrindo o card, os dados cadastrais completos da loja
    await primeiraLoja.locator('.user-card-toggle').click();
    const detalhesDaLoja = primeiraLoja.locator('.user-card-body');
    await expect(detalhesDaLoja).toBeVisible();
    await expect(detalhesDaLoja.getByText('Nome da loja', { exact: true })).toBeVisible();
    await expect(detalhesDaLoja.getByLabel('Status da loja')).toHaveValue(/seller|blocked/);
    await expect(
      detalhesDaLoja.getByRole('heading', { name: /Produtos Cadastrados desta Loja/ })
    ).toBeVisible();
  });
});