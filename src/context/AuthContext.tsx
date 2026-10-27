import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AppUser } from '../types';
import { authProvider } from '../services/authService';

interface AuthContextValue {
  user: AppUser | null;
  /** true عندما يكون مزود المصادقة تجريبيًا (بلا تحقق حقيقي) */
  isDemoAuth: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<AppUser, 'name' | 'favoriteSports'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => authProvider.getSession());

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await authProvider.signIn(email, password));
  }, []);
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setUser(await authProvider.signUp(name, email, password));
  }, []);
  const signOut = useCallback(async () => {
    await authProvider.signOut();
    setUser(null);
  }, []);
  const updateProfile = useCallback(async (patch: Partial<Pick<AppUser, 'name' | 'favoriteSports'>>) => {
    setUser(await authProvider.updateProfile(patch));
  }, []);

  const value = useMemo(
    () => ({ user, isDemoAuth: authProvider.isDemo, signIn, signUp, signOut, updateProfile }),
    [user, signIn, signUp, signOut, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
