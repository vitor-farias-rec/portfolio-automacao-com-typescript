// imprime a decisão de cada cenário e quantos são automatizáveis.
// Importado pelo teste (06-cenarios.test.ts, Vitest), o arquivo só empresta os dados e a regra.

import { resumo, titulo, verificar } from './utils.js';

const BASE_URL =
  'https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login';

export type Origem = 'automatizar-ou-nao' | 'painel-administrativo';

export type Cenario = {
  nome: string;
  origem: Origem;
  repetitivo: boolean; // acontece de novo a cada release?
  regraEstavel: boolean; // o comportamento esperado já está definido?
  manual: boolean; // depende de julgamento humano?
};

export const cenarios: Cenario[] = [
  { nome: 'Login com e-mail e senha válidos', origem: 'automatizar-ou-nao', repetitivo: true, regraEstavel: true, manual: false },
  { nome: 'Login com senha errada mostra mensagem de erro', origem: 'automatizar-ou-nao', repetitivo: true, regraEstavel: true, manual: true },
  { nome: 'Cadastro de nova loja (nome, e-mail, senha)', origem: 'automatizar-ou-nao', repetitivo: true, regraEstavel: true, manual: true },
  { nome: 'Busca e filtros da vitrine (nome, categoria, preço)', origem: 'automatizar-ou-nao', repetitivo: true, regraEstavel: false, manual: false },
  { nome: 'Adicionar ao carrinho e conferir o total', origem: 'automatizar-ou-nao', repetitivo: true, regraEstavel: true, manual: false },
  { nome: '[CT 01] Validar exibição da lista de Usuários', origem: 'painel-administrativo', repetitivo: true, regraEstavel: true, manual: false },
  { nome: '[CT 02] Validar listagem e filtros de Produtos', origem: 'painel-administrativo', repetitivo: true, regraEstavel: true, manual: false },
  { nome: '[CT 03] Validar informações na lista de Lojas', origem: 'painel-administrativo', repetitivo: true, regraEstavel: true, manual: false },
];

export function decidir(c: Cenario): 'AUTOMATIZAR' | 'NÃO AUTOMATIZAR' {
  if (c.manual) return 'NÃO AUTOMATIZAR';
  else if (c.repetitivo && c.regraEstavel) return 'AUTOMATIZAR';
  else return 'NÃO AUTOMATIZAR';
}

export function automatizaveis(lista: Cenario[]): Cenario[] {
  return lista.filter(cenario => decidir(cenario) === 'AUTOMATIZAR');
}

async function rodar(): Promise<void> {
  titulo('Exercício 06 — Cenários: automatizar ou não? (LojaQA)');

  try {
    const res = await fetch(BASE_URL);
    verificar('BASE_URL responde 200', res.status, 200);
  } catch {
    console.log('⚠️  Não consegui acessar o BASE_URL agora (sem internet?) — seguindo só com a classificação.');
  }

  console.log('\nDecisão por cenário:');
  for (const cenario of cenarios) {
    const decisao = decidir(cenario);
    console.log(`${decisao === 'AUTOMATIZAR' ? '🤖' : '🧑'} ${decisao} — ${cenario.nome}`);
  }

  const totalAutomatizaveis = automatizaveis(cenarios).length;
  console.log(`\nTotal: ${totalAutomatizaveis} de ${cenarios.length} cenários são automatizáveis.`);

  verificar('total de cenários', cenarios.length, 8);
  verificar('cenários automatizáveis', totalAutomatizaveis, 5);

  resumo();
}

type AmbienteNode = {
  process?: { env?: Record<string, string | undefined>; exitCode?: number };
};

const ambiente = globalThis as AmbienteNode;
const rodandoNoVitest = Boolean(ambiente.process?.env?.VITEST);

export const exercicio06 = rodandoNoVitest
  ? Promise.resolve()
  : rodar().catch(erro => {
      console.error('Falha ao executar o exercício 06:', erro);
      if (ambiente.process) ambiente.process.exitCode = 1;
    });