import { test, expect } from '@playwright/test';

test.use({ deviceScaleFactor: 2 });

async function expectDecoded(image) {
  await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0), { timeout: 20_000 }).toBe(true);
  await expect(image).toBeVisible();
}

for (const width of [390, 1440]) {
  test(`${width}px: sharp images remain loaded when revisiting an album page and scrolling back`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/groom/NGV');
    const hero = page.locator('.premium-hero img');
    await expectDecoded(hero);
    expect(new URL(await hero.evaluate(node => node.currentSrc)).searchParams.get('q')).toBe('90');
    const portraits = page.locator('#invitation').getByRole('img');
    await portraits.first().scrollIntoViewIfNeeded();
    for (const portrait of await portraits.all()) await expectDecoded(portrait);

    const album = page.locator('#album');
    await album.scrollIntoViewIfNeeded();
    await expectDecoded(album.getByRole('img'));
    await album.getByRole('img').evaluate(node => { window.__firstAlbumPhoto = node; });
    expect(new URL(await album.getByRole('img').evaluate(node => node.currentSrc)).searchParams.get('q')).toBe('90');
    await album.getByRole('button', { name: 'Ảnh tiếp theo', exact: true }).click();
    await expectDecoded(album.getByRole('img'));
    expect(await page.evaluate(() => window.__firstAlbumPhoto.isConnected)).toBe(true);
    await album.getByRole('button', { name: 'Ảnh trước', exact: true }).click();
    await expectDecoded(album.getByRole('img'));
    expect(await album.getByRole('img').evaluate(node => node === window.__firstAlbumPhoto)).toBe(true);
    await page.locator('footer').scrollIntoViewIfNeeded();
    await page.locator('.premium-hero').scrollIntoViewIfNeeded();
    await expectDecoded(hero);
    await album.scrollIntoViewIfNeeded();
    await expectDecoded(album.getByRole('img'));
    await expect.poll(() => album.locator('.album-sheet').evaluate(node => getComputedStyle(node).opacity)).toBe('1');
    expect(await album.getByRole('img').evaluate(node => node === window.__firstAlbumPhoto)).toBe(true);

    await album.getByRole('button', { name: 'Mở ảnh 1', exact: true }).click();
    const enlarged = page.getByRole('dialog').getByRole('img');
    await expectDecoded(enlarged);
    expect(new URL(await enlarged.evaluate(node => node.currentSrc)).searchParams.get('q')).toBe('95');
    await page.keyboard.press('Escape');
    await expectDecoded(album.getByRole('img'));
  });
}

test('An unavailable optimizer falls back to the original image instead of leaving a blank photo', async ({ page }) => {
  test.setTimeout(60_000);
  await page.route('**/_next/image?*', route => {
    const url = new URL(route.request().url());
    return url.searchParams.get('url') === '/images/gallery/gallery-1.jpg'
      ? route.fulfill({ status: 500, body: 'Temporary image optimization failure' })
      : route.continue();
  });
  await page.goto('/groom/NGV');
  const album = page.locator('#album');
  await album.scrollIntoViewIfNeeded();
  const image = album.getByRole('img');
  await expect(image).toHaveAttribute('src', '/images/gallery/gallery-1.jpg');
  await expectDecoded(image);
});
