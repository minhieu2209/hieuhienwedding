import { test, expect } from '@playwright/test';
let token;
test.beforeEach(async({request})=>{token=(await (await request.post('http://127.0.0.1:4711/__test/reset')).json()).token;});

async function expectVoice(page,self,addressee){
 const welcome=page.locator('#invitation h2').first().locator('xpath=following-sibling::p[1]');
 await expect(welcome).toHaveText(`Đến chung vui cùng gia đình ${self}`);
 const footer=page.locator('footer');
 await expect(footer).toContainText(`cảm ơn ${addressee}`);
 const footerText=(await footer.textContent()).toLocaleLowerCase('vi-VN');
 expect(footerText).toContain(self.toLocaleLowerCase('vi-VN'));
 for(const other of ['chúng mình','chúng em','anh chị'].filter(value=>value!==self.toLocaleLowerCase('vi-VN')))expect(footerText).not.toContain(other);
 const guestbook=page.locator('section').filter({has:page.getByRole('heading',{name:'Sổ lưu bút',exact:true})});
 await expect(guestbook).toContainText(`Những lời chúc của ${addressee}`);
}

test('Verified personal recipient controls both pronouns throughout the invitation, independently of URL and previous guests',async({page,request})=>{
 for(const [name,self,addressee] of [['Anh mẫu','chúng em','Anh'],['Em mẫu','Anh Chị','Em'],['Chị mẫu','chúng em','Chị'],['Các bạn nhóm CKLS mẫu','chúng mình','Các bạn'],['Anh và Em mẫu','Anh Chị','Em'],['Em mẫu và Bạn đồng hành','Anh Chị','Em'],['Khách mẫu','chúng em','Anh/Chị'],['Bạn mẫu','chúng mình','Bạn']]){
  await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name}});
  await page.goto(`/groom/friends?guest=${token}&khach=Em%20khong%20hop%20le`);
  await expect(page.locator('#invitation h2').first()).toHaveText(name);
  await expectVoice(page,self,addressee);
  expect(await page.locator('#invitation').textContent()).not.toContain('khong hop le');
 }
});

test('Both companies retain chúng em and Anh/Chị/Em despite the Em keyword',async({page})=>{
 for(const path of ['/groom/NGV','/bride/Partron']){
  await page.goto(path);await expectVoice(page,'chúng em','Anh/Chị/Em');
 }
});

test('UFC 97 uses the exact recipient address Anh Em throughout the invitation',async({page})=>{
 await page.goto('/groom/UFC97');
 await expectVoice(page,'Anh Chị','Anh Em');
});

for(const [name,expected] of [['Anh khách mẫu','Chúng em đã nhận được phản hồi. Cảm ơn Anh đã dành thời gian xác nhận.'],['Em khách mẫu','Anh Chị đã nhận được phản hồi. Cảm ơn Em đã dành thời gian xác nhận.'],['Các bạn CKLS','Chúng mình đã nhận được phản hồi. Cảm ơn Các bạn đã dành thời gian xác nhận.']]){
 test(`RSVP thank-you matches both speaker and recipient for ${name}`,async({page,request})=>{
  await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name}});
  await page.goto(`/groom/friends?guest=${token}`);
  await page.getByLabel('Sẽ tham dự',{exact:true}).check();
  const form=page.locator('form').filter({has:page.locator('#guestName')});
  await form.locator('button[type=submit]').click();
  await expect(page.getByRole('status').filter({hasText:expected})).toBeVisible();
 });
}

test('UncleLEE keeps the existing Korean invitation wording',async({page})=>{
 await page.goto('/UncleLEE');
 await expect(page.locator('#invitation h2').first()).toContainText('Bác Lee');
 await expect(page.locator('#invitation h2').first().locator('xpath=following-sibling::p[1]')).toHaveText('저희 가족과 함께 기쁨을 나눠 주시면 감사하겠습니다.');
 const content=await page.locator('main').textContent();
 expect(content).not.toContain('chúng mình');expect(content).not.toContain('chúng em');
});

test('Personalized prose does not rewrite a guestbook author or the guest’s message',async({page,request})=>{
 await request.post('http://127.0.0.1:4711/__test/change',{data:{action:'rename',code:'GF-test',name:'Em khách mẫu'}});
 const wish={id:'98765',guest_name:'Bạn tác giả mẫu',message:'Chúng mình chúc bạn hạnh phúc và cảm ơn Anh/Chị/Em!',created_at:'2026-11-04T00:00:00Z'};
 await page.route('**/api/invitations/groom-friends/wishes',route=>route.request().method()==='GET'?route.fulfill({json:{wishes:[wish],next:null}}):route.continue());
 await page.goto(`/groom/friends?guest=${token}`);
 await expectVoice(page,'Anh Chị','Em');
 const entry=page.locator('article').filter({has:page.getByRole('heading',{name:wish.guest_name,exact:true})});
 await expect(entry).toContainText(wish.message);
 await expect(entry.getByRole('heading')).toHaveText(wish.guest_name);
});
