import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** يُستخدم كصفحة 404 عامة، وكنتيجة "غير موجود" داخل صفحات التفاصيل (what) */
export default function NotFound({ what }: { what?: 'match' | 'news' | 'team' | 'player' | 'sport' | 'product' }) {
  const { t } = useLang();
  useDocumentTitle(t('notfound.title'));

  return (
    <div className="container">
      <div className="notfound">
        <span className="notfound-code" aria-hidden="true">
          404
        </span>
        <h1>{t('notfound.title')}</h1>
        <p className="muted">{what ? t(`notfound.${what}`) : t('notfound.text')}</p>
        <div className="row gap wrap center">
          <Link to="/" className="btn btn-primary">
            <Home size={16} aria-hidden="true" /> {t('notfound.home')}
          </Link>
          <Link to="/matches" className="btn btn-secondary">
            <Search size={16} aria-hidden="true" /> {t('nav.matches')}
          </Link>
        </div>
      </div>
    </div>
  );
}
