import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Logo from './Logo';
import { useLang } from '../context/LanguageContext';
import { SPORTS } from '../data/sports';

export default function Footer() {
  const { t, tr } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo size={44} />
          <p className="footer-tagline">{t('brand.tagline')}</p>
          <p className="muted small" dir="ltr" lang="en">
            {t('brand.tagline.en')}
          </p>
          <div className="social-row" aria-label={t('footer.social')}>
            {/* لا توجد حسابات رسمية بعد: نعرضها كعناصر غير نشطة بدل روابط وهمية */}
            {['X', 'Instagram', 'YouTube', 'Facebook'].map((n) => (
              <span key={n} className="social-chip" aria-disabled="true" title={t('footer.soon')}>
                {n}
              </span>
            ))}
          </div>
          <p className="muted small">{t('footer.soon')}</p>
        </div>

        <nav className="footer-col" aria-label={t('footer.platform')}>
          <h3>{t('footer.platform')}</h3>
          <Link to="/matches">{t('nav.matches')}</Link>
          <Link to="/news">{t('nav.news')}</Link>
          <Link to="/store">{t('nav.store')}</Link>
          <Link to="/assistant">{t('nav.assistant')}</Link>
          <Link to="/favorites">{t('nav.favorites')}</Link>
        </nav>

        <nav className="footer-col" aria-label={t('menu.sports')}>
          <h3>{t('menu.sports')}</h3>
          {SPORTS.slice(0, 5).map((s) => (
            <Link key={s.id} to={`/sports/${s.id}`}>
              {tr(s.name)}
            </Link>
          ))}
        </nav>

        <nav className="footer-col" aria-label={t('footer.company')}>
          <h3>{t('footer.company')}</h3>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">
            <Mail size={14} aria-hidden="true" /> {t('nav.contact')}
          </Link>
          <Link to="/privacy">{t('nav.privacy')}</Link>
          <Link to="/terms">{t('nav.terms')}</Link>
          <Link to="/settings">{t('nav.settings')}</Link>
        </nav>
      </div>

      <div className="container footer-bottom">
        <span>
          © {year} {t('footer.rights')}
        </span>
        <span className="muted small">{t('footer.demo')}</span>
      </div>
    </footer>
  );
}
