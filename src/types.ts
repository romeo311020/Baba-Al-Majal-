export type Lang = 'ar' | 'en';
export type ThemeMode = 'dark' | 'light';

/** نص ثنائي اللغة */
export interface Bi {
  ar: string;
  en: string;
}

export type SportId =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'handball'
  | 'volleyball'
  | 'athletics'
  | 'swimming'
  | 'boxing';

export interface Sport {
  id: SportId;
  emoji: string;
  name: Bi;
  description: Bi;
  accent: string;
}

export interface Competition {
  id: string;
  sport: SportId;
  name: Bi;
  country: Bi;
  countryCode: string;
}

export interface Team {
  id: string;
  sport: SportId;
  name: Bi;
  short: string;
  country: Bi;
  countryCode: string;
  color: string;
  founded: number;
  home?: Bi;
  about: Bi;
}

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed';

/** تعريف خام للمباراة التجريبية (قبل الحساب مقابل الوقت الحالي) */
export interface MatchDef {
  id: string;
  sport: SportId;
  competitionId: string;
  homeId: string;
  awayId: string;
  dayOffset: number;
  hour: number;
  minute: number;
  finalHome: number;
  finalAway: number;
  venue: Bi;
  postponed?: boolean;
  featured?: boolean;
}

export interface Match {
  id: string;
  sport: SportId;
  competition: Competition;
  home: Team;
  away: Team;
  /** ISO — يُعرض بتوقيت جهاز المستخدم */
  kickoff: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  clock?: string;
  venue: Bi;
  featured?: boolean;
}

export interface MatchStat {
  key: string;
  label: Bi;
  home: number;
  away: number;
  percent?: boolean;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'sub';
  side: 'home' | 'away';
  player: Bi;
}

export interface LineupPlayer {
  number: number;
  name: Bi;
  pos: 'GK' | 'DF' | 'MF' | 'FW';
}

export interface Lineup {
  formation: string;
  players: LineupPlayer[];
}

export interface MatchDetails {
  match: Match;
  stats: MatchStat[];
  /** null = غير متوفرة لهذه الرياضة في المصدر الحالي */
  events: MatchEvent[] | null;
  lineups: { home: Lineup; away: Lineup } | null;
}

export interface PlayerProfile {
  id: string;
  name: Bi;
  teamId: string;
  sport: SportId;
  position: Bi;
  number: number;
  age: number;
  nationality: Bi;
  bio: Bi;
  stats: { key: string; label: Bi; value: number }[];
}

export interface NewsArticle {
  id: string;
  sport: SportId;
  title: Bi;
  summary: Bi;
  body: Bi[];
  /** عدد الأيام قبل اليوم (0 = اليوم) */
  daysAgo: number;
  hour: number;
  source: string;
  views: number;
  teamIds?: string[];
}

export type ProductCategory =
  | 'apparel'
  | 'jerseys'
  | 'shoes'
  | 'balls'
  | 'training'
  | 'bags'
  | 'equipment';

export interface Vendor {
  id: string;
  name: string;
  /** وسم العمولة لاحقًا — يُلحق برابط الشراء */
  affiliateTag?: string;
}

export interface Product {
  id: string;
  name: Bi;
  brand: string;
  category: ProductCategory;
  sport: SportId | 'multi';
  price: number;
  currency: 'USD';
  description: Bi;
  features: Bi[];
  vendorId: string;
  /** null = لا يوجد رابط شراء (منتج تجريبي) */
  buyUrl: string | null;
}

/** كل استجابة تحمل علامة التجريب كي تعرضها الواجهة بوضوح */
export interface Result<T> {
  data: T;
  isDemo: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  favoriteSports: SportId[];
  createdAt: string;
}
