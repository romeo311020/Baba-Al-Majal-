// محوّل مزود بيانات الرياضة — هنا تربط مزودًا حقيقيًا (API-Football أو غيره).
//
// ⚠️ غير منفّذ عمدًا: لم يُختر مزود بعد، ولن نخترع نتائج. حتى يُكتب المحوّل يردّ الخادم بـ 501،
// وتبقى الواجهة في وضع demo (VITE_SPORTS_DATA_MODE=demo) وتعرض بيانات موسومة "تجريبي".
//
// عند الكتابة: حوّل استجابة المزود إلى نفس الأشكال في src/types.ts:
//   GET /api/sports/matches?date=YYYY-MM-DD   ← Match[]
//   GET /api/sports/matches/:id               ← MatchDetails        (404 إن لم توجد)
//   GET /api/sports/teams/:id                 ← { team, matches, players }
//   GET /api/sports/players/:id               ← { player, team }
//
// المتغيرات المتاحة من env(): SPORTS_API_BASE_URL, SPORTS_API_KEY, SPORTS_API_KEY_HEADER
// (المفتاح يبقى على الخادم ولا يصل للمتصفح). خزّن الاستجابات مؤقتًا (cache) لتوفير حصة المزود.

/**
 * @param {string} subPath   المسار بعد /api/sports (مثل /matches أو /matches/123)
 * @param {URLSearchParams} query
 * @param {(key: string, fallback?: string) => string} env
 * @returns {Promise<{status: number, body: unknown}>}
 */
export async function handleSports(subPath, query, env) {
  const configured = env('SPORTS_API_BASE_URL') && env('SPORTS_API_KEY');
  return {
    status: 501,
    body: {
      error: configured
        ? 'sports provider adapter not implemented: write it in server/providers/sports.js'
        : 'sports provider not configured: set SPORTS_API_BASE_URL and SPORTS_API_KEY, then implement server/providers/sports.js',
    },
  };
}
