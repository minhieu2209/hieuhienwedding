import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
let legacy;
test.beforeEach(async ({ request }) => {
  legacy = await (await request.post('http://127.0.0.1:4711/__test/reset')).json();
  await request.post('http://127.0.0.1:4711/__test/change', { data: { action: 'code-guest' } });
});

for (const [path, code, name] of [['/groom/friends', 'GF-test', 'Bạn mẫu & Gia Đình'], ['/bride/friends', 'BF-test', 'Lan mẫu'], ['/bride/friends1', 'BF1-code', 'Bạn đồng nghiệp mẫu'], ['/groom/friends', 'GF-code', 'Em khách mới']]) {
  test(`${path}: ${code} resolves the correct recipient and enables forms`, async ({ page }) => {
    await page.goto(`${path}?guest=${code}&khach=Forged`);
    await expect(page.locator('#invitation h2').first()).toHaveText(name);
    await expect(page.locator('#guestName')).toHaveValue(name);
    for (const button of await page.locator('form button[type=submit]').all()) await expect(button).toBeEnabled();
    expect(await page.locator('#invitation').textContent()).not.toContain('Forged');
  });
}

test('A new guest without a token submits RSVP and a moderated wish using their code', async ({ page, request }) => {
  await page.goto('/groom/friends?guest=GF-code');
  await page.getByLabel('Sẽ tham dự', { exact: true }).check();
  const rsvpRequest = page.waitForRequest(req => req.url().endsWith('/rsvp') && req.method() === 'POST');
  await page.locator('form').filter({ has: page.locator('#guestName') }).locator('button[type=submit]').click();
  expect((await rsvpRequest).postDataJSON().guest).toBe('GF-code');
  await expect(page.getByRole('status').filter({ hasText: 'Cảm ơn Em' })).toBeVisible();
  await page.locator('#wishName').fill('Khách mẫu');
  await page.locator('#wishMessage').fill('Chúc hai người hạnh phúc!');
  const wishRequest = page.waitForRequest(req => req.url().endsWith('/wishes') && req.method() === 'POST');
  await page.locator('form').filter({ has: page.locator('#wishName') }).locator('button[type=submit]').click();
  expect((await wishRequest).postDataJSON().guest).toBe('GF-code');
  await expect(page.getByRole('status').filter({ hasText: 'Lời chúc sẽ hiển thị sau khi được duyệt' })).toBeVisible();
  const state = await (await request.get('http://127.0.0.1:4711/__test/state')).json();
  const guest = state.guests.find(row => row.guest_code === 'GF-code');
  expect(guest.invite_token_hash).toBeNull();
  expect(state.rsvp).toHaveLength(1);
  expect(state.rsvp[0]).toMatchObject({ guest_id: guest.id, event_id: 'groom-wedding', host_side: 'groom' });
  expect(state.wishes.find(row => row.message === 'Chúc hai người hạnh phúc!')).toMatchObject({ guest_id: guest.id, moderation_status: 'pending' });
});

test('Code links and old links update the same RSVP instead of creating duplicates', async ({ request, page }) => {
  for (const [reference, count] of [['GF-test', 1], [legacy.token, 2]]) {
    const response = await request.post('/api/invitations/groom-friends/rsvp', { data: { guest: reference, guest_name: 'Guest fixture', attendance: 'yes', guest_count: count, submission_id: randomUUID() } });
    expect(response.ok()).toBe(true);
  }
  await page.goto(`/groom/friends?guest=${legacy.token}`);
  await expect(page.locator('#invitation h2').first()).toHaveText('Bạn mẫu & Gia Đình');
  await page.getByLabel('Sẽ tham dự', { exact: true }).check();
  const submitted = page.waitForRequest(req => req.url().endsWith('/rsvp') && req.method() === 'POST');
  await page.locator('form').filter({ has: page.locator('#guestName') }).locator('button[type=submit]').click();
  expect((await submitted).postDataJSON().guest).toBe('GF-test');
  await expect(page.getByRole('status').filter({ hasText: 'đã nhận được phản hồi' })).toBeVisible();
  const state = await (await request.get('http://127.0.0.1:4711/__test/state')).json();
  expect(state.rsvp).toHaveLength(1);
  expect(state.rsvp[0].guest_id).toBe(state.guests.find(row => row.guest_code === 'GF-test').id);
});

test('Unknown, wrong-group and inactive codes cannot submit; inactive legacy links are also rejected', async ({ page, request }) => {
  await request.post('http://127.0.0.1:4711/__test/change', { data: { action: 'deactivate', code: 'GF-test' } });
  for (const reference of ['', 'GF-missing', 'BF-test', 'GF-test', legacy.token, 'GF-code.invalid']) {
    await page.goto(`/groom/friends?guest=${encodeURIComponent(reference)}`);
    for (const button of await page.locator('form button[type=submit]').all()) await expect(button).toBeDisabled();
    const data = { guest: reference, guest_name: 'Fixture', submission_id: randomUUID(), attendance: 'yes', guest_count: 1, message: 'Fixture wish' };
    for (const action of ['rsvp', 'wishes']) expect((await request.post(`/api/invitations/groom-friends/${action}`, { data })).status()).toBe(403);
  }
});
