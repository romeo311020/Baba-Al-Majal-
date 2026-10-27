// فحص ثابت: كل صفحة مسارها موجود وملفها موجود، وكل رابط داخلي في الكود يطابق مسارًا معرّفًا.
// التشغيل: npm run check:routes
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const routesSrc = readFileSync('src/routes/AppRoutes.tsx', 'utf8');
let bad = 0;

// الصفحات المستوردة (lazy) يجب أن توجد ملفاتها
const imports = [...routesSrc.matchAll(/import\('\.\.\/pages\/(\w+)'\)/g)].map((m) => m[1]);
for (const p of imports) if (!existsSync(`src/pages/${p}.tsx`)) { console.error(`✗ ملف صفحة مفقود: ${p}`); bad++; }

const patterns = ['/', ...[...routesSrc.matchAll(/path="([^"]+)"/g)].map((m) => '/' + m[1])].filter((p) => p !== '/*');
const required = ['/', '/matches', '/news', '/news/:id', '/sports/:sport', '/matches/:id', '/teams/:id', '/players/:id', '/assistant', '/store', '/store/:id', '/favorites', '/notifications', '/profile', '/login', '/register', '/settings', '/about', '/contact', '/privacy', '/terms'];
for (const r of required) if (!patterns.includes(r)) { console.error(`✗ مسار مطلوب غير معرّف: ${r}`); bad++; }
if (!/path="\*"/.test(routesSrc)) { console.error('✗ لا يوجد مسار 404'); bad++; }

const toRegex = (p: string) => new RegExp('^' + p.replace(/:[^/]+/g, '[^/]+') + '$');
const regs = patterns.map(toRegex);

function walk(d: string): string[] {
  return readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : []; });
}
const links = new Set<string>();
for (const f of walk('src')) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/\bto=(?:"|\{`|\{')(\/[^"`'}]*)/g)) links.add(m[1]);
  for (const m of s.matchAll(/navigate\((?:'|`)(\/[^'`?]*)/g)) links.add(m[1]);
}
for (const l of links) {
  const path = l.split('?')[0].replace(/\$\{[^}]+\}/g, 'X');
  const clean = path.replace(/\/$/, '') || '/';
  if (!regs.some((r) => r.test(clean))) { console.error(`✗ رابط لا يطابق أي مسار: ${l}`); bad++; }
}
console.log(`ℹ ${patterns.length} مسارًا و${links.size} رابطًا داخليًا مفحوصًا`);
if (bad) { console.error(`${bad} مشكلة`); process.exit(1); }
console.log('✔ كل المسارات المطلوبة معرّفة وكل الروابط الداخلية صحيحة');
