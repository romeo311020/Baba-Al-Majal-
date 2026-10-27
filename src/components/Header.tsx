import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Bell, Globe, Heart, Menu, Search, User, X } from 'lucide-react';
import Logo from './Logo';
import SearchBox from './SearchBox';
import MobileMenu from './MobileMenu';
import { useLang } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotifications } from '../context/NotificationsContext';
import { useAuth } from '../context/AuthContext';

export const MAIN_NAV = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/matches', key: 'nav.matches', end: false },
  { to: '/news', key: 'nav.news', end: false },
  { to: '/store', key: 'nav.store', end: false },
  { to: '/assistant', key: 'nav.assistant', end: false },
];

export default function Header() {
  const { t, lang, toggleLang } = useLang();
  const { total } = useFavorites();
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className="main-nav" aria-label={t('nav.main')}>
          {MAIN_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="header-search-desktop">
          <SearchBox />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn header-search-toggle"
            aria-expanded={searchOpen}
            aria-label={t('search.open')}
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
          </button>

          <button type="button" className="lang-btn" onClick={toggleLang} aria-label={t('lang.switch')} title={t('lang.switch')}>
            <Globe size={16} aria-hidden="true" />
            <span>{lang === 'ar' ? 'EN' : 'ع'}</span>
          </button>

          <Link to="/favorites" className="icon-btn badge-host hide-xs" aria-label={t('nav.favorites')} title={t('nav.favorites')}>
            <Heart size={20} aria-hidden="true" />
            {total > 0 && <span className="count-badge">{total > 99 ? '99+' : total}</span>}
          </Link>

          <Link to="/notifications" className="icon-btn badge-host" aria-label={t('nav.notifications')} title={t('nav.notifications')}>
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
          </Link>

          <Link
            to={user ? '/profile' : '/login'}
            className="icon-btn hide-xs"
            aria-label={user ? t('nav.profile') : t('nav.login')}
            title={user ? t('nav.profile') : t('nav.login')}
          >
            <User size={20} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={t('menu.open')}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="header-search-mobile container">
          <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
        </div>
      )}

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
