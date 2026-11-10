import { test, expect } from '@playwright/test';

test('Adicionar o produto Blue Top ao carrinho e confirmar adição', async ({ page }) => {
  const url = 'https://automationexercise.com/';
  const nomeProduto = 'Blue Top';

  await page.goto(url);

  const cardBlueTop = page
    .locator('.features_items .product-image-wrapper')
    .filter({ hasText: nomeProduto });

  await cardBlueTop.hover();
  await cardBlueTop.locator('.overlay-content .add-to-cart').click();

  await expect(page.getByText('Your product has been added to cart.')).toBeVisible();

  await page.getByRole('link', { name: 'View Cart' }).click();

  await expect(
    page.locator('#cart_info_table').getByRole('link', { name: nomeProduto, exact: true })
  ).toBeVisible();
});