import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type FavKind = 'matches' | 'news' | 'products' | 'teams' | 'players';
export const FAV_KINDS: FavKind[] = ['matches', 'news', 'products', 'teams', 'players'];

type FavState = Record<FavKind, string[]>;

const KEY = 'yr_favorites';
const empty = (): FavState => ({ matches: [], news: [], products: [], teams: [], players: [] });

function read(): FavState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<FavState> | null;
    const base = empty();
    if (raw && typeof raw === 'object') {
      for (const k of FAV_KINDS) if (Array.isArray(raw[k])) base[k] = raw[k]!.filter((x) => typeof x === 'string');
    }
    return base;
  } catch {
    return empty();
  }
}

interface FavoritesContextValue {
  favorites: FavState;
  has: (kind: FavKind, id: string) => boolean;
  toggle: (kind: FavKind, id: string) => boolean;
  total: number;
  clearAll: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/**
 * المفضلة محفوظة محليًا في المتصفح (localStorage).
 * عند ربط حسابات حقيقية تُزامَن مع قاعدة البيانات عبر طبقة services.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavState>(read);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(favorites));
    } catch {
      /* ignore */
    }
  }, [favorites]);

  const has = useCallback((kind: FavKind, id: string) => favorites[kind].includes(id), [favorites]);

  const toggle = useCallback(
    (kind: FavKind, id: string) => {
      const exists = favorites[kind].includes(id);
      setFavorites((prev) => ({
        ...prev,
        [kind]: exists ? prev[kind].filter((x) => x !== id) : [...prev[kind], id],
      }));
      return !exists;
    },
    [favorites],
  );

  const clearAll = useCallback(() => setFavorites(empty()), []);

  const total = FAV_KINDS.reduce((n, k) => n + favorites[k].length, 0);
  const value = useMemo(() => ({ favorites, has, toggle, total, clearAll }), [favorites, has, toggle, total, clearAll]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
