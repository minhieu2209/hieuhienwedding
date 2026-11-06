import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test.beforeEach(async({request})=>{await request.post('http://127.0.0.1:4711/__test/reset');});

test('Invitation moves below a minimal Hero, family portraits follow parents and RSVP has no duplicated event details',async({page})=>{
 await page.goto('/groom/NGV');
 const hero=page.locator('.premium-hero');
 await expect(hero).not.toContainText('Trân trọng kính mời');
 await expect(hero.locator('p').filter({hasText:/^H$/})).toHaveCount(0);
 await expect(hero.locator('h1')).toContainText('Minh Hiếu');
 const invitation=page.locator('#invitation');
 await expect(invitation).toContainText('Trân trọng kính mời');
 await expect(invitation).toContainText('Công ty Cổ phần NGV');
 const first=invitation.locator('article').first();
 await expect(first).toContainText('Nguyễn Văn Lộc');
 const father=await first.getByText('Nguyễn Văn Lộc',{exact:true}).boundingBox();
 const portrait=await first.getByRole('img').boundingBox();
 expect(portrait.y).toBeGreaterThan(father.y+father.height);
 await expect(invitation.getByRole('heading',{name:'Lễ thành hôn',exact:true})).toBeVisible();
 await expect(invitation.getByRole('link',{name:/Xem bản đồ/})).toHaveAttribute('href',/^https:\/\//);
 await invitation.screenshot({path:'.local/redesign-invitation.png'});
 const rsvp=page.locator('section').filter({has:page.locator('#guestName')});
 await expect(rsvp).not.toContainText('Nhà hàng Chen');
 await expect(rsvp).not.toContainText('29 · 11 · 2026');
 await expect(page.locator('#save-the-date')).not.toContainText('Save The Date');
 await expect(page.locator('#countdown').getByRole('heading')).toHaveText('Cùng đếm ngược');
});

test('All 20 album photos load with distinct versioned URLs instead of reusing stale cached paths',async({page})=>{
 test.setTimeout(180_000);
 const legacyRequests=[];
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  const source=url.pathname==='/_next/image'?url.searchParams.get('url'):url.pathname;
  if(/^\/images\/gallery\/gallery-\d+\.jpg$/.test(source??'')){
   legacyRequests.push(source);
   return route.abort(); // Simulate an unusable old cached image at the reused URL.
  }
  return route.continue();
 });
 await page.goto('/groom/NGV');
 const album=page.locator('#album');
 await expect(album.getByRole('button',{name:'Ảnh trước',exact:true})).toBeDisabled();
 await album.scrollIntoViewIfNeeded();
 await album.screenshot({path:'.local/redesign-album.png'});
 const sources=new Set();
 for(let n=1;n<=20;n++){
  const image=album.getByRole('img');
  await expect(image).toHaveAttribute('alt',new RegExp(n+'$'));
  await expect.poll(()=>image.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:20_000}).toBe(true);
  const source=new URL(await image.evaluate(node=>node.currentSrc)).searchParams.get('url');
  expect(source).toMatch(new RegExp(`^/_next/static/media/gallery-${n}\\.[\\w-]+\\.jpg$`));
  sources.add(source);
  if(n<20)await album.getByRole('button',{name:'Ảnh tiếp theo',exact:true}).click();
 }
 expect(sources.size).toBe(20);
 await expect(album.getByRole('button',{name:'Ảnh tiếp theo',exact:true})).toBeDisabled();
 await album.getByRole('button',{name:'Mở ảnh 20',exact:true}).click();
 const enlarged=page.getByRole('dialog').getByRole('img');
 await expect(enlarged).toHaveAttribute('alt',/20$/);
 await expect.poll(()=>enlarged.evaluate(node=>node.complete&&node.naturalWidth>0),{timeout:20_000}).toBe(true);
 expect(sources.has(new URL(await enlarged.evaluate(node=>node.currentSrc)).searchParams.get('url'))).toBe(true);
 await page.keyboard.press('Escape');
 await expect(album.getByRole('button',{name:'Mở ảnh 20',exact:true})).toBeFocused();
 await album.getByRole('group').focus();await page.keyboard.press('ArrowLeft');
 await expect(album.getByRole('img')).toHaveAttribute('alt',/19$/);
 expect(legacyRequests).toEqual([]);
});

test('Only an allowlisted, authenticated administrator can publish or hide wishes in the shared book',async({page,request,context})=>{
 const payload={submission_id:randomUUID(),guest_name:'Moderation fixture',message:'Private until reviewed',moderation_status:'approved'};
 expect((await request.post('/api/invitations/groom-ngv/wishes',{data:payload})).status()).toBe(201);
 let list=await (await request.get('/api/invitations/groom-ngv/wishes')).json();expect(list.wishes.some(w=>w.message===payload.message)).toBe(false);
 await page.goto('/admin/wishes');await expect(page).toHaveURL(/\/admin\/login/);
 await context.addCookies([{name:'wedding_admin_session',value:'forged-cookie',url:'http://127.0.0.1:3100/admin'}]);
 await page.goto('/admin/wishes');await expect(page).toHaveURL(/\/admin\/login/);
 await context.addCookies([{name:'wedding_admin_session',value:'fixture-ordinary-access-token',url:'http://127.0.0.1:3100/admin'}]);
 await page.goto('/admin/wishes');await expect(page).toHaveURL(/\/admin\/login/);
 await context.clearCookies();
 await page.getByLabel('Email',{exact:true}).fill('admin@example.test');
 await page.getByLabel('Mật khẩu',{exact:true}).fill('wrong-password');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await expect(page.getByRole('button',{name:'Đăng nhập',exact:true})).toBeEnabled();
 await page.getByLabel('Email',{exact:true}).fill('admin@example.test');
 await page.getByLabel('Mật khẩu',{exact:true}).fill('fixture-password-2026');
 await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page).toHaveURL(/\/admin\/wishes/);
 const wish=page.locator('article').filter({hasText:payload.message});
 await expect(wish).toBeVisible();await wish.getByRole('button',{name:'Duyệt hiển thị',exact:true}).click();await expect(wish).toHaveCount(0);
 for(const variant of ['groom-ngv','uncle-lee']){
  list=await (await request.get(`/api/invitations/${variant}/wishes`)).json();expect(list.wishes.some(w=>w.message===payload.message)).toBe(true);
 }
 // Retrying the original submission cannot reset an approved wish to pending.
 expect((await request.post('/api/invitations/groom-ngv/wishes',{data:payload})).ok()).toBe(true);
 list=await (await request.get('/api/invitations/groom-ngv/wishes')).json();expect(list.wishes.filter(w=>w.message===payload.message)).toHaveLength(1);
 await page.getByRole('link',{name:'Đã hiển thị',exact:true}).click();
 await page.locator('article').filter({hasText:payload.message}).getByRole('button',{name:'Ẩn lời chúc',exact:true}).click();
 list=await (await request.get('/api/invitations/groom-ngv/wishes')).json();expect(list.wishes.some(w=>w.message===payload.message)).toBe(false);
 await page.getByRole('button',{name:'Đăng xuất',exact:true}).click();await expect(page).toHaveURL(/\/admin\/login/);
 await page.goto('/admin/wishes');await expect(page).toHaveURL(/\/admin\/login/);
});
