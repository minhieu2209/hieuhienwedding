import { test,expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const copies=JSON.parse(await readFile(new URL('../../data/invitation-copy.json',import.meta.url),'utf8'));
test.beforeEach(async({request})=>{await request.post('http://127.0.0.1:4711/__test/reset');});

for(const [path,id,recipient,eventTitle] of [['/bride/Partron?lang=ko','bride-partron','파트론 비나 임직원 여러분께','결혼 피로연'],['/UncleLEE','uncle-lee','이준석 선생님께','결혼식']]){
 test(`${id}: reviewed recipient, dynamic day count and paragraph breaks render on mobile and desktop`,async({page})=>{
  const copy=copies.find(row=>row.variant_id===id&&row.locale==='ko').content;
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:900});await page.goto(path);
   await expect(page.locator('main')).toHaveAttribute('lang','ko');
   await expect(page.locator('#invitation h2').first()).toHaveText(recipient);
   await expect(page.locator('#invitation').getByRole('heading',{name:eventTitle,exact:true})).toBeVisible();
   await expect(page.locator('#save-the-date').getByRole('heading').first()).toHaveText('Save The Date');
   await expect(page.locator('#album').getByRole('heading')).toHaveText('우리의 아름다운 순간들');
   const countdown=page.locator('#countdown');await expect(countdown.locator('.tabular-nums').first()).not.toHaveText('--');
   const days=Number(await countdown.locator('.tabular-nums').first().textContent());
   await expect(countdown.getByRole('heading')).toHaveText(`우리의 결혼식까지 ${days}일 남았습니다`);
   const thanks=page.locator('footer p').filter({hasText:copy.footerThanks.split('\n')[0]});
   await expect(thanks).toHaveText(copy.footerThanks);await expect(thanks).toHaveCSS('white-space','pre-line');
   expect(await thanks.textContent()).toContain('\n\n');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
   await page.locator('#invitation').getByRole('img').first().scrollIntoViewIfNeeded();
   await expect.poll(()=>page.locator('#invitation').getByRole('img').evaluateAll(images=>images.every(image=>image.complete&&image.naturalWidth>0)),{timeout:10000}).toBe(true);
   await page.locator('#invitation').screenshot({path:`.local/reviewed-${id}-${width}.png`});
  }
 });

 test(`${id}: reviewed RSVP thank-you is shown after sending`,async({page})=>{
  await page.goto(path);await page.locator('#guestName').fill('Fixture guest');
  await page.getByRole('radio',{name:'참석하겠습니다',exact:true}).check();
  await page.locator('form').filter({has:page.locator('#guestName')}).locator('button[type=submit]').click();
  await expect(page.getByRole('status').filter({hasText:'회신해주셔서 감사드립니다.'})).toBeVisible();
 });
}
