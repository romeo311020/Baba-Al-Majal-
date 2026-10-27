// يتأكد أن كل مفتاح ترجمة مستخدم في الكود موجود بالعربية والإنجليزية، وأن القاموسين متطابقان.
// التشغيل: npm run check:i18n
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import ar from '../src/i18n/ar';
import en from '../src/i18n/en';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|ts)$/.test(f) ? [p] : [];
  });
}

const used = new Set<string>();
const dynamicPrefixes = new Set<string>();
for (const file of walk('src')) {
  if (file.includes('/i18n/')) continue;
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.\-]+)'/g)) used.add(m[1]);
  for (const m of src.matchAll(/messageKey="([a-zA-Z0-9_.\-]+)"/g)) used.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*`([a-zA-Z0-9_.\-]*)\$\{/g)) dynamicPrefixes.add(m[1]);
}

// القيم المحتملة للمفاتيح الديناميكية
const dyn: Record<string, string[]> = {
  'about.value.': ['1.title', '1.text', '2.title', '2.text', '3.title', '3.text'],
  'auth.error.': ['weak', 'exists', 'not-found', 'invalid', 'no-session', 'generic'],
  'category.': ['apparel', 'jerseys', 'shoes', 'balls', 'training', 'bags', 'equipment'],
  'day.': ['yesterday', 'today', 'tomorrow'],
  'event.': ['goal', 'yellow', 'red', 'sub'],
  'fav.tab.': ['matches', 'news', 'products', 'teams', 'players'],
  'notfound.': ['match', 'news', 'team', 'player', 'sport', 'product', 'text'],
  'privacy.s': ['1.title', '1.text', '2.title', '2.text', '3.title', '3.text', '4.title', '4.text', '5.title', '5.text'],
  'terms.s': ['1.title', '1.text', '2.title', '2.text', '3.title', '3.text', '4.title', '4.text', '5.title', '5.text'],
  'search.in.': ['matches', 'news', 'store'],
  'settings.theme.': ['dark', 'light'],
  'status.': ['scheduled', 'live', 'halftime', 'finished', 'postponed'],
  'store.sort.': ['featured', 'price-asc', 'price-desc'],
};

let bad = 0;
for (const p of dynamicPrefixes) {
  if (!p) continue; // i18n الداخلي
  if (!dyn[p]) {
    console.error(`✗ مفتاح ديناميكي غير مغطى في الفحص: ${p}\${…}`);
    bad++;
    continue;
  }
  for (const s of dyn[p]) used.add(p + s);
}

for (const k of used) {
  if (!(k in ar)) { console.error(`✗ مفقود في ar: ${k}`); bad++; }
  if (!(k in en)) { console.error(`✗ مفقود في en: ${k}`); bad++; }
}
for (const k of Object.keys(ar)) if (!(k in en)) { console.error(`✗ في ar فقط: ${k}`); bad++; }
for (const k of Object.keys(en)) if (!(k in ar)) { console.error(`✗ في en فقط: ${k}`); bad++; }

const unused = Object.keys(ar).filter((k) => !used.has(k));
if (unused.length) console.log(`ℹ مفاتيح غير مستخدمة (${unused.length}): ${unused.join(', ')}`);

if (bad) { console.error(`\n${bad} مشكلة`); process.exit(1); }
console.log(`✔ ${used.size} مفتاحًا مستخدمًا — كلها موجودة في العربية والإنجليزية`);
