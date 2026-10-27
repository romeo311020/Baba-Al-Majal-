import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUrlState } from '../hooks/useUrlState';
import { getMostRead, getNews } from '../services/newsApi';
import { isSportId } from '../data/sports';
import { formatCompact } from '../utils/format';
import type { SportId } from '../types';
import PageHeader from '../components/PageHeader';
import SportChips from '../components/SportChips';
import NewsCard from '../components/NewsCard';
import { Async } from '../components/Async';
import { SkeletonGrid } from '../components/StateViews';
import { DemoNotice } from '../components/DemoBadge';

export default function News() {
  const { t, tr, lang } = useLang();
  useDocumentTitle(t('nav.news'));
  const url = useUrlState();
  const rawSport = url.get('sport', 'all');
  const sport: SportId | 'all' = isSportId(rawSport) ? rawSport : 'all';
  const q = url.get('q');
  const [qInput, setQInput] = useState(q);

  const list = useAsync(() => getNews({ sport, q }), [sport, q]);
  const most = useAsync(() => getMostRead(5), []);

  return (
    <>
      <PageHeader title={t('news.title')} subtitle={t('news.sub')} />
      <div className="container">
        <DemoNotice messageKey="demo.news" />

        <div className="filters-panel">
          <SportChips value={sport} onChange={(s) => url.set({ sport: s })} />
          <label className="field field-grow">
            <span>{t('filters.search')}</span>
            <span className="input-icon">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={qInput}
                placeholder={t('search.in.news')}
                onChange={(e) => {
                  setQInput(e.target.value);
                  url.set({ q: e.target.value.trim() });
                }}
              />
            </span>
          </label>
        </div>

        <div className="layout-2col">
          <div>
            <Async
              state={list}
              isEmpty={(r) => r.data.length === 0}
              emptyTitle={t('news.empty.title')}
              emptyText={t('news.empty.text')}
              skeleton={<SkeletonGrid count={4} className="grid grid-cards-2" />}
            >
              {(r) => (
                <div className="grid grid-cards-2">
                  {r.data.map((n, i) => (
                    <NewsCard key={n.id} item={n} variant={i === 0 && !q && sport === 'all' ? 'featured' : 'default'} />
                  ))}
                </div>
              )}
            </Async>
          </div>

          <aside className="side-card" aria-label={t('news.mostread')}>
            <h2>{t('news.mostread')}</h2>
            <Async state={most}>
              {(r) => (
                <ol className="most-read">
                  {r.data.map((n) => (
                    <li key={n.id}>
                      <Link to={`/news/${n.id}`}>{tr(n.title)}</Link>
                      <span className="muted small">
                        <Eye size={13} aria-hidden="true" /> {formatCompact(n.views, lang)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Async>
          </aside>
        </div>
      </div>
    </>
  );
}
