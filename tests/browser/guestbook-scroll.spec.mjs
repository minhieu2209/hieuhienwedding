import { test, expect } from '@playwright/test';

for (const [width, path, title, more] of [[390, '/groom/NGV', 'Sổ lưu bút', 'Xem thêm lời chúc'], [1440, '/groom/NGV', 'Sổ lưu bút', 'Xem thêm lời chúc'], [390, '/bride/Partron?lang=ko', '축하 메시지', '축하 메시지 더 보기']]) {
  test(`${path} ${width}px: many wishes scroll independently and pagination stays usable`, async ({ page, request }) => {
    await request.post('http://127.0.0.1:4711/__test/reset');
    await request.post('http://127.0.0.1:4711/__test/change', { data: { action: 'paginate' } });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const list = page.getByRole('region', { name: title, exact: true });
    await expect(list.locator('article')).toHaveCount(20);
    const bounds = await list.evaluate(node => ({ client: node.clientHeight, scroll: node.scrollHeight }));
    expect(bounds.scroll).toBeGreaterThan(bounds.client);
    expect(bounds.client).toBeLessThanOrEqual(width < 768 ? 512 : 640);
    await list.scrollIntoViewIfNeeded();
    await list.evaluate(node => node.focus({ preventScroll: true }));
    const pageScroll = await page.evaluate(() => window.scrollY);
    await list.press('End');
    await expect.poll(() => list.evaluate(node => node.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScroll);
    await page.getByRole('button', { name: more, exact: true }).click();
    await expect(list.locator('article')).toHaveCount(27);
    expect(await list.evaluate(node => node.clientHeight)).toBe(bounds.client);
    await expect(page.getByRole('button', { name: more, exact: true })).toHaveCount(0);
    expect(await list.getByRole('heading', { level: 4 }).allTextContents()).toHaveLength(27);
    await list.screenshot({ path: `.local/guestbook-scroll-${width}-${path.includes('ko') ? 'ko' : 'vi'}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
}
