import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { invitationVoice, personalizeInvitationCopy } from '../data/invitation-tone.ts';
const records=JSON.parse(await readFile(new URL('../data/invitation-copy.json',import.meta.url),'utf8'));
const friend=records.find(row=>row.variant_id==='groom-friends'&&row.locale==='vi').content;
const company=records.find(row=>row.variant_id==='groom-ngv'&&row.locale==='vi').content;

for(const recipient of ['Bạn mẫu','Các bạn trong lớp','Chị và BẠN mẫu','Bạn mẫu']){
 test(`Bạn uses chúng mình/Bạn: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'chúng mình',addressee:'Bạn'}));
}
for(const recipient of ['Em mẫu','Nhóm các em','Anh và em mẫu','  EM mẫu  ','Anh và bạn Em mẫu','Em mẫu và Bạn đồng hành']){
 test(`Em uses Anh Chị/Em: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'Anh Chị',addressee:'Em'}));
}
for(const [recipient,addressee] of [['Anh mẫu','Anh'],['Chị mẫu','Chị'],['Tập thể công ty','Anh/Chị'],['Khách mẫu','Anh/Chị'],['Minh Anh','Anh/Chị'],['Email nhóm','Anh/Chị'],['Xem thiệp','Anh/Chị'],['Emilia','Anh/Chị'],['Diem','Anh/Chị'],['','Anh/Chị']]){
 test(`Other recipients use chúng em: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'chúng em',addressee}));
}

test('Both company exceptions precede recipient keywords',()=>{
 for(const id of ['groom-ngv','bride-partron'])assert.deepEqual(invitationVoice('Toàn thể Anh/Chị/Em công ty',id),{self:'chúng em',addressee:'Anh/Chị/Em'});
});

test('UFC 97 addresses Anh Em while following the speaker keyword rule',()=>{
 assert.deepEqual(invitationVoice('Toàn thể Anh/Em đội bóng UFC 97','groom-ufc97'),{self:'Anh Chị',addressee:'Anh Em'});
});

test('CKLS addresses Các bạn, independently of casing and position',()=>{
 for(const [name,self] of [['Các bạn mình "CKLS thân yêu"','chúng mình'],['Nhóm ckls','chúng em'],['Các Em CKLS','Anh Chị']])assert.deepEqual(invitationVoice(name,'groom-friends'),{self,addressee:'Các bạn'});
});

test('Both speaker and addressee adapt across invitation, RSVP, guestbook introduction and closing without request leakage',()=>{
 const snapshot=structuredClone(friend);
 const junior=personalizeInvitationCopy(friend,invitationVoice('Em mẫu'),'vi');
 for(const key of ['invitation','coupleHeading','coupleIntro','galleryIntro','rsvpIntro','rsvpThanks','wishesIntro','footerThanks','coupleQuote','eventIntro','closingQuote','countdownQuote']){
  assert.ok(!junior[key].toLowerCase().includes('chúng mình'),key);
  assert.ok(junior[key].includes('Anh Chị'),key);
 }
 assert.equal(junior.rsvpThanks,'Anh Chị đã nhận được phản hồi. Cảm ơn Em đã dành thời gian xác nhận.');
 assert.ok(junior.wishesIntro.includes('của Em'));
 assert.ok(junior.footerThanks.includes('cảm ơn Em'));
 assert.deepEqual(junior.labels,friend.labels);assert.equal(junior.salutation,friend.salutation);assert.equal(junior.defaultRecipient,friend.defaultRecipient);
 const buddy=personalizeInvitationCopy(friend,invitationVoice('Bạn mẫu'),'vi');
 assert.ok(buddy.rsvpThanks.startsWith('Chúng mình'));assert.ok(buddy.rsvpThanks.includes('Cảm ơn Bạn'));
 assert.deepEqual(friend,snapshot);
 const companySnapshot=structuredClone(company);
 const staff=personalizeInvitationCopy(company,invitationVoice(company.defaultRecipient,'groom-ngv'),'vi');
 assert.ok(staff.footerThanks.startsWith('Chúng em'));assert.ok(staff.footerThanks.includes('Anh/Chị/Em'));assert.deepEqual(company,companySnapshot);
});

test('CKLS prose says Các bạn once and keeps friend nouns in descriptions',()=>{
 const base=structuredClone(friend);base.footerThanks='Chúng mình cảm ơn các bạn. Hẹn gặp bạn!';base.groomDescription='Những người bạn đồng hành cùng chúng mình.';
 const result=personalizeInvitationCopy(base,invitationVoice('Các bạn CKLS'),'vi');
 assert.equal(result.footerThanks,'Chúng mình cảm ơn Các bạn. Hẹn gặp Các bạn!');
 assert.equal(result.groomDescription,base.groomDescription);
});

test('Vietnamese replacements protect self-references from recipient replacements',()=>{
 const base=structuredClone(friend);base.footerThanks='CHÚNG EM, chúng tôi; Chúng mình! Cảm ơn bạn.';
 assert.equal(personalizeInvitationCopy(base,invitationVoice('Em mẫu'),'vi').footerThanks,'ANH CHỊ, Anh Chị; Anh Chị! Cảm ơn Em.');
});

test('Korean copy remains unchanged',()=>{
 for(const row of records.filter(row=>row.locale==='ko'))assert.deepEqual(personalizeInvitationCopy(row.content,invitationVoice(row.content.defaultRecipient,row.variant_id),'ko'),row.content);
});

test('UncleLEE retains the established special address',()=>{
 assert.deepEqual(invitationVoice('Bác Lee','uncle-lee'),{self:'chúng cháu',addressee:'Bác'});
 const copy=records.find(row=>row.variant_id==='uncle-lee').content;
 assert.deepEqual(personalizeInvitationCopy(copy,invitationVoice(copy.defaultRecipient,'uncle-lee'),'ko'),copy);
});
