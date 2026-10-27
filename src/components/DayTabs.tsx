import { useMemo } from 'react';
import { useLang } from '../context/LanguageContext';
import { addDays, toISODate } from '../utils/date';

interface Props {
  /** YYYY-MM-DD */
  value: string;
  onChange: (iso: string) => void;
  showDatePicker?: boolean;
}

export default function DayTabs({ value, onChange, showDatePicker = true }: Props) {
  const { t } = useLang();
  const days = useMemo(() => {
    const today = new Date();
    return [
      { key: 'yesterday', iso: toISODate(addDays(today, -1)) },
      { key: 'today', iso: toISODate(today) },
      { key: 'tomorrow', iso: toISODate(addDays(today, 1)) },
    ];
  }, []);

  return (
    <div className="day-tabs">
      <div className="tabs" role="tablist" aria-label={t('filters.day')}>
        {days.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={value === d.iso}
            className={`tab ${value === d.iso ? 'is-active' : ''}`}
            onClick={() => onChange(d.iso)}
          >
            {t(`day.${d.key}`)}
          </button>
        ))}
      </div>
      {showDatePicker && (
        <label className="date-picker">
          <span className="sr-only">{t('filters.date')}</span>
          <input type="date" value={value} onChange={(e) => e.target.value && onChange(e.target.value)} />
        </label>
      )}
    </div>
  );
}
