/**
 * طبقة المصادقة.
 *
 * ⚠️ التنفيذ الحالي (localDemoAuth) تجريبي: يحفظ الاسم والبريد في localStorage فقط،
 * ولا يتحقق من كلمة المرور ولا يحفظها. لا تستخدمه في الإنتاج.
 *
 * للإنتاج: اكتب كائنًا آخر يطابق واجهة AuthProvider (مثال: Supabase Auth) ثم بدّل
 * `authProvider` أدناه — لا حاجة لتغيير أي صفحة. انظر README (قسم الحسابات).
 */
import type { AppUser, SportId } from '../types';
import { delay } from './config';

export interface AuthProvider {
  readonly isDemo: boolean;
  getSession(): AppUser | null;
  signIn(email: string, password: string): Promise<AppUser>;
  signUp(name: string, email: string, password: string): Promise<AppUser>;
  signOut(): Promise<void>;
  updateProfile(patch: Partial<Pick<AppUser, 'name' | 'favoriteSports'>>): Promise<AppUser>;
}

export class AuthError extends Error {
  code: 'exists' | 'not-found' | 'invalid' | 'no-session';
  constructor(code: AuthError['code']) {
    super(code);
    this.code = code;
  }
}

const USERS_KEY = 'yr_demo_users';
const SESSION_KEY = 'yr_demo_session';

function readUsers(): Record<string, AppUser> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}') as Record<string, AppUser>;
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, AppUser>) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* التخزين غير متاح */
  }
}

const normalize = (email: string) => email.trim().toLowerCase();

const localDemoAuth: AuthProvider = {
  isDemo: true,

  getSession() {
    try {
      const email = localStorage.getItem(SESSION_KEY);
      if (!email) return null;
      return readUsers()[email] ?? null;
    } catch {
      return null;
    }
  },

  async signIn(email, password) {
    await delay(350);
    if (!email || !password) throw new AuthError('invalid');
    const user = readUsers()[normalize(email)];
    if (!user) throw new AuthError('not-found');
    localStorage.setItem(SESSION_KEY, normalize(email));
    return user;
  },

  async signUp(name, email, password) {
    await delay(350);
    if (!name.trim() || !email || !password) throw new AuthError('invalid');
    const key = normalize(email);
    const users = readUsers();
    if (users[key]) throw new AuthError('exists');
    const user: AppUser = {
      id: `u-${Date.now().toString(36)}`,
      name: name.trim(),
      email: key,
      favoriteSports: [] as SportId[],
      createdAt: new Date().toISOString(),
    };
    users[key] = user;
    writeUsers(users);
    localStorage.setItem(SESSION_KEY, key);
    return user;
  },

  async signOut() {
    await delay(120);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },

  async updateProfile(patch) {
    await delay(200);
    const key = localStorage.getItem(SESSION_KEY);
    const users = readUsers();
    if (!key || !users[key]) throw new AuthError('no-session');
    users[key] = { ...users[key], ...patch };
    writeUsers(users);
    return users[key];
  },
};

export const authProvider: AuthProvider = localDemoAuth;
