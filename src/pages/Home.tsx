import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Heart, Languages, Newspaper, ShoppingBag, Trophy, Zap } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getFeaturedTeams, getMatches, getCompetitions } from '../services/sportsApi';
import { getNews } from '../services/newsApi';
import { getSuggestedProducts } from '../services/storeApi';
import { toISODate } from '../utils/date';
import type { SportId } from '../types';
import HeroArt from '../components/HeroArt';
import SectionHeader from '../components/SectionHeader';
import DayTabs from '../components/DayTabs';
import SportChips from '../components/SportChips';
import MatchCard from '../components/MatchCard';
import NewsCard from '../components/NewsCard';
import ProductCard from '../components/ProductCard';
import TeamBadge from '../components/TeamBadge';
import { Async } from '../components/Async';
import { SkeletonGrid } from '../components/StateViews';
import { DemoNotice } from '../components/DemoBadge';
import { getSport } from '../data/sports';

export default function Home() {
  const { t, tr } = useLang();
  useDocumentTitle();

  const [day, setDay] = useState(() => toISODate(new Date()));
  const [sport, setSport] = useState<SportId | 'all'>('all');

  const matches = useAsync(() => getMatches({ date: day, sport }), [day, sport]);
  const news = useAsync(() => getNews(), []);
  const teams = useAsync(() => getFeaturedTeams(6), []);
  const products = useAsync(() => getSuggestedProducts(4), []);
  const competitions = getCompetitions().slice(0, 6);

  const quick = [
    { to: '/matches', icon: Trophy, title: t('nav.matches'), text: t('home.quick.matches') },
    { to: '/news', icon: Newspaper, title: t('nav.news'), text: t('home.quick.news') },
    { to: '/store', icon: ShoppingBag, title: t('nav.store'), text: t('home.quick.store') },
    { to: '/assistant', icon: Bot, title: t('nav.assistant'), text: t('home.quick.assistant') },
  ];

  const features = [
    { icon: Zap, title: t('home.feat.1.title'), text: t('home.feat.1.text') },
    { icon: Trophy, title: t('home.feat.2.title'), text: t('home.feat.2.text') },
    { icon: Bot, title: t('home.feat.3.title'), text: t('home.feat.3.text') },
    { icon: ShoppingBag, title: t('home.feat.4.title'), text: t('home.feat.4.text') },
    { icon: Heart, title: t('home.feat.5.title'), text: t('home.feat.5.text') },
    { icon: Languages, title: t('home.feat.6.title'), text: t('home.feat.6.text') },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{t('brand.tagline')}</span>
            <h1>{t('home.hero.title')}</h1>
            <p className="lead">{t('home.hero.text')}</p>
            <div className="row gap wrap">
              <Link to="/matches" className="btn btn-primary btn-lg">
                <Trophy size={18} aria-hidden="true" />
                {t('home.hero.cta.matches')}
              </Link>
              <Link to="/assistant" className="btn btn-secondary btn-lg">
                <Bot size={18} aria-hidden="true" />
                {t('home.hero.cta.ai')}
              </Link>
            </div>
          </div>
          <HeroArt />
        </div>
      </section>

      <div className="container">
        <DemoNotice />

        <section className="quick-grid" aria-label={t('home.quick.title')}>
          {quick.map((q) => (
            <Link key={q.to} to={q.to} className="quick-card">
              <span className="quick-icon">
                <q.icon size={22} aria-hidden="true" />
              </span>
              <strong>{q.title}</strong>
              <span className="muted small">{q.text}</span>
            </Link>
          ))}
        </section>

        <section className="section">
          <SectionHeader
            title={t('home.matches.title')}
            subtitle={t('home.matches.sub')}
            to={`/matches?date=${day}${sport !== 'all' ? `&sport=${sport}` : ''}`}
            linkLabel={t('home.matches.all')}
          />
          <div className="filters-stack">
            <DayTabs value={day} onChange={setDay} showDatePicker={false} />
            <SportChips value={sport} onChange={setSport} />
          </div>
          <Async
            state={matches}
            isEmpty={(r) => r.data.length === 0}
            emptyTitle={t('matches.empty.title')}
            emptyText={t('matches.empty.text')}
            skeleton={<SkeletonGrid count={3} className="grid grid-matches" />}
          >
            {(r) => (
              <div className="grid grid-matches">
                {r.data.slice(0, 6).map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('home.news.title')} subtitle={t('home.news.sub')} to="/news" linkLabel={t('home.news.all')} />
          <Async state={news} isEmpty={(r) => r.data.length === 0} skeleton={<SkeletonGrid count={3} />}>
            {(r) => (
              <div className="grid grid-cards">
                {r.data.slice(0, 3).map((n) => (
                  <NewsCard key={n.id} item={n} />
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('home.comps.title')} subtitle={t('home.comps.sub')} />
          <div className="grid grid-tiles">
            {competitions.map((c) => (
              <Link key={c.id} to={`/matches?comp=${c.id}`} className="tile">
                <span className="tile-emoji" aria-hidden="true">
                  {getSport(c.sport)?.emoji}
                </span>
                <strong>{tr(c.name)}</strong>
                <span className="muted small">{tr(c.country)}</span>
              </Link>
            ))}
          </div>
          <Async state={teams} skeleton={<SkeletonGrid count={3} className="grid grid-tiles" />}>
            {(r) => (
              <div className="grid grid-tiles tiles-teams">
                {r.data.map((team) => (
                  <Link key={team.id} to={`/teams/${team.id}`} className="tile tile-team">
                    <TeamBadge team={team} size={48} />
                    <strong>{tr(team.name)}</strong>
                    <span className="muted small">{tr(team.country)}</span>
                  </Link>
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('home.store.title')} subtitle={t('home.store.sub')} to="/store" linkLabel={t('home.store.all')} />
          <Async state={products} skeleton={<SkeletonGrid count={4} className="grid grid-products" />}>
            {(r) => (
              <div className="grid grid-products">
                {r.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </Async>
        </section>

        <section className="section">
          <SectionHeader title={t('home.feat.title')} subtitle={t('home.feat.sub')} />
          <div className="grid grid-features">
            {features.map((f) => (
              <div key={f.title} className="feature">
                <span className="feature-icon">
                  <f.icon size={22} aria-hidden="true" />
                </span>
                <h3>{f.title}</h3>
                <p className="muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-band">
          <div>
            <h2>{t('home.cta.title')}</h2>
            <p className="muted">{t('home.cta.text')}</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">
            {t('home.cta.button')}
            <ArrowRight size={18} className="icon-dir" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
