import { Info } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

/** تنبيه واضح أن نظام الحسابات الحالي تجريبي (محلي) وليس مصادقة حقيقية */
export default function DemoAuthNotice() {
  const { t } = useLang();
  const { isDemoAuth } = useAuth();
  if (!isDemoAuth) return null;
  return (
    <div className="notice notice-demo" role="note">
      <Info size={18} aria-hidden="true" />
      <span>{t('auth.demo.notice')}</span>
    </div>
  );
}
