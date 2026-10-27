import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getArticle } from '../services/newsApi';
import { getSport } from '../data/sports';
import { getTeamById } from '../data/catalog';
import { formatCompact, formatDateLong } from '../utils/format';
import SportArt from '../components/SportArt';
import NewsCard from '../components/NewsCard';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { Async } from '../components/Async';
import { DemoNotice } from '../components/DemoBadge';
import NotFound from './NotFound';

export default function NewsDetails() {
  const { id = '' } = useParams();
  const { t, tr, lang } = useLang();
  const state = useAsync(() => getArticle(id), [id]);
  const art = state.data?.data?.article;
  useDocumentTitle(art ? tr(art.title) : t('nav.news'));

  if (state.status === 'success' && state.data && state.data.data === null) return <NotFound what="news" />;

  return (
    <div className="container page-pad">
      <Link to="/news" className="back-link">
        <ArrowLeft size={16} className="icon-dir" aria-hidden="true" /> {t('nav.news')}
      </Link>
      <DemoNotice messageKey="demo.news" />
      <Async state={state}>
        {(r) => {
          if (!r.data) return null;
          const { article, related, mostRead } = r.data;
          const sport = getSport(article.sport);
          const teams = (article.teamIds ?? []).map((tid) => getTeamById(tid)).filter((x) => !!x);
          return (
            <div className="layout-2col">
              <article className="article">
                <SportArt sport={article.sport} className="article-art" />
                <div className="news-meta">
                  <span className="tag">
                    {sport?.emoji} {sport ? tr(sport.name) : ''}
                  </span>
                  <time dateTime={article.publishedAt}>{formatDateLong(article.publishedAt, lang)}</time>
                  <span>
                    {t('news.source')}: {article.source}
                  </span>
                  <span>
                    <Eye size={14} aria-hidden="true" /> {formatCompact(article.views, lang)}
                  </span>
                </div>
                <h1>{tr(article.title)}</h1>
                <p className="lead">{tr(article.summary)}</p>
                {article.body.map((p, i) => (
                  <p key={i}>{tr(p)}</p>
                ))}
                <div className="row gap wrap article-actions">
                  <FavoriteButton kind="news" id={article.id} withLabel />
                  <ShareButton title={tr(article.title)} />
                </div>
                {teams.length > 0 && (
                  <div className="row gap wrap">
                    {teams.map((tm) => (
                      <Link key={tm!.id} to={`/teams/${tm!.id}`} className="chip">
                        {tr(tm!.name)}
                      </Link>
                    ))}
                  </div>
                )}
              </article>

              <aside>
                <div className="side-card">
                  <h2>{t('news.related')}</h2>
                  <div className="stack">
                    {related.map((n) => (
                      <NewsCard key={n.id} item={n} variant="compact" />
                    ))}
                  </div>
                </div>
                <div className="side-card">
                  <h2>{t('news.mostread')}</h2>
                  <ol className="most-read">
                    {mostRead.map((n) => (
                      <li key={n.id}>
                        <Link to={`/news/${n.id}`}>{tr(n.title)}</Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
