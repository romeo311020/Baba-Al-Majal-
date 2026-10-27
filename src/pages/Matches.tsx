import { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUrlState } from '../hooks/useUrlState';
import { getCompetitions, getCountries, getMatches } from '../services/sportsApi';
import { isSportId } from '../data/sports';
import { parseISODate, toISODate } from '../utils/date';
import { formatDateLong } from '../utils/format';
import type { SportId } from '../types';
import PageHeader from '../components/PageHeader';
import DayTabs from '../components/DayTabs';
import SportChips from '../components/SportChips';
import MatchList from '../components/MatchList';
import { Async } from '../components/Async';
import { SkeletonGrid } from '../components/StateViews';
import { DemoNotice } from '../components/DemoBadge';

export default function Matches() {
  const { t, tr, lang } = useLang();
  useDocumentTitle(t('nav.matches'));
  const url = useUrlState();

  const today = toISODate(new Date());
  const rawDate = url.get('date', today);
  const date = parseISODate(rawDate) ? rawDate : today;
  const rawSport = url.get('sport', 'all');
  const sport: SportId | 'all' = isSportId(rawSport) ? rawSport : 'all';
  const comp = url.get('comp');
  const country = url.get('country');
  const q = url.get('q');
  const [qInput, setQInput] = useState(q);

  const state = useAsync(
    () =>
      getMatches({
        date,
        sport,
        competitionId: comp || undefined,
        country: country || undefined,
        q: q || undefined,
      }),
    [date, sport, comp, country, q],
  );

  const competitions = getCompetitions(sport);
  const countries = getCountries();
  const hasFilters = sport !== 'all' || !!comp || !!country || !!q || date !== today;
  const day = parseISODate(date) ?? new Date();

  const reset = () => {
    setQInput('');
    url.set({ date: null, sport: null, comp: null, country: null, q: null });
  };

  return (
    <>
      <PageHeader title={t('matches.title')} subtitle={t('matches.sub')} />
      <div className="container">
        <DemoNotice messageKey="demo.matches" />

        <div className="filters-panel">
          <DayTabs value={date} onChange={(iso) => url.set({ date: iso === today ? null : iso })} />

          <SportChips
            value={sport}
            onChange={(s) => url.set({ sport: s, comp: null })}
          />

          <div className="filters-row">
            <label className="field">
              <span>{t('filters.competition')}</span>
              <select value={comp} onChange={(e) => url.set({ comp: e.target.value })}>
                <option value="">{t('filters.all')}</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {tr(c.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('filters.country')}</span>
              <select value={country} onChange={(e) => url.set({ country: e.target.value })}>
                <option value="">{t('filters.all')}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {tr(c.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-grow">
              <span>{t('filters.search')}</span>
              <span className="input-icon">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={qInput}
                  placeholder={t('search.in.matches')}
                  onChange={(e) => {
                    setQInput(e.target.value);
                    url.set({ q: e.target.value.trim() });
                  }}
                />
              </span>
            </label>

            {hasFilters && (
              <button type="button" className="btn btn-ghost" onClick={reset}>
                <RotateCcw size={16} aria-hidden="true" />
                {t('filters.reset')}
              </button>
            )}
          </div>
        </div>

        <p className="results-line muted">
          {formatDateLong(day, lang)}
          {state.data ? ` · ${t('matches.count', { n: state.data.data.length })}` : ''}
        </p>

        <Async
          state={state}
          isEmpty={(r) => r.data.length === 0}
          emptyTitle={t('matches.empty.title')}
          emptyText={t('matches.empty.text')}
          skeleton={<SkeletonGrid count={6} className="grid grid-matches" />}
        >
          {(r) => <MatchList matches={r.data} />}
        </Async>
      </div>
    </>
  );
}
