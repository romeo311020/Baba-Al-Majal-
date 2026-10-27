import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** حالة مرتبطة بعنوان الصفحة (?key=value) كي تعمل الفلاتر مع الرجوع والتحديث والمشاركة */
export function useUrlState() {
  const [params, setParams] = useSearchParams();

  const get = useCallback((key: string, fallback = ''): string => params.get(key) ?? fallback, [params]);

  const set = useCallback(
    (patch: Record<string, string | null | undefined>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === null || v === undefined || v === '' || v === 'all') next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  return { get, set, params };
}
