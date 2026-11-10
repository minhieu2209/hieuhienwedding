import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.post('http://127.0.0.1:4711/__test/reset');
});

test('Korean bride reception guest sees own name, Partron event and Korean-only UI', async ({ page, request }) => {
  await page.goto('/bride/PartronKO?guest=BFKO-test&lang=vi');
  await expect(page.locator('main')).toHaveAttribute('lang', 'ko');
  await expect(page.locator('#invitation h2').first()).toHaveText('테스트 손님');
  await expect(page.locator('#invitation')).toContainText('2026년 12월 4일');
  await expect(page.locator('#invitation')).toContainText('17:30');
  await expect(page.locator('#invitation')).toContainText('Nhà hàng Tam Giao');
  await expect(page.locator('#invitation')).toContainText('결혼 피로연');
  await expect(page.locator('#invitation')).toContainText('소중한 분들을 모십니다');
  await expect(page.locator('#invitation')).not.toContainText('Partron Vina 임직원 여러분');
  await expect(page.getByRole('navigation', { name: '언어' })).toHaveCount(0);

  await page.getByRole('radio', { name: '참석하겠습니다', exact: true }).check();
  await page.locator('form').filter({ has: page.locator('#guestName') }).locator('button[type=submit]').click();
  await expect(page.getByRole('status').filter({ hasText: '회신해주셔서 감사드립니다.' })).toBeVisible();
  const state = await (await request.get('http://127.0.0.1:4711/__test/state')).json();
  expect(state.rsvp[0]).toMatchObject({ invitation_variant_id: 'bride-partron-ko', event_id: 'wedding-reception', host_side: 'bride' });
});

test('A Korean guest code cannot unlock the Vietnamese Partron invitation or another guest', async ({ page }) => {
  await page.goto('/bride/PartronKO?guest=BFKO-unknown');
  await expect(page.locator('#invitation h2').first()).toHaveText('소중한 손님께');
  await expect(page.locator('form').filter({ has: page.locator('#guestName') }).locator('button[type=submit]')).toBeDisabled();
  await page.goto('/bride/Partron?guest=BFKO-test');
  await expect(page.locator('#invitation h2').first()).not.toHaveText('테스트 손님');
});
