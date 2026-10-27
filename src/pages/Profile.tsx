import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SPORTS } from '../data/sports';
import { formatDateShort } from '../utils/format';
import type { SportId } from '../types';
import PageHeader from '../components/PageHeader';
import DemoAuthNotice from '../components/DemoAuthNotice';

export default function Profile() {
  const { t, tr, lang } = useLang();
  const { user, signOut, updateProfile } = useAuth();
  const { favorites } = useFavorites();
  const { show } = useToast();
  const navigate = useNavigate();
  useDocumentTitle(t('nav.profile'));

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  const toggleSport = async (id: SportId) => {
    const has = user.favoriteSports.includes(id);
    const next = has ? user.favoriteSports.filter((s) => s !== id) : [...user.favoriteSports, id];
    try {
      await updateProfile({ favoriteSports: next });
    } catch {
      show(t('state.error.title'), 'error');
    }
  };

  const saveName = async () => {
    if (!name.trim() || name.trim() === user.name) return;
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      show(t('profile.saved'), 'success');
    } catch {
      show(t('state.error.title'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const out = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const favTotal = Object.values(favorites).reduce((n, a) => n + a.length, 0);

  return (
    <>
      <PageHeader title={t('profile.title')} subtitle={t('profile.sub')} />
      <div className="container narrow-page">
        <DemoAuthNotice />

        <section className="card">
          <div className="row gap profile-id">
            <span className="avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <p className="muted small" dir="ltr">
                {user.email}
              </p>
              <p className="muted small">
                {t('profile.since')}: {formatDateShort(user.createdAt, lang)}
              </p>
            </div>
          </div>

          <div className="row gap wrap end">
            <label className="field field-grow">
              <span>{t('auth.name')}</span>
              <input type="text" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            </label>
            <button type="button" className="btn btn-secondary" onClick={saveName} disabled={saving || !name.trim() || name.trim() === user.name}>
              {t('profile.save')}
            </button>
          </div>
        </section>

        <section className="card">
          <h2>{t('profile.sports')}</h2>
          <p className="muted small">{t('profile.sports.hint')}</p>
          <div className="chips">
            {SPORTS.map((s) => {
              const on = user.favoriteSports.includes(s.id);
              return (
                <button key={s.id} type="button" className={`chip ${on ? 'is-active' : ''}`} aria-pressed={on} onClick={() => toggleSport(s.id)}>
                  <span aria-hidden="true">{s.emoji}</span> {tr(s.name)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h2>{t('profile.shortcuts')}</h2>
          <div className="row gap wrap">
            <Link to="/favorites" className="btn btn-secondary">
              {t('nav.favorites')} ({favTotal})
            </Link>
            <Link to="/notifications" className="btn btn-secondary">
              {t('nav.notifications')}
            </Link>
            <Link to="/settings" className="btn btn-secondary">
              {t('nav.settings')}
            </Link>
          </div>
        </section>

        <button type="button" className="btn btn-ghost danger" onClick={out}>
          <LogOut size={16} aria-hidden="true" /> {t('profile.logout')}
        </button>
      </div>
    </>
  );
}
