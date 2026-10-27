import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

type Scope = 'matches' | 'news' | 'store';

/** البحث يتبع القسم الحالي: الأخبار ← أخبار، المتجر ← منتجات، وغير ذلك ← مباريات */
export default function SearchBox({ onDone, autoFocus = false }: { onDone?: () => void; autoFocus?: boolean }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState('');

  const scope: Scope = pathname.startsWith('/news') ? 'news' : pathname.startsWith('/store') ? 'store' : 'matches';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/${scope}?q=${encodeURIComponent(term)}` : `/${scope}`);
    onDone?.();
  };

  return (
    <form className="search-box" role="search" onSubmit={onSubmit}>
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t(`search.in.${scope}`)}
        aria-label={t(`search.in.${scope}`)}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
    </form>
  );
}
