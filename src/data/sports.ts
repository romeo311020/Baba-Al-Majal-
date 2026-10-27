import type { Sport, SportId } from '../types';

export const SPORTS: Sport[] = [
  {
    id: 'football',
    emoji: '⚽',
    name: { ar: 'كرة القدم', en: 'Football' },
    description: {
      ar: 'اللعبة الأكثر شعبية في الوطن العربي: دوريات وكؤوس ومنتخبات.',
      en: 'The most popular game in the Arab world: leagues, cups and national teams.',
    },
    accent: '#2f7bff',
  },
  {
    id: 'basketball',
    emoji: '🏀',
    name: { ar: 'كرة السلة', en: 'Basketball' },
    description: {
      ar: 'سرعة وإيقاع عالٍ ونتائج تتغير في كل ربع.',
      en: 'High tempo, fast swings and a result that can change every quarter.',
    },
    accent: '#ff8a3d',
  },
  {
    id: 'tennis',
    emoji: '🎾',
    name: { ar: 'التنس', en: 'Tennis' },
    description: {
      ar: 'منافسات فردية ومجموعات حاسمة على مختلف الملاعب.',
      en: 'Individual duels and decisive sets across different surfaces.',
    },
    accent: '#b6e03a',
  },
  {
    id: 'handball',
    emoji: '🤾',
    name: { ar: 'كرة اليد', en: 'Handball' },
    description: {
      ar: 'قوة بدنية وتسجيل متواصل ومواجهات حماسية.',
      en: 'Physical power, constant scoring and intense matchups.',
    },
    accent: '#22d3ee',
  },
  {
    id: 'volleyball',
    emoji: '🏐',
    name: { ar: 'الكرة الطائرة', en: 'Volleyball' },
    description: {
      ar: 'تنسيق جماعي وضربات ساحقة ومجموعات متقاربة.',
      en: 'Team coordination, powerful spikes and tight sets.',
    },
    accent: '#f5b942',
  },
  {
    id: 'athletics',
    emoji: '🏃',
    name: { ar: 'ألعاب القوى', en: 'Athletics' },
    description: {
      ar: 'جري وقفز ورمي: أرقام وأزمنة تُكسر.',
      en: 'Running, jumping and throwing: times and distances that get broken.',
    },
    accent: '#ff5d6c',
  },
  {
    id: 'swimming',
    emoji: '🏊',
    name: { ar: 'السباحة', en: 'Swimming' },
    description: {
      ar: 'سباقات الأحواض والمتتابعات وأجزاء الثانية.',
      en: 'Pool races, relays and fractions of a second.',
    },
    accent: '#38bdf8',
  },
  {
    id: 'boxing',
    emoji: '🥊',
    name: { ar: 'الملاكمة', en: 'Boxing' },
    description: {
      ar: 'نزالات ونقاط وجولات حاسمة.',
      en: 'Fights, scorecards and decisive rounds.',
    },
    accent: '#7c5cff',
  },
];

export const SPORT_IDS = SPORTS.map((s) => s.id) as SportId[];

export function getSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}

export function isSportId(id: string): id is SportId {
  return SPORTS.some((s) => s.id === id);
}
