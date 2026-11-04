import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { invitationVoice, personalizeInvitationCopy } from '../data/invitation-tone.ts';
const records=JSON.parse(await readFile(new URL('../data/invitation-copy.json',import.meta.url),'utf8'));
const friend=records.find(row=>row.variant_id==='groom-friends'&&row.locale==='vi').content;
const group=records.find(row=>row.variant_id==='groom-ngv'&&row.locale==='vi').content;

for(const recipient of ['Bạn mẫu','Em mẫu','Các bạn trong lớp','Nhóm các em','Anh/Em đội bóng','Toàn thể Anh/Chị/Em công ty','Anh và em mẫu','BẠN MẪU','Chị và BẠN mẫu','  EM mẫu  ','Bạn mẫu']){
 test(`Recipient containing bạn/em uses chúng mình: ${recipient}`,()=>assert.equal(invitationVoice(recipient).self,'chúng mình'));
}
for(const recipient of ['Anh mẫu','Chị mẫu','Tập thể công ty','Bác Lee','Khách mẫu','Minh Anh','Email nhóm','Xem thiệp','Emilia','Diem','']){
 test(`Other recipient uses chúng em: ${recipient}`,()=>assert.equal(invitationVoice(recipient).self,'chúng em'));
}

test('Personalization updates the self-reference across invitation, RSVP, wishes intro and closing without mutating shared copy',()=>{
 const snapshot=structuredClone(friend);
 const senior=personalizeInvitationCopy(friend,invitationVoice('Anh mẫu'),'vi');
 for(const key of ['invitation','coupleHeading','coupleIntro','galleryIntro','rsvpIntro','rsvpThanks','wishesIntro','footerThanks','coupleQuote','eventIntro','closingQuote','countdownQuote']){
  assert.ok(!senior[key].toLowerCase().includes('chúng mình'),key);
  assert.ok(senior[key].toLowerCase().includes('chúng em'),key);
 }
 assert.deepEqual(senior.labels,friend.labels);assert.equal(senior.salutation,friend.salutation);assert.equal(senior.defaultRecipient,friend.defaultRecipient);
 assert.deepEqual(personalizeInvitationCopy(friend,invitationVoice('Bạn mẫu'),'vi'),friend);
 assert.deepEqual(friend,snapshot);
 const friendlyGroup=personalizeInvitationCopy(group,invitationVoice(group.defaultRecipient),'vi');
 assert.ok(friendlyGroup.footerThanks.includes('Chúng mình'));
 assert.ok(friendlyGroup.footerThanks.includes('Anh/Chị/Em'));
 assert.deepEqual(group,records.find(row=>row.variant_id==='groom-ngv'&&row.locale==='vi').content);
});

test('Vietnamese replacements preserve capitalization, punctuation and whole words',()=>{
 const copy=structuredClone(friend);
 copy.footerThanks='CHÚNG EM, chúng tôi; Chúng mình! Gia đình chúng cháu.';
 const result=personalizeInvitationCopy(copy,invitationVoice('Các bạn mẫu'),'vi');
 assert.equal(result.footerThanks,'CHÚNG MÌNH, chúng mình; Chúng mình! Gia đình chúng mình.');
});

test('Korean copy remains unchanged',()=>{
 for(const row of records.filter(row=>row.locale==='ko')){
  assert.deepEqual(personalizeInvitationCopy(row.content,invitationVoice(row.content.defaultRecipient),'ko'),row.content);
 }
});

test('UncleLEE retains the established special address',()=>{
 assert.equal(invitationVoice('Bác Lee','uncle-lee').self,'chúng cháu');
 const copy=records.find(row=>row.variant_id==='uncle-lee').content;
 assert.deepEqual(personalizeInvitationCopy(copy,invitationVoice(copy.defaultRecipient,'uncle-lee'),'ko'),copy);
});
