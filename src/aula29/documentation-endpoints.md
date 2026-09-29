# Aula 29: PUT, PATCH e DELETE (JSONPlaceholder)

**API:** https://jsonplaceholder.typicode.com

**Script:** `src/aula29/apis2.ts` (`npx tsx src/aula29/apis2.ts`)

**Testes:** `src/aula29/apis2.test.ts` (`npm test`)

Resumo da execução:

| # | Endpoint | Método | Status obtido |
|---|----------|--------|---------------|
| 1 | `/posts/1` | PUT | 200 |
| 1b | `/posts/1` (payload incompleto) | PUT | 200 |
| 2 | `/posts/1` | PATCH | 200 |
| 3 | `/posts/1` | DELETE | 200 |

---

## Diferença entre PUT, PATCH e DELETE

| | PUT | PATCH | DELETE |
|---|---|---|---|
| **Semântica** | Substituição completa do recurso | Modificação parcial do recurso | Remoção do recurso |
| **Body da request** | Representação completa do recurso | Apenas os campos a alterar | N/A |
| **Campos omitidos** | Não são preservados | São preservados | N/A |
| **Idempotente** | Sim | Não garantido pela especificação | Sim |
| **Status obtido** | 200 | 200 | 200 |

---

## 1. PUT /posts/1

### Request
- **Método:** PUT
- **URL completa:** `https://jsonplaceholder.typicode.com/posts/1`
- **Headers:** `Content-Type: application/json; charset=UTF-8`
- **Body enviado (payload JSON):**

```json
{
  "id": 1,
  "userId": 1,
  "title": "Titulo via PUT",
  "body": "Conteudo via PUT"
}
```

### Response
- **Status:** 200 OK
- **Body:** objeto `Post` com os campos `id`, `userId`, `title` e `body`

**Exemplo (copiado da execução):**

```json
{
  "id": 1,
  "userId": 1,
  "title": "Titulo via PUT",
  "body": "Conteudo via PUT"
}
```

### Campos não enviados no PUT

Com payload incompleto (`{ "title": "So o titulo via PUT" }`), a response (status 200) foi:

```json
{ "title": "So o titulo via PUT", "id": 1 }
```

`userId` e `body` não constam na response: o PUT trata o payload como a representação completa do recurso, e os campos omitidos não são preservados. Para alteração parcial, o método adequado é o PATCH.

### Finalidade
Substitui o recurso inteiro por uma nova representação. O payload deve conter todos os campos.

---

## 2. PATCH /posts/1

### Request
- **Método:** PATCH
- **URL completa:** `https://jsonplaceholder.typicode.com/posts/1`
- **Headers:** `Content-Type: application/json; charset=UTF-8`
- **Body enviado:**

```json
{ "title": "MEU TITULO SUPER ATUALIZADO" }
```

### Response
- **Status:** 200 OK
- **Body:** objeto `Post` completo, com o campo enviado alterado e os demais preservados

**Exemplo (copiado da execução):**

```json
{
  "userId": 1,
  "id": 1,
  "title": "MEU TITULO SUPER ATUALIZADO",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

### Finalidade
Altera apenas os campos enviados, mantendo os demais como estavam.

---

## 3. DELETE /posts/1

### Request
- **Método:** DELETE
- **URL completa:** `https://jsonplaceholder.typicode.com/posts/1`
- **Headers:** nenhum definido manualmente
- **Body enviado:** N/A

### Response
- **Status:** 200 OK
- **Body:** objeto vazio

**Exemplo (copiado da execução):**

```json
{}
```

### Finalidade
Remove o recurso. O JSONPlaceholder responde 200 com body vazio; outras APIs costumam retornar 204 No Content.

---

## Status codes

| Status | Nome | Semântica | Uso típico |
|--------|------|-----------|------------|
| **200** | OK | Requisição bem-sucedida, com body na response | GET, PUT, PATCH ou DELETE com sucesso |
| **201** | Created | Novo recurso criado | POST que cria um recurso |
| **204** | No Content | Sucesso, sem body na response | DELETE ou PUT que não retorna representação |
| **400** | Bad Request | Requisição malformada, que o servidor não consegue interpretar | JSON com sintaxe inválida |
| **401** | Unauthorized | Autenticação ausente ou inválida | Rota protegida chamada sem token |
| **403** | Forbidden | Autenticado, mas sem permissão para o recurso | Usuário sem privilégio para apagar o recurso |
| **404** | Not Found | Recurso ou rota inexistente | GET em um id que não existe |
| **422** | Unprocessable Entity | Sintaxe válida, mas falha nas regras de validação | Campo obrigatório ausente ou formato inválido |
| **500** | Internal Server Error | Falha inesperada no servidor | Exceção não tratada no back-end |

---

## Simulação de escrita no JSONPlaceholder

O JSONPlaceholder simula operações de escrita (POST, PUT, PATCH e DELETE): ele aceita a requisição e devolve status e body compatíveis com uma API real, mas **não persiste nenhuma alteração**. Um `GET /posts/1` feito depois do DELETE ou do PATCH continua retornando o post original. Por isso, os testes validam o contrato da response (status code e body), e não o estado dos dados no servidor.

---

## Testes de integração

`apis2.test.ts` contém um teste por método (mais o POST da aula 28), cada um validando status code e body. Resultado:

```
✓ src/aula29/apis2.test.ts (4 tests)
   ✓ Metodo POST para criar um novo post
   ✓ Metodo PUT para SUBSTITUIR um post
   ✓ Metodo PATCH para ATUALIZAR um post
   ✓ Metodo DELETE para DELETAR um post

Tests  4 passed (4)
```
