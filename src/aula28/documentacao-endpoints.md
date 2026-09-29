# Documentação dos endpoints: JSONPlaceholder

**API:** https://jsonplaceholder.typicode.com

**Script:** `src/aula28/apis.ts`

**Executado com:** `npx tsx src/aula28/apis.ts`

Resumo da execução:

| # | Endpoint | Método | Status obtido |
|---|----------|--------|---------------|
| 1 | `/posts` | GET | 200 |
| 2 | `/posts/1` | GET | 200 |
| 3 | `/posts/1/comments` | GET | 200 |
| 4 | `/posts` | POST | 201 |

---

## 1. GET /posts

### Request
- **Método:** GET
- **URL completa:** `https://jsonplaceholder.typicode.com/posts`
- **Headers:** nenhum definido manualmente (o `fetch` envia os padrões, como `Accept: */*`)
- **Body:** N/A

### Response
- **Status:** 200 OK
- **Corpo:** array com 100 objetos `Post`
- **Campos de cada item:**
  - `userId` (number): id do autor
  - `id` (number): id do post
  - `title` (string): título
  - `body` (string): texto do post

**Exemplo (primeiro item da lista):**

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

### Finalidade
Lista todos os posts disponíveis. Serve para popular listagens e feeds.

---

## 2. GET /posts/1

### Request
- **Método:** GET
- **URL completa:** `https://jsonplaceholder.typicode.com/posts/1`
- **Headers:** nenhum definido manualmente
- **Body:** N/A

### Response
- **Status:** 200 OK
- **Corpo:** um único objeto `Post`
- **Campos:** `userId`, `id`, `title`, `body` (mesmos do endpoint anterior)

**Exemplo:**

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

### Finalidade
Busca um post específico pelo id. Serve para a tela de detalhe de um post.

---

## 3. GET /posts/1/comments

### Request
- **Método:** GET
- **URL completa:** `https://jsonplaceholder.typicode.com/posts/1/comments`
- **Headers:** nenhum definido manualmente
- **Body:** N

### Response
- **Status:** 200 OK
- **Corpo:** array com 5 objetos `Coment` (para o post 1)
- **Campos de cada item:**
  - `postId` (number): id do post ao qual o comentário pertence
  - `id` (number): id do comentário
  - `name` (string): título do comentário
  - `email` (string): e-mail de quem comentou
  - `body` (string): texto do comentário

**Exemplo (primeiro comentário):**

```json
{
  "postId": 1,
  "id": 1,
  "name": "id labore ex et quam laborum",
  "email": "Eliseo@gardner.biz",
  "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium"
}
```

### Finalidade
Lista os comentários de um post. Serve para exibir a discussão abaixo do post.

---

## 4. POST /posts

### Request
- **Método:** POST
- **URL completa:** `https://jsonplaceholder.typicode.com/posts`
- **Headers:**
  - `Content-Type: application/json; charset=UTF-8`
- **Body enviado (JSON):**

```json
{
  "userId": 1,
  "title": "Meu post",
  "body": "Conteúdo de teste"
}
```

### Response
- **Status:** 201 Created
- **Body:** objeto `Post` com os dados enviados mais o `id` gerado pelo servidor
- **Campos:** `userId`, `title`, `body` (ecoados do envio) e `id` (number, novo)

**Exemplo (copiado da execução):**

```json
{
  "userId": 1,
  "title": "Meu post",
  "body": "Conteúdo de teste",
  "id": 101
}
```

### Finalidade
Cria um novo post. O JSONPlaceholder apenas simula a criação: o `id: 101` é devolvido, mas o post não fica salvo de verdade, então um `GET /posts/101` depois não o encontraria.
