// اختبار الخادم الوسيط: npm run test:server
// يشغّل الخادم في وضعين (بدون مفتاح / مع مزوّد وهمي محلي يحاكي واجهة OpenAI) ويتحقق من السلوك.
// ⚠️ هذا يختبر "السباكة" فقط (التحقق، الأخطاء، عدم تسريب المفتاح) — وليس مزود ذكاء اصطناعي حقيقيًا.
import { spawn } from 'node:child_process';
import http from 'node:http';
import { rm, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (c, m) => { if (!c) { failures++; console.error('✗', m); } else console.log('✓', m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function start(port, extraEnv) {
  const child = spawn('node', ['server/index.js'], { cwd: root, env: { ...process.env, PORT: String(port), AI_API_KEY: '', ...extraEnv }, stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  child.stdout.on('data', (d) => (out += d));
  child.stderr.on('data', (d) => (out += d));
  return { child, out: () => out };
}
async function post(port, path, body, raw) {
  const r = await fetch(`http://localhost:${port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ?? JSON.stringify(body) });
  return { status: r.status, json: await r.json().catch(() => null) };
}

// مزوّد وهمي
let lastUpstream = null;
const mock = http.createServer((req, res) => {
  let b = '';
  req.on('data', (c) => (b += c));
  req.on('end', () => {
    lastUpstream = { url: req.url, auth: req.headers.authorization, body: JSON.parse(b || '{}') };
    if (lastUpstream.body.messages?.some((m) => m.content === 'FAIL')) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: { message: 'SECRET upstream detail sk-xyz' } }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ choices: [{ message: { content: 'mock reply' } }] }));
  });
});
await new Promise((r) => mock.listen(8899, r));

// ---- 1) بدون مفتاح
let s = start(8801, {});
await wait(700);
let r = await fetch('http://localhost:8801/api/health').then((x) => x.json());
ok(r.ok === true && r.aiConfigured === false, 'health: aiConfigured=false بدون مفتاح');
r = await post(8801, '/api/chat', { messages: [{ role: 'user', content: 'مرحبا' }], lang: 'ar' });
ok(r.status === 200 && r.json.demo === true && /تجريبي/.test(r.json.reply), 'chat بدون مفتاح يردّ بوضع تجريبي صريح');
r = await post(8801, '/api/chat', { messages: [] });
ok(r.status === 400, 'chat: رسائل فارغة → 400');
r = await post(8801, '/api/chat', { messages: [{ role: 'assistant', content: 'x' }] });
ok(r.status === 400, 'chat: آخر رسالة ليست من المستخدم → 400');
r = await post(8801, '/api/chat', null, '{bad json');
ok(r.status === 400, 'chat: JSON تالف → 400');
r = await post(8801, '/api/chat', { messages: [{ role: 'user', content: 'x'.repeat(100000) }] });
ok(r.status === 413, 'chat: جسم كبير → 413');
await rm(join(root, 'server/data'), { recursive: true, force: true });
r = await post(8801, '/api/contact', { name: 'A', email: 'bad', message: 'hi' });
ok(r.status === 400, 'contact: بريد غير صالح → 400');
r = await post(8801, '/api/contact', { name: 'Ali', email: 'ali@example.com', message: 'hello' });
ok(r.status === 200 && r.json.ok, 'contact: صالح → 200');
const saved = await readFile(join(root, 'server/data/contacts.jsonl'), 'utf8');
ok(saved.includes('ali@example.com'), 'contact: الرسالة حُفظت فعليًا');
await rm(join(root, 'server/data'), { recursive: true, force: true });
r = await fetch('http://localhost:8801/api/sports/matches');
ok(r.status === 501, 'sports: 501 صريح بدل بيانات مختلقة');
r = await fetch('http://localhost:8801/api/nope');
ok(r.status === 404, 'مسار غير معروف → 404');
for (let i = 0; i < 25; i++) r = await post(8801, '/api/chat', { messages: [{ role: 'user', content: 'hi' }] });
ok(r.status === 429, 'chat: حد الطلبات → 429');
s.child.kill();

// ---- 2) مع مفتاح ومزوّد وهمي (openai-compatible)
s = start(8802, { AI_PROVIDER: 'openai', AI_API_KEY: 'sk-test-123', AI_BASE_URL: 'http://localhost:8899', AI_MODEL: 'm1' });
await wait(700);
r = await fetch('http://localhost:8802/api/health').then((x) => x.json());
ok(r.aiConfigured === true, 'health: aiConfigured=true مع مفتاح');
ok(!JSON.stringify(r).includes('sk-test-123'), 'health لا يكشف المفتاح');
r = await post(8802, '/api/chat', { messages: [{ role: 'assistant', content: 'old' }, { role: 'user', content: 'اشرح التسلل' }], lang: 'ar' });
ok(r.status === 200 && r.json.demo === false && r.json.reply === 'mock reply', 'chat حقيقي: يمرّر ويعيد ردّ المزود');
ok(lastUpstream.auth === 'Bearer sk-test-123' && lastUpstream.body.model === 'm1', 'المفتاح والنموذج يُرسلان من الخادم فقط');
ok(lastUpstream.body.messages[0].role === 'system' && lastUpstream.body.messages[1].role === 'user', 'system prompt أولًا ثم أول رسالة user (حُذفت assistant الأولى)');
r = await post(8802, '/api/chat', { messages: [{ role: 'user', content: 'FAIL' }] });
ok(r.status === 502 && !JSON.stringify(r.json).includes('SECRET') && !JSON.stringify(r.json).includes('sk-'), 'خطأ المزود: 502 دون تسريب تفاصيل أو مفاتيح');
s.child.kill();
mock.close();

if (failures) { console.error(`\n${failures} فشل`); process.exit(1); }
console.log('\n✔ كل اختبارات الخادم نجحت');
