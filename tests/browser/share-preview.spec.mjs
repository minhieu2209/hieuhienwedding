import { test, expect } from '@playwright/test';

test('personal invitation links expose a small, public photo preview in the initial HTML head', async ({ request }) => {
  await request.post('http://127.0.0.1:4711/__test/reset');
  const imageUrl = 'https://hieuhienwedding.vercel.app/images/share/wedding-preview-v1.jpg';
  for (const [path, locale] of [
    ['/groom/friends?guest=GF-test', 'vi_VN'],
    ['/bride/PartronKO?guest=BFKO-test', 'ko_KR'],
  ]) {
    const response = await request.get(path, { headers: { 'User-Agent': 'Zalo/1.0' } });
    expect(response.ok()).toBe(true);
    const head = (await response.text()).split('</head>')[0];
    expect(head).toContain(`property="og:locale" content="${locale}"`);
    expect(head).toContain(`property="og:image" content="${imageUrl}"`);
    expect(head).toContain('property="og:image:width" content="1200"');
    expect(head).toContain('property="og:image:height" content="630"');
    expect(head).toContain(`name="twitter:image" content="${imageUrl}"`);
    expect(head).toContain('name="twitter:card" content="summary_large_image"');
  }
  const image = await request.get('/images/share/wedding-preview-v1.jpg');
  expect(image.ok()).toBe(true);
  expect(image.headers()['content-type']).toContain('image/jpeg');
  expect((await image.body()).length).toBeLessThan(200_000);
});
