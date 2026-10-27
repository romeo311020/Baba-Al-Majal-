import type { PlayerProfile } from '../types';

/** ⚠️ لاعبون خياليون لعرض شكل الصفحة فقط. أي تشابه مع أسماء حقيقية غير مقصود. */
export const PLAYERS: PlayerProfile[] = [
  {
    id: 'p-1',
    name: { ar: 'كريم نبيل', en: 'Karim Nabil' },
    teamId: 't-nile',
    sport: 'football',
    position: { ar: 'مهاجم', en: 'Forward' },
    number: 9,
    age: 27,
    nationality: { ar: 'مصر', en: 'Egypt' },
    bio: {
      ar: 'مهاجم تجريبي يُستخدم لعرض بطاقة اللاعب: الأرقام الأساسية ونبذة قصيرة.',
      en: 'A demo striker used to preview the player card: key numbers and a short bio.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 24 },
      { key: 'goals', label: { ar: 'أهداف', en: 'Goals' }, value: 14 },
      { key: 'assists', label: { ar: 'تمريرات حاسمة', en: 'Assists' }, value: 6 },
    ],
  },
  {
    id: 'p-2',
    name: { ar: 'زياد حجازي', en: 'Ziad Hegazy' },
    teamId: 't-delta',
    sport: 'football',
    position: { ar: 'وسط', en: 'Midfielder' },
    number: 8,
    age: 25,
    nationality: { ar: 'مصر', en: 'Egypt' },
    bio: {
      ar: 'لاعب وسط تجريبي. المعلومات للعرض فقط.',
      en: 'A demo midfielder. Information is for display only.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 26 },
      { key: 'goals', label: { ar: 'أهداف', en: 'Goals' }, value: 5 },
      { key: 'assists', label: { ar: 'تمريرات حاسمة', en: 'Assists' }, value: 11 },
    ],
  },
  {
    id: 'p-3',
    name: { ar: 'طارق رفعت', en: 'Tarek Refaat' },
    teamId: 't-giza',
    sport: 'football',
    position: { ar: 'حارس مرمى', en: 'Goalkeeper' },
    number: 1,
    age: 30,
    nationality: { ar: 'مصر', en: 'Egypt' },
    bio: {
      ar: 'حارس مرمى تجريبي.',
      en: 'A demo goalkeeper.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 28 },
      { key: 'clean', label: { ar: 'مباريات بلا أهداف', en: 'Clean sheets' }, value: 11 },
      { key: 'saves', label: { ar: 'تصديات', en: 'Saves' }, value: 74 },
    ],
  },
  {
    id: 'p-4',
    name: { ar: 'فيصل الدوسري', en: 'Faisal Al-Dosari' },
    teamId: 't-riyadh',
    sport: 'football',
    position: { ar: 'مهاجم', en: 'Forward' },
    number: 10,
    age: 28,
    nationality: { ar: 'السعودية', en: 'Saudi Arabia' },
    bio: {
      ar: 'مهاجم تجريبي من فريق العاصمة.',
      en: 'A demo forward from the capital-city side.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 25 },
      { key: 'goals', label: { ar: 'أهداف', en: 'Goals' }, value: 17 },
      { key: 'assists', label: { ar: 'تمريرات حاسمة', en: 'Assists' }, value: 4 },
    ],
  },
  {
    id: 'p-5',
    name: { ar: 'مازن الزهراني', en: 'Mazen Al-Zahrani' },
    teamId: 't-najd',
    sport: 'football',
    position: { ar: 'مدافع', en: 'Defender' },
    number: 4,
    age: 29,
    nationality: { ar: 'السعودية', en: 'Saudi Arabia' },
    bio: {
      ar: 'مدافع تجريبي.',
      en: 'A demo defender.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 27 },
      { key: 'goals', label: { ar: 'أهداف', en: 'Goals' }, value: 3 },
      { key: 'tackles', label: { ar: 'تدخلات ناجحة', en: 'Tackles won' }, value: 58 },
    ],
  },
  {
    id: 'p-6',
    name: { ar: 'باسل منصور', en: 'Basel Mansour' },
    teamId: 't-bb-cairo',
    sport: 'basketball',
    position: { ar: 'جارد', en: 'Guard' },
    number: 7,
    age: 26,
    nationality: { ar: 'مصر', en: 'Egypt' },
    bio: {
      ar: 'لاعب سلة تجريبي.',
      en: 'A demo basketball player.',
    },
    stats: [
      { key: 'ppg', label: { ar: 'نقاط/مباراة', en: 'Points per game' }, value: 18 },
      { key: 'rpg', label: { ar: 'متابعات/مباراة', en: 'Rebounds per game' }, value: 4 },
      { key: 'apg', label: { ar: 'تمريرات/مباراة', en: 'Assists per game' }, value: 7 },
    ],
  },
  {
    id: 'p-7',
    name: { ar: 'نايف الحربي', en: 'Nayef Al-Harbi' },
    teamId: 't-bb-jeddah',
    sport: 'basketball',
    position: { ar: 'فورورد', en: 'Forward' },
    number: 23,
    age: 28,
    nationality: { ar: 'السعودية', en: 'Saudi Arabia' },
    bio: {
      ar: 'لاعب سلة تجريبي.',
      en: 'A demo basketball player.',
    },
    stats: [
      { key: 'ppg', label: { ar: 'نقاط/مباراة', en: 'Points per game' }, value: 21 },
      { key: 'rpg', label: { ar: 'متابعات/مباراة', en: 'Rebounds per game' }, value: 8 },
      { key: 'apg', label: { ar: 'تمريرات/مباراة', en: 'Assists per game' }, value: 3 },
    ],
  },
  {
    id: 'p-8',
    name: { ar: 'رامي سعيد', en: 'Rami Saeed' },
    teamId: 't-hb-suez',
    sport: 'handball',
    position: { ar: 'جناح', en: 'Wing' },
    number: 11,
    age: 24,
    nationality: { ar: 'مصر', en: 'Egypt' },
    bio: {
      ar: 'لاعب يد تجريبي.',
      en: 'A demo handball player.',
    },
    stats: [
      { key: 'apps', label: { ar: 'مباريات', en: 'Appearances' }, value: 22 },
      { key: 'goals', label: { ar: 'أهداف', en: 'Goals' }, value: 96 },
      { key: 'assists', label: { ar: 'تمريرات حاسمة', en: 'Assists' }, value: 31 },
    ],
  },
];

export function getPlayerById(id: string): PlayerProfile | undefined {
  return PLAYERS.find((p) => p.id === id);
}
