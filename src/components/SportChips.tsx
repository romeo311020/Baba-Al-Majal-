import type { SportId } from '../types';
import { SPORTS } from '../data/sports';
import { useLang } from '../context/LanguageContext';

interface Props {
  value: SportId | 'all';
  onChange: (v: SportId | 'all') => void;
  includeAll?: boolean;
}

export default function SportChips({ value, onChange, includeAll = true }: Props) {
  const { t, tr } = useLang();
  return (
    <div className="chips" role="group" aria-label={t('filters.sport')}>
      {includeAll && (
        <button type="button" className={`chip ${value === 'all' ? 'is-active' : ''}`} aria-pressed={value === 'all'} onClick={() => onChange('all')}>
          {t('filters.all')}
        </button>
      )}
      {SPORTS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`chip ${value === s.id ? 'is-active' : ''}`}
          aria-pressed={value === s.id}
          onClick={() => onChange(s.id)}
        >
          <span aria-hidden="true">{s.emoji}</span> {tr(s.name)}
        </button>
      ))}
    </div>
  );
}
