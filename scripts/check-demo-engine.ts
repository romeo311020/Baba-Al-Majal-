// فحص منطق البيانات التجريبية (بدون React): npm run check:engine
import { allMatches, buildDetails } from '../src/services/demo/engine';
import { MATCH_DEFS } from '../src/data/matches';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error('✗', msg);
  }
}

// نختبر عدة أوقات من اليوم لنتأكد من اتساق الحالات والنتائج
const base = new Date();
base.setHours(0, 0, 0, 0);
const hours = [0, 6, 11, 12, 15, 17, 19, 20, 21, 22, 23];

for (const h of hours) {
  const now = new Date(base);
  now.setHours(h, 20, 0, 0);
  const ms = allMatches(now);
  assert(ms.length === MATCH_DEFS.length, `count at ${h}h`);

  for (const m of ms) {
    if (m.status === 'scheduled' || m.status === 'postponed') {
      assert(m.homeScore === null && m.awayScore === null, `${m.id}@${h}: scheduled has no score`);
    } else {
      assert(m.homeScore !== null && m.awayScore !== null, `${m.id}@${h}: started has score`);
    }
    const def = MATCH_DEFS.find((d) => d.id === m.id)!;
    if (m.status === 'finished') {
      assert(m.homeScore === def.finalHome && m.awayScore === def.finalAway, `${m.id}@${h}: final score`);
    }
    const det = buildDetails(def, now);
    if (m.sport === 'football' && det.events && (m.status === 'finished' || m.status === 'live' || m.status === 'halftime')) {
      const goalsHome = det.events.filter((e) => e.type === 'goal' && e.side === 'home').length;
      const goalsAway = det.events.filter((e) => e.type === 'goal' && e.side === 'away').length;
      assert(goalsHome === m.homeScore && goalsAway === m.awayScore, `${m.id}@${h}: goals events match score`);
      assert(det.lineups !== null && det.lineups.home.players.length === 11, `${m.id}@${h}: lineup`);
      const sot = det.stats.find((s) => s.key === 'sot');
      const shots = det.stats.find((s) => s.key === 'shots');
      assert(!!sot && !!shots && shots.home >= sot.home && shots.away >= sot.away, `${m.id}@${h}: shots >= on target`);
    }
    if (m.sport !== 'football') {
      assert(det.events === null && det.lineups === null, `${m.id}: non-football has no events/lineups`);
    }
  }
}

// تأكد من وجود أيام أمس/اليوم/غدًا
const noon = new Date(base);
noon.setHours(12, 0, 0, 0);
const offsets = new Set(MATCH_DEFS.map((d) => d.dayOffset));
assert(offsets.has(-1) && offsets.has(0) && offsets.has(1), 'yesterday/today/tomorrow exist');

// عرض لقطة
const snap = new Date(base);
snap.setHours(20, 50, 0, 0);
console.log(`لقطة عند ${snap.toLocaleTimeString()}:`);
for (const m of allMatches(snap).filter((x) => x.kickoff.slice(0, 10) === snap.toISOString().slice(0, 10) || true).slice(0, 40)) {
  if (new Date(m.kickoff).toDateString() === snap.toDateString()) {
    console.log(`  ${m.id} ${m.home.name.en} ${m.homeScore ?? '-'}:${m.awayScore ?? '-'} ${m.away.name.en}  [${m.status}] ${m.clock ?? ''}`);
  }
}

if (failures) {
  console.error(`\n${failures} فشل`);
  process.exit(1);
}
console.log('\n✔ كل فحوصات المحرك التجريبي نجحت');
