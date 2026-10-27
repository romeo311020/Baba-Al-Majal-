import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Bi, Lang } from '../types';
import { dictionaries } from '../i18n';
import { localeFor } from '../utils/format';

const KEY = 'yr_lang';

interface LanguageContextValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  locale: string;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  /** ترجمة مفتاح من القاموس مع متغيرات {name} */
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** اختيار النص المناسب من كائن ثنائي اللغة */
  tr: (b: Bi) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitial(): Lang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch {
    /* ignore */
  }
  return 'ar';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLang = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(() => {
    const dict = dictionaries[lang];
    const t = (key: string, vars?: Record<string, string | number>) => {
      let s = dict[key];
      if (s === undefined) {
        if (import.meta.env.DEV) console.warn(`[i18n] missing key: ${key}`);
        return key;
      }
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
      return s;
    };
    return {
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      locale: localeFor(lang),
      setLang,
      toggleLang,
      t,
      tr: (b: Bi) => b[lang],
    };
  }, [lang, setLang, toggleLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
