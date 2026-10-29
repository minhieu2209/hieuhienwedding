import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
const groups = { 'groom/friends': 'groom-friends', 'bride/friends': 'bride-friends', 'bride/friends1': 'bride-friends1' };
export function parseCsv(source) {
  const rows = []; let row = [], field = '', quoted = false;
  const input = source.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"' && !field) quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field); if (row.some(value => value !== '')) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (quoted) throw new Error('CSV has an unclosed quoted field');
  if (field || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  if (!header || !['guest_code', 'display_name', 'group_path'].every(key => header.includes(key))) throw new Error('CSV needs guest_code,display_name,group_path columns');
  const codes = new Set();
  return rows.map((cells, index) => {
    if (cells.length !== header.length) throw new Error(`Invalid CSV column count at row ${index + 2}`);
    const record = Object.fromEntries(header.map((key, column) => [key, cells[column]]));
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(record.guest_code) || codes.has(record.guest_code)) throw new Error(`Invalid or duplicate guest_code at row ${index + 2}`);
    if (!record.display_name.trim() || record.display_name.trim().length > 120 || !Object.hasOwn(groups, record.group_path)) throw new Error(`Invalid name or group at row ${index + 2}`);
    codes.add(record.guest_code);
    return { ...record, invitation_variant_id: groups[record.group_path] };
  });
}
export function makeGuestSql(records) {
  if (!records.length) throw new Error('Guest list is empty');
  const literal = value => `'${value.replaceAll("'", "''")}'`;
  const values = records.map(row => `(${[row.guest_code,row.display_name,row.invitation_variant_id].map(literal).join(',')})`).join(',\n');
  return `-- Private guest data. Review before applying in Supabase SQL Editor.\nBEGIN;\nCREATE TEMP TABLE wedding_guest_import(guest_code text PRIMARY KEY,display_name text NOT NULL,invitation_variant_id text NOT NULL) ON COMMIT DROP;\nINSERT INTO wedding_guest_import VALUES\n${values};\nDO $block$ BEGIN\nIF EXISTS (SELECT 1 FROM wedding_guest_import i LEFT JOIN public.wedding_invitation_variants v ON v.id=i.invitation_variant_id WHERE v.id IS NULL OR v.recipient_mode <> 'individual') THEN RAISE EXCEPTION 'Unknown or non-individual invitation group'; END IF;\nIF EXISTS (SELECT 1 FROM wedding_guest_import i JOIN public.wedding_guests g USING(guest_code) WHERE i.invitation_variant_id <> g.invitation_variant_id) THEN RAISE EXCEPTION 'Existing guest_code belongs to a different group'; END IF;\nEND; $block$;\nINSERT INTO public.wedding_guests(guest_code,display_name,invitation_variant_id) SELECT guest_code,display_name,invitation_variant_id FROM wedding_guest_import ON CONFLICT(guest_code) DO UPDATE SET display_name=EXCLUDED.display_name,updated_at=now();\nCOMMIT;\n`;
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { values } = parseArgs({ options: { file: { type: 'string' }, output: { type: 'string' } } });
    if (!values.file || !values.output) throw new Error('Usage: node scripts/prepare-guests.mjs --file .local/guests.csv --output .local/import-guests.sql');
    const records = parseCsv(await readFile(values.file, 'utf8'));
    await mkdir(dirname(resolve(values.output)), { recursive: true });
    await writeFile(values.output, makeGuestSql(records), { flag: 'wx', mode: 0o600 });
    console.log(`Prepared ${records.length} draft guests. No database changes. Existing output files are never overwritten.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
