import { randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, mkdir, open, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
async function atomicWrite(file, content) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, content, { flag: 'wx', mode: 0o600 });
  await rename(temporary, file);
}
// Optional private export only: importing guests now activates their code links.
// This function never changes guest activation, hashes or database rows.
export async function issueLinks({ databaseUrl, key, baseUrl, output, write = false, fetchImpl = fetch }) {
  if (!databaseUrl || !key || !baseUrl || !output) throw new Error('Database URL, server key, base URL and private output file are required');
  for (const value of [databaseUrl, baseUrl]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1','localhost'].includes(url.hostname))) throw new Error('Use HTTPS, except for localhost development');
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  async function request(table, query) {
    const response = await fetchImpl(`${databaseUrl.replace(/\/$/,'')}/rest/v1/${table}?${query}`, { headers, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Database read failed (${response.status}); private output is preserved`);
    return response.json();
  }
  let lock;
  if (write) {
    await mkdir(dirname(resolve(output)), { recursive: true });
    lock = await open(`${output}.lock`, 'wx', 0o600);
  }
  try {
    let previous = [];
    try { previous = JSON.parse(await readFile(output, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw new Error('Private output is not valid JSON; refusing to replace it'); }
    if (!Array.isArray(previous) || previous.some(row => typeof row.guestId !== 'string')) throw new Error('Invalid private output format');
    const profiles = await request('wedding_invitation_variants', 'select=id,path,recipient_mode');
    const guests = [];
    for (let offset = 0; ; offset += 500) {
      const page = await request('wedding_guests', `select=id,guest_code,display_name,invitation_variant_id,is_active&order=guest_code.asc&limit=500&offset=${offset}`);
      guests.push(...page);
      if (page.length < 500) break;
      if (guests.length > 10000) throw new Error('Guest limit exceeded; process the list in batches');
    }
    const prepared = new Map(previous.map(row => [row.guestId, { ...row, status: 'unavailable' }]));
    const rows = [];
    const summary = { ready: 0, skipped: 0, written: write };
    for (const guest of guests) {
      const profile = profiles.find(row => row.id === guest.invitation_variant_id && row.recipient_mode === 'individual');
      if (!profile) throw new Error('Guest has an unknown or non-individual invitation group');
      const saved = previous.find(row => row.guestId === guest.id) ?? previous.find(row => row.guestCode === guest.guest_code);
      if (saved && saved.guestId !== guest.id) prepared.delete(saved.guestId);
      if (!guest.is_active) {
        if (saved) prepared.set(guest.id, { ...saved, guestId: guest.id, status: 'revoked' });
        summary.skipped++;
        continue;
      }
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(guest.guest_code)) throw new Error('Guest code must use letters, numbers, underscores or hyphens (up to 80 characters)');
      const url = new URL(`${profile.path}?${new URLSearchParams({ guest: guest.guest_code })}`, baseUrl).href;
      const row = { ...saved, guestId: guest.id, guestCode: guest.guest_code, displayName: guest.display_name, path: profile.path, variantId: profile.id, url, status: 'ready' };
      if (saved?.url && new URL(saved.url).searchParams.get('guest') !== guest.guest_code) row.legacyUrl ??= saved.url;
      prepared.set(guest.id, row);
      rows.push(row);
      summary.ready++;
    }
    if (!write) return summary;
    await atomicWrite(output, JSON.stringify([...prepared.values()], null, 2) + '\n');
    const quote = value => `"${String(value).replaceAll('"','""')}"`;
    const csv = 'guest_code,display_name,url\n' + rows.map(row => [row.guestCode,row.displayName,row.url].map(quote).join(',')).join('\n') + '\n';
    await atomicWrite(`${output}.csv`, '\uFEFF' + csv);
    return summary;
  } finally { if (lock) { await lock.close(); await unlink(`${output}.lock`); } }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { values } = parseArgs({ options: { 'base-url': { type: 'string' }, output: { type: 'string' }, write: { type: 'boolean', default: false } } });
    const result = await issueLinks({ databaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY, baseUrl: values['base-url'], output: values.output, write: values.write });
    console.log(result); // Counts only; no tokens, keys or guest names in logs.
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
