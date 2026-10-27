import { Bell, BellRing } from 'lucide-react';
import type { Match } from '../types';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationsContext';
import { useToast } from '../context/ToastContext';

interface Props {
  match: Match;
  withLabel?: boolean;
}

/** تذكير قبل بداية المباراة — يظهر فقط للمباريات التي لم تبدأ */
export default function ReminderButton({ match, withLabel = false }: Props) {
  const { t } = useLang();
  const { hasReminder, toggleReminder, prefs } = useNotifications();
  const { show } = useToast();
  if (match.status !== 'scheduled') return null;

  const active = hasReminder(match.id);
  const label = active ? t('reminder.off') : t('reminder.on', { min: prefs.leadMinutes });

  return (
    <button
      type="button"
      className={`icon-btn reminder-btn ${active ? 'is-active' : ''} ${withLabel ? 'with-label' : ''}`}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => {
        const on = toggleReminder(match);
        show(on ? t('reminder.set', { min: prefs.leadMinutes }) : t('reminder.cleared'), 'success');
      }}
    >
      {active ? <BellRing size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
      {withLabel && <span>{label}</span>}
    </button>
  );
}
