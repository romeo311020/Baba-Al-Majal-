import { Link, useParams } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getMatchesRange, getTeamsBySport } from '../services/sportsApi';
import { getNews } from '../services/newsApi';
import { SPORTS, getSport, isSportId } from '../data/sports';
import { addDays, toISODate } from '../utils/date';
import PageHeader from '../components/PageHeader';
import SectionHeader from '../components/SectionHeader';
import MatchCard from '../components/MatchCard';
import NewsCard from '../components/NewsCard';
import TeamBadge from '../components/TeamBadge';
import { Async } from '../components/Async';
import { SkeletonGrid } from '../components/StateViews';
import { DemoNotice } from '../components/DemoBadge';
import NotFound from './NotFound';

export default function SportPage() {
  const { sport: param = '' } = useParams();
  const { t, tr } = useLang();
  const sport = isSportId(param) ? getSport(param) : undefined;
  useDocumentTitle(sport ? tr(sport.name) : t('notfound.title'));

  const id = sport?.id;
  const matches = useAsync(
    () => (id ? getMatchesRange(toISODate(addDays(new Date(), -2)), toISODate(addDays(new Date(), 3)), { sport: id }) : Promise.resolve(null)),
    [id],
  );
  const news = useAsync(() => (id ? getNews({ sport: id }) : Promise.resolve(null)), [id]);
  const teams = useAsync(() => (id ? getTeamsBySport(id) : Promise.resolve(null)), [id]);

  if (!sport) return <NotFound what="sport" />;

  return (
    <>
      <PageHeader eyebrow={sport.emoji} title={tr(sport.name)} subtitle={tr(sport.description)} />
      <div className="container">
        <DemoNotice />

        <nav className="chips sport-switch" aria-label={t('menu.sports')}>
          {SPORTS.map((s) => (
            <Link key={s.id} to={`/sports/${s.id}`} className={`chip ${s.id === sport.id ? 'is-active' : ''}`} aria-current={s.id === sport.id ? 'page' : undefined}>
              <span aria-hidden="true">{s.emoji}</span> {tr(s.name)}
            </Link>
          ))}
        </nav>

        <section className="section">
          <SectionHeader title={t('sport.matches')} to={`/matches?sport=${sport.id}`} linkLabel={t('home.matches.all')} />
          <Async
            state={matches}
            isEmpty={(r) => !r || r.data.length === 0}
            emptyTitle={t('matches.empty.title')}
            emptyText={t('sport.matches.empty')}
            skeleton={<SkeletonGrid count={3} className="grid grid-matches" />}
          >
            {(r) => (
              <div className="grid grid-matches">
                {r?.data.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('sport.teams')} />
          <Async state={teams} isEmpty={(r) => !r || r.data.length === 0} skeleton={<SkeletonGrid count={4} className="grid grid-tiles" />}>
            {(r) => (
              <div className="grid grid-tiles tiles-teams">
                {r?.data.map((team) => (
                  <Link key={team.id} to={`/teams/${team.id}`} className="tile tile-team">
                    <TeamBadge team={team} size={48} />
                    <strong>{tr(team.name)}</strong>
                    <span className="muted small">{tr(team.country)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('sport.news')} to={`/news?sport=${sport.id}`} linkLabel={t('home.news.all')} />
          <Async
            state={news}
            isEmpty={(r) => !r || r.data.length === 0}
            emptyTitle={t('news.empty.title')}
            emptyText={t('sport.news.empty')}
            skeleton={<SkeletonGrid count={3} />}
          >
            {(r) => (
              <div className="grid grid-cards">
                {r?.data.slice(0, 3).map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            )}
          </Async>
        </section>
      </div>
    </>
  );
}
