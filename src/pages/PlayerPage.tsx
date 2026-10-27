import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPlayer } from '../services/sportsApi';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import TeamBadge from '../components/TeamBadge';
import { Async } from '../components/Async';
import { DemoNotice } from '../components/DemoBadge';
import NotFound from './NotFound';

export default function PlayerPage() {
  const { id = '' } = useParams();
  const { t, tr } = useLang();
  const state = useAsync(() => getPlayer(id), [id]);
  const p = state.data?.data?.player;
  useDocumentTitle(p ? tr(p.name) : t('nav.matches'));

  if (state.status === 'success' && state.data && state.data.data === null) return <NotFound what="player" />;

  return (
    <div className="container page-pad">
      <Link to="/matches" className="back-link">
        <ArrowLeft size={16} className="icon-dir" aria-hidden="true" /> {t('nav.matches')}
      </Link>
      <DemoNotice />
      <Async state={state}>
        {(r) => {
          if (!r.data) return null;
          const { player, team } = r.data;
          return (
            <>
              <section className="profile-hero">
                <span className="num-badge num-badge-lg" aria-hidden="true">
                  {player.number}
                </span>
                <div className="profile-hero-text">
                  <h1>{tr(player.name)}</h1>
                  <p className="muted">
                    {tr(player.position)} · {tr(player.nationality)} · {t('player.age', { n: player.age })}
                  </p>
                  {team && (
                    <Link to={`/teams/${team.id}`} className="row gap team-link">
                      <TeamBadge team={team} size={30} />
                      <span>{tr(team.name)}</span>
                    </Link>
                  )}
                </div>
                <div className="row gap">
                  <FavoriteButton kind="players" id={player.id} withLabel />
                  <ShareButton title={tr(player.name)} />
                </div>
              </section>

              <p className="lead narrow">{tr(player.bio)}</p>

              <section className="section">
                <h2>{t('player.stats')}</h2>
                <div className="grid grid-stats">
                  {player.stats.map((s) => (
                    <div key={s.key} className="stat-card">
                      <strong dir="ltr">{s.value}</strong>
                      <span className="muted">{tr(s.label)}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          );
        }}
      </Async>
    </div>
  );
}
