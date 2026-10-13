import { describe, expect, test } from 'vitest';
import { automatizaveis, cenarios, decidir, type Cenario } from './06-cenarios.js';

describe('Cenários da LojaQA — automatizar ou não', () => {
  test('o quadro tem os 8 cenários do trabalho (5 + 3 do painel)', () => {
    expect(cenarios).toHaveLength(8);
    expect(cenarios.filter(cenario => cenario.origem === 'painel-administrativo')).toHaveLength(3);
  });

  test('5 cenários são automatizáveis e 3 ficam manuais', () => {
    expect(automatizaveis(cenarios)).toHaveLength(5);
    expect(cenarios.filter(cenario => decidir(cenario) === 'NÃO AUTOMATIZAR')).toHaveLength(3);
  });

  test('a decisão de cada cenário bate com o documento', () => {
    const decisaoEsperada: Record<string, string> = {
      'Login com e-mail e senha válidos': 'AUTOMATIZAR',
      'Login com senha errada mostra mensagem de erro': 'NÃO AUTOMATIZAR',
      'Cadastro de nova loja (nome, e-mail, senha)': 'NÃO AUTOMATIZAR',
      'Busca e filtros da vitrine (nome, categoria, preço)': 'NÃO AUTOMATIZAR',
      'Adicionar ao carrinho e conferir o total': 'AUTOMATIZAR',
      '[CT 01] Validar exibição da lista de Usuários': 'AUTOMATIZAR',
      '[CT 02] Validar listagem e filtros de Produtos': 'AUTOMATIZAR',
      '[CT 03] Validar informações na lista de Lojas': 'AUTOMATIZAR',
    };

    for (const cenario of cenarios) {
      expect(decidir(cenario), cenario.nome).toBe(decisaoEsperada[cenario.nome]);
    }
  });

  test('os 3 cenários do painel administrativo são automatizáveis', () => {
    const doPainel = cenarios.filter(cenario => cenario.origem === 'painel-administrativo');

    expect(doPainel).toHaveLength(3);
    for (const cenario of doPainel) {
      expect(decidir(cenario), cenario.nome).toBe('AUTOMATIZAR');
    }
  });
});

describe('Regra de decisão (if/else)', () => {
  const base: Cenario = {
    nome: 'exemplo',
    origem: 'automatizar-ou-nao',
    repetitivo: true,
    regraEstavel: true,
    manual: false,
  };

  test('repetitivo + regra estável → automatizar', () => {
    expect(decidir(base)).toBe('AUTOMATIZAR');
  });

  test('julgamento humano (manual) → não automatizar', () => {
    expect(decidir({ ...base, manual: true })).toBe('NÃO AUTOMATIZAR');
  });

  test('resultado que não é fixo (regra instável) → não automatizar', () => {
    expect(decidir({ ...base, regraEstavel: false })).toBe('NÃO AUTOMATIZAR');
  });
});