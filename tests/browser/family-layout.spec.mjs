import { test, expect } from '@playwright/test';

for (const [path, locale] of [['/groom/NGV', 'vi'], ['/bride/friends', 'vi'], ['/bride/Partron', 'vi'], ['/bride/Partron', 'ko'], ['/UncleLEE', 'ko']]) {
  test(`${path} ${locale}: fathers, mothers and portraits align when parent names wrap`, async ({ page }) => {
    for (const width of [320, 360, 390, 430, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      if (path === '/bride/Partron' && locale === 'ko') await page.getByRole('link', { name: 'KOR', exact: true }).click();
      await expect(page.locator('main')).toHaveAttribute('lang', locale);
      await page.evaluate(() => document.fonts.ready);

      const details = page.locator('#invitation');
      const families = details.locator('article');
      await expect(families).toHaveCount(2);
      await families.first().getByRole('img').scrollIntoViewIfNeeded();
      await expect.poll(() => details.getByRole('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
      if (width === 320) await details.screenshot({ path: `.local/family-${path.slice(1).replaceAll('/', '-')}-${locale}-${width}.png` });
      const portraits = await Promise.all((await families.all()).map(family => family.getByRole('img').boundingBox()));
      expect(portraits.every(Boolean)).toBe(true);
      expect(Math.abs(portraits[0].y - portraits[1].y), `${path} at ${width}px: portrait tops`).toBeLessThan(1);
      expect(Math.abs(portraits[0].height - portraits[1].height), `${path} at ${width}px: portrait heights`).toBeLessThan(1);
      const parentNames = [];
      for (const [index, family] of (await families.all()).entries()) {
        const parents = family.locator('p').filter({ hasText: /^(Bố|Mẹ|아버지|어머니):/ });
        await expect(parents).toHaveCount(2);
        parentNames.push(await Promise.all((await parents.all()).map(parent => parent.locator('span').last().boundingBox())));
        for (const parent of await parents.all()) {
          const bounds = await parent.boundingBox();
          expect(bounds.y + bounds.height).toBeLessThanOrEqual(portraits[index].y);
        }
        const name = await family.getByRole('heading', { level: 3 }).boundingBox();
        expect(name.y).toBeGreaterThanOrEqual(portraits[index].y + portraits[index].height);
      }
      for (const [index, role] of ['father', 'mother'].entries()) {
        expect(Math.abs(parentNames[0][index].y - parentNames[1][index].y), `${path} ${locale} at ${width}px: ${role} names`).toBeLessThan(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  });
}
