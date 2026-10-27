import type { ReactNode } from 'react';
import type { AsyncState } from '../hooks/useAsync';
import { EmptyState, ErrorState, Loading } from './StateViews';
import { ApiError } from '../services/config';
import { useLang } from '../context/LanguageContext';

interface Props<T> {
  state: AsyncState<T> & { reload: () => void };
  children: (data: T) => ReactNode;
  /** يحدد متى تُعتبر البيانات فارغة */
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyText?: string;
  skeleton?: ReactNode;
}

/** يعرض حالات التحميل والخطأ والفراغ بشكل موحّد حول أي طلب بيانات */
export function Async<T>({ state, children, isEmpty, emptyTitle, emptyText, skeleton }: Props<T>) {
  const { t } = useLang();

  if (state.status === 'error') {
    const e = state.error;
    const msg = e instanceof ApiError && e.network ? t('state.error.network') : undefined;
    return <ErrorState message={msg} onRetry={state.reload} />;
  }
  if (state.data === undefined) {
    return <>{skeleton ?? <Loading />}</>;
  }
  if (isEmpty?.(state.data)) {
    return <EmptyState title={emptyTitle} text={emptyText} />;
  }
  return (
    <div aria-busy={state.status === 'loading'} className={state.status === 'loading' ? 'is-refreshing' : undefined}>
      {children(state.data)}
    </div>
  );
}
