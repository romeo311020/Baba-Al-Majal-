import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useFavorites, type FavKind } from '../context/FavoritesContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useAsync } from '../hooks/useAsync';
import { getMatchesRange } from '../services/sportsApi';
import { PRODUCTS } from '../data/products';
import { TEAMS } from '../data/catalog';
import { PLAYERS } from '../data/players';
import { getNews } from '../services/newsApi';
import { toISODate, addDays } from '../utils/date';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import MatchCard from '../components/MatchCard';
import NewsCard from '../components/NewsCard';
import ProductCard from '../components/ProductCard';
import TeamBadge from '../components/TeamBadge';
import { EmptyState, Loading } from '../components/StateViews';

export default function Favorites() {
  const { t, tr } = useLang();
  useDocumentTitle(t('nav.favorites'));
  const { favorites, total, clearAll } = useFavorites();
  const [tab, setTab] = useState<FavKind>('matches');

  // نطاق واسع يغطي كل المباريات التجريبية
  const matches = useAsync(() => getMatchesRange(toISODate(addDays(new Date(), -30)), toISODate(addDays(new Date(), 30))), []);
  const news = useAsync(() => getNews(), []);

  const favMatches = useMemo(() => (matches.data?.data ?? []).filter((m) => favorites.matches.includes(m.id)), [matches.data, favorites.matches]);
  const favNews = useMemo(() => (news.data?.data ?? []).filter((n) => favorites.news.includes(n.id)), [news.data, favorites.news]);
  const favProducts = PRODUCTS.filter((p) => favorites.products.includes(p.id));
  const favTeams = TEAMS.filter((tm) => favorites.teams.includes(tm.id));
  const favPlayers = PLAYERS.filter((p) => favorites.players.includes(p.id));

  const counts: Record<FavKind, number> = {
    matches: favorites.matches.length,
    news: favorites.news.length,
    products: favorites.products.length,
    teams: favorites.teams.length,
    players: favorites.players.length,
  };

  const tabs = (['matches', 'news', 'products', 'teams', 'players'] as FavKind[]).map((k) => ({
    id: k,
    label: t(`fav.tab.${k}`),
    count: counts[k],
  }));

  const emptyBlock = (
    <EmptyState
      title={t('fav.empty.title')}
      text={t('fav.empty.text')}
      action={
        <Link to={tab === 'news' ? '/news' : tab === 'products' ? '/store' : '/matches'} className="btn btn-primary">
          {t('fav.empty.cta')}
        </Link>
      }
    />
  );

  return (
    <>
      <PageHeader title={t('fav.title')} subtitle={t('fav.sub')} />
      <div className="container">
        <p className="notice notice-info">{t('fav.local')}</p>
        <div className="row between wrap">
          <Tabs tabs={tabs} active={tab} onChange={(id) => setTab(id as FavKind)} ariaLabel={t('fav.title')} />
          {total > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => window.confirm(t('fav.clear.confirm')) && clearAll()}>
              <Trash2 size={16} aria-hidden="true" /> {t('fav.clear')}
            </button>
          )}
        </div>

        <div className="tab-panel">
          {tab === 'matches' &&
            (counts.matches === 0 ? (
              emptyBlock
            ) : matches.status === 'loading' && !matches.data ? (
              <Loading />
            ) : favMatches.length === 0 ? (
              emptyBlock
            ) : (
              <div className="grid grid-matches">
                {favMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            ))}

          {tab === 'news' &&
            (favNews.length === 0 && !(news.status === 'loading' && counts.news > 0) ? (
              emptyBlock
            ) : (
              <div className="grid grid-cards">
                {favNews.map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            ))}

          {tab === 'products' &&
            (favProducts.length === 0 ? (
              emptyBlock
            ) : (
              <div className="grid grid-products">
                {favProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ))}

          {tab === 'teams' &&
            (favTeams.length === 0 ? (
              emptyBlock
            ) : (
              <div className="grid grid-tiles tiles-teams">
                {favTeams.map((tm) => (
                  <Link key={tm.id} to={`/teams/${tm.id}`} className="tile tile-team">
                    <TeamBadge team={tm} size={48} />
                    <strong>{tr(tm.name)}</strong>
                    <span className="muted small">{tr(tm.country)}</span>
                  </Link>
                ))}
              </div>
            ))}

          {tab === 'players' &&
            (favPlayers.length === 0 ? (
              emptyBlock
            ) : (
              <div className="grid grid-tiles">
                {favPlayers.map((p) => (
                  <Link key={p.id} to={`/players/${p.id}`} className="tile">
                    <span className="num-badge" aria-hidden="true">
                      {p.number}
                    </span>
                    <strong>{tr(p.name)}</strong>
                    <span className="muted small">{tr(p.position)}</span>
                  </Link>
                ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
