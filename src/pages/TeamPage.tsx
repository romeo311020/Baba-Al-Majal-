import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getTeam } from '../services/sportsApi';
import { getSport } from '../data/sports';
import TeamBadge from '../components/TeamBadge';
import MatchCard from '../components/MatchCard';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import SectionHeader from '../components/SectionHeader';
import { Async } from '../components/Async';
import { DemoNotice } from '../components/DemoBadge';
import NotFound from './NotFound';

export default function TeamPage() {
  const { id = '' } = useParams();
  const { t, tr } = useLang();
  const state = useAsync(() => getTeam(id), [id]);
  const team = state.data?.data?.team;
  useDocumentTitle(team ? tr(team.name) : t('nav.matches'));

  if (state.status === 'success' && state.data && state.data.data === null) return <NotFound what="team" />;

  return (
    <div className="container page-pad">
      <Link to="/matches" className="back-link">
        <ArrowLeft size={16} className="icon-dir" aria-hidden="true" /> {t('nav.matches')}
      </Link>
      <DemoNotice />
      <Async state={state}>
        {(r) => {
          if (!r.data) return null;
          const { team: tm, matches, players } = r.data;
          const sport = getSport(tm.sport);
          return (
            <>
              <section className="profile-hero">
                <TeamBadge team={tm} size={96} />
                <div className="profile-hero-text">
                  <h1>{tr(tm.name)}</h1>
                  <p className="muted">
                    {sport?.emoji} {sport ? tr(sport.name) : ''} · {tr(tm.country)}
                  </p>
                  <div className="meta-row">
                    <span>
                      <Calendar size={14} aria-hidden="true" /> {t('team.founded')}: {tm.founded}
                    </span>
                    {tm.home && (
                      <span>
                        <MapPin size={14} aria-hidden="true" /> {tr(tm.home)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="row gap">
                  <FavoriteButton kind="teams" id={tm.id} withLabel />
                  <ShareButton title={tr(tm.name)} />
                </div>
              </section>

              <p className="lead narrow">{tr(tm.about)}</p>

              <section className="section">
                <SectionHeader title={t('team.matches')} />
                {matches.length ? (
                  <div className="grid grid-matches">
                    {matches.map((m) => (
                      <MatchCard key={m.id} match={m} />
                    ))}
                  </div>
                ) : (
                  <p className="muted">{t('team.matches.empty')}</p>
                )}
              </section>

              <section className="section">
                <SectionHeader title={t('team.players')} />
                {players.length ? (
                  <div className="grid grid-tiles">
                    {players.map((p) => (
                      <Link key={p.id} to={`/players/${p.id}`} className="tile">
                        <span className="num-badge" aria-hidden="true">
                          {p.number}
                        </span>
                        <strong>{tr(p.name)}</strong>
                        <span className="muted small">{tr(p.position)}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="muted">{t('team.players.empty')}</p>
                )}
              </section>
            </>
          );
        }}
      </Async>
    </div>
  );
}
