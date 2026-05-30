/* eslint-disable no-console */
/**
 * Copy public schema data from source Supabase to destination.
 * Source: authenticated JWT via REST. Destination: psql (Supabase CLI login role).
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const SOURCE_URL = process.env.SOURCE_SUPABASE_URL ?? 'https://ufnahagiixvvxyngnyqy.supabase.co';
const SOURCE_KEY = process.env.SOURCE_SUPABASE_KEY ?? '';
const SOURCE_JWT = process.env.SOURCE_ACCESS_TOKEN ?? '';

const PAGE_SIZE = 1000;
const OUT_SQL = process.env.OUT_SQL ?? '/tmp/erp_data.sql';

const TABLES = [
  'var_thong_tin_to_chuc',
  'var_phong_ban',
  'var_chuc_vu',
  'var_chi_nhanh',
  'var_nhan_vien',
  'var_nhan_vien_chi_nhanh',
  'var_phan_quyen',
];

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return `'{}'::bigint[]`;
    if (v.every((x) => typeof x === 'number')) return `ARRAY[${v.join(',')}]::bigint[]`;
    if (v.every((x) => typeof x === 'string')) {
      return `ARRAY[${v.map((s) => sqlLiteral(s)).join(',')}]::text[]`;
    }
    return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  }
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function fetchAll(sourceUrl, sourceKey, sourceJwt, table) {
  const rows = [];
  let from = 0;
  while (true) {
    const res = await fetch(`${sourceUrl}/rest/v1/${table}?select=*`, {
      headers: {
        apikey: sourceKey,
        Authorization: `Bearer ${sourceJwt}`,
        Range: `${from}-${from + PAGE_SIZE - 1}`,
      },
    });
    if (!res.ok) throw new Error(`${table} select: ${res.status} ${await res.text()}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

function sortSelfRef(rows, parentKey = 'cha_id') {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const sorted = [];
  const done = new Set();
  let guard = rows.length * rows.length + 1;
  while (sorted.length < rows.length && guard-- > 0) {
    for (const row of rows) {
      if (done.has(row.id)) continue;
      const p = row[parentKey];
      if (p == null || done.has(p)) {
        sorted.push(row);
        done.add(row.id);
      }
    }
  }
  return sorted.length === rows.length ? sorted : rows;
}

function prepareRows(table, rows) {
  if (table === 'var_phong_ban') return sortSelfRef(rows);
  return rows;
}

const GENERATED_COLUMNS = {};

function rowsToSql(table, rows) {
  if (!rows.length) return '';
  const skip = new Set(GENERATED_COLUMNS[table] ?? []);
  const cols = Object.keys(rows[0]).filter((c) => !skip.has(c));
  const lines = rows.map((row) => {
    const vals = cols.map((c) => sqlLiteral(row[c]));
    return `INSERT INTO public.${table} (${cols.join(', ')}) OVERRIDING SYSTEM VALUE VALUES (${vals.join(', ')});`;
  });
  return lines.join('\n') + '\n';
}

async function main() {
  if (!SOURCE_KEY || !SOURCE_JWT) {
    console.error('Missing SOURCE_SUPABASE_KEY or SOURCE_ACCESS_TOKEN');
    process.exit(1);
  }

  const truncateList = [...TABLES].reverse().join(', ');
  let sql = `SET ROLE postgres;
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I DISABLE TRIGGER USER', r.tablename);
  END LOOP;
END $$;
TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE;
-- data copy
`;
  let total = 0;

  for (const table of TABLES) {
    const rows = await fetchAll(SOURCE_URL, SOURCE_KEY, SOURCE_JWT, table);
    console.log(`${table}: ${rows.length} rows`);
    sql += rowsToSql(table, prepareRows(table, rows));
    total += rows.length;
  }

  sql += `DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE TRIGGER USER', r.tablename);
  END LOOP;
END $$;
-- end data copy
`;
  writeFileSync(OUT_SQL, sql);
  console.log(`Wrote ${total} rows to ${OUT_SQL}`);

  if (process.env.APPLY_SQL === '1') {
    const dry = spawnSync('supabase', ['db', 'dump', '--dry-run', '--linked'], {
      cwd: process.cwd(),
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN ?? '' },
      encoding: 'utf8',
    });
    const passMatch = dry.stdout.match(/export PGPASSWORD="([^"]+)"/);
    const hostMatch = dry.stdout.match(/export PGHOST="([^"]+)"/);
    const userMatch = dry.stdout.match(/export PGUSER="([^"]+)"/);
    if (!passMatch) {
      console.error('Could not parse psql credentials from supabase db dump --dry-run');
      process.exit(3);
    }
    const env = {
      ...process.env,
      PGPASSWORD: passMatch[1],
      PGHOST: hostMatch?.[1] ?? '',
      PGPORT: '5432',
      PGUSER: userMatch?.[1] ?? '',
      PGDATABASE: 'postgres',
    };
    const psql = spawnSync('psql', ['--single-transaction', '--variable', 'ON_ERROR_STOP=1', '-f', OUT_SQL], {
      env,
      encoding: 'utf8',
    });
    if (psql.status !== 0) {
      console.error(psql.stderr || psql.stdout);
      process.exit(4);
    }
    console.log('Applied SQL to destination.');
  }
}

main();
