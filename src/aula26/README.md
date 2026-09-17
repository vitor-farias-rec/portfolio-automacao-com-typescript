## Aula 26 — Modelagem de domínio de QA com TypeScript

## O que foi feito
Criado `src/aula26/casos-de-teste.ts` com o `type CasoDeTeste` (id, título, descrição e status de automação), três casos de uma suíte de login, e as funções tipadas `criarCaso`, `descrever` e `marcarAutomatizado`. Também há uma variável com anotação explícita (`totalDeCasos: number`) e outra sem anotação (`nomeDaSuite`, inferida pelo TS).

## Como rodar
npx tsx src/aula26/casos-de-teste.ts

## Erro de tipo provocado
Chamada `criarCaso('quatro', ...)`, passando string no parâmetro `id` (tipo `number`). O editor acusou:
"Argument of type 'string' is not assignable to parameter of type 'number'."
Print em `print-erro-tipo.png`.
