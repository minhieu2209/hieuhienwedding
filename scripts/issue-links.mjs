import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, mkdir, open, unlink } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
const hash = token => createHash('sha256').update(token).digest('hex');
async function atomicWrite(file, content) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, content, { flag: 'wx', mode: 0o600 });
  await rename(temporary, file);
}
export async function issueLinks({ databaseUrl, key, baseUrl, output, write = false, fetchImpl = fetch }) {
  if (!databaseUrl || !key || !baseUrl || !output) throw new Error('Database URL, server key, base URL and private output file are required');
  for (const value of [databaseUrl, baseUrl]) {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1','localhost'].includes(url.hostname))) throw new Error('Use HTTPS, except for localhost development');
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const request = async (table, query, options = {}) => {
    const response = await fetchImpl(`${databaseUrl.replace(/\/$/,'')}/rest/v1/${table}?${query}`, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Database operation failed (${response.status}); private output is preserved for retry`);
    return response.status === 204 ? [] : response.json();
  };
  let lock;
  if (write) {
    await mkdir(dirname(resolve(output)), { recursive: true });
    lock = await open(`${output}.lock`, 'wx', 0o600);
  }
  try {
  let previous = [];
  try { previous = JSON.parse(await readFile(output, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Private output is not valid JSON; refusing to replace it'); }
  if (!Array.isArray(previous) || previous.some(row => typeof row.guestId !== 'string' || (row.token && !/^[A-Za-z0-9_-]{43}$/.test(row.token)))) throw new Error('Invalid private output format');
  const profiles = await request('wedding_invitation_variants', 'select=id,path,recipient_mode');
  const guests = [];
  for (let offset = 0; ; offset += 500) {
    const page = await request('wedding_guests', `select=id,guest_code,display_name,invitation_variant_id,invite_token_hash,is_active&order=guest_code.asc&limit=500&offset=${offset}`);
    guests.push(...page);
    if (page.length < 500) break;
    if (guests.length > 10000) throw new Error('Guest limit exceeded; process the list in batches');
  }
  const summary = { created: 0, kept: 0, skipped: 0, pending: 0, written: write };
  const prepared = new Map(previous.map(row => [row.guestId, row]));
  const updates = [];
  for (const guest of guests) {
    const profile = profiles.find(row => row.id === guest.invitation_variant_id && row.recipient_mode === 'individual');
    if (!profile) throw new Error('Guest has an unknown or non-individual invitation group');
    // SQL-based activation can precede knowing the database UUID. The stable
    // private guest_code also lets us recover the saved token without rotating it.
    const saved = prepared.get(guest.id) ?? previous.find(row => row.guestCode === guest.guest_code);
    if (saved && saved.guestId !== guest.id) prepared.delete(saved.guestId);
    if (guest.is_active && guest.invite_token_hash) {
      if (saved?.token && hash(saved.token) === guest.invite_token_hash) {
        prepared.set(guest.id, { ...saved, guestId: guest.id, guestCode: guest.guest_code, displayName: guest.display_name, url: new URL(`${profile.path}?guest=${saved.token}`, baseUrl).href, status: 'ready' }); summary.kept++;
      } else { if (saved) prepared.set(guest.id, { ...saved, status: 'unavailable' }); summary.skipped++; }
      continue;
    }
    // An already-issued/revoked link is never silently rotated or reactivated.
    if (guest.invite_token_hash || saved?.status === 'ready' || saved?.status === 'unavailable') { if (saved) prepared.set(guest.id, { ...saved, status: 'revoked' }); summary.skipped++; continue; }
    summary.pending++;
    if (!write) continue;
    const token = saved?.status === 'pending' ? saved.token : randomBytes(32).toString('base64url');
    const row = { guestId: guest.id, guestCode: guest.guest_code, displayName: guest.display_name, token, url: new URL(`${profile.path}?guest=${token}`, baseUrl).href, status: 'pending' };
    prepared.set(guest.id, row); updates.push(row);
  }
  if (!write) return summary;

    // Save raw tokens privately before activation so a failed network operation is resumable.
    await atomicWrite(output, JSON.stringify([...prepared.values()], null, 2) + '\n');
    for (const row of updates) {
      const query = new URLSearchParams({ id: `eq.${row.guestId}`, is_active: 'eq.false', invite_token_hash: 'is.null', select: 'id' });
      const changed = await request('wedding_guests', query, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ invite_token_hash: hash(row.token), is_active: true, updated_at: new Date().toISOString() }) });
      if (changed.length === 1) { row.status = 'ready'; summary.created++; summary.pending--; }
      await atomicWrite(output, JSON.stringify([...prepared.values()], null, 2) + '\n');
    }
    const quote = value => `"${String(value).replaceAll('"','""')}"`;
    const rows = [...prepared.values()].filter(row => row.status === 'ready' && guests.some(guest => guest.id === row.guestId && (guest.is_active || updates.includes(row))));
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
