import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Bi, Match } from '../types';
import { useLang } from './LanguageContext';

export interface Reminder {
  matchId: string;
  kickoff: string;
  home: Bi;
  away: Bi;
  fired: boolean;
}

export interface AppNotification {
  id: string;
  type: 'welcome' | 'reminder';
  createdAt: string;
  read: boolean;
  matchId?: string;
  home?: Bi;
  away?: Bi;
}

export interface NotificationPrefs {
  matchReminders: boolean;
  newsAlerts: boolean;
  /** قبل بداية المباراة بكم دقيقة يصل التنبيه */
  leadMinutes: number;
}

interface Stored {
  reminders: Reminder[];
  notifications: AppNotification[];
  prefs: NotificationPrefs;
  welcomed: boolean;
}

const KEY = 'yr_notifications';
const defaults = (): Stored => ({
  reminders: [],
  notifications: [],
  prefs: { matchReminders: true, newsAlerts: true, leadMinutes: 15 },
  welcomed: false,
});

function read(): Stored {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Stored> | null;
    const d = defaults();
    if (!raw) return d;
    return {
      reminders: Array.isArray(raw.reminders) ? raw.reminders : d.reminders,
      notifications: Array.isArray(raw.notifications) ? raw.notifications : d.notifications,
      prefs: { ...d.prefs, ...(raw.prefs ?? {}) },
      welcomed: !!raw.welcomed,
    };
  } catch {
    return defaults();
  }
}

type BrowserPermission = 'unsupported' | 'default' | 'granted' | 'denied';

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  prefs: NotificationPrefs;
  setPrefs: (patch: Partial<NotificationPrefs>) => void;
  hasReminder: (matchId: string) => boolean;
  /** يعيد true إذا أصبح التذكير مفعّلًا */
  toggleReminder: (match: Match) => boolean;
  markAllRead: () => void;
  clearAll: () => void;
  browserPermission: BrowserPermission;
  requestBrowserPermission: () => Promise<BrowserPermission>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function currentPermission(): BrowserPermission {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as BrowserPermission;
}

/**
 * تذكيرات المباريات تعمل ما دام الموقع مفتوحًا في المتصفح (فحص كل 20 ثانية).
 * التنبيهات الخلفية (والموقع مغلق) تحتاج Web Push + خادم — انظر README.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { t, tr } = useLang();
  const [state, setState] = useState<Stored>(read);
  const [permission, setPermission] = useState<BrowserPermission>(currentPermission);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  // إشعار ترحيبي مرة واحدة
  useEffect(() => {
    setState((s) =>
      s.welcomed
        ? s
        : {
            ...s,
            welcomed: true,
            notifications: [
              { id: 'welcome', type: 'welcome', createdAt: new Date().toISOString(), read: false },
              ...s.notifications,
            ],
          },
    );
  }, []);

  // فحص التذكيرات
  useEffect(() => {
    const check = () => {
      const s = stateRef.current;
      if (!s.prefs.matchReminders) return;
      const now = Date.now();
      const due: Reminder[] = [];
      const stale: string[] = [];
      for (const r of s.reminders) {
        if (r.fired) continue;
        const k = new Date(r.kickoff).getTime();
        if (now > k + 3 * 3600_000) stale.push(r.matchId);
        else if (now >= k - s.prefs.leadMinutes * 60_000) due.push(r);
      }
      if (!due.length && !stale.length) return;
      const dueIds = new Set(due.map((d) => d.matchId));
      const staleIds = new Set(stale);
      setState((prev) => ({
        ...prev,
        reminders: prev.reminders.map((r) => (dueIds.has(r.matchId) || staleIds.has(r.matchId) ? { ...r, fired: true } : r)),
        notifications: [
          ...due.map<AppNotification>((r) => ({
            id: `rem-${r.matchId}-${Date.now()}`,
            type: 'reminder',
            createdAt: new Date().toISOString(),
            read: false,
            matchId: r.matchId,
            home: r.home,
            away: r.away,
          })),
          ...prev.notifications,
        ],
      }));
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        for (const r of due) {
          try {
            new Notification(t('notif.reminder.title'), {
              body: t('notif.reminder.text', { home: tr(r.home), away: tr(r.away) }),
              icon: './assets/brand/icon-192.png',
            });
          } catch {
            /* بعض المتصفحات تمنع الإنشاء المباشر */
          }
        }
      }
    };
    check();
    const id = window.setInterval(check, 20_000);
    return () => window.clearInterval(id);
  }, [t, tr]);

  const setPrefs = useCallback((patch: Partial<NotificationPrefs>) => {
    setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
  }, []);

  const hasReminder = useCallback((matchId: string) => state.reminders.some((r) => r.matchId === matchId && !r.fired), [state.reminders]);

  const toggleReminder = useCallback(
    (match: Match) => {
      const exists = stateRef.current.reminders.some((r) => r.matchId === match.id && !r.fired);
      setState((s) => ({
        ...s,
        reminders: exists
          ? s.reminders.filter((r) => r.matchId !== match.id)
          : [
              ...s.reminders.filter((r) => r.matchId !== match.id),
              { matchId: match.id, kickoff: match.kickoff, home: match.home.name, away: match.away.name, fired: false },
            ],
      }));
      return !exists;
    },
    [],
  );

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const clearAll = useCallback(() => {
    setState((s) => ({ ...s, notifications: [] }));
  }, []);

  const requestBrowserPermission = useCallback(async (): Promise<BrowserPermission> => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const p = (await Notification.requestPermission()) as BrowserPermission;
    setPermission(p);
    return p;
  }, []);

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications: state.notifications,
      unreadCount,
      prefs: state.prefs,
      setPrefs,
      hasReminder,
      toggleReminder,
      markAllRead,
      clearAll,
      browserPermission: permission,
      requestBrowserPermission,
    }),
    [state.notifications, unreadCount, state.prefs, setPrefs, hasReminder, toggleReminder, markAllRead, clearAll, permission, requestBrowserPermission],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}
