import type { Bi, MatchDef, SportId } from '../types';
import { getTeamById } from './catalog';

/**
 * ⚠️ جدول مباريات تجريبي. المواعيد نسبية لليوم الحالي (أمس/اليوم/غدًا) والحالات
 * (مباشرة/انتهت…) تُحسب من الوقت الحالي لجهاز المستخدم. لا علاقة لها بمباريات حقيقية.
 */
function d(
  id: string,
  sport: SportId,
  competitionId: string,
  homeId: string,
  awayId: string,
  dayOffset: number,
  hour: number,
  minute: number,
  finalHome: number,
  finalAway: number,
  extra: Partial<Pick<MatchDef, 'postponed' | 'featured'>> = {},
): MatchDef {
  const fallback: Bi = { ar: 'مكان تجريبي', en: 'Demo venue' };
  return {
    id,
    sport,
    competitionId,
    homeId,
    awayId,
    dayOffset,
    hour,
    minute,
    finalHome,
    finalAway,
    venue: getTeamById(homeId)?.home ?? fallback,
    ...extra,
  };
}

export const MATCH_DEFS: MatchDef[] = [
  // قبل أمس
  d('m-001', 'football', 'c-eg-league', 't-nile', 't-giza', -2, 20, 0, 2, 0),
  d('m-002', 'football', 'c-eg-league', 't-red', 't-delta', -2, 18, 0, 1, 1),

  // أمس
  d('m-101', 'football', 'c-eg-league', 't-nile', 't-delta', -1, 19, 0, 2, 1, { featured: true }),
  d('m-102', 'football', 'c-sa-league', 't-riyadh', 't-najd', -1, 21, 0, 0, 0),
  d('m-103', 'basketball', 'c-bb-series', 't-bb-cairo', 't-bb-jeddah', -1, 20, 0, 88, 91),
  d('m-104', 'tennis', 'c-tn-open', 't-tn-1', 't-tn-2', -1, 15, 0, 2, 1),
  d('m-105', 'handball', 'c-hb-cup', 't-hb-suez', 't-hb-tabuk', -1, 18, 0, 29, 27),

  // اليوم
  d('m-209', 'football', 'c-sa-league', 't-najd', 't-dammam', 0, 11, 0, 1, 1),
  d('m-201', 'football', 'c-eg-league', 't-giza', 't-red', 0, 14, 0, 2, 2),
  d('m-202', 'football', 'c-sa-league', 't-jeddah', 't-dammam', 0, 16, 30, 1, 3),
  d('m-206', 'tennis', 'c-tn-open', 't-tn-3', 't-tn-4', 0, 17, 0, 1, 2),
  d('m-203', 'basketball', 'c-bb-series', 't-bb-alex', 't-bb-riyadh', 0, 18, 0, 79, 84),
  d('m-204', 'volleyball', 'c-vb-cup', 't-vb-portsaid', 't-vb-qassim', 0, 19, 0, 3, 1),
  d('m-205', 'football', 'c-arab-cup', 't-nile', 't-riyadh', 0, 20, 30, 3, 2, { featured: true }),
  d('m-207', 'handball', 'c-hb-cup', 't-hb-mansoura', 't-hb-abha', 0, 21, 0, 31, 30),
  d('m-208', 'football', 'c-eg-league', 't-delta', 't-red', 0, 22, 30, 1, 0),

  // غدًا
  d('m-301', 'football', 'c-eg-league', 't-delta', 't-giza', 1, 18, 0, 0, 0, { featured: true }),
  d('m-305', 'swimming', 'c-sw-meet', 't-sw-alex', 't-sw-dammam', 1, 16, 0, 61, 57),
  d('m-306', 'athletics', 'c-at-meet', 't-at-eg', 't-at-sa', 1, 17, 30, 54, 48),
  d('m-303', 'football', 'c-eg-league', 't-red', 't-nile', 1, 19, 0, 0, 0, { postponed: true }),
  d('m-307', 'volleyball', 'c-vb-cup', 't-vb-tanta', 't-vb-hail', 1, 19, 30, 3, 0),
  d('m-302', 'football', 'c-sa-league', 't-najd', 't-jeddah', 1, 20, 0, 0, 0),
  d('m-308', 'basketball', 'c-bb-series', 't-bb-cairo', 't-bb-riyadh', 1, 21, 0, 0, 0),
  d('m-304', 'boxing', 'c-bx-night', 't-bx-1', 't-bx-2', 1, 23, 0, 2, 1),

  // بعد غد
  d('m-402', 'handball', 'c-hb-cup', 't-hb-tabuk', 't-hb-suez', 2, 18, 0, 0, 0),
  d('m-401', 'football', 'c-arab-cup', 't-giza', 't-najd', 2, 20, 0, 0, 0, { featured: true }),
];

export function getMatchDef(id: string): MatchDef | undefined {
  return MATCH_DEFS.find((m) => m.id === id);
}
