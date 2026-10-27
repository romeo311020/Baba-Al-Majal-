import { Heart } from 'lucide-react';
import { useFavorites, type FavKind } from '../context/FavoritesContext';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface Props {
  kind: FavKind;
  id: string;
  /** يعرض النص بجانب الأيقونة */
  withLabel?: boolean;
  className?: string;
}

export default function FavoriteButton({ kind, id, withLabel = false, className = '' }: Props) {
  const { has, toggle } = useFavorites();
  const { t } = useLang();
  const { show } = useToast();
  const active = has(kind, id);
  const label = active ? t('fav.remove') : t('fav.add');

  return (
    <button
      type="button"
      className={`icon-btn fav-btn ${active ? 'is-active' : ''} ${withLabel ? 'with-label' : ''} ${className}`}
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={() => {
        const added = toggle(kind, id);
        show(added ? t('fav.added') : t('fav.removed'), 'success');
      }}
    >
      <Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />
      {withLabel && <span>{label}</span>}
    </button>
  );
}
