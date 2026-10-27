import { Info } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

/** وسم صغير يوضّح أن البيانات المعروضة تجريبية */
export function DemoBadge({ className = '' }: { className?: string }) {
  const { t } = useLang();
  return (
    <span className={`badge badge-demo ${className}`} title={t('demo.tooltip')}>
      {t('demo.badge')}
    </span>
  );
}

/** شريط تنبيه أعلى القسم يوضّح أن المحتوى تجريبي */
export function DemoNotice({ messageKey = 'demo.notice' }: { messageKey?: string }) {
  const { t } = useLang();
  return (
    <div className="notice notice-demo" role="note">
      <Info size={18} aria-hidden="true" />
      <span>{t(messageKey)}</span>
    </div>
  );
}
