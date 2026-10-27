import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, Heart, LogIn, Settings, User, X } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SPORTS } from '../data/sports';

const MAIN = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/matches', key: 'nav.matches', end: false },
  { to: '/news', key: 'nav.news', end: false },
  { to: '/store', key: 'nav.store', end: false },
  { to: '/assistant', key: 'nav.assistant', end: false },
];

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, tr } = useLang();
  const { user } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside id="mobile-menu" className="drawer" role="dialog" aria-modal="true" aria-label={t('menu.title')}>
        <div className="drawer-head">
          <Logo onClick={onClose} />
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label={t('menu.close')}>
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        <nav className="drawer-section" aria-label={t('nav.main')}>
          {MAIN.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) => `drawer-link ${isActive ? 'is-active' : ''}`}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="drawer-section">
          <h3 className="drawer-title">{t('menu.sports')}</h3>
          <div className="drawer-sports">
            {SPORTS.map((s) => (
              <NavLink
                key={s.id}
                to={`/sports/${s.id}`}
                onClick={onClose}
                className={({ isActive }) => `drawer-sport ${isActive ? 'is-active' : ''}`}
              >
                <span aria-hidden="true">{s.emoji}</span> {tr(s.name)}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <h3 className="drawer-title">{t('menu.account')}</h3>
          {user ? (
            <Link to="/profile" className="drawer-link" onClick={onClose}>
              <User size={18} aria-hidden="true" /> {t('nav.profile')}
            </Link>
          ) : (
            <Link to="/login" className="drawer-link" onClick={onClose}>
              <LogIn size={18} aria-hidden="true" /> {t('nav.login')}
            </Link>
          )}
          <Link to="/favorites" className="drawer-link" onClick={onClose}>
            <Heart size={18} aria-hidden="true" /> {t('nav.favorites')}
          </Link>
          <Link to="/notifications" className="drawer-link" onClick={onClose}>
            <Bell size={18} aria-hidden="true" /> {t('nav.notifications')}
          </Link>
          <Link to="/settings" className="drawer-link" onClick={onClose}>
            <Settings size={18} aria-hidden="true" /> {t('nav.settings')}
          </Link>
        </div>

        <div className="drawer-section drawer-legal">
          <Link to="/about" onClick={onClose}>
            {t('nav.about')}
          </Link>
          <Link to="/contact" onClick={onClose}>
            {t('nav.contact')}
          </Link>
          <Link to="/privacy" onClick={onClose}>
            {t('nav.privacy')}
          </Link>
          <Link to="/terms" onClick={onClose}>
            {t('nav.terms')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
