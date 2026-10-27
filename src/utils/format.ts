import type { Lang } from '../types';

export const localeFor = (lang: Lang) => (lang === 'ar' ? 'ar-EG' : 'en-GB');

export function formatPrice(amount: number, currency: string, lang: Lang): string {
  try {
    return new Intl.NumberFormat(localeFor(lang), { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(localeFor(lang), { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function formatDateLong(iso: string | Date, lang: Lang): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(localeFor(lang), { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

export function formatDateShort(iso: string | Date, lang: Lang): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(localeFor(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

export function formatCompact(n: number, lang: Lang): string {
  return new Intl.NumberFormat(localeFor(lang), { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}
