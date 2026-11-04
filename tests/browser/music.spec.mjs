import { test, expect, chromium } from '@playwright/test';

async function mockPlayback(page, blocked = false) {
  await page.addInitScript(({ blocked }) => {
    window.__music = { attempts: [], starts: 0, activated: false };
    // CDP evaluation can grant browser activation; only real DOM input unlocks this mock.
    for (const name of ['click', 'touchend', 'keydown']) document.addEventListener(name, event => {
      if (event.isTrusted) window.__music.activated = true;
    }, { capture: true });
    const paused = new WeakMap();
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { configurable: true, get() { return paused.get(this) ?? true; } });
    HTMLMediaElement.prototype.load = function () {};
    HTMLMediaElement.prototype.play = function () {
      window.__music.attempts.push(this.getAttribute('src'));
      if (blocked && !window.__music.activated) return Promise.reject(new DOMException('Activation required', 'NotAllowedError'));
      paused.set(this, false);
      window.__music.starts++;
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () { paused.set(this, true); this.dispatchEvent(new Event('pause')); };
  }, { blocked });
}

test('Music autoplays when permitted; pause, track selection and the updated popup work', async ({ page }) => {
  await mockPlayback(page);
  await page.goto('/groom/NGV');
  await expect(page.locator('audio')).toHaveAttribute('autoplay', '');
  await expect(page.locator('audio')).toHaveAttribute('preload', 'auto');
  await expect.poll(() => page.evaluate(() => window.__music.starts)).toBe(1);
  const disc = page.locator('[data-music-player=disc]');
  await expect(disc).toHaveCSS('animation-play-state', 'running');
  const initialRotation = await disc.evaluate(node => getComputedStyle(node).transform);
  await expect.poll(() => disc.evaluate(node => getComputedStyle(node).transform)).not.toBe(initialRotation);
  await expect(page.getByText('Made by groom', { exact: true })).toHaveCSS('text-transform', 'none');
  await page.getByRole('button', { name: 'Mở danh sách nhạc', exact: true }).click();
  const panel = page.locator('[data-music-player=panel]');
  await expect(panel.getByText('Tặng mọi người list nhạc đám cưới ạ ^^', { exact: true })).toBeVisible();
  await expect(panel.getByText('Danh sách nhạc', { exact: true })).toHaveCount(0);
  await panel.getByRole('button', { name: 'Tạm dừng', exact: true }).click();
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.paused)).toBe(true);
  await expect(page.locator('audio')).not.toHaveAttribute('autoplay');
  await expect(disc).toHaveCSS('animation-play-state', 'paused');
  const pausedRotation = await disc.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(150);
  expect(await disc.evaluate(node => getComputedStyle(node).transform)).toBe(pausedRotation);
  await panel.getByRole('button', { name: 'Bài tiếp theo', exact: true }).click();
  await expect(page.locator('audio')).toHaveAttribute('src', '/music/MotDoi.mp3');
  expect(await page.evaluate(() => window.__music.starts)).toBe(1);
  await panel.getByRole('button', { name: 'Đóng danh sách nhạc', exact: true }).click();
  await page.locator('h1').click();
  await page.getByRole('button', { name: 'Mở danh sách nhạc', exact: true }).click();
  expect(await page.evaluate(() => window.__music.starts)).toBe(1);
  await panel.getByRole('button', { name: /Lễ Đường/ }).click();
  await expect(page.locator('audio')).toHaveAttribute('src', '/music/LeDuong.mp3');
  await expect.poll(() => page.evaluate(() => window.__music.starts)).toBe(2);
  await expect(disc).toHaveCSS('animation-play-state', 'running');
  await page.locator('audio').evaluate(audio => audio.dispatchEvent(new Event('ended')));
  await expect(page.locator('audio')).toHaveAttribute('src', '/music/BeautifulInWhite.mp3');
  await expect.poll(() => page.evaluate(() => window.__music.starts)).toBe(3);
});

for (const gesture of ['page', 'music button']) {
  test(`Blocked autoplay resumes on the first ${gesture} interaction and respects a later pause`, async ({ page }) => {
    await mockPlayback(page, true);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('/groom/NGV');
    await expect.poll(() => page.evaluate(() => window.__music.attempts.length)).toBe(1);
    expect(await page.evaluate(() => window.__music.starts)).toBe(0);
    await expect(page.locator('audio')).not.toHaveAttribute('autoplay');
    await expect(page.locator('audio')).toHaveAttribute('preload', 'metadata');
    await expect(page.locator('[data-music-player=disc]')).toHaveCSS('animation-play-state', 'paused');
    if (gesture === 'page') await page.locator('h1').click();
    else await page.getByRole('button', { name: 'Mở danh sách nhạc', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__music.starts)).toBe(1);
    await page.locator('h1').click();
    expect(await page.evaluate(() => window.__music.starts)).toBe(1);
    if (gesture === 'page') await page.getByRole('button', { name: 'Mở danh sách nhạc', exact: true }).click();
    await page.locator('[data-music-player=panel]').getByRole('button', { name: 'Tạm dừng', exact: true }).click();
    await page.locator('h1').click();
    expect(await page.evaluate(() => window.__music.starts)).toBe(1);
    await expect.poll(() => page.locator('audio').evaluate(audio => audio.paused)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('Real MP3 autoplay starts from server HTML without waiting for JavaScript when the browser permits it', async () => {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined, headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto('http://127.0.0.1:3100/groom/NGV');
    await expect.poll(() => page.locator('audio').evaluate(audio => !audio.paused && audio.currentTime > 0), { timeout: 15000 }).toBe(true);
  } finally { await browser.close(); }
});

test('Reduced motion keeps the music disc still while playback continues', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockPlayback(page);
  await page.goto('/groom/NGV');
  await expect.poll(() => page.evaluate(() => window.__music.starts)).toBe(1);
  await expect(page.locator('[data-music-player=disc]')).toHaveCSS('animation-name', 'none');
});
