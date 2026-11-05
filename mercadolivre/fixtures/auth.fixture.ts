import fs from 'node:fs';
import { test as base, request as playwrightRequest } from '@playwright/test';
import { MeliApiClient } from '../utils/meli-api';
import {
  AUTH_STORAGE_STATE_PATH,
  MELI_API_BASE_URL,
  hasAuthStorageState,
  meliAccessToken,
  meliItemId,
  redact,
} from '../utils/env';

/**
 * Fixtures compartilhadas.
 *
 * `meliApi` cria um APIRequestContext próprio e injeta o header Bearer
 * explicitamente — a fixture `{ request }` do Playwright não herda cookies do
 * navegador, e o token OAuth da API também não autentica a interface web.
 */
export interface MeliFixtures {
  /** Access token OAuth (string vazia quando não configurado). */
  meliToken: string;
  /** Item id configurado em MELI_ITEM_ID (string vazia quando não configurado). */
  meliItemId: string;
  /** Indica se há credenciais de API configuradas. */
  meliApiEnabled: boolean;
  /** Cliente real da Bookmarks API oficial. */
  meliApi: MeliApiClient;
}

export const test = base.extend<MeliFixtures>({
  meliToken: async ({}, use) => {
    await use(meliAccessToken() ?? '');
  },

  meliItemId: async ({}, use) => {
    await use(meliItemId() ?? '');
  },

  meliApiEnabled: async ({ meliToken }, use) => {
    await use(meliToken.length > 0);
  },

  meliApi: async ({ meliToken }, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: MELI_API_BASE_URL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        ...(meliToken ? { Authorization: `Bearer ${meliToken}` } : {}),
      },
    });

    try {
      await use(new MeliApiClient(context, meliToken));
    } finally {
      await context.dispose();
    }
  },
});

export { expect } from '@playwright/test';

/** Mensagem única para pular testes autenticados com motivo claro e rastreável. */
export const SKIP_MESSAGES = {
  token:
    'BLOQUEADO: MELI_ACCESS_TOKEN não configurado. Rode "npm run oauth:url", "npm run oauth:exchange" e depois "npm run setup:verify".',
  item:
    'BLOQUEADO: MELI_ITEM_ID não configurado. Escolha um anúncio ativo com compra imediata (ver README, seção "Escolha do MELI_ITEM_ID").',
  storageState:
    `BLOQUEADO: storage state ausente em ${AUTH_STORAGE_STATE_PATH}. Rode "npm run auth:save" (Chromium headed) e conclua o login manualmente.`,
  pkce: 'BLOQUEADO: o projeto usa PKCE (S256); configure MELI_PKCE_ENABLED=true e habilite PKCE na aplicação Developers.',
} as const;

export function storageStateExists(): boolean {
  return hasAuthStorageState() && fs.statSync(AUTH_STORAGE_STATE_PATH).size > 0;
}

export function describeSession(): string {
  if (!storageStateExists()) {
    return 'sessão web: <ausente>';
  }
  const { mtime } = fs.statSync(AUTH_STORAGE_STATE_PATH);
  return redact(`sessão web: ${AUTH_STORAGE_STATE_PATH} (modificada em ${mtime.toISOString()})`);
}
