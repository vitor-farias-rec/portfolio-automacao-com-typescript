import { test, expect } from '../fixtures/auth.fixture';

type Cenario = {
  titulo: string;
  email: string;
  senha: string;
  destinoEsperado?: RegExp;
  mensagemEsperada?: string;
};

const tempoDeEspera = 20000;

const cenarios: Cenario[] = [
  {
    titulo: 'Login com cliente válido',
    email: 'user@system.com',
    senha: 'UserPassword123',
    destinoEsperado: /painel\.html/,
  },
  {
    titulo: 'Login com administrador válido',
    email: 'admin@system.com',
    senha: 'AdminPassword123',
    destinoEsperado: /painel\.html/,
  },
  {
    titulo: 'Mensagem de erro com senha incorreta',
    email: 'user@system.com',
    senha: 'SenhaErrada123',
    mensagemEsperada: 'Tentativa 1 de 3',
  },
];

test.describe('Testes de login com Data-Driven', () => {
  for (const cenario of cenarios) {
    test(cenario.titulo, async ({ loginPage, page }) => {
      await loginPage.login(cenario.email, cenario.senha);

      if (cenario.destinoEsperado) {
        await expect(page).toHaveURL(cenario.destinoEsperado, { timeout: tempoDeEspera });
      }

      if (cenario.mensagemEsperada) {
        await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: tempoDeEspera });
        await expect(loginPage.getErrorMessage()).toContainText(cenario.mensagemEsperada);
      }
    });
  }
});