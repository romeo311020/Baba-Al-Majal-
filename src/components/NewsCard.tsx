import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { getSport } from '../data/sports';
import type { NewsItem } from '../services/newsApi';
import { formatDateShort } from '../utils/format';
import SportArt from './SportArt';
import FavoriteButton from './FavoriteButton';

interface Props {
  item: NewsItem;
  variant?: 'default' | 'featured' | 'compact';
}

export default function NewsCard({ item, variant = 'default' }: Props) {
  const { tr, lang } = useLang();
  const sport = getSport(item.sport);

  return (
    <article className={`news-card news-${variant}`}>
      <Link to={`/news/${item.id}`} className="news-link">
        <SportArt sport={item.sport} className="news-art" />
        <div className="news-content">
          <div className="news-meta">
            <span className="tag">
              {sport?.emoji} {sport ? tr(sport.name) : ''}
            </span>
            <time dateTime={item.publishedAt}>{formatDateShort(item.publishedAt, lang)}</time>
          </div>
          <h3>{tr(item.title)}</h3>
          {variant !== 'compact' && <p>{tr(item.summary)}</p>}
        </div>
      </Link>
      {variant !== 'compact' && (
        <div className="news-fav">
          <FavoriteButton kind="news" id={item.id} />
        </div>
      )}
    </article>
  );
}
