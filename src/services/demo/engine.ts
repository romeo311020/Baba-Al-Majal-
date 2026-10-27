/**
 * محرك البيانات التجريبية للمباريات.
 * يحسب حالة كل مباراة (لم تبدأ / مباشرة / بين الشوطين / انتهت / تأجلت) من الوقت الحالي،
 * ويولّد النتيجة والأحداث والإحصائيات والتشكيلات بشكل ثابت (deterministic) من رقم المباراة.
 * لا علاقة له بمباريات حقيقية — كل شيء هنا للعرض فقط.
 */
import type {
  Bi,
  Lineup,
  LineupPlayer,
  Match,
  MatchDef,
  MatchDetails,
  MatchEvent,
  MatchStat,
  MatchStatus,
  SportId,
  Team,
} from '../../types';
import { COMPETITIONS, TEAMS } from '../../data/catalog';
import { MATCH_DEFS } from '../../data/matches';
import { PLAYERS } from '../../data/players';
import { randInt, rngFor } from '../../utils/random';
import { startOfDay } from '../../utils/date';

/** مدة المباراة بالدقائق (تشمل الاستراحات) لكل رياضة — لحساب المباشر/المنتهي */
export const DURATION: Record<SportId, number> = {
  football: 105,
  basketball: 120,
  tennis: 120,
  handball: 90,
  volleyball: 100,
  athletics: 90,
  swimming: 60,
  boxing: 45,
};

export function kickoffDate(def: MatchDef, now: Date): Date {
  const k = startOfDay(now);
  k.setDate(k.getDate() + def.dayOffset);
  k.setHours(def.hour, def.minute, 0, 0);
  return k;
}

/** دقيقة اللعب الفعلية في كرة القدم من الزمن المنقضي منذ الصافرة (مع استراحة 15 دقيقة) */
export function footballMinute(elapsed: number): number {
  if (elapsed < 45) return Math.max(0, elapsed);
  if (elapsed < 60) return 45;
  return Math.min(90, elapsed - 15);
}

interface Goal {
  side: 'home' | 'away';
  minute: number;
}

export function goalsFor(def: MatchDef): Goal[] {
  const rng = rngFor(`${def.id}:goals`);
  const goals: Goal[] = [];
  for (let i = 0; i < def.finalHome; i++) goals.push({ side: 'home', minute: randInt(rng, 3, 90) });
  for (let i = 0; i < def.finalAway; i++) goals.push({ side: 'away', minute: randInt(rng, 3, 90) });
  return goals.sort((a, b) => a.minute - b.minute);
}

function scoreAtMinute(def: MatchDef, minute: number): { home: number; away: number } {
  let home = 0;
  let away = 0;
  for (const g of goalsFor(def)) {
    if (g.minute <= minute) {
      if (g.side === 'home') home++;
      else away++;
    }
  }
  return { home, away };
}

export function computeStatus(def: MatchDef, elapsed: number): MatchStatus {
  if (def.postponed) return 'postponed';
  if (elapsed < 0) return 'scheduled';
  if (elapsed >= DURATION[def.sport]) return 'finished';
  if (def.sport === 'football' && elapsed >= 45 && elapsed < 60) return 'halftime';
  return 'live';
}

function mustFind<T>(item: T | undefined, what: string): T {
  if (!item) throw new Error(`Demo data error: missing ${what}`);
  return item;
}

export function buildMatch(def: MatchDef, now: Date = new Date()): Match {
  const competition = mustFind(
    COMPETITIONS.find((c) => c.id === def.competitionId),
    `competition ${def.competitionId}`,
  );
  const home = mustFind(
    TEAMS.find((t) => t.id === def.homeId),
    `team ${def.homeId}`,
  );
  const away = mustFind(
    TEAMS.find((t) => t.id === def.awayId),
    `team ${def.awayId}`,
  );
  const kickoff = kickoffDate(def, now);
  const elapsed = (now.getTime() - kickoff.getTime()) / 60000;
  const status = computeStatus(def, elapsed);

  let homeScore: number | null = null;
  let awayScore: number | null = null;
  let clock: string | undefined;

  if (status === 'finished') {
    homeScore = def.finalHome;
    awayScore = def.finalAway;
  } else if (status === 'live' || status === 'halftime') {
    if (def.sport === 'football') {
      const gm = footballMinute(elapsed);
      const s = scoreAtMinute(def, gm);
      homeScore = s.home;
      awayScore = s.away;
      if (status === 'live') clock = `${Math.max(1, Math.floor(gm))}'`;
    } else {
      const p = Math.min(1, elapsed / DURATION[def.sport]);
      homeScore = Math.round(def.finalHome * p);
      awayScore = Math.round(def.finalAway * p);
      if (def.sport === 'basketball') clock = `Q${Math.min(4, Math.floor(elapsed / 30) + 1)}`;
    }
  }

  return {
    id: def.id,
    sport: def.sport,
    competition,
    home,
    away,
    kickoff: kickoff.toISOString(),
    status,
    homeScore,
    awayScore,
    clock,
    venue: def.venue,
    featured: def.featured,
  };
}

export function allMatches(now: Date = new Date()): Match[] {
  return MATCH_DEFS.map((d) => buildMatch(d, now)).sort(
    (a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime(),
  );
}

/** نص بحث يضم أسماء الفريقين والبطولة والدولة واللاعبين المميزين */
export function matchSearchText(m: Match): string {
  const players = PLAYERS.filter((p) => p.teamId === m.home.id || p.teamId === m.away.id)
    .map((p) => `${p.name.ar} ${p.name.en}`)
    .join(' ');
  return [
    m.home.name.ar,
    m.home.name.en,
    m.away.name.ar,
    m.away.name.en,
    m.competition.name.ar,
    m.competition.name.en,
    m.competition.country.ar,
    m.competition.country.en,
    players,
  ]
    .join(' ')
    .toLowerCase();
}

// ---------------------------------------------------------------- التشكيلات

const FIRST: Bi[] = [
  { ar: 'كريم', en: 'Karim' },
  { ar: 'يوسف', en: 'Youssef' },
  { ar: 'عمر', en: 'Omar' },
  { ar: 'زياد', en: 'Ziad' },
  { ar: 'فيصل', en: 'Faisal' },
  { ar: 'سالم', en: 'Salem' },
  { ar: 'نايف', en: 'Nayef' },
  { ar: 'هاني', en: 'Hany' },
  { ar: 'طارق', en: 'Tarek' },
  { ar: 'مازن', en: 'Mazen' },
  { ar: 'باسل', en: 'Basel' },
  { ar: 'رامي', en: 'Rami' },
  { ar: 'خالد', en: 'Khaled' },
  { ar: 'ماجد', en: 'Majed' },
];

const LAST: Bi[] = [
  { ar: 'نبيل', en: 'Nabil' },
  { ar: 'الحربي', en: 'Al-Harbi' },
  { ar: 'فهمي', en: 'Fahmy' },
  { ar: 'القحطاني', en: 'Al-Qahtani' },
  { ar: 'عادل', en: 'Adel' },
  { ar: 'منصور', en: 'Mansour' },
  { ar: 'الزهراني', en: 'Al-Zahrani' },
  { ar: 'سعيد', en: 'Saeed' },
  { ar: 'حجازي', en: 'Hegazy' },
  { ar: 'الدوسري', en: 'Al-Dosari' },
  { ar: 'رفعت', en: 'Refaat' },
  { ar: 'شاكر', en: 'Shaker' },
  { ar: 'العتيبي', en: 'Al-Otaibi' },
];

const FORMATION: { pos: LineupPlayer['pos']; number: number }[] = [
  { pos: 'GK', number: 1 },
  { pos: 'DF', number: 2 },
  { pos: 'DF', number: 3 },
  { pos: 'DF', number: 4 },
  { pos: 'DF', number: 5 },
  { pos: 'MF', number: 6 },
  { pos: 'MF', number: 8 },
  { pos: 'MF', number: 10 },
  { pos: 'FW', number: 7 },
  { pos: 'FW', number: 9 },
  { pos: 'FW', number: 11 },
];

export function buildLineup(team: Team): Lineup {
  const rng = rngFor(`lineup:${team.id}`);
  const used = new Set<string>();
  const players: LineupPlayer[] = FORMATION.map((slot) => {
    let f = 0;
    let l = 0;
    let key = '';
    do {
      f = randInt(rng, 0, FIRST.length - 1);
      l = randInt(rng, 0, LAST.length - 1);
      key = `${f}-${l}`;
    } while (used.has(key));
    used.add(key);
    return {
      number: slot.number,
      pos: slot.pos,
      name: { ar: `${FIRST[f].ar} ${LAST[l].ar}`, en: `${FIRST[f].en} ${LAST[l].en}` },
    };
  });
  return { formation: '4-3-3', players };
}

// ---------------------------------------------------------------- الإحصائيات

type StatSpec = [key: string, ar: string, en: string, min: number, max: number, percent?: boolean];

const SPECS: Partial<Record<SportId, StatSpec[]>> = {
  basketball: [
    ['fg', 'نسبة التسديد', 'Field goal %', 38, 54, true],
    ['reb', 'متابعات', 'Rebounds', 30, 48],
    ['ast', 'تمريرات حاسمة', 'Assists', 12, 26],
    ['to', 'خسارة الكرة', 'Turnovers', 7, 16],
  ],
  tennis: [
    ['ace', 'إرسال ساحق', 'Aces', 2, 14],
    ['df', 'أخطاء إرسال مزدوجة', 'Double faults', 0, 6],
    ['bp', 'كسر إرسال', 'Break points won', 1, 6],
    ['fs', 'نسبة الإرسال الأول', 'First serve %', 54, 72, true],
  ],
  handball: [
    ['sv', 'تصديات', 'Saves', 7, 17],
    ['sus', 'إيقاف دقيقتين', '2-min suspensions', 0, 4],
    ['p7', 'رميات 7 أمتار', '7m throws', 0, 4],
  ],
  volleyball: [
    ['ace', 'إرسال ساحق', 'Aces', 2, 9],
    ['blk', 'صدّات ناجحة', 'Blocks', 3, 13],
    ['atk', 'نقاط هجومية', 'Attack points', 28, 52],
  ],
  boxing: [
    ['pl', 'لكمات مُسجَّلة', 'Punches landed', 40, 120],
    ['pp', 'لكمات قوية', 'Power punches', 15, 55],
    ['jb', 'ضربات مباشرة', 'Jabs landed', 15, 60],
  ],
};

function genericStats(def: MatchDef, progress: number): MatchStat[] {
  const specs = SPECS[def.sport];
  if (!specs) return [];
  const rng = rngFor(`${def.id}:stats`);
  return specs.map(([key, ar, en, min, max, percent]) => {
    const h = randInt(rng, min, max);
    const a = randInt(rng, min, max);
    return {
      key,
      label: { ar, en },
      home: percent ? h : Math.round(h * progress),
      away: percent ? a : Math.round(a * progress),
      percent,
    };
  });
}

// ---------------------------------------------------------------- التفاصيل

export function buildDetails(def: MatchDef, now: Date = new Date()): MatchDetails {
  const match = buildMatch(def, now);
  const started = match.status === 'live' || match.status === 'halftime' || match.status === 'finished';
  const elapsed = (now.getTime() - new Date(match.kickoff).getTime()) / 60000;

  if (def.sport !== 'football') {
    const progress = match.status === 'finished' ? 1 : Math.min(1, Math.max(0, elapsed / DURATION[def.sport]));
    return {
      match,
      stats: started ? genericStats(def, progress) : [],
      events: null,
      lineups: null,
    };
  }

  const lineups = { home: buildLineup(match.home), away: buildLineup(match.away) };
  if (!started) {
    return { match, stats: [], events: [], lineups: null };
  }

  const gm = match.status === 'finished' ? 90 : footballMinute(elapsed);
  const events: MatchEvent[] = [];
  const evRng = rngFor(`${def.id}:events`);

  const pickScorer = (side: 'home' | 'away'): Bi => {
    const pool = lineups[side].players.filter((p) => p.pos === 'FW' || p.pos === 'MF');
    return pool[randInt(evRng, 0, pool.length - 1)].name;
  };
  const pickAny = (side: 'home' | 'away'): Bi => {
    const pool = lineups[side].players.filter((p) => p.pos !== 'GK');
    return pool[randInt(evRng, 0, pool.length - 1)].name;
  };

  for (const g of goalsFor(def)) {
    events.push({ minute: g.minute, type: 'goal', side: g.side, player: pickScorer(g.side) });
  }
  const yellows = randInt(evRng, 1, 4);
  for (let i = 0; i < yellows; i++) {
    const side = evRng() < 0.5 ? 'home' : 'away';
    events.push({ minute: randInt(evRng, 8, 88), type: 'yellow', side, player: pickAny(side) });
  }
  if (evRng() < 0.15) {
    const side = evRng() < 0.5 ? 'home' : 'away';
    events.push({ minute: randInt(evRng, 55, 88), type: 'red', side, player: pickAny(side) });
  }
  for (const side of ['home', 'away'] as const) {
    events.push({ minute: randInt(evRng, 56, 78), type: 'sub', side, player: pickAny(side) });
    events.push({ minute: randInt(evRng, 66, 86), type: 'sub', side, player: pickAny(side) });
  }

  const visible = events.filter((e) => e.minute <= gm).sort((a, b) => a.minute - b.minute);
  const progress = Math.min(1, gm / 90);
  const sRng = rngFor(`${def.id}:fstats`);

  const possHome = randInt(sRng, 42, 60);
  const shotsHome = Math.round(randInt(sRng, 9, 18) * progress);
  const shotsAway = Math.round(randInt(sRng, 7, 16) * progress);
  const hsc = match.homeScore ?? 0;
  const asc = match.awayScore ?? 0;
  const sotHome = Math.max(hsc, Math.round(shotsHome * 0.4));
  const sotAway = Math.max(asc, Math.round(shotsAway * 0.4));
  const count = (type: MatchEvent['type'], side: 'home' | 'away') =>
    visible.filter((e) => e.type === type && e.side === side).length;

  const stats: MatchStat[] = [
    { key: 'poss', label: { ar: 'الاستحواذ', en: 'Possession' }, home: possHome, away: 100 - possHome, percent: true },
    { key: 'shots', label: { ar: 'التسديدات', en: 'Shots' }, home: Math.max(shotsHome, sotHome), away: Math.max(shotsAway, sotAway) },
    { key: 'sot', label: { ar: 'على المرمى', en: 'On target' }, home: sotHome, away: sotAway },
    {
      key: 'corners',
      label: { ar: 'ركنيات', en: 'Corners' },
      home: Math.round(randInt(sRng, 2, 8) * progress),
      away: Math.round(randInt(sRng, 2, 8) * progress),
    },
    {
      key: 'fouls',
      label: { ar: 'أخطاء', en: 'Fouls' },
      home: Math.round(randInt(sRng, 8, 16) * progress),
      away: Math.round(randInt(sRng, 8, 16) * progress),
    },
    { key: 'yellow', label: { ar: 'إنذارات', en: 'Yellow cards' }, home: count('yellow', 'home'), away: count('yellow', 'away') },
  ];

  return { match, stats, events: visible, lineups };
}
