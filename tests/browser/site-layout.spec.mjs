import { test, expect } from '@playwright/test';

const paths = ['/groom/NGV', '/groom/friends', '/groom/UFC97', '/bride/Partron', '/bride/friends', '/UncleLEE', '/bride/friends1'];

async function frameBounds(page) {
  return page.locator('.site-frame').evaluate(frame => {
    const { left, right, width } = frame.getBoundingClientRect();
    return { left, right, width, viewport: document.documentElement.clientWidth };
  });
}

async function expectInsideFrame(locator, frame) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds.x).toBeGreaterThanOrEqual(frame.left - 1);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(frame.right + 1);
}

for (const width of [320, 390, 812, 1000, 1440, 1920]) {
  test(`centered site: ${width}px viewport keeps the site centered and music at the viewport corner`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/bride/Partron');
    const frame = await frameBounds(page);
    expect(frame.width).toBe(Math.min(1000, frame.viewport));
    expect(Math.abs(frame.left - (frame.viewport - frame.width) / 2)).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    for (const section of await page.locator('main > section, main > footer').all()) {
      await expectInsideFrame(section, frame);
    }
    const language = page.getByRole('navigation', { name: 'Ngôn ngữ', exact: true });
    const music = page.getByRole('button', { name: 'Mở danh sách nhạc', exact: true });
    await expectInsideFrame(language, frame);
    const viewport = { left: 0, right: frame.viewport };
    await expectInsideFrame(music, viewport);
    const initialMusic = await music.boundingBox();
    await page.locator('footer').scrollIntoViewIfNeeded();
    expect(Math.abs((await music.boundingBox()).y - initialMusic.y)).toBeLessThan(1);
    await expectInsideFrame(language, frame);
    await expectInsideFrame(music, viewport);

    await music.click();
    const panel = page.locator('[data-music-player=panel]');
    await expect(panel).toHaveCSS('opacity', '1');
    await expectInsideFrame(panel, viewport);
    const musicBounds = await music.boundingBox();
    expect(Math.abs(frame.viewport - (musicBounds.x + musicBounds.width) - (width >= 768 ? 28 : 20))).toBeLessThan(1);
    if (width > 1000) expect(musicBounds.x + musicBounds.width).toBeGreaterThan(frame.right);
    await music.click();

    await page.getByRole('button', { name: 'Mở ảnh 1', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const overlayFrame = await frameBounds(page);
    await expectInsideFrame(dialog, overlayFrame);
    expect((await dialog.boundingBox()).width).toBe(overlayFrame.width);
    await expectInsideFrame(dialog.getByRole('img'), overlayFrame);
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('img')).toHaveAttribute('alt', /2$/);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    if (width === 390 || width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `.local/site-layout-${width}.png` });
    }
  });
}

test('centered site: all seven invitations share the full-page frame', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const path of paths) {
    expect((await page.goto(path)).status()).toBe(200);
    const frame = await frameBounds(page);
    expect(frame.width).toBe(1000);
    await expectInsideFrame(page.locator('.premium-hero'), frame);
    await expectInsideFrame(page.locator('footer'), frame);
  }
});
