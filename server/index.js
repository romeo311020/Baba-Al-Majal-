// الخادم الوسيط الآمن ليلا رياضة — بدون أي حزم خارجية (Node 18+).
// المفاتيح السرية تبقى هنا في متغيرات البيئة ولا تصل إلى المتصفح أبدًا.
//
//   GET  /api/health          حالة الخادم وهل مفتاح الذكاء الاصطناعي مضبوط
//   POST /api/chat            Yalla AI  { messages:[{role,content}], lang }
//   POST /api/contact         رسائل صفحة اتصل بنا (تُحفظ في server/data/contacts.jsonl)
//   GET  /api/sports/*        بيانات الرياضة الحقيقية (تحتاج محوّلًا: server/providers/sports.js)

import http from 'node:http';
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleSports } from './providers/sports.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------- قراءة .env (بدون dotenv) ----------
async function loadEnv() {
  for (const file of [join(__dirname, '..', '.env'), join(__dirname, '.env')]) {
    try {
      const text = await readFile(file, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
        if (!m || line.trim().startsWith('#')) continue;
        const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
        if (process.env[m[1]] === undefined) process.env[m[1]] = value;
      }
    } catch {
      /* الملف غير موجود — لا بأس */
    }
  }
}
await loadEnv();

const env = (k, d = '') => (process.env[k] ?? d).trim();
const PORT = Number(env('PORT', '8787'));
const ALLOWED_ORIGIN = env('ALLOWED_ORIGIN', '*');
const AI = {
  provider: env('AI_PROVIDER', 'anthropic').toLowerCase(),
  key: env('AI_API_KEY'),
  model: env('AI_MODEL', 'claude-sonnet-5-5'),
  baseUrl: env('AI_BASE_URL').replace(/\/$/, ''),
  maxTokens: Math.min(Math.max(Number(env('AI_MAX_TOKENS', '900')) || 900, 64), 4000),
};
const aiConfigured = () => AI.key.length > 0;

// ---------- أدوات ----------
const MAX_BODY = 64 * 1024;
const MAX_MESSAGES = 20;
const MAX_CONTENT = 1500;

function send(res, status, body, origin) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN === '*' ? '*' : origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooBig = false;
    const chunks = [];
    req.on('data', (c) => {
      if (tooBig) return; // نتجاهل ما تبقى (لا نقطع الاتصال كي يصل ردّ 413 للعميل)
      size += c.length;
      if (size > MAX_BODY) {
        tooBig = true;
        chunks.length = 0;
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      if (tooBig) return reject(Object.assign(new Error('payload too large'), { status: 413 }));
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(Object.assign(new Error('invalid json'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

// حد بسيط للطلبات لكل عنوان IP (في الذاكرة). للإنتاج استخدم حلًا مركزيًا (Redis/بوابة API).
const hits = new Map();
function rateLimited(ip, bucket, limit, windowMs) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  return false;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of hits) if (!arr.some((t) => now - t < 3600_000)) hits.delete(k);
}, 600_000).unref();

// ---------- المساعد ----------
function systemPrompt(lang) {
  const language = lang === 'en' ? 'English' : 'Arabic (Modern Standard Arabic, friendly tone)';
  return [
    'You are Yalla AI, the sports assistant of the Yalla Riyada platform ("The Strongest Sports Platform in the Arab World").',
    `Reply in ${language} unless the user clearly writes in another language.`,
    'You can explain rules, terminology, history, statistics concepts, teams, tournaments and general training/fitness information across many sports.',
    'You do not have live data. Never invent live scores, fixtures, transfers, injuries or news. If asked for current information, say you cannot see live data and suggest checking the Matches or News pages.',
    'Fitness and health information is general and not medical advice; recommend a professional for injuries or medical conditions.',
    'Keep answers clear and reasonably concise. Politely decline requests unrelated to sports.',
  ].join(' ');
}

function demoReply(lang, lastUser) {
  const q = lastUser.length > 80 ? `${lastUser.slice(0, 80)}…` : lastUser;
  return lang === 'en'
    ? `This is a demo reply: the server is running but AI_API_KEY is not set, so no real AI model answered. Your question was: "${q}". Add AI_API_KEY to your .env file and restart the server to enable Yalla AI.`
    : `هذا ردّ تجريبي: الخادم يعمل لكن AI_API_KEY غير مضبوط، لذلك لم يُجب نموذج ذكاء اصطناعي حقيقي. سؤالك كان: «${q}». أضف AI_API_KEY في ملف .env ثم أعد تشغيل الخادم لتفعيل Yalla AI.`;
}

function validateChat(body) {
  const lang = body.lang === 'en' ? 'en' : 'ar';
  if (!Array.isArray(body.messages) || body.messages.length === 0) return { error: 'messages required' };
  let messages = body.messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CONTENT) }))
    .slice(-MAX_MESSAGES);
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return { error: 'last message must be from user' };
  return { lang, messages };
}

async function callProvider(messages, lang) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    if (AI.provider === 'openai') {
      if (!AI.baseUrl) throw Object.assign(new Error('AI_BASE_URL is required when AI_PROVIDER=openai'), { status: 500 });
      const r = await fetch(`${AI.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI.key}` },
        body: JSON.stringify({
          model: AI.model,
          max_tokens: AI.maxTokens,
          messages: [{ role: 'system', content: systemPrompt(lang) }, ...messages],
        }),
        signal: controller.signal,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(data?.error?.message ?? `provider ${r.status}`), { status: r.status });
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) throw Object.assign(new Error('empty provider reply'), { status: 502 });
      return text.trim();
    }

    // anthropic (الافتراضي)
    const r = await fetch(`${AI.baseUrl || 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': AI.key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: AI.model, max_tokens: AI.maxTokens, system: systemPrompt(lang), messages }),
      signal: controller.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data?.error?.message ?? `provider ${r.status}`), { status: r.status });
    const text = Array.isArray(data?.content) ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n') : '';
    if (!text.trim()) throw Object.assign(new Error('empty provider reply'), { status: 502 });
    return text.trim();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- الخادم ----------
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  const ip = req.socket.remoteAddress ?? 'unknown';
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.replace(/\/+$/, '') || '/';

  try {
    if (req.method === 'OPTIONS') return send(res, 204, {}, origin);

    if (req.method === 'GET' && path === '/api/health') {
      return send(res, 200, { ok: true, aiConfigured: aiConfigured(), provider: AI.provider }, origin);
    }

    if (req.method === 'POST' && path === '/api/chat') {
      if (rateLimited(ip, 'chat', 20, 60_000)) return send(res, 429, { error: 'rate limit' }, origin);
      const parsed = validateChat(await readJson(req));
      if (parsed.error) return send(res, 400, { error: parsed.error }, origin);

      if (!aiConfigured()) {
        const last = parsed.messages[parsed.messages.length - 1].content;
        return send(res, 200, { reply: demoReply(parsed.lang, last), demo: true }, origin);
      }
      try {
        const reply = await callProvider(parsed.messages, parsed.lang);
        return send(res, 200, { reply, demo: false }, origin);
      } catch (e) {
        console.error('[chat] provider error:', e instanceof Error ? e.message : e);
        // لا نمرّر تفاصيل المزود (قد تكشف إعدادات) — رسالة عامة فقط
        const status = e?.status === 429 ? 429 : 502;
        return send(res, status, { error: status === 429 ? 'rate limit' : 'ai provider error' }, origin);
      }
    }

    if (req.method === 'POST' && path === '/api/contact') {
      if (rateLimited(ip, 'contact', 5, 3600_000)) return send(res, 429, { error: 'rate limit' }, origin);
      const b = await readJson(req);
      const name = typeof b.name === 'string' ? b.name.trim().slice(0, 80) : '';
      const email = typeof b.email === 'string' ? b.email.trim().slice(0, 120) : '';
      const message = typeof b.message === 'string' ? b.message.trim().slice(0, 2000) : '';
      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: 'invalid fields' }, origin);
      const dir = join(__dirname, 'data');
      await mkdir(dir, { recursive: true });
      await appendFile(join(dir, 'contacts.jsonl'), JSON.stringify({ at: new Date().toISOString(), name, email, message }) + '\n', 'utf8');
      return send(res, 200, { ok: true }, origin);
    }

    if (req.method === 'GET' && path.startsWith('/api/sports')) {
      const out = await handleSports(path.replace('/api/sports', '') || '/', url.searchParams, env);
      return send(res, out.status, out.body, origin);
    }

    return send(res, 404, { error: 'not found' }, origin);
  } catch (e) {
    const status = typeof e?.status === 'number' ? e.status : 500;
    if (status === 500) console.error('[server] error:', e);
    return send(res, status, { error: status === 500 ? 'server error' : e.message }, origin);
  }
});

server.listen(PORT, () => {
  console.log(`✔ Yalla Riyada API on http://localhost:${PORT}`);
  console.log(aiConfigured() ? `  AI: ${AI.provider} / ${AI.model} (key set)` : '  AI: DEMO mode — AI_API_KEY is not set');
});
