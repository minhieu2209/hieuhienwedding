import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { invitationVoice, personalizeInvitationCopy } from '../data/invitation-tone.ts';
const records=JSON.parse(await readFile(new URL('../data/invitation-copy.json',import.meta.url),'utf8'));
const friend=records.find(row=>row.variant_id==='groom-friends'&&row.locale==='vi').content;
const company=records.find(row=>row.variant_id==='groom-ngv'&&row.locale==='vi').content;

for(const recipient of ['Bạn mẫu','Các bạn trong lớp','Chị và BẠN mẫu','Bạn mẫu']){
 test(`Bạn uses chúng mình/Bạn: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'chúng mình',addressee:'bạn'}));
}
for(const recipient of ['Em mẫu','Nhóm các em','  EM mẫu  ','Em mẫu và Bạn đồng hành']){
 test(`Em uses Anh Chị/Em: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'Anh Chị',addressee:'em'}));
}

test('Mixed Anh/Chị/Em groups follow the first whole title, including case and punctuation',()=>{
 for(const [recipient,self,addressee] of [
  ['Anh An, Chị Bình và Em Cường','chúng em','Anh'],
  ['Chị Bình, Anh An và Em Cường','chúng em','Chị'],
  ['Em Cường, Anh An và Chị Bình','Anh Chị','em'],
  ['Anh/Chị/Em','chúng em','Anh'],
  ['Chị / Em / Anh','chúng em','Chị'],
  ['Em / Chị / Anh','Anh Chị','em'],
  ['  ANH An và em Cường  ','chúng em','Anh'],
  ['Gia đình Chị Bình và Em Cường','chúng em','Chị'],
  ['Anh và em mẫu','chúng em','Anh'],
  ['Anh và bạn Em mẫu','chúng em','Anh'],
 ])assert.deepEqual(invitationVoice(recipient,'groom-friends'),{self,addressee},recipient);
});

test('The first mixed-group title controls both speakers and recipients throughout invitation copy',()=>{
 for(const [name,address] of [['Anh An, Chị Bình và Em Cường','Anh'],['Chị Bình, Em Cường và Anh An','Chị']]){
  const copy=personalizeInvitationCopy(friend,invitationVoice(name,'groom-friends'),'vi');
  assert.equal(copy.rsvpThanks,`Chúng em đã nhận được phản hồi. Cảm ơn ${address.toLowerCase()} đã dành thời gian xác nhận.`);
  assert.ok(copy.wishesIntro.includes(`của ${address.toLowerCase()}`));
  assert.ok(copy.footerThanks.includes(`cảm ơn ${address.toLowerCase()}`));
  for(const key of ['invitation','rsvpIntro','rsvpThanks','wishesIntro','footerThanks']){
   assert.ok(!copy[key].includes('Anh Chị'),key);
   assert.ok(!copy[key].includes('chúng mình'),key);
  }
 }
});
for(const [recipient,addressee] of [['Anh mẫu','Anh'],['Chị mẫu','Chị']]){
 test(`Senior recipients use chúng em: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'chúng em',addressee}));
}
for(const recipient of ['Tập thể công ty','Khách mẫu','Minh Anh','Minh Anh và người ấy','Email nhóm','Xem thiệp','Emilia','Diem','']){
 test(`Unmarked recipients use chúng mình/bạn: ${recipient}`,()=>assert.deepEqual(invitationVoice(recipient),{self:'chúng mình',addressee:'bạn'}));
}

test('Bridesmaids override Em; 1H20 has its own collective address, with Unicode and whitespace normalization',()=>{
 for(const name of ['Phù dâu của em','PHÙ DÂU của em','Các phù  dâu','Phù dâu của em'])assert.deepEqual(invitationVoice(name,'bride-friends'),{self:'chúng em',addressee:'Chị'});
 for(const name of ['Các gái iu 1H20','Nhóm 1h20','1H20 thân yêu'])assert.deepEqual(invitationVoice(name,'bride-friends'),{self:'chúng mình',addressee:'các gái iu'});
 for(const name of ['Phù dâung','Nhóm 11H200'])assert.deepEqual(invitationVoice(name,'bride-friends'),{self:'chúng mình',addressee:'bạn'});
 for(const id of ['groom-ngv','bride-partron'])assert.deepEqual(invitationVoice('Phù dâu và 1H20',id),{self:'chúng em',addressee:'Anh/Chị/Em'});
});

test('Only verified bride-friends guest BF-0003 has the requested chị address',()=>{
 assert.deepEqual(invitationVoice('Khách thử nghiệm','bride-friends','BF-0003'),{self:'chúng em',addressee:'Chị'});
 assert.deepEqual(invitationVoice('Khách thử nghiệm','bride-friends','BF-0004'),{self:'chúng mình',addressee:'bạn'});
 assert.deepEqual(invitationVoice('Khách thử nghiệm','groom-friends','BF-0003'),{self:'chúng mình',addressee:'bạn'});
});

test('Both company exceptions precede recipient keywords',()=>{
 for(const id of ['groom-ngv','bride-partron'])assert.deepEqual(invitationVoice('Toàn thể Anh/Chị/Em công ty',id),{self:'chúng em',addressee:'Anh/Chị/Em'});
});

test('UFC 97 always uses chúng em and addresses Anh Em',()=>{
 assert.deepEqual(invitationVoice('Toàn thể Anh/Em đội bóng UFC 97','groom-ufc97'),{self:'chúng em',addressee:'Anh Em'});
});

test('CKLS addresses Các bạn, independently of casing and position',()=>{
 for(const [name,self] of [['Các bạn mình "CKLS thân yêu"','chúng mình'],['Nhóm ckls','chúng mình'],['Các Em CKLS','Anh Chị'],['Anh An và Em Bình CKLS','chúng em']])assert.deepEqual(invitationVoice(name,'groom-friends'),{self,addressee:'các bạn'});
});

test('Both speaker and addressee adapt across invitation, RSVP, guestbook introduction and closing without request leakage',()=>{
 const snapshot=structuredClone(friend);
 const junior=personalizeInvitationCopy(friend,invitationVoice('Em mẫu'),'vi');
 for(const key of ['invitation','coupleHeading','coupleIntro','galleryIntro','rsvpIntro','rsvpThanks','wishesIntro','footerThanks','coupleQuote','eventIntro','closingQuote','countdownQuote']){
  assert.ok(!junior[key].toLowerCase().includes('chúng mình'),key);
  assert.ok(junior[key].toLowerCase().includes('anh chị'),key);
 }
 assert.equal(junior.rsvpThanks,'Anh chị đã nhận được phản hồi. Cảm ơn em đã dành thời gian xác nhận.');
 assert.ok(junior.wishesIntro.includes('của em'));
 assert.ok(junior.footerThanks.includes('cảm ơn em'));
 assert.deepEqual(junior.labels,friend.labels);assert.equal(junior.salutation,friend.salutation);assert.equal(junior.defaultRecipient,friend.defaultRecipient);
 const buddy=personalizeInvitationCopy(friend,invitationVoice('Bạn mẫu'),'vi');
 assert.ok(buddy.rsvpThanks.startsWith('Chúng mình'));assert.ok(buddy.rsvpThanks.includes('Cảm ơn bạn'));
 assert.deepEqual(friend,snapshot);
 const companySnapshot=structuredClone(company);
 const staff=personalizeInvitationCopy(company,invitationVoice(company.defaultRecipient,'groom-ngv'),'vi');
 assert.ok(staff.footerThanks.startsWith('Chúng em'));assert.ok(staff.footerThanks.includes('anh/chị/em'));assert.deepEqual(company,companySnapshot);
});

test('CKLS prose says Các bạn once and keeps friend nouns in descriptions',()=>{
 const base=structuredClone(friend);base.footerThanks='Chúng mình cảm ơn các bạn. Hẹn gặp bạn!';base.groomDescription='Những người bạn đồng hành cùng chúng mình.';
 const result=personalizeInvitationCopy(base,invitationVoice('Các bạn CKLS'),'vi');
 assert.equal(result.footerThanks,'Chúng mình cảm ơn các bạn. Hẹn gặp các bạn!');
 assert.equal(result.groomDescription,base.groomDescription);
});

test('Vietnamese replacements protect self-references from recipient replacements',()=>{
 const base=structuredClone(friend);base.footerThanks='CHÚNG EM, chúng tôi; Chúng mình! Cảm ơn bạn.';
 assert.equal(personalizeInvitationCopy(base,invitationVoice('Em mẫu'),'vi').footerThanks,'Anh chị, anh chị; anh chị! Cảm ơn em.');
});

test('Pronouns capitalize only at sentence starts and retain names, labels and guest data',()=>{
 const base=structuredClone(friend);
 base.footerThanks='BẠN đến nhé! Chúng mình chờ Bạn. “Bạn” hãy gửi lời chúc; cảm ơn BẠN.\nBạn là khách quý của chúng mình.';
 const result=personalizeInvitationCopy(base,invitationVoice('Phù dâu của em','bride-friends'),'vi');
 assert.equal(result.footerThanks,'Chị đến nhé! Chúng em chờ chị. “Chị” hãy gửi lời chúc; cảm ơn chị.\nChị là khách quý của chúng em.');
 const classmates=personalizeInvitationCopy(base,invitationVoice('Các gái iu 1H20','bride-friends'),'vi');
 assert.equal(classmates.footerThanks,'Các gái iu đến nhé! Chúng mình chờ các gái iu. “Các gái iu” hãy gửi lời chúc; cảm ơn các gái iu.\nCác gái iu là khách quý của chúng mình.');
 assert.deepEqual(result.labels,base.labels);
 assert.equal(result.defaultRecipient,base.defaultRecipient);
 assert.equal(result.eventTitle,base.eventTitle);
});

test('Korean copy remains unchanged',()=>{
 for(const row of records.filter(row=>row.locale==='ko'))assert.deepEqual(personalizeInvitationCopy(row.content,invitationVoice(row.content.defaultRecipient,row.variant_id),'ko'),row.content);
});

test('UncleLEE retains the established special address',()=>{
 assert.deepEqual(invitationVoice('Bác Lee','uncle-lee'),{self:'chúng cháu',addressee:'Bác'});
 const copy=records.find(row=>row.variant_id==='uncle-lee').content;
 assert.deepEqual(personalizeInvitationCopy(copy,invitationVoice(copy.defaultRecipient,'uncle-lee'),'ko'),copy);
});
