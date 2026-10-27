import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  status: 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
}

/**
 * يجلب بيانات غير متزامنة مع حالات loading/success/error وإعادة المحاولة.
 * أعد استدعاء الدالة عند تغيّر أي عنصر في deps.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ status: 'loading', data: s.data }));
    fnRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: 'error', error: err instanceof Error ? err : new Error(String(err)) });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}
