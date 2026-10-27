import { useMemo } from 'react';
import type { Match } from '../types';
import { useLang } from '../context/LanguageContext';
import MatchCard from './MatchCard';

/** مباريات مجمّعة حسب البطولة (يحافظ على ترتيب أول موعد لكل بطولة) */
export default function MatchList({ matches, grouped = true }: { matches: Match[]; grouped?: boolean }) {
  const { tr } = useLang();

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; items: Match[] }>();
    for (const m of matches) {
      const g = map.get(m.competition.id);
      if (g) g.items.push(m);
      else map.set(m.competition.id, { name: m.competition.name.ar + '|' + m.competition.name.en, items: [m] });
    }
    return Array.from(map, ([id, g]) => ({ id, items: g.items, comp: g.items[0].competition }));
  }, [matches]);

  if (!grouped) {
    return (
      <div className="grid grid-matches">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    );
  }

  return (
    <div className="match-groups">
      {groups.map((g) => (
        <section key={g.id} className="match-group" aria-label={tr(g.comp.name)}>
          <h3 className="group-title">
            {tr(g.comp.name)} <span className="muted small">· {tr(g.comp.country)}</span>
          </h3>
          <div className="grid grid-matches">
            {g.items.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
