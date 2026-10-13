// Cada exercício imprime o valor obtido E o valor esperado,
// para conferir linha por linha. No fim, um resumo diz quantas verificações passaram.

let totalVerificacoes = 0;
let totalFalhas = 0;
const ambiente = globalThis as { process?: { exitCode?: number } };

/** Imprime um cabeçalho de seção. */
export function titulo(texto: string): void {
  console.log(`\n=== ${texto} ===`);
}


// Confere um valor obtido contra o valor esperado e imprime o resultado.
export function verificar(descricao: string, obtido: unknown, esperado: unknown): void {
  totalVerificacoes++;
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado);
  if (!ok) totalFalhas++;
  const icone = ok ? '✅' : '❌';
  console.log(
    `${icone} ${descricao}: obtido=${JSON.stringify(obtido)} | esperado=${JSON.stringify(esperado)}`,
  );
}

// Resumo parcial (acumulado até este ponto da execução).
export function resumo(): void {
  console.log(`— Parcial: ${totalVerificacoes} verificações | ${totalFalhas} falha(s)`);
}

// Resumo final; sai com código de erro se algo não bateu.
export function resumoFinal(): void {
  console.log('\n============================================');
  console.log(`RESUMO FINAL: ${totalVerificacoes} verificações | ${totalFalhas} falha(s)`);
  if (totalFalhas > 0) {
    console.log('❌ Algum valor não bateu com o esperado. Revise os ❌ acima.');
    if (ambiente.process) ambiente.process.exitCode = 1;
  } else {
    console.log('🎉 Todos os valores conferem com o esperado!');
  }
}