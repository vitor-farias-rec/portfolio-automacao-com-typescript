import { SKIP_MESSAGES, expect, storageStateExists, test } from '../../fixtures/auth.fixture';
import { MELI_TEST_DATA } from '../../data/test-data';
import { CartPage } from '../../pages/CartPage';
import { FavoritesPage } from '../../pages/FavoritesPage';
import { ProductPage } from '../../pages/ProductPage';
import { capture } from '../../utils/evidence';

/**
 * CT-E2E-01 — único CT de interface do Mercado Livre.
 *
 * Pré-condições:
 *  - storage state válido (npm run auth:save) da MESMA conta do token OAuth;
 *  - MELI_ITEM_ID apontando para anúncio ativo, com estoque, compra imediata e sem variação obrigatória;
 *  - favorito e item de carrinho residuais removidos antes do cenário.
 *
 * Resultado esperado: produto favoritado pela interface, presente em Favoritos,
 * mantido após refresh, aberto novamente a partir dos Favoritos, removido dos
 * favoritos, adicionado ao carrinho e comprovado no carrinho — sem finalizar compra.
 *
 * Regras aplicadas: POM para toda interação, `expect` somente aqui, nenhuma espera
 * fixa (`waitForTimeout`), limpeza em `finally` mesmo após falha recuperável.
 */
test.describe('Favoritos → Carrinho (Mercado Livre)', () => {
  test('CT-E2E-01 — favoritar pela UI, validar persistência, remover dos favoritos e comprovar no carrinho', async (
    { page, meliApi, meliApiEnabled, meliItemId },
    testInfo,
  ) => {
    test.skip(!storageStateExists(), SKIP_MESSAGES.storageState);
    test.skip(!meliItemId, SKIP_MESSAGES.item);
    test.setTimeout(6 * 60_000);

    const productPage = new ProductPage(page);
    const favoritesPage = new FavoritesPage(page);
    const cartPage = new CartPage(page);

    let productTitle = '';
    let favoritedByUi = false;
    let addedToCartByUi = false;

    /**
     * Oráculo adicional de sincronização UI ↔ API (não substitui as verificações de interface).
     * Usa `expect.poll` porque a sincronização entre web e API é eventualmente consistente.
     */
    const expectBookmarkInApi = async (expected: boolean, afterAction: string): Promise<void> => {
      if (!meliApiEnabled) {
        console.log(`[Oráculo API] Ignorado após "${afterAction}": token OAuth não configurado.`);
        return;
      }
      await expect
        .poll(async () => Boolean(await meliApi.findBookmark(meliItemId)), {
          message: `GET /users/me/bookmarks deve refletir o estado após "${afterAction}"`,
          timeout: MELI_TEST_DATA.timeouts.eventualConsistency,
          intervals: [500, 1_000, 2_000],
        })
        .toBe(expected);
      console.log(`[Oráculo API] Listagem sincronizada após "${afterAction}": favorito ${expected ? 'presente' : 'ausente'}.`);
    };

    try {
      await test.step('0. Preparar cenário removendo favorito e item de carrinho residuais', async () => {
        await favoritesPage.open();
        if (await favoritesPage.isItemVisible(meliItemId, 5_000)) {
          await favoritesPage.removeItemById(meliItemId);
          console.log('[Cenário] Favorito residual removido antes do CT.');
        } else {
          console.log('[Cenário] Nenhum favorito residual para o item configurado.');
        }
        await capture(page, '00-favoritos-antes', testInfo);

        await cartPage.open();
        if (await cartPage.isItemVisible(meliItemId, 5_000)) {
          await cartPage.removeItemById(meliItemId);
          console.log('[Cenário] Item residual removido do carrinho antes do CT.');
        } else {
          console.log('[Cenário] Nenhum item residual no carrinho.');
        }
        await capture(page, '00-carrinho-antes', testInfo);
      });

      await test.step('1. Abrir anúncio disponível', async () => {
        await productPage.openItem(meliItemId);
        productTitle = await productPage.getTitle();
        expect(productTitle.length, 'O anúncio precisa expor um título').toBeGreaterThan(0);
        expect(await productPage.isFavorite(), 'Pré-condição: anúncio deve começar NÃO favoritado').toBe(false);
        console.log(`[Cenário] Anúncio aberto: "${productTitle}"`);
        await capture(page, '01-anuncio-aberto', testInfo);
      });

      await test.step('2. Adicionar o produto aos favoritos pela interface', async () => {
        await productPage.addToFavorites();
        favoritedByUi = true;
        expect(await productPage.isFavorite(), 'O botão deve passar ao estado "Excluir dos favoritos"').toBe(true);
        await expectBookmarkInApi(true, 'inclusão pela interface');
        await capture(page, '02-produto-favoritado', testInfo);
      });

      await test.step('3. Acessar a área de Favoritos pela interface', async () => {
        await favoritesPage.open();
        expect(new URL(await favoritesPage.currentUrl()).pathname, 'A área de Favoritos deve estar aberta').toContain(
          '/bookmarks',
        );
        await capture(page, '03-area-favoritos', testInfo);
      });

      await test.step('4. Comprovar que o produto está presente nos Favoritos', async () => {
        expect(await favoritesPage.isItemVisible(meliItemId), 'O produto favoritado deve aparecer na listagem').toBe(
          true,
        );
        const titles = await favoritesPage.getVisibleItemTitles();
        console.log(`[Cenário] Rótulos visíveis na listagem (amostra): ${titles.slice(0, 5).join(' | ')}`);
        await capture(page, '04-produto-nos-favoritos', testInfo);
      });

      await test.step('5. Atualizar a página (refresh) e confirmar que o favorito permanece', async () => {
        await favoritesPage.reload();
        await favoritesPage.waitForLoaded();
        expect(await favoritesPage.isItemVisible(meliItemId), 'Após o refresh o favorito deve permanecer').toBe(true);
        await capture(page, '05-favorito-apos-refresh', testInfo);
      });

      await test.step('6. Abrir novamente o produto a partir dos Favoritos', async () => {
        await favoritesPage.openItemById(meliItemId);
        await productPage.waitForLoaded();
        const titleFromFavorites = await productPage.getTitle();
        expect(titleFromFavorites, 'O produto aberto pelos Favoritos deve ser o mesmo do cenário').toBe(productTitle);
        expect(await productPage.isFavorite(), 'O anúncio deve continuar favoritado').toBe(true);
        await capture(page, '06-produto-aberto-pelos-favoritos', testInfo);
      });

      await test.step('7. Remover o produto dos favoritos pela interface', async () => {
        await productPage.removeFromFavorites();
        favoritedByUi = false;
        expect(await productPage.isFavorite(), 'O botão deve voltar ao estado "Adicionar aos favoritos"').toBe(false);
        await expectBookmarkInApi(false, 'exclusão pela interface');
        await capture(page, '07-produto-removido-dos-favoritos', testInfo);
      });

      await test.step('8. Adicionar o mesmo produto ao carrinho pela interface', async () => {
        await productPage.addToCart();
        addedToCartByUi = true;
        await capture(page, '08-produto-adicionado-ao-carrinho', testInfo);
      });

      await test.step('9. Abrir o carrinho e comprovar a presença do produto', async () => {
        await cartPage.open();
        expect(await cartPage.isItemVisible(meliItemId), 'O produto adicionado deve estar no carrinho').toBe(true);
        expect(await cartPage.containsText(productTitle.slice(0, 25), 10_000), 'O título do produto deve aparecer no carrinho').toBe(
          true,
        );
        await capture(page, '09-produto-no-carrinho', testInfo);
        console.log('[Cenário] Produto comprovado no carrinho. Nenhuma etapa de checkout foi executada.');
      });
    } finally {
      await test.step('10. Encerrar e limpar o cenário (sem finalizar compra)', async () => {
        if (favoritedByUi) {
          try {
            await favoritesPage.open();
            if (await favoritesPage.isItemVisible(meliItemId, 5_000)) {
              await favoritesPage.removeItemById(meliItemId);
            }
            console.log('[Limpeza] Favorito removido no encerramento.');
          } catch (error) {
            console.log(`[Limpeza] Não foi possível remover o favorito: ${(error as Error).message}`);
          }
        }

        if (addedToCartByUi) {
          try {
            if (!page.url().includes('/gz/cart')) {
              await cartPage.open();
            }
            if (await cartPage.isItemVisible(meliItemId, 5_000)) {
              await cartPage.removeItemById(meliItemId);
            }
            console.log('[Limpeza] Carrinho higienizado.');
          } catch (error) {
            console.log(`[Limpeza] Não foi possível remover o item do carrinho: ${(error as Error).message}`);
          }
        }

        await capture(page, '10-limpeza-final', testInfo).catch(() => undefined);

        if (meliApiEnabled) {
          try {
            const remaining = await meliApi.findBookmark(meliItemId);
            console.log(
              `[Limpeza] Oráculo API após encerramento: favorito ${remaining ? 'AINDA presente' : 'ausente'} para ${meliItemId}.`,
            );
          } catch (error) {
            console.log(`[Limpeza] Consulta do oráculo falhou: ${(error as Error).message}`);
          }
        }

        console.log('[Encerramento] Nenhuma compra foi finalizada: o fluxo para antes do checkout.');
      });
    }
  });
});
