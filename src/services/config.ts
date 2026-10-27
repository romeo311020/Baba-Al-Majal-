export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

/** demo = بيانات تجريبية من المشروع | live = من الخادم الوسيط (/api/sports/...) */
export const DATA_MODE: 'demo' | 'live' = import.meta.env.VITE_SPORTS_DATA_MODE === 'live' ? 'live' : 'demo';

export class ApiError extends Error {
  status?: number;
  /** true عند فشل الاتصال بالشبكة/الخادم نفسه (وليس رفضًا منه) */
  network: boolean;
  constructor(message: string, opts: { status?: number; network?: boolean } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.network = opts.network ?? false;
  }
}

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function apiFetch<T>(path: string, init: RequestInit = {}, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('network', { network: true });
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // الخادم غير موجود (استضافة ثابتة تُرجع HTML) — نعامله كفشل اتصال
    throw new ApiError('invalid-response', { status: res.status, network: true });
  }
  if (!res.ok) {
    const msg =
      json && typeof json === 'object' && 'error' in json && typeof (json as { error: unknown }).error === 'string'
        ? (json as { error: string }).error
        : `HTTP ${res.status}`;
    throw new ApiError(msg, { status: res.status });
  }
  return json as T;
}
