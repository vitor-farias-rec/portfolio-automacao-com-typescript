# Cenários da LojaQA: automatizar ou não?

**Sistema:** LojaQA — `projetos-base/01-sistema-login`
**URL:** `https://alisonmelo.github.io/tioalison-pe-t4-fap26/projetos-base/01-sistema-login`

**Código:** os **5 cenários automatizados** ficam em um único arquivo — `e2e/tests/automacao-testes-loja-qa.ts` e os **3 cenários manuais** desta tabela **não entram no código** (é a decisão "não automatizar").

**Teste de unidade:** o quadro de decisão dos 8 cenários é validado com **Vitest** em `src/aula25/06-cenarios.test.ts`.

**Como eu decidi:** *repetitivo + regra estável + baixo efeito colateral → automatizar*. O que depende de **julgamento humano** ou deixa **rastro na base compartilhada** ou tem **resultado não fixo** fica **manual**.

---

## Parte 1 — Desafio "automatizar ou não" (cenários 1 a 5)

| # | Cenário | Decisão | Justificativa |
|---|---------|---------|---------------|
| 1 | Login com e-mail e senha válidos | 🤖 Automatizar | É o fluxo mais repetido do sistema e a regra é estável: entra e vai para o painel. Vale rodar em todo release. |
| 2 | Login com senha errada mostra mensagem de erro | 🧑 Não automatizar | Validar a mensagem de erro é conferir texto e tom (UX), que muda com frequência — o retorno não paga a manutenção do teste. Melhor a olho. |
| 3 | Cadastro de nova loja (nome, e-mail, senha) | 🧑 Não automatizar | Cada execução cria uma loja **de verdade** na base compartilhada do curso — automatizar em série deixaria lixo permanente. Melhor rodar sob demanda. |
| 4 | Busca e filtros da vitrine (nome, categoria, preço) | 🧑 Não automatizar | O resultado depende da massa do momento (qualquer colega cadastra produtos), então o esperado não é fixo e o teste ficaria frágil. |
| 5 | Adicionar ao carrinho e conferir o total | 🤖 Automatizar | Regra estável e crítica: o total exibido tem que ser a soma dos itens (preço × quantidade). Mexe com dinheiro e roda em toda regressão. |
| 6 | CT 01 - Validar exibição da lista de Usuários | 🤖 Automatizar | Lista de leitura (renderização de cards): cenário rápido, estável e repetido em toda regressão do painel. |
| 7 | CT 02 - Validar listagem e filtros de Produtos | 🤖 Automatizar | Campo de pesquisa, dropdown de categorias e lista são regras fixas — e o catálogo muda toda hora, então o risco de quebra é alto. |
| 8 | CT 03 - Validar informações na lista de Lojas | 🤖 Automatizar | Nome, responsável, status e produtos da loja alimentam a moderação: validar a renderização evita decisão de admin com dado errado. |

---

## Pirâmide de testes da LojaQA

```
        ▲  poucos, lentos, caros
       ╱ ╲
      ╱   ╲     E2E (interface)      ~10%
     ╱─────╲
    ╱       ╲   INTEGRAÇÃO (API)    ~20%
   ╱─────────╲
  ╱───────────╲ UNITÁRIOS (funções) ~70%
 ▼  muitos, rápidos, baratos
```

**🔹 Unitário (a maioria):** testa uma regra isolada, sem navegador e sem tela.
*Exemplo:* as validações de e-mail e de senha (8 a 25 caracteres) do login/cadastro e o cálculo do total do carrinho (preço × quantidade) — cenários 1, 3 e 5.

**🔸 Integração (o meio):** testa a comunicação entre telas e API (token, dados, filtros).
*Exemplo:* `POST /login` devolvendo token/perfil, `POST /register` criando a loja e `GET /products?search=&category=&maxPrice=` alimentando a vitrine — cenários 1, 3 e 4.

**🔺 E2E (poucos, no topo):** percorre o fluxo completo como o usuário, pela interface.
*Exemplo:* é o que o arquivo automatiza — login do cliente → adicionar ao carrinho e conferir o total (cenários 1 e 5) e login do admin → painel Usuários/Produtos/Lojas (CT 01 a 03).

**Fora da pirâmide:** os cenários manuais (2, 3 e 4) e qualquer teste exploratório.

---

## O que já foi observado nos cenários manuais

- **Cenário 4 (vitrine):** aplicar dois filtros em sequência muito rápida pode exibir o resultado da resposta que chegar por último — a vitrine não cancela requisições antigas (aplicação com corrida real). E a categoria aparece em CAIXA ALTA só por CSS: o texto de tela é "PERIFÉRICOS", mas o valor da `<option>` é "Periféricos".
- **Cenário 3 (cadastro):** o e-mail precisa ser único a cada tentativa manual (a base é compartilhada).

---

## Como rodar

**Testes de UI (Playwright — os 5 cenários automatizados)**

```bash
yarn playwright test e2e/tests/automacao-testes-loja-qa.ts
```

**Teste de unidade (Vitest — o quadro de decisão dos 8 cenários)**

```bash
npx vitest run src/aula25/06-cenarios.test.ts
npx tsx src/aula25/06-cenarios.ts
```
