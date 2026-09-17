type CasoDeTeste = {
  id: number;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'média' | 'baixa';
  automatizado: boolean;
};

// Funções tipadas

function criarCaso(
  id: number,
  titulo: string,
  descricao: string,
  prioridade: 'alta' | 'média' | 'baixa'
): CasoDeTeste {
  return { id, titulo, descricao, prioridade, automatizado: false };
}

function descrever(caso: CasoDeTeste): string {
  const status = caso.automatizado ? 'AUTOMATIZADO' : 'MANUAL';
  return `[Caso #${caso.id}] ${caso.titulo} | Prioridade: ${caso.prioridade} | ${status}`;
}

function marcarAutomatizado(caso: CasoDeTeste): CasoDeTeste {
  return { ...caso, automatizado: true };
}

const casoLoginValido: CasoDeTeste = criarCaso(
  1,
  'Login com credenciais válidas',
  'Verifica se o usuário consegue acessar o sistema informando usuário e senha corretos.',
  'alta'
);

const casoSenhaInvalida: CasoDeTeste = criarCaso(
  2,
  'Login com senha inválida',
  'Verifica se o sistema bloqueia o acesso e exibe mensagem de erro ao informar senha incorreta.',
  'alta'
);

const casoCamposVazios: CasoDeTeste = criarCaso(
  3,
  'Login com campos vazios',
  'Verifica se o sistema impede o envio do formulário quando usuário e/ou senha não são preenchidos.',
  'média'
);

const suiteDeLogin: CasoDeTeste[] = [casoLoginValido, casoSenhaInvalida, casoCamposVazios];

// Variáveis de exemplo (com e sem anotação de tipo)

let totalDeCasos: number = suiteDeLogin.length; // com anotação explícita
let nomeDaSuite = 'Suíte de Testes de Login';   // sem anotação (tipo inferido pelo TS)

// Usando as funções

console.log(`--- ${nomeDaSuite} (${totalDeCasos} casos) ---`);
suiteDeLogin.forEach(caso => console.log(descrever(caso)));

const casoCamposVaziosAutomatizado = marcarAutomatizado(casoCamposVazios);
console.log('\nApós marcarAutomatizado:');
console.log(descrever(casoCamposVaziosAutomatizado));

// Conferindo o typeof de cada item na saída

console.log('\n--- Conferindo tipos (typeof) ---');

const conferencias: { nome: string; valor: unknown; tipoEsperado: string }[] = [
  { nome: 'casoLoginValido', valor: casoLoginValido, tipoEsperado: 'object' },
  { nome: 'totalDeCasos', valor: totalDeCasos, tipoEsperado: 'number' },
  { nome: 'nomeDaSuite', valor: nomeDaSuite, tipoEsperado: 'string' },
  { nome: 'criarCaso', valor: criarCaso, tipoEsperado: 'function' },
  { nome: 'descrever', valor: descrever, tipoEsperado: 'function' },
  { nome: 'marcarAutomatizado', valor: marcarAutomatizado, tipoEsperado: 'function' },
];

let aprovados = 0;
conferencias.forEach(({ nome, valor, tipoEsperado }) => {
  const tipoReal = typeof valor;
  const ok = tipoReal === tipoEsperado;
  if (ok) aprovados++;
  console.log(`  ${ok ? '✅' : '❌'} typeof ${nome} === "${tipoReal}"`);
});

console.log(`\n  Tipos: ${aprovados} ✅ | ${conferencias.length - aprovados} ❌`);

// Simulação de erro de tipo proposital

criarCaso('quatro', 'Caso inválido', 'texto para provocar erro', 'alta');