import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAsync } from '../hooks/useAsync';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getProduct, outboundUrl } from '../services/storeApi';
import { formatPrice } from '../utils/format';
import { getSport } from '../data/sports';
import SportArt from '../components/SportArt';
import ProductCard from '../components/ProductCard';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { Async } from '../components/Async';
import { DemoBadge, DemoNotice } from '../components/DemoBadge';
import NotFound from './NotFound';

export default function ProductDetails() {
  const { id = '' } = useParams();
  const { t, tr, lang } = useLang();
  const state = useAsync(() => getProduct(id), [id]);
  const p = state.data?.data?.product;
  useDocumentTitle(p ? tr(p.name) : t('nav.store'));

  if (state.status === 'success' && state.data && state.data.data === null) return <NotFound what="product" />;

  return (
    <div className="container page-pad">
      <Link to="/store" className="back-link">
        <ArrowLeft size={16} className="icon-dir" aria-hidden="true" /> {t('nav.store')}
      </Link>
      <DemoNotice messageKey="demo.store" />
      <Async state={state}>
        {(r) => {
          if (!r.data) return null;
          const { product, vendor, related } = r.data;
          const sport = product.sport === 'multi' ? undefined : getSport(product.sport);
          const buy = outboundUrl(product, vendor);
          return (
            <>
              <div className="product-detail">
                <SportArt sport={product.sport} className="product-detail-art" />
                <div>
                  <span className="product-brand">{product.brand}</span>
                  <h1>{tr(product.name)}</h1>
                  <div className="product-price-row big">
                    <strong>{formatPrice(product.price, product.currency, lang)}</strong>
                    <DemoBadge />
                  </div>
                  <p className="lead">{tr(product.description)}</p>

                  <ul className="checklist">
                    {product.features.map((f, i) => (
                      <li key={i}>
                        <Check size={16} aria-hidden="true" /> {tr(f)}
                      </li>
                    ))}
                  </ul>

                  <dl className="spec-list">
                    <div>
                      <dt>{t('store.category')}</dt>
                      <dd>{t(`category.${product.category}`)}</dd>
                    </div>
                    <div>
                      <dt>{t('filters.sport')}</dt>
                      <dd>{sport ? tr(sport.name) : t('store.allSports')}</dd>
                    </div>
                    <div>
                      <dt>{t('store.vendor')}</dt>
                      <dd>{vendor?.name ?? '—'}</dd>
                    </div>
                  </dl>

                  <div className="row gap wrap">
                    {buy ? (
                      <a className="btn btn-primary btn-lg" href={buy} target="_blank" rel="noopener noreferrer sponsored">
                        <ExternalLink size={18} aria-hidden="true" /> {t('store.buy')}
                      </a>
                    ) : (
                      <button type="button" className="btn btn-primary btn-lg" disabled aria-describedby="no-buy">
                        {t('store.buy.unavailable')}
                      </button>
                    )}
                    <FavoriteButton kind="products" id={product.id} withLabel />
                    <ShareButton title={tr(product.name)} />
                  </div>
                  {!buy && (
                    <p id="no-buy" className="muted small">
                      {t('store.buy.note')}
                    </p>
                  )}
                  <p className="muted small">{t('store.disclosure')}</p>
                </div>
              </div>

              {related.length > 0 && (
                <section className="section">
                  <h2>{t('store.related')}</h2>
                  <div className="grid grid-products">
                    {related.map((rp) => (
                      <ProductCard key={rp.id} product={rp} />
                    ))}
                  </div>
                </section>
              )}
            </>
          );
        }}
      </Async>
    </div>
  );
}
