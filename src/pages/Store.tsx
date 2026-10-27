import { useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useUrlState } from '../hooks/useUrlState';
import { getProducts, type ProductSort } from '../services/storeApi';
import { BRANDS } from '../data/products';
import { SPORTS, isSportId } from '../data/sports';
import type { ProductCategory, SportId } from '../types';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import { Async } from '../components/Async';
import { SkeletonGrid } from '../components/StateViews';
import { DemoNotice } from '../components/DemoBadge';

const CATEGORIES: ProductCategory[] = ['apparel', 'jerseys', 'shoes', 'balls', 'training', 'bags', 'equipment'];
const SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc'];

function num(v: string): number | undefined {
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default function Store() {
  const { t, tr } = useLang();
  useDocumentTitle(t('nav.store'));
  const url = useUrlState();

  const q = url.get('q');
  const rawCat = url.get('cat', 'all');
  const category = (CATEGORIES as string[]).includes(rawCat) ? (rawCat as ProductCategory) : 'all';
  const brand = url.get('brand', 'all');
  const rawSport = url.get('sport', 'all');
  const sport: SportId | 'all' = isSportId(rawSport) ? rawSport : 'all';
  const min = url.get('min');
  const max = url.get('max');
  const rawSort = url.get('sort', 'featured');
  const sort = (SORTS as string[]).includes(rawSort) ? (rawSort as ProductSort) : 'featured';
  const [qInput, setQInput] = useState(q);

  const state = useAsync(
    () => getProducts({ q, category, brand, sport, minPrice: num(min), maxPrice: num(max), sort }),
    [q, category, brand, sport, min, max, sort],
  );

  const hasFilters = !!q || category !== 'all' || brand !== 'all' || sport !== 'all' || !!min || !!max || sort !== 'featured';

  return (
    <>
      <PageHeader title={t('store.title')} subtitle={t('store.sub')} />
      <div className="container">
        <DemoNotice messageKey="demo.store" />

        <div className="filters-panel">
          <div className="chips" role="group" aria-label={t('store.category')}>
            <button type="button" className={`chip ${category === 'all' ? 'is-active' : ''}`} aria-pressed={category === 'all'} onClick={() => url.set({ cat: null })}>
              {t('filters.all')}
            </button>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={`chip ${category === c ? 'is-active' : ''}`} aria-pressed={category === c} onClick={() => url.set({ cat: c })}>
                {t(`category.${c}`)}
              </button>
            ))}
          </div>

          <div className="filters-row">
            <label className="field field-grow">
              <span>{t('filters.search')}</span>
              <span className="input-icon">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  value={qInput}
                  placeholder={t('search.in.store')}
                  onChange={(e) => {
                    setQInput(e.target.value);
                    url.set({ q: e.target.value.trim() });
                  }}
                />
              </span>
            </label>

            <label className="field">
              <span>{t('store.brand')}</span>
              <select value={brand} onChange={(e) => url.set({ brand: e.target.value })}>
                <option value="all">{t('filters.all')}</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t('filters.sport')}</span>
              <select value={sport} onChange={(e) => url.set({ sport: e.target.value })}>
                <option value="all">{t('filters.all')}</option>
                {SPORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {tr(s.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field-sm">
              <span>{t('store.minPrice')}</span>
              <input type="number" inputMode="numeric" min={0} value={min} onChange={(e) => url.set({ min: e.target.value })} />
            </label>
            <label className="field field-sm">
              <span>{t('store.maxPrice')}</span>
              <input type="number" inputMode="numeric" min={0} value={max} onChange={(e) => url.set({ max: e.target.value })} />
            </label>

            <label className="field">
              <span>{t('store.sort')}</span>
              <select value={sort} onChange={(e) => url.set({ sort: e.target.value === 'featured' ? null : e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s} value={s}>
                    {t(`store.sort.${s}`)}
                  </option>
                ))}
              </select>
            </label>

            {hasFilters && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setQInput('');
                  url.set({ q: null, cat: null, brand: null, sport: null, min: null, max: null, sort: null });
                }}
              >
                <RotateCcw size={16} aria-hidden="true" /> {t('filters.reset')}
              </button>
            )}
          </div>
        </div>

        <Async
          state={state}
          isEmpty={(r) => r.data.length === 0}
          emptyTitle={t('store.empty.title')}
          emptyText={t('store.empty.text')}
          skeleton={<SkeletonGrid count={8} className="grid grid-products" />}
        >
          {(r) => (
            <>
              <p className="results-line muted">{t('store.count', { n: r.data.length })}</p>
              <div className="grid grid-products">
                {r.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}
        </Async>
      </div>
    </>
  );
}
