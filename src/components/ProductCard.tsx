import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useLang } from '../context/LanguageContext';
import { formatPrice } from '../utils/format';
import SportArt from './SportArt';
import FavoriteButton from './FavoriteButton';
import { DemoBadge } from './DemoBadge';

export default function ProductCard({ product }: { product: Product }) {
  const { tr, lang, t } = useLang();
  return (
    <article className="product-card">
      <Link to={`/store/${product.id}`} className="product-link">
        <SportArt sport={product.sport} className="product-art" />
        <div className="product-info">
          <span className="product-brand">{product.brand}</span>
          <h3>{tr(product.name)}</h3>
          <div className="product-price-row">
            <strong>{formatPrice(product.price, product.currency, lang)}</strong>
            <DemoBadge />
          </div>
          <span className="muted small">{t(`category.${product.category}`)}</span>
        </div>
      </Link>
      <div className="product-fav">
        <FavoriteButton kind="products" id={product.id} />
      </div>
    </article>
  );
}
