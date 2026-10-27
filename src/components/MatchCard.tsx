import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Match } from '../types';
import { useLang } from '../context/LanguageContext';
import { getSport } from '../data/sports';
import { formatTime } from '../utils/format';
import TeamBadge from './TeamBadge';
import StatusPill from './StatusPill';
import FavoriteButton from './FavoriteButton';
import ReminderButton from './ReminderButton';

export default function MatchCard({ match }: { match: Match }) {
  const { t, tr, lang } = useLang();
  const live = match.status === 'live' || match.status === 'halftime';
  const hasScore = match.homeScore !== null && match.awayScore !== null;
  const sport = getSport(match.sport);
  const time = formatTime(match.kickoff, lang);

  return (
    <article className={`match-card ${live ? 'is-live' : ''}`}>
      <div className="match-top">
        <span className="match-comp">
          <span aria-hidden="true">{sport?.emoji}</span> {tr(match.competition.name)}
        </span>
        <StatusPill status={match.status} clock={match.clock} />
      </div>

      <Link
        to={`/matches/${match.id}`}
        className="match-body"
        aria-label={`${tr(match.home.name)} ${t('match.vs')} ${tr(match.away.name)}`}
      >
        <div className="match-team">
          <TeamBadge team={match.home} />
          <span className="match-team-name">{tr(match.home.name)}</span>
        </div>

        <div className="match-center">
          {hasScore ? (
            <span className="match-score" dir="ltr">
              <b>{match.homeScore}</b>
              <i>:</i>
              <b>{match.awayScore}</b>
            </span>
          ) : (
            <span className="match-time">{match.status === 'postponed' ? '—' : time}</span>
          )}
        </div>

        <div className="match-team">
          <TeamBadge team={match.away} />
          <span className="match-team-name">{tr(match.away.name)}</span>
        </div>
      </Link>

      <div className="match-foot">
        <span className="muted small">
          <Clock size={14} aria-hidden="true" /> {time}
        </span>
        <div className="match-actions">
          <ReminderButton match={match} />
          <FavoriteButton kind="matches" id={match.id} />
        </div>
      </div>
    </article>
  );
}
