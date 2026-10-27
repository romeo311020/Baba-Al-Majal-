import type { MatchStatus } from '../types';
import { useLang } from '../context/LanguageContext';

export default function StatusPill({ status, clock }: { status: MatchStatus; clock?: string }) {
  const { t } = useLang();
  const live = status === 'live';
  return (
    <span className={`pill pill-${status}`}>
      {live && <span className="live-dot" aria-hidden="true" />}
      {t(`status.${status}`)}
      {live && clock ? ` · ${clock}` : ''}
    </span>
  );
}
