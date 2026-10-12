import { test, expect } from '@playwright/test';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

const POST_ESPERADO = {
  userId: 1,
  id: 1,
  title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
  body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
};

test.describe('1) GET — listar recursos', () => {
  test('GET /posts retorna 200 e uma lista com 100 posts @smoke', async ({ request }) => {
    const resposta = await request.get(`${BASE_URL}/posts`);

    // Assert do status HTTP (200–299)
    expect(resposta.status()).toBe(200);
    await expect(resposta).toBeOK();

    const posts = await resposta.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts).toHaveLength(100);
    expect('id' in posts[0]).toBe(true);
    expect(typeof posts[0].title).toBe('string');
  });

  test('GET /posts/1 retorna exatamente o post esperado', async ({ request }) => {
    const resposta = await request.get(`${BASE_URL}/posts/1`);
    expect(resposta.status()).toBe(200);

    const post = await resposta.json();
    expect(post).toEqual(POST_ESPERADO);
  });

  test('GET /posts?userId=1 usa query string e filtra pelo autor', async ({ request }) => {
    const resposta = await request.get(`${BASE_URL}/posts`, { params: { userId: 1 } });
    expect(resposta.status()).toBe(200);

    const posts = await resposta.json();
    expect(posts).toHaveLength(10);
    expect(posts.every((p: { userId: number }) => p.userId === 1)).toBe(true);
  });
});

test.describe('2) POST — criar recurso', () => {
  test('POST /posts cria o recurso e devolve 201 com o corpo enviado @smoke', async ({ request }) => {
    const novoPost = { title: 'Automação de QA', body: 'testando a API com Playwright', userId: 7 };

    const resposta = await request.post(`${BASE_URL}/posts`, { data: novoPost });
    expect(resposta.status()).toBe(201);

    expect(resposta.headers()['content-type']).toContain('application/json');

    const criado = await resposta.json();
    expect(criado).toMatchObject(novoPost);
    expect(criado.id).toBe(101);
  });
});

test.describe('3) PUT / PATCH — atualizar recurso', () => {
  test('PUT /posts/1 substitui o recurso', async ({ request }) => {
    const resposta = await request.put(`${BASE_URL}/posts/1`, {
      data: { id: 1, title: 'título novo', body: 'corpo novo', userId: 1 },
    });
    expect(resposta.status()).toBe(200);

    const atualizado = await resposta.json();
    expect(atualizado.title).toBe('título novo');
  });

  test('PATCH /posts/1 atualiza apenas um campo', async ({ request }) => {
    const resposta = await request.patch(`${BASE_URL}/posts/1`, { data: { title: 'só o título mudou' } });
    expect(resposta.status()).toBe(200);

    const atualizado = await resposta.json();
    expect(atualizado.title).toBe('só o título mudou');
    expect(atualizado.body).toBe(POST_ESPERADO.body);
  });
});

test.describe('4) DELETE — remover recurso', () => {
  test('DELETE /posts/1 responde 200 com corpo vazio', async ({ request }) => {
    const resposta = await request.delete(`${BASE_URL}/posts/1`);
    expect(resposta.status()).toBe(200);

    const corpo = await resposta.text();
    expect(corpo.trim()).toBe('{}');
  });
});

test.describe('5) Erros e casos de borda', () => {
  test('GET /posts/9999 (inexistente) responde 404 com corpo vazio', async ({ request }) => {
    const resposta = await request.get(`${BASE_URL}/posts/9999`);
    expect(resposta.status()).toBe(404);

    const corpo = await resposta.text();
    expect(corpo.trim()).toBe('{}');
  });

  test('GET /rota-que-nao-existe responde 404 (rota inválida)', async ({ request }) => {
    const resposta = await request.get(`${BASE_URL}/rota-que-nao-existe`);
    expect(resposta.status()).toBe(404);
  });
});