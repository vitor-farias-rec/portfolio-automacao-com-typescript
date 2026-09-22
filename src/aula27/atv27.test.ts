import { test, expect, vi } from 'vitest';

interface ExecucaoTeste {
  id: number;
  nome: string;
  status: 'sucesso' | 'falha';
  duracaoMs: number;
}

const execucoes: ExecucaoTeste[] = [
  { id: 1, nome: 'login', status: 'sucesso', duracaoMs: 120 },
  { id: 2, nome: 'logout', status: 'sucesso', duracaoMs: 80 },
  { id: 3, nome: 'cadastro', status: 'falha', duracaoMs: 340 },
  { id: 4, nome: 'checkout', status: 'sucesso', duracaoMs: 210 },
  { id: 5, nome: 'busca-produto', status: 'falha', duracaoMs: 95 },
];

const nomesExecucoes = execucoes.map((execucao) => execucao.nome);
const execucoesComFalha = execucoes.filter((execucao) => execucao.status === 'falha');
const duracaoTotalMs = execucoes.reduce((total, execucao) => total + execucao.duracaoMs, 0);

// Função async que busca uma execução pelo id
function buscarExecucaoPorId(id: number): Promise<ExecucaoTeste> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const execucaoEncontrada = execucoes.find((execucao) => execucao.id === id);

      if (!execucaoEncontrada) {
        reject(new Error(`Execução com id ${id} não encontrada.`));
        return;
      }

      resolve(execucaoEncontrada);
    }, 1000);
  });
}

// Testes cobrindo caminho de sucesso e caminho de erro
test('busca execução por id existente', async () => {
  vi.useFakeTimers();

  const promessa = buscarExecucaoPorId(1);
  await vi.advanceTimersByTimeAsync(1000);
  const resultado = await promessa;

  expect(resultado.nome).toBe('login');

  vi.useRealTimers();
});

test('busca execução por id inexistente', async () => {
  vi.useFakeTimers();

  const expectativa = expect(buscarExecucaoPorId(999)).rejects.toThrow(
    'Execução com id 999 não encontrada.'
  );
  await vi.advanceTimersByTimeAsync(1000);
  await expectativa;

  vi.useRealTimers();
});