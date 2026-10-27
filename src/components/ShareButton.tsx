import { Share2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface Props {
  title: string;
  withLabel?: boolean;
}

/** مشاركة الرابط الحالي: قائمة المشاركة الأصلية إن وُجدت، وإلا نسخ الرابط */
export default function ShareButton({ title, withLabel = true }: Props) {
  const { t } = useLang();
  const { show } = useToast();

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      show(t('share.copied'), 'success');
    } catch {
      show(t('share.failed'), 'error');
    }
  };

  return (
    <button type="button" className={`icon-btn ${withLabel ? 'with-label' : ''}`} onClick={onShare} aria-label={t('share.label')} title={t('share.label')}>
      <Share2 size={18} aria-hidden="true" />
      {withLabel && <span>{t('share.label')}</span>}
    </button>
  );
}
