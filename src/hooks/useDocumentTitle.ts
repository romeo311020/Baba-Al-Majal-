import { useEffect } from 'react';

const BASE = 'يلا رياضة | YALLA RIYADA';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : BASE;
  }, [title]);
}
