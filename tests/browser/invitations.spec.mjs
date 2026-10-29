import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { issueLinks } from '../../scripts/issue-links.mjs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let tokens;
test.beforeEach(async({request})=>{tokens=await (await request.post('http://127.0.0.1:4711/__test/reset')).json();});
const cases=[
 ['/groom/NGV','Minh Hiếu','groom','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định','vi'],
 ['/groom/friends','Minh Hiếu','groom','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định','vi'],
 ['/groom/UFC97','Minh Hiếu','groom','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định','vi'],
 ['/bride/Partron','Thu Hiền','bride','04 · 12 · 2026','Nhà hàng Tam Giao','vi'],
 ['/bride/friends','Thu Hiền','bride','28 · 11 · 2026','Tư gia Nhà gái','vi'],
 ['/UncleLEE','Thu Hiền','bride','2026년 11월 29일','Nhà hàng Chen 01 Nam Định','ko'],
 ['/bride/friends1','Thu Hiền','bride','04 · 12 · 2026','Nhà hàng Tam Giao','vi'],
];
for(const [path,first,side,date,venue,locale] of cases)test(`${path}: correct names, family order, event and language`,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(path);expect(response.status()).toBe(200);
 await expect(page.locator('main')).toHaveAttribute('lang',locale);
 await expect(page.locator('h1 > span').first()).toHaveText(first);
 const content=await page.locator('main').textContent();expect(content).toContain(date);expect(content).toContain(venue);
 const family=page.locator('main > section').filter({has:page.getByRole('heading',{name:locale==='ko'?'소중한 소식을 전합니다':'Trân trọng báo tin',exact:true})});
 expect(await family.locator('article').first().textContent()).toContain(side==='groom'?'Nguyễn Văn Lộc':'Đào Tuấn');
 const day=path==='/bride/Partron'||path==='/bride/friends1'?'4':path==='/bride/friends'?'28':'29';
 expect(await page.locator('#save-the-date .grid-cols-7 > div > div').evaluateAll(nodes=>nodes.filter(node=>node.className.includes('rounded-full')).map(node=>node.textContent.trim()))).toEqual([day+'♥']);
 const countdown=page.locator('.tabular-nums');
 await expect(countdown.first()).not.toHaveText('--');
 const digits=(await countdown.allTextContents()).map(Number);
 const starts=path==='/bride/Partron'||path==='/bride/friends1'?'2026-12-04T17:30:00+07:00':path==='/bride/friends'?'2026-11-28T10:00:00+07:00':'2026-11-29T10:00:00+07:00';
 const seconds=digits[0]*86400+digits[1]*3600+digits[2]*60+digits[3];
 expect(Math.abs(seconds-Math.max(0,Math.floor((Date.parse(starts)-Date.now())/1000)))).toBeLessThan(4);
 if(path==='/groom/NGV'){await page.waitForTimeout(1300);await page.screenshot({path:'.local/groom-ngv.png'});}
 expect(errors).toEqual([]);
});
test('Partron toggles full Korean copy, keeps proper names and has no Vietnamese UI prose',async({page})=>{
 await page.goto('/bride/Partron');await page.getByRole('link',{name:'한국어',exact:true}).click();
 await expect(page.locator('main')).toHaveAttribute('lang','ko');
 await expect(page.locator('h1')).toContainText('Thu Hiền');
 const text=await page.locator('main').textContent();
 for(const leaked of ['chúng mình','Chúng mình','Xem bản đồ','Xác nhận tham dự','Sổ lưu bút','Họ và tên','Save The Date','Wedding'])expect(text).not.toContain(leaked);
 expect(text).toContain('Nhà hàng Tam Giao');expect(text).toContain('2026년 12월 4일');expect(text).toContain('17:30');
 await expect(page.locator('#guestName')).toHaveAttribute('placeholder','회신하시는 분의 성함을 입력해 주세요');
 await expect(page.getByRole('navigation',{name:'언어'})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1400);await page.screenshot({path:'.local/partron-ko.png'});
});
test('Personal names come from Supabase and do not duplicate prefixes or trust khach',async({page,request})=>{
 await page.goto(`/groom/friends?guest=${tokens.token}&khach=Forged`);
 await expect(page.locator('main > section').first()).toContainText('Bạn mẫu & Gia Đình');
 expect(await page.locator('main').textContent()).not.toContain('Bạn Bạn');
 expect(await page.locator('main').textContent()).not.toContain('Forged');
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name:'Em Lan "mẫu"'}});
 await page.reload();await expect(page.locator('main > section').first()).toContainText('Em Lan "mẫu"');
});
test('Wrong-group, missing and invalid tokens never enable individual submissions',async({page,request})=>{
 for(const query of ['',`?guest=${tokens.brideToken}`,'?guest=invalid']){
  await page.goto('/groom/friends'+query);for(const button of await page.locator('form button[type=submit]').all())await expect(button).toBeDisabled();
 }
 const response=await request.post('/api/invitations/groom-friends/rsvp',{data:{submission_id:randomUUID(),guest:tokens.brideToken,guest_name:'Fake',attendance:'yes',guest_count:1}});
 expect(response.status()).toBe(403);
});
test('Both guestbooks are separate, and unclassified legacy wishes stay out',async({page})=>{
 await page.goto('/groom/NGV');await expect(page.getByText('Groom-only wish',{exact:true})).toBeVisible();
 expect(await page.locator('main').textContent()).not.toContain('Bride-only wish');
 await page.goto('/UncleLEE');await expect(page.getByText('Bride-only wish',{exact:true})).toBeVisible();
 const text=await page.locator('main').textContent();expect(text).not.toContain('Groom-only wish');expect(text).not.toContain('Unclassified legacy wish');
});
test('RSVP server binds the correct event and side, normalizes declined count, and supports retry/update',async({request})=>{
 const id=randomUUID();
 const body={submission_id:id,guest:tokens.token,guest_name:'Actual attendee',attendance:'no',guest_count:5,host_side:'bride',event_id:'wedding-reception'};
 expect((await request.post('/api/invitations/groom-friends/rsvp',{data:body})).ok()).toBeTruthy();
 expect((await request.post('/api/invitations/groom-friends/rsvp',{data:body})).ok()).toBeTruthy();
 let state=await (await request.get('http://127.0.0.1:4711/__test/state')).json();
 expect(state.rsvp).toHaveLength(1);expect(state.rsvp[0]).toMatchObject({host_side:'groom',event_id:'groom-wedding',guest_count:0});
 expect((await request.post('/api/invitations/groom-friends/rsvp',{data:{...body,submission_id:randomUUID(),attendance:'yes',guest_count:3}})).ok()).toBeTruthy();
 state=await (await request.get('http://127.0.0.1:4711/__test/state')).json();expect(state.rsvp).toHaveLength(1);expect(state.rsvp[0].guest_count).toBe(3);
});
test('UncleLEE wish stays in bride guestbook despite spoofed metadata; retry adds no duplicate',async({request})=>{
 const body={submission_id:randomUUID(),guest_name:'Bác Lee',message:'축하합니다',host_side:'groom',event_id:'bride-wedding'};
 for(let n=0;n<2;n++)expect((await request.post('/api/invitations/uncle-lee/wishes',{data:body})).ok()).toBeTruthy();
 const state=await (await request.get('http://127.0.0.1:4711/__test/state')).json();
 const rows=state.wishes.filter(row=>row.message==='축하합니다');expect(rows).toHaveLength(1);expect(rows[0]).toMatchObject({host_side:'bride',event_id:'groom-wedding'});
});
test('Form validation, body limits and same-origin checks reject invalid submissions',async({request})=>{
 const base={submission_id:randomUUID(),guest_name:'Name',attendance:'yes',guest_count:1};
 for(const data of [{...base,guest_name:''},{...base,guest_count:999},{...base,attendance:'maybe'},{...base,website:'bot'},{...base,submission_id:'nope'}])expect((await request.post('/api/invitations/groom-ngv/rsvp',{data})).status()).toBe(400);
 expect((await request.post('/api/invitations/groom-ngv/rsvp',{headers:{origin:'https://other.example'},data:base})).status()).toBe(403);
 expect((await request.post('/api/invitations/groom-ngv/wishes',{data:{...base,message:'x'.repeat(9000)}})).status()).toBe(413);
});
test('Pagination with identical timestamps has no duplicates',async({request})=>{
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'paginate'}});
 const first=await (await request.get('/api/invitations/uncle-lee/wishes')).json();expect(first.wishes).toHaveLength(20);expect(first.next).toBeTruthy();
 const second=await (await request.get('/api/invitations/uncle-lee/wishes?cursor='+first.next)).json();
 const ids=[...first.wishes,...second.wishes].map(row=>String(row.id));expect(new Set(ids).size).toBe(ids.length);expect(ids).toHaveLength(26);
});
test('Unapproved translations and paused variants cannot be published by URL',async({page,request})=>{
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'draft-locale',id:'bride-partron',locale:'ko'}});
 expect((await page.goto('/bride/Partron')).status()).toBe(404);
 expect((await page.goto('/bride/Partron?lang=ko')).status()).toBe(404);
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'pause',id:'groom-ngv'}});
 expect((await page.goto('/groom/NGV')).status()).toBe(404);
 expect((await request.post('/api/invitations/groom-ngv/rsvp',{data:{submission_id:randomUUID(),guest_name:'No',attendance:'yes',guest_count:1}})).status()).toBe(404);
});
test('Without server configuration, all seven cards render safely and forms stay unavailable',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [path] of cases){expect((await page.goto('http://127.0.0.1:3101'+path)).status()).toBe(200);for(const button of await page.locator('form button[type=submit]').all())await expect(button).toBeDisabled();}
 expect(errors).toEqual([]);
});
test('Mobile gallery, countdown, keyboard and real form UI work',async({page,request})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:390,height:844});await page.goto(`/bride/friends?guest=${tokens.brideToken}`);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const image=page.getByRole('button',{name:'Mở ảnh 1',exact:true});await image.scrollIntoViewIfNeeded();await image.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('ArrowRight');await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('alt',/2$/);await page.keyboard.press('Escape');
 await page.locator('#guestName').fill('Lan thực tế');await page.getByLabel('Sẽ tham dự',{exact:true}).check();await page.locator('#guestCount').selectOption('2');await page.locator('form').filter({has:page.locator('#guestName')}).locator('button[type=submit]').click();
 await expect(page.getByRole('heading',{name:'Trân trọng cảm ơn',exact:true}).first()).toBeVisible();
 await page.locator('#wishName').fill('Lan');await page.locator('#wishMessage').fill('Chúc hạnh phúc!');await page.locator('form').filter({has:page.locator('#wishName')}).locator('button[type=submit]').click();await expect(page.getByText('Chúc hạnh phúc!',{exact:true})).toBeVisible();
 const state=await (await request.get('http://127.0.0.1:4711/__test/state')).json();expect(state.rsvp[0]).toMatchObject({guest_name:'Lan thực tế',guest_count:2,host_side:'bride'});expect(errors).toEqual([]);
});
test('Issuing links is private, repeatable, and does not rotate already-issued links',async({request})=>{
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'draft-guest'}});
 const directory=await mkdtemp(join(tmpdir(),'wedding-links-'));const output=join(directory,'links.json');
 try{
  const options={databaseUrl:'http://127.0.0.1:4711',key:'fixture-server-key-not-a-real-credential',baseUrl:'https://wedding.example',output};
  const dry=await issueLinks(options);expect(dry.pending).toBe(1);expect(dry.written).toBe(false);
  const first=await issueLinks({...options,write:true});expect(first.created).toBe(1);
  const entries=JSON.parse(await readFile(output,'utf8'));expect(entries).toHaveLength(1);expect(entries[0].status).toBe('ready');
  const second=await issueLinks({...options,write:true});expect(second.created).toBe(0);expect(second.kept).toBe(1);
  expect(JSON.parse(await readFile(output,'utf8'))[0].token).toBe(entries[0].token);
  const missing=await issueLinks({...options,output:join(directory,'lost-output.json'),write:true});expect(missing.created).toBe(0);expect(missing.skipped).toBe(3);
 }finally{await rm(directory,{recursive:true,force:true});}
});
