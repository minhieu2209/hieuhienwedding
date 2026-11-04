import { test, expect } from '@playwright/test';
let token;
test.beforeEach(async({request})=>{token=(await (await request.post('http://127.0.0.1:4711/__test/reset')).json()).token;});

async function expectVoice(page,self){
 const welcome=page.locator('#invitation h2').first().locator('xpath=following-sibling::p[1]');
 await expect(welcome).toHaveText(`Đến chung vui cùng gia đình ${self}`);
 const footer=(await page.locator('footer').textContent()).toLocaleLowerCase('vi-VN');
 expect(footer).toContain(self);
 expect(footer).not.toContain(self==='chúng mình'?'chúng em':'chúng mình');
}

test('Verified personal recipient controls the voice anywhere in the name, independently of the URL and previous guests',async({page,request})=>{
 for(const [name,self] of [['Anh mẫu','chúng em'],['Em mẫu','chúng mình'],['Chị mẫu','chúng em'],['Các bạn nhóm mẫu','chúng mình'],['Anh và Em mẫu','chúng mình'],['Khách mẫu','chúng em'],['Bạn mẫu','chúng mình']]){
  await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name}});
  await page.goto(`/groom/friends?guest=${token}&khach=Em%20khong%20hop%20le`);
  await expect(page.locator('#invitation h2').first()).toHaveText(name);
  await expectVoice(page,self);
  expect(await page.locator('#invitation').textContent()).not.toContain('khong hop le');
 }
});

test('Group recipients containing Em follow the same priority rule',async({page})=>{
 for(const path of ['/groom/NGV','/groom/UFC97','/bride/Partron']){
  await page.goto(path);await expectVoice(page,'chúng mình');
 }
});

test('The RSVP thank-you follows the personal recipient voice',async({page,request})=>{
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name:'Anh khách mẫu'}});
 await page.goto(`/groom/friends?guest=${token}`);
 await page.getByLabel('Sẽ tham dự',{exact:true}).check();
 const form=page.locator('form').filter({has:page.locator('#guestName')});
 await form.locator('button[type=submit]').click();
 await expect(page.getByRole('status').filter({hasText:'Chúng em đã nhận được phản hồi'})).toBeVisible();
});

test('UncleLEE keeps the existing Korean invitation wording',async({page})=>{
 await page.goto('/UncleLEE');
 await expect(page.locator('#invitation h2').first()).toContainText('Bác Lee');
 await expect(page.locator('#invitation h2').first().locator('xpath=following-sibling::p[1]')).toHaveText('저희 가족과 함께 기쁨을 나눠 주시면 감사하겠습니다.');
 const content=await page.locator('main').textContent();
 expect(content).not.toContain('chúng mình');expect(content).not.toContain('chúng em');
});
