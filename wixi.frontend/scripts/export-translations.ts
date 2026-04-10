import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

type Dict = Record<string, string>;
type All = { de?: Dict; tr?: Dict; en?: Dict; ar?: Dict };

function extractBlock(src: string, lang: 'de'|'tr'|'en'|'ar'): Dict {
  const start = new RegExp(`\\b${lang}\\s*:\\s*\\{`);
  const si = src.search(start);
  if (si < 0) return {};
  let i = si + src.slice(si).indexOf('{');
  let depth = 0;
  let end = i;
  for (let p = i; p < src.length; p++) {
    const ch = src[p];
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) { end = p; break; }
    }
  }
  const body = src.slice(i + 1, end);
  const dict: Dict = {};
  // naive key/value pairs: "key": "value"
  const re = /"([^"]+)"\s*:\s*"([\s\S]*?)"\s*,?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const key = m[1];
    const val = m[2].replace(/\\n/g, '\n');
    dict[key] = val;
  }
  return dict;
}

function mergeAll(files: string[]): All {
  const all: All = {};
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const lang of ['de','tr','en','ar'] as const) {
      const part = extractBlock(src, lang);
      if (Object.keys(part).length) {
        all[lang] = { ...(all[lang]||{}), ...part };
      }
    }
  }
  return all;
}

const root = resolve(process.cwd(), '..'); // from V4/scripts -> V4
const files = [
  resolve(root, 'src/contexts/language-context.tsx'),
  resolve(root, 'src/contexts/LanguageContext.tsx'),
];

const all = mergeAll(files);
const keys = Array.from(new Set([
  ...Object.keys(all.de||{}),
  ...Object.keys(all.tr||{}),
  ...Object.keys(all.en||{}),
  ...Object.keys(all.ar||{}),
])).sort();

const items = keys.map(k => ({
  key: k,
  De: all.de?.[k] ?? '',
  Tr: all.tr?.[k] ?? '',
  En: all.en?.[k] ?? undefined,
  Ar: all.ar?.[k] ?? undefined,
}));

writeFileSync(resolve(process.cwd(), 'translations-bulk.json'), JSON.stringify({ items }, null, 2), 'utf8');
console.log('Wrote translations-bulk.json with', items.length, 'items');


