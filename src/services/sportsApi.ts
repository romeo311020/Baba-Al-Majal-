/**
 * طبقة بيانات الرياضة.
 * - وضع demo (الافتراضي): بيانات تجريبية موسومة isDemo = true.
 * - وضع live: يطلب من الخادم الوسيط /api/sports/... ويتوقع JSON بنفس أشكال src/types.ts.
 *   (محوّل المزود الفعلي يُكتب في server/providers — انظر README).
 */
import type {
  Bi,
  Competition,
  Match,
  MatchDetails,
  PlayerProfile,
  Result,
  SportId,
  Team,
} from '../types';
import { COMPETITIONS, TEAMS, getTeamById } from '../data/catalog';
import { MATCH_DEFS } from '../data/matches';
import { PLAYERS, getPlayerById } from '../data/players';
import { allMatches, buildDetails, matchSearchText } from './demo/engine';
import { DATA_MODE, apiFetch, delay } from './config';
import { addDays, parseISODate, startOfDay, toISODate } from '../utils/date';

export interface MatchFilters {
  /** YYYY-MM-DD بالتوقيت المحلي */
  date: string;
  sport?: SportId | 'all';
  competitionId?: string;
  /** رمز الدولة كما في Competition.countryCode */
  country?: string;
  q?: string;
}

const isDemo = DATA_MODE === 'demo';

function applyFilters(list: Match[], f: Omit<MatchFilters, 'date'>): Match[] {
  const q = f.q?.trim().toLowerCase();
  return list.filter((m) => {
    if (f.sport && f.sport !== 'all' && m.sport !== f.sport) return false;
    if (f.competitionId && m.competition.id !== f.competitionId) return false;
    if (f.country && m.competition.countryCode !== f.country) return false;
    if (q && !matchSearchText(m).includes(q)) return false;
    return true;
  });
}

async function loadAll(): Promise<Match[]> {
  if (isDemo) {
    await delay(220);
    return allMatches();
  }
  return apiFetch<Match[]>('/sports/matches');
}

export async function getMatches(f: MatchFilters): Promise<Result<Match[]>> {
  const day = parseISODate(f.date);
  if (!day) return { data: [], isDemo };
  const list = isDemo
    ? await loadAll()
    : await apiFetch<Match[]>(`/sports/matches?date=${encodeURIComponent(f.date)}`);
  const sameDay = list.filter((m) => toISODate(new Date(m.kickoff)) === f.date);
  return { data: applyFilters(sameDay, f), isDemo };
}

/** مباريات بين تاريخين (شاملين) — لصفحات الرياضة والفريق */
export async function getMatchesRange(
  fromISO: string,
  toISO: string,
  f: Omit<MatchFilters, 'date'> = {},
): Promise<Result<Match[]>> {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (!from || !to) return { data: [], isDemo };
  const end = addDays(startOfDay(to), 1).getTime();
  const list = (await loadAll()).filter((m) => {
    const t = new Date(m.kickoff).getTime();
    return t >= startOfDay(from).getTime() && t < end;
  });
  return { data: applyFilters(list, f), isDemo };
}

export async function getFeaturedMatches(limit = 4): Promise<Result<Match[]>> {
  const list = await loadAll();
  const upcoming = list.filter((m) => m.status === 'live' || m.status === 'halftime' || m.status === 'scheduled');
  const featured = upcoming.filter((m) => m.featured);
  return { data: (featured.length ? featured : upcoming).slice(0, limit), isDemo };
}

export async function getMatchDetails(id: string): Promise<Result<MatchDetails | null>> {
  if (!isDemo) {
    try {
      return { data: await apiFetch<MatchDetails>(`/sports/matches/${encodeURIComponent(id)}`), isDemo };
    } catch (e) {
      if (e instanceof Error && 'status' in e && (e as { status?: number }).status === 404) return { data: null, isDemo };
      throw e;
    }
  }
  await delay(200);
  const def = MATCH_DEFS.find((d) => d.id === id);
  return { data: def ? buildDetails(def) : null, isDemo };
}

export interface TeamPage {
  team: Team;
  matches: Match[];
  players: PlayerProfile[];
}

export async function getTeam(id: string): Promise<Result<TeamPage | null>> {
  if (!isDemo) {
    try {
      return { data: await apiFetch<TeamPage>(`/sports/teams/${encodeURIComponent(id)}`), isDemo };
    } catch (e) {
      if ((e as { status?: number }).status === 404) return { data: null, isDemo };
      throw e;
    }
  }
  await delay(160);
  const team = getTeamById(id);
  if (!team) return { data: null, isDemo };
  const matches = allMatches().filter((m) => m.home.id === id || m.away.id === id);
  const players = PLAYERS.filter((p) => p.teamId === id);
  return { data: { team, matches, players }, isDemo };
}

export interface PlayerPage {
  player: PlayerProfile;
  team: Team | null;
}

export async function getPlayer(id: string): Promise<Result<PlayerPage | null>> {
  if (!isDemo) {
    try {
      return { data: await apiFetch<PlayerPage>(`/sports/players/${encodeURIComponent(id)}`), isDemo };
    } catch (e) {
      if ((e as { status?: number }).status === 404) return { data: null, isDemo };
      throw e;
    }
  }
  await delay(160);
  const player = getPlayerById(id);
  if (!player) return { data: null, isDemo };
  return { data: { player, team: getTeamById(player.teamId) ?? null }, isDemo };
}

export async function getTeamsBySport(sport: SportId): Promise<Result<Team[]>> {
  await delay(80);
  return { data: TEAMS.filter((t) => t.sport === sport), isDemo };
}

export async function getFeaturedTeams(limit = 6): Promise<Result<Team[]>> {
  await delay(80);
  const picks = ['t-nile', 't-riyadh', 't-giza', 't-bb-cairo', 't-jeddah', 't-delta', 't-najd'];
  const list = picks.map((id) => getTeamById(id)).filter((t): t is Team => !!t);
  return { data: list.slice(0, limit), isDemo };
}

// ---- قوائم الفلاتر (ثابتة في وضع التجريب؛ تُستبدل بطلب API في الوضع الحقيقي)

export function getCompetitions(sport?: SportId | 'all'): Competition[] {
  return COMPETITIONS.filter((c) => !sport || sport === 'all' || c.sport === sport);
}

export function getCountries(): { code: string; name: Bi }[] {
  const map = new Map<string, Bi>();
  for (const c of COMPETITIONS) if (!map.has(c.countryCode)) map.set(c.countryCode, c.country);
  return Array.from(map, ([code, name]) => ({ code, name }));
}

export function getDemoFlag(): boolean {
  return isDemo;
}
