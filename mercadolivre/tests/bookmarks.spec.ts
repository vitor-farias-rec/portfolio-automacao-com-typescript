import type { APIResponse } from '@playwright/test';
import { SKIP_MESSAGES, expect, test } from '../../fixtures/auth.fixture';
import { MELI_TEST_DATA } from '../../data/test-data';
import type { MeliBookmark, MeliItem, MeliUser } from '../../types/meli';
import { isMeliTokenExpired, meliTokenExpiresAt } from '../../utils/env';

/**
 * CTs privados — Bookmarks API oficial do Mercado Livre.
 *
 * Executados em série (`describe.serial` + workers=1) porque a exclusão depende
 * do favorito criado pela inclusão e porque a mesma conta é compartilhada.
 *
 * Contratos validados apenas no que é real: status HTTP efetivamente devolvido,
 * Content-Type, corpo JSON quando existe corpo, e o estado da listagem como
 * oráculo. Nenhum código de sucesso é inventado — a faixa 2xx é aceita e o valor
 * exato é registrado no log de cada execução.
 */

function contentTypeOf(response: APIResponse): string {
  return response.headers()['content-type'] ?? '';
}

async function safeJson<T>(response: APIResponse): Promise<T | undefined> {
  if (response.status() === 204) {
    return undefined;
  }
  const text = await response.text();
  if (text.trim().length === 0) {
    return undefined;
  }
  return JSON.parse(text) as T;
}

async function readBookmarks(meliApi: {
  listBookmarks: () => Promise<APIResponse>;
}): Promise<MeliBookmark[]> {
  const response = await meliApi.listBookmarks();
  expect(response.status(), 'GET /users/me/bookmarks deve responder 200').toBe(200);
  expect(contentTypeOf(response), 'Content-Type da listagem deve ser JSON').toContain('application/json');
  const bookmarks = (await response.json()) as MeliBookmark[];
  expect(Array.isArray(bookmarks), 'A listagem de favoritos deve ser um array').toBe(true);
  return bookmarks;
}

test.describe.serial('Bookmarks API oficial do Mercado Livre', () => {
  test.beforeEach(({ meliToken, meliItemId }) => {
    test.skip(!meliToken, SKIP_MESSAGES.token);
    test.skip(!meliItemId, SKIP_MESSAGES.item);
    test.info().annotations.push({
      type: 'credenciais',
      description: 'Token OAuth carregado por variável de ambiente; nenhum segredo é impresso.',
    });

    if (isMeliTokenExpired()) {
      const expiresAt = meliTokenExpiresAt();
      console.log(
        `[Mercado Livre API] Atenção: MELI_TOKEN_EXPIRES_AT indica token expirado ou desconhecido ` +
          `(${expiresAt ? expiresAt.toISOString() : 'sem data'}). Rode "npm run oauth:refresh" se as chamadas retornarem 401.`,
      );
    }
  });

  test('CT-API-MELI-01 — pré-condições do anúncio e da conta autenticada', async ({ meliApi, meliItemId }) => {
    console.log('[Mercado Livre API] Objetivo: garantir que o anúncio é brasileiro, ativo, com estoque e compra imediata, e que não pertence à conta usada no teste.');

    const itemResponse = await meliApi.getItem(meliItemId);
    expect(itemResponse.status(), 'GET /items/{id} deve responder 200 para o item configurado').toBe(200);
    expect(contentTypeOf(itemResponse)).toContain('application/json');

    const item = (await itemResponse.json()) as MeliItem;
    expect(item.id, 'O anúncio devolvido deve ser o mesmo de MELI_ITEM_ID').toBe(meliItemId);
    expect(item.site_id, 'Anúncio precisa ser brasileiro (MLB)').toBe(MELI_TEST_DATA.requiredItem.siteId);
    expect(item.status, 'Anúncio precisa estar ativo').toBe(MELI_TEST_DATA.requiredItem.activeStatus);

    const variationStock = (item.variations ?? []).reduce(
      (total, variation) => total + (variation.available_quantity ?? 0),
      0,
    );
    const availableQuantity = item.available_quantity ?? variationStock;
    expect(availableQuantity, 'Anúncio precisa ter estoque disponível').toBeGreaterThanOrEqual(
      MELI_TEST_DATA.requiredItem.minimumAvailableQuantity,
    );

    if (item.buying_mode !== undefined) {
      expect(item.buying_mode, 'Anúncio precisa permitir compra imediata').toBe(
        MELI_TEST_DATA.requiredItem.buyItNowMode,
      );
    } else {
      console.log('[Mercado Livre API] buying_mode ausente no contrato observado; validação de compra imediata ignorada.');
    }

    const meResponse = await meliApi.getMe();
    expect(meResponse.status(), 'GET /users/me deve responder 200').toBe(200);
    expect(contentTypeOf(meResponse)).toContain('application/json');

    const me = (await meResponse.json()) as MeliUser;
    expect(me.site_id, 'A conta precisa ser brasileira (MLB) para o cenário de UI').toBe('MLB');
    expect(item.seller_id, 'O anúncio não pode pertencer à própria conta usada na avaliação').not.toBe(me.id);

    console.log(
      `[Mercado Livre API] Pré-condições atendidas: item=${item.id} site=${item.site_id} status=${item.status} estoque=${availableQuantity} buying_mode=${item.buying_mode ?? '<ausente no contrato>'} conta=${me.nickname}`,
    );
  });

  test('CT-API-MELI-02 — inclusão do favorito com POST /users/me/bookmarks', async ({ meliApi, meliItemId }) => {
    console.log('[Mercado Livre API] Objetivo: incluir o favorito pela API oficial e comprovar a presença na listagem (oráculo real, não mock).');

    const before = await readBookmarks(meliApi);
    if (before.some((bookmark) => bookmark.item_id === meliItemId)) {
      const cleanup = await meliApi.removeBookmark(meliItemId);
      console.log(`[Mercado Livre API] Favorito residual encontrado e removido antes do CT (status=${cleanup.status()}).`);
    }

    const response = await meliApi.addBookmark(meliItemId);
    const status = response.status();
    const body = await safeJson<MeliBookmark>(response);
    console.log(`[Mercado Livre API] POST /users/me/bookmarks → status=${status} corpo=${body ? JSON.stringify(body) : '<sem corpo>'}`);

    expect(status, 'A inclusão deve retornar sucesso (2xx)').toBeGreaterThanOrEqual(200);
    expect(status, 'A inclusão deve retornar sucesso (2xx)').toBeLessThan(300);

    if (body) {
      expect(contentTypeOf(response), 'Quando há corpo, o Content-Type deve ser JSON').toContain('application/json');
      if (body.item_id !== undefined) {
        expect(body.item_id, 'O corpo deve referenciar o item incluído').toBe(meliItemId);
      }
    } else {
      console.log('[Mercado Livre API] Resposta sem corpo: a comprovação é feita pela listagem.');
    }

    const after = await readBookmarks(meliApi);
    const bookmark = after.find((entry) => entry.item_id === meliItemId);
    expect(bookmark, 'GET /users/me/bookmarks deve listar o item incluído').toBeDefined();
    expect(Number.isNaN(Date.parse(bookmark?.bookmarked_date ?? '')), 'bookmarked_date deve ser uma data válida').toBe(false);

    console.log(`[Mercado Livre API] Favorito confirmado na listagem: item_id=${bookmark?.item_id} bookmarked_date=${bookmark?.bookmarked_date}`);
  });

  test('CT-API-MELI-03 — exclusão do favorito com DELETE /users/me/bookmarks/{ITEM_ID}', async ({ meliApi, meliItemId }) => {
    console.log('[Mercado Livre API] Objetivo: excluir o favorito pela API oficial e comprovar a ausência na listagem.');

    if (!(await meliApi.findBookmark(meliItemId))) {
      const seed = await meliApi.addBookmark(meliItemId);
      console.log(`[Mercado Livre API] Favorito não existia; recriado para o CT de exclusão (status=${seed.status()}).`);
    }

    const response = await meliApi.removeBookmark(meliItemId);
    const status = response.status();
    const text = response.status() === 204 ? '' : await response.text();
    console.log(`[Mercado Livre API] DELETE /users/me/bookmarks/${meliItemId} → status=${status} corpo=${text.length > 0 ? text : '<sem corpo>'}`);

    expect(status, 'A exclusão deve retornar sucesso (2xx)').toBeGreaterThanOrEqual(200);
    expect(status, 'A exclusão deve retornar sucesso (2xx)').toBeLessThan(300);

    if (status !== 204 && text.trim().length > 0) {
      expect(contentTypeOf(response), 'Quando há corpo na exclusão, o Content-Type deve ser JSON').toContain('application/json');
    } else {
      console.log('[Mercado Livre API] Exclusão sem corpo (comportamento equivalente a 204 No Content).');
    }

    const after = await readBookmarks(meliApi);
    expect(
      after.some((entry) => entry.item_id === meliItemId),
      'O item excluído não pode permanecer na listagem de favoritos',
    ).toBe(false);

    console.log('[Mercado Livre API] Ausência confirmada na listagem: estado final limpo.');
  });

  test('CT-API-MELI-04 — estado final sem favorito residual', async ({ meliApi, meliItemId }) => {
    console.log('[Mercado Livre API] Objetivo: garantir que a suíte não deixa favorito residual na conta.');

    const bookmarks = await readBookmarks(meliApi);
    const residual = bookmarks.find((entry) => entry.item_id === meliItemId);

    if (residual) {
      const cleanup = await meliApi.removeBookmark(meliItemId);
      expect(cleanup.status(), 'A limpeza do favorito residual deve retornar sucesso').toBeLessThan(300);
      const listAfterCleanup = await readBookmarks(meliApi);
      expect(
        listAfterCleanup.some((entry) => entry.item_id === meliItemId),
        'Após a limpeza o item não pode constar na listagem',
      ).toBe(false);
      console.log('[Mercado Livre API] Favorito residual removido no encerramento.');
      return;
    }

    expect(bookmarks.length, 'A listagem deve estar acessível e sem o item do cenário').toBeGreaterThanOrEqual(0);
    console.log(`[Mercado Livre API] Nenhum favorito residual para ${meliItemId}. Total de favoritos na conta: ${bookmarks.length}.`);
  });
});
