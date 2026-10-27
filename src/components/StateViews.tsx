import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

export function Loading({ label }: { label?: string }) {
  const { t } = useLang();
  return (
    <div className="state state-loading" role="status" aria-live="polite">
      <Loader2 className="spin" size={26} aria-hidden="true" />
      <span>{label ?? t('state.loading')}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="container page-loader">
      <Loading />
    </div>
  );
}

export function SkeletonGrid({ count = 6, className = 'grid grid-cards' }: { count?: number; className?: string }) {
  const { t } = useLang();
  return (
    <div className={className} role="status" aria-label={t('state.loading')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card" aria-hidden="true" />
      ))}
    </div>
  );
}

interface EmptyProps {
  title?: string;
  text?: string;
  action?: ReactNode;
}

export function EmptyState({ title, text, action }: EmptyProps) {
  const { t } = useLang();
  return (
    <div className="state state-empty">
      <Inbox size={34} aria-hidden="true" />
      <h3>{title ?? t('state.empty.title')}</h3>
      <p>{text ?? t('state.empty.text')}</p>
      {action}
    </div>
  );
}

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorProps) {
  const { t } = useLang();
  return (
    <div className="state state-error" role="alert">
      <AlertTriangle size={34} aria-hidden="true" />
      <h3>{t('state.error.title')}</h3>
      <p>{message ?? t('state.error.text')}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          {t('state.retry')}
        </button>
      )}
    </div>
  );
}
