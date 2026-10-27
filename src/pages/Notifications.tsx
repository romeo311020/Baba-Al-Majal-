import { Link } from 'react-router-dom';
import { Bell, BellRing, CheckCheck, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationsContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../context/ToastContext';
import { formatDateShort, formatTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import { EmptyState } from '../components/StateViews';

export default function Notifications() {
  const { t, tr, lang } = useLang();
  useDocumentTitle(t('nav.notifications'));
  const { show } = useToast();
  const { notifications, unreadCount, markAllRead, clearAll, prefs, setPrefs, browserPermission, requestBrowserPermission } = useNotifications();

  const enableBrowser = async () => {
    const p = await requestBrowserPermission();
    if (p === 'granted') show(t('notif.perm.granted'), 'success');
    else if (p === 'denied') show(t('notif.perm.denied'), 'error');
  };

  return (
    <>
      <PageHeader title={t('notif.title')} subtitle={t('notif.sub')} />
      <div className="container narrow-page">
        <section className="card">
          <h2>{t('notif.settings')}</h2>
          <label className="switch-row">
            <input type="checkbox" checked={prefs.matchReminders} onChange={(e) => setPrefs({ matchReminders: e.target.checked })} />
            <span>{t('notif.pref.matches')}</span>
          </label>
          <label className="switch-row">
            <input type="checkbox" checked={prefs.newsAlerts} onChange={(e) => setPrefs({ newsAlerts: e.target.checked })} />
            <span>
              {t('notif.pref.news')} <em className="muted small">({t('notif.pref.news.note')})</em>
            </span>
          </label>
          <label className="field">
            <span>{t('notif.lead')}</span>
            <select value={prefs.leadMinutes} onChange={(e) => setPrefs({ leadMinutes: Number(e.target.value) })}>
              {[5, 15, 30, 60].map((m) => (
                <option key={m} value={m}>
                  {t('notif.lead.option', { n: m })}
                </option>
              ))}
            </select>
          </label>

          <div className="browser-perm">
            {browserPermission === 'unsupported' && <p className="muted small">{t('notif.perm.unsupported')}</p>}
            {browserPermission === 'granted' && <p className="muted small">{t('notif.perm.granted')}</p>}
            {browserPermission === 'denied' && <p className="muted small">{t('notif.perm.blocked')}</p>}
            {browserPermission === 'default' && (
              <button type="button" className="btn btn-secondary" onClick={enableBrowser}>
                <Bell size={16} aria-hidden="true" /> {t('notif.perm.enable')}
              </button>
            )}
            <p className="muted small">{t('notif.limit')}</p>
          </div>
        </section>

        <section className="card">
          <div className="row between wrap">
            <h2>
              {t('notif.inbox')} {unreadCount > 0 && <span className="tab-count">{unreadCount}</span>}
            </h2>
            <div className="row gap">
              <button type="button" className="btn btn-ghost" onClick={markAllRead} disabled={unreadCount === 0}>
                <CheckCheck size={16} aria-hidden="true" /> {t('notif.markRead')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={clearAll} disabled={notifications.length === 0}>
                <Trash2 size={16} aria-hidden="true" /> {t('notif.clear')}
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <EmptyState title={t('notif.empty.title')} text={t('notif.empty.text')} action={<Link to="/matches" className="btn btn-primary">{t('nav.matches')}</Link>} />
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => (
                <li key={n.id} className={n.read ? '' : 'is-unread'}>
                  <span className="notif-icon" aria-hidden="true">
                    {n.type === 'reminder' ? <BellRing size={18} /> : <SettingsIcon size={18} />}
                  </span>
                  <div>
                    {n.type === 'reminder' && n.home && n.away ? (
                      <>
                        <strong>{t('notif.reminder.title')}</strong>
                        <p>
                          {n.matchId ? (
                            <Link to={`/matches/${n.matchId}`}>{t('notif.reminder.text', { home: tr(n.home), away: tr(n.away) })}</Link>
                          ) : (
                            t('notif.reminder.text', { home: tr(n.home), away: tr(n.away) })
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <strong>{t('notif.welcome.title')}</strong>
                        <p>{t('notif.welcome.text')}</p>
                      </>
                    )}
                    <span className="muted small">
                      {formatDateShort(n.createdAt, lang)} · {formatTime(n.createdAt, lang)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
