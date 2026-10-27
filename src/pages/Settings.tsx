import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Lang, ThemeMode } from '../types';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const { t, lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { clearAll } = useFavorites();
  const { show } = useToast();
  useDocumentTitle(t('nav.settings'));

  const wipeLocal = () => {
    if (!window.confirm(t('settings.wipe.confirm'))) return;
    try {
      const keep = ['yr_lang', 'yr_theme'];
      Object.keys(localStorage)
        .filter((k) => k.startsWith('yr_') && !keep.includes(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    clearAll();
    show(t('settings.wipe.done'), 'success');
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <>
      <PageHeader title={t('settings.title')} subtitle={t('settings.sub')} />
      <div className="container narrow-page">
        <section className="card">
          <h2>{t('settings.language')}</h2>
          <div className="segmented" role="radiogroup" aria-label={t('settings.language')}>
            {(['ar', 'en'] as Lang[]).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={lang === l} className={lang === l ? 'is-active' : ''} onClick={() => setLang(l)}>
                {l === 'ar' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
          <p className="muted small">{t('settings.language.hint')}</p>
        </section>

        <section className="card">
          <h2>{t('settings.theme')}</h2>
          <div className="segmented" role="radiogroup" aria-label={t('settings.theme')}>
            {(['dark', 'light'] as ThemeMode[]).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={theme === m} className={theme === m ? 'is-active' : ''} onClick={() => setTheme(m)}>
                {t(`settings.theme.${m}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>{t('settings.account')}</h2>
          {user ? (
            <p>
              {user.name} · <span dir="ltr">{user.email}</span> — <Link to="/profile">{t('nav.profile')}</Link>
            </p>
          ) : (
            <p>
              {t('settings.account.guest')} <Link to="/login">{t('nav.login')}</Link>
            </p>
          )}
          <p>
            <Link to="/notifications">{t('settings.notifications')}</Link>
          </p>
        </section>

        <section className="card">
          <h2>{t('settings.data')}</h2>
          <p className="muted small">{t('settings.data.hint')}</p>
          <button type="button" className="btn btn-ghost danger" onClick={wipeLocal}>
            {t('settings.wipe')}
          </button>
        </section>
      </div>
    </>
  );
}
