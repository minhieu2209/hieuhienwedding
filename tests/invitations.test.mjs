import assert from 'node:assert/strict';
import test from 'node:test';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const cases=[['/groom/NGV','Minh Hiếu','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định'],['/groom/friends','Minh Hiếu','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định'],['/groom/UFC97','Minh Hiếu','29 · 11 · 2026','Nhà hàng Chen 01 Nam Định'],['/bride/Partron','Thu Hiền','04 · 12 · 2026','Nhà hàng Tam Giao'],['/bride/friends','Thu Hiền','28 · 11 · 2026','Tư gia Nhà gái'],['/UncleLEE','Thu Hiền','2026년 11월 29일','Nhà hàng Chen 01 Nam Định'],['/bride/friends1','Thu Hiền','04 · 12 · 2026','Nhà hàng Tam Giao']];
for(const [path,first,date,venue] of cases)test(`${path}: server renders correct invitation`,async()=>{
 const response=await fetch(new URL(path,base));assert.equal(response.status,200);
 const html=await response.text();const main=html.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1];assert.ok(main);
 assert.ok(main.includes(first));assert.ok(main.includes(date));assert.ok(main.includes(venue));
 assert.ok(main.indexOf(first)<main.indexOf(first==='Minh Hiếu'?'Thu Hiền':'Minh Hiếu'));
});
for(const path of ['/bride/invalid','/groom/__proto__'])test(`${path}: invalid template returns 404`,async()=>assert.equal((await fetch(new URL(path,base))).status,404));
