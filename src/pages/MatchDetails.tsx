import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, RectangleVertical, Repeat, Goal } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getMatchDetails } from '../services/sportsApi';
import { formatDateLong, formatTime } from '../utils/format';
import type { Lineup, MatchDetails as Details, MatchEvent } from '../types';
import TeamBadge from '../components/TeamBadge';
import StatusPill from '../components/StatusPill';
import FavoriteButton from '../components/FavoriteButton';
import ReminderButton from '../components/ReminderButton';
import ShareButton from '../components/ShareButton';
import Tabs from '../components/Tabs';
import { Async } from '../components/Async';
import { DemoNotice } from '../components/DemoBadge';
import { EmptyState } from '../components/StateViews';
import NotFound from './NotFound';

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  if (type === 'goal') return <Goal size={16} aria-hidden="true" />;
  if (type === 'sub') return <Repeat size={16} aria-hidden="true" />;
  return <RectangleVertical size={16} className={type === 'red' ? 'card-red' : 'card-yellow'} aria-hidden="true" />;
}

function Body({ d }: { d: Details }) {
  const { t, tr, lang } = useLang();
  const m = d.match;
  const [tab, setTab] = useState('stats');
  const started = m.status === 'live' || m.status === 'halftime' || m.status === 'finished';
  const hasScore = m.homeScore !== null && m.awayScore !== null;

  const tabs = [
    { id: 'stats', label: t('match.tab.stats') },
    { id: 'events', label: t('match.tab.events') },
    { id: 'lineups', label: t('match.tab.lineups') },
  ];

  const renderLineup = (l: Lineup, name: string) => (
    <div className="lineup">
      <h3>
        {name} <span className="muted small">{l.formation}</span>
      </h3>
      <ol>
        {l.players.map((p) => (
          <li key={p.number}>
            <span className="num">{p.number}</span>
            <span>{tr(p.name)}</span>
            <span className="muted small">{p.pos}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <>
      <section className="scoreboard">
        <div className="scoreboard-comp muted">
          {tr(m.competition.name)} · {formatDateLong(m.kickoff, lang)}
        </div>
        <div className="scoreboard-main">
          <Link to={`/teams/${m.home.id}`} className="sb-team">
            <TeamBadge team={m.home} size={72} />
            <strong>{tr(m.home.name)}</strong>
          </Link>
          <div className="sb-center">
            {hasScore ? (
              <span className="sb-score" dir="ltr">
                {m.homeScore} : {m.awayScore}
              </span>
            ) : (
              <span className="sb-score sb-time">{m.status === 'postponed' ? '—' : formatTime(m.kickoff, lang)}</span>
            )}
            <StatusPill status={m.status} clock={m.clock} />
          </div>
          <Link to={`/teams/${m.away.id}`} className="sb-team">
            <TeamBadge team={m.away} size={72} />
            <strong>{tr(m.away.name)}</strong>
          </Link>
        </div>
        <div className="scoreboard-foot">
          <span className="muted small">
            <MapPin size={14} aria-hidden="true" /> {tr(m.venue)}
          </span>
          <div className="row gap">
            <ReminderButton match={m} withLabel />
            <FavoriteButton kind="matches" id={m.id} withLabel />
            <ShareButton title={`${tr(m.home.name)} - ${tr(m.away.name)}`} />
          </div>
        </div>
      </section>

      {!started ? (
        <EmptyState
          title={m.status === 'postponed' ? t('match.postponed.title') : t('match.notstarted.title')}
          text={m.status === 'postponed' ? t('match.postponed.text') : t('match.notstarted.text')}
        />
      ) : (
        <>
          <Tabs tabs={tabs} active={tab} onChange={setTab} ariaLabel={t('match.tabs')} />
          <div className="tab-panel">
            {tab === 'stats' &&
              (d.stats.length ? (
                <div className="stats">
                  {d.stats.map((s) => {
                    const total = s.home + s.away || 1;
                    return (
                      <div key={s.key} className="stat-row">
                        <div className="stat-head">
                          <b dir="ltr">
                            {s.home}
                            {s.percent ? '%' : ''}
                          </b>
                          <span>{tr(s.label)}</span>
                          <b dir="ltr">
                            {s.away}
                            {s.percent ? '%' : ''}
                          </b>
                        </div>
                        <div className="stat-bar" dir="ltr" aria-hidden="true">
                          <span style={{ width: `${(s.home / total) * 100}%`, background: m.home.color }} />
                          <span style={{ width: `${(s.away / total) * 100}%`, background: m.away.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title={t('match.nodata.title')} text={t('match.nodata.text')} />
              ))}

            {tab === 'events' &&
              (d.events === null ? (
                <EmptyState title={t('match.nodata.title')} text={t('match.events.unavailable')} />
              ) : d.events.length === 0 ? (
                <EmptyState title={t('match.events.none')} text={t('match.nodata.text')} />
              ) : (
                <ul className="timeline">
                  {d.events.map((e, i) => (
                    <li key={i} className={`tl-${e.side}`}>
                      <span className="tl-min" dir="ltr">
                        {e.minute}'
                      </span>
                      <EventIcon type={e.type} />
                      <span>{tr(e.player)}</span>
                      <span className="muted small">{t(`event.${e.type}`)}</span>
                    </li>
                  ))}
                </ul>
              ))}

            {tab === 'lineups' &&
              (d.lineups ? (
                <div className="lineups">
                  {renderLineup(d.lineups.home, tr(m.home.name))}
                  {renderLineup(d.lineups.away, tr(m.away.name))}
                </div>
              ) : (
                <EmptyState title={t('match.nodata.title')} text={t('match.lineups.unavailable')} />
              ))}
          </div>
        </>
      )}
    </>
  );
}

export default function MatchDetails() {
  const { id = '' } = useParams();
  const { t, tr } = useLang();
  const state = useAsync(() => getMatchDetails(id), [id]);
  const title = state.data?.data ? `${tr(state.data.data.match.home.name)} - ${tr(state.data.data.match.away.name)}` : t('nav.matches');
  useDocumentTitle(title);

  if (state.status === 'success' && state.data && state.data.data === null) return <NotFound what="match" />;

  return (
    <div className="container page-pad">
      <Link to="/matches" className="back-link">
        <ArrowLeft size={16} className="icon-dir" aria-hidden="true" /> {t('nav.matches')}
      </Link>
      <DemoNotice messageKey="demo.matches" />
      <Async state={state}>{(r) => (r.data ? <Body d={r.data} /> : null)}</Async>
    </div>
  );
}
