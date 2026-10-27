const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ProviderFixture = {
  fixture?: {
    id?: number;
    date?: string;
    status?: { short?: string };
  };
  league?: { name?: string };
  teams?: {
    home?: { name?: string; logo?: string };
    away?: { name?: string; logo?: string };
  };
  goals?: { home?: number | null; away?: number | null };
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=30',
    },
  });

function cairoDate(offset = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + offset));
  return date.toISOString().slice(0, 10);
}

function normalizeFixture(item: ProviderFixture) {
  const status = item.fixture?.status?.short ?? '';
  const liveStatuses = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE', 'INT']);
  const finishedStatuses = new Set(['FT', 'AET', 'PEN']);

  return {
    fixture_id: item.fixture?.id,
    kickoff: item.fixture?.date ?? null,
    status: liveStatuses.has(status) ? 'live' : finishedStatuses.has(status) ? 'finished' : 'scheduled',
    home_team: item.teams?.home?.name ?? 'الفريق الأول',
    away_team: item.teams?.away?.name ?? 'الفريق الثاني',
    home_logo: item.teams?.home?.logo ?? null,
    away_logo: item.teams?.away?.logo ?? null,
    league: item.league?.name ?? 'كرة القدم',
    home_score: item.goals?.home ?? null,
    away_score: item.goals?.away ?? null,
  };
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'طريقة الطلب غير مدعومة.' }, 405);

  const apiKey = Deno.env.get('API_FOOTBALL_KEY');
  if (!apiKey) return jsonResponse({ error: 'مفتاح API-Football غير مضبوط في إعدادات الخادم.' }, 503);

  let body: { action?: string; date?: string; fixtureId?: number };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'صيغة الطلب غير صالحة.' }, 400);
  }

  const params = new URLSearchParams({ timezone: 'Africa/Cairo' });
  if (body.action === 'fixtures') {
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return jsonResponse({ error: 'التاريخ المطلوب غير صالح.' }, 400);
    }
    const parsedDate = new Date(`${body.date}T00:00:00Z`);
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== body.date) {
      return jsonResponse({ error: 'التاريخ المطلوب غير صالح.' }, 400);
    }
    const allowedDates = new Set([cairoDate(-1), cairoDate(), cairoDate(1)]);
    if (!allowedDates.has(body.date)) {
      return jsonResponse({ error: 'يمكن طلب مباريات أمس أو اليوم أو غدًا فقط.' }, 400);
    }
    params.set('date', body.date);
  } else if (body.action === 'fixture') {
    if (!Number.isSafeInteger(body.fixtureId) || Number(body.fixtureId) < 1) {
      return jsonResponse({ error: 'رقم المباراة غير صالح.' }, 400);
    }
    params.set('id', String(body.fixtureId));
  } else {
    return jsonResponse({ error: 'نوع الطلب غير معروف.' }, 400);
  }

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?${params}`, {
      headers: { 'x-apisports-key': apiKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      return jsonResponse(
        { error: response.status === 429 ? 'تم تجاوز حد الطلبات في API-Football. حاول لاحقًا.' : 'تعذّر جلب البيانات من API-Football.' },
        response.status === 429 ? 429 : 502,
      );
    }

    const payload = await response.json();
    if (payload.errors && Object.keys(payload.errors).length > 0) {
      return jsonResponse({ error: 'رفض API-Football الطلب. تحقق من صلاحية المفتاح والباقة.' }, 502);
    }
    const fixtures = (payload.response ?? []).map(normalizeFixture);
    if (body.action === 'fixture') {
      const fixture = fixtures.find((item: ReturnType<typeof normalizeFixture>) => item.fixture_id === body.fixtureId);
      return jsonResponse({ fixture: fixture ?? null });
    }
    return jsonResponse({ fixtures });
  } catch (error) {
    console.error('API-Football request failed:', error);
    return jsonResponse({ error: 'تعذّر الاتصال بـ API-Football. حاول مرة أخرى.' }, 502);
  }
});
