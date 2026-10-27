import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Bot, History, Plus, SendHorizontal, Trash2, User as UserIcon } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAiMode, sendChat, type AiMode, type ChatMessage } from '../services/aiApi';
import { asset } from '../utils/assets';
import PageHeader from '../components/PageHeader';

interface Conversation {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
}

const MAX_LEN = 1500;
const storeKey = (uid: string) => `yr_chats_${uid}`;

function loadChats(uid: string): Conversation[] {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey(uid)) ?? '[]') as Conversation[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const newId = () => `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export default function Assistant() {
  const { t, lang, dir } = useLang();
  const { user } = useAuth();
  useDocumentTitle(t('nav.assistant'));

  const uid = user?.id ?? null;
  const [chats, setChats] = useState<Conversation[]>(() => (uid ? loadChats(uid) : []));
  const [activeId, setActiveId] = useState<string>(() => newId());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AiMode | 'checking'>('checking');
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    abortedRef.current = false;
    getAiMode().then((m) => {
      if (!abortedRef.current) setMode(m);
    });
    return () => {
      abortedRef.current = true;
    };
  }, []);

  // عند تغيّر المستخدم نحمّل سجله
  useEffect(() => {
    setChats(uid ? loadChats(uid) : []);
    setMessages([]);
    setActiveId(newId());
  }, [uid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, busy]);

  const persist = useCallback(
    (id: string, msgs: ChatMessage[]) => {
      if (!uid || msgs.length === 0) return;
      setChats((prev) => {
        const first = msgs.find((m) => m.role === 'user')?.content ?? '';
        const entry: Conversation = { id, title: first.slice(0, 48), updatedAt: Date.now(), messages: msgs };
        const next = [entry, ...prev.filter((c) => c.id !== id)].slice(0, 30);
        try {
          localStorage.setItem(storeKey(uid), JSON.stringify(next));
        } catch {
          /* التخزين ممتلئ أو غير متاح */
        }
        return next;
      });
    },
    [uid],
  );

  const suggestions = useMemo(() => [t('ai.s1'), t('ai.s2'), t('ai.s3'), t('ai.s4')], [t]);

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_LEN);
    if (!content || busy) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await sendChat(next.slice(-20), lang);
      const withReply: ChatMessage[] = [...next, { role: 'assistant', content: res.reply }];
      setMessages(withReply);
      setMode(res.mode);
      persist(activeId, withReply);
    } catch (e) {
      const status = (e as { status?: number }).status;
      setError(status === 429 ? t('ai.error.rate') : t('ai.error.generic'));
      persist(activeId, next);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const startNew = () => {
    setMessages([]);
    setActiveId(newId());
    setError(null);
    setShowHistory(false);
  };

  const openChat = (c: Conversation) => {
    setMessages(c.messages);
    setActiveId(c.id);
    setError(null);
    setShowHistory(false);
  };

  const removeChat = (id: string) => {
    if (!uid) return;
    const next = chats.filter((c) => c.id !== id);
    setChats(next);
    try {
      localStorage.setItem(storeKey(uid), JSON.stringify(next));
    } catch {
      /* ignore */
    }
    if (id === activeId) startNew();
  };

  const retryLast = () => {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    if (!last) return;
    setMessages((m) => m.slice(0, m.lastIndexOf(last)));
    void send(last.content);
  };

  const modeLabel: Record<AiMode | 'checking', string> = {
    checking: t('ai.mode.checking'),
    live: t('ai.mode.live'),
    'demo-server': t('ai.mode.demoServer'),
    'offline-demo': t('ai.mode.offline'),
  };

  return (
    <>
      <PageHeader title="Yalla AI" subtitle={t('ai.sub')} />
      <div className="container">
        <div className={`ai-status ai-${mode}`} role="status">
          <span className="ai-dot" aria-hidden="true" />
          {modeLabel[mode]}
          {mode !== 'live' && mode !== 'checking' && <span className="muted small"> — {t('ai.mode.help')}</span>}
        </div>

        <div className="chat-shell">
          <aside className={`chat-side ${showHistory ? 'is-open' : ''}`} aria-label={t('ai.history')}>
            <button type="button" className="btn btn-primary btn-block" onClick={startNew}>
              <Plus size={16} aria-hidden="true" /> {t('ai.new')}
            </button>
            <h2 className="chat-side-title">
              <History size={16} aria-hidden="true" /> {t('ai.history')}
            </h2>
            {!user ? (
              <p className="muted small">
                {t('ai.history.login')} <Link to="/login">{t('nav.login')}</Link>
              </p>
            ) : chats.length === 0 ? (
              <p className="muted small">{t('ai.history.empty')}</p>
            ) : (
              <ul className="chat-list">
                {chats.map((c) => (
                  <li key={c.id} className={c.id === activeId ? 'is-active' : ''}>
                    <button type="button" onClick={() => openChat(c)}>
                      {c.title || t('ai.new')}
                    </button>
                    <button type="button" className="icon-btn" aria-label={t('ai.delete')} onClick={() => removeChat(c.id)}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="chat-main" aria-label="Yalla AI">
            <div className="chat-toolbar">
              <button type="button" className="btn btn-ghost chat-history-toggle" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory}>
                <History size={16} aria-hidden="true" /> {t('ai.history')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={startNew}>
                <Plus size={16} aria-hidden="true" /> {t('ai.new')}
              </button>
            </div>

            <div className="chat-log" role="log" aria-live="polite" aria-relevant="additions">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <img src={asset('assets/brand/logo-mark.svg')} alt="" width={56} height={56} />
                  <h2>{t('ai.welcome.title')}</h2>
                  <p className="muted">{t('ai.welcome.text')}</p>
                  <div className="suggestions">
                    {suggestions.map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => void send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.role}`}>
                  <span className="msg-avatar" aria-hidden="true">
                    {m.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </span>
                  <div className="msg-bubble" dir="auto">
                    <span className="sr-only">{m.role === 'user' ? t('ai.you') : 'Yalla AI'}: </span>
                    {m.content}
                  </div>
                </div>
              ))}

              {busy && (
                <div className="msg msg-assistant" role="status" aria-label={t('ai.thinking')}>
                  <span className="msg-avatar" aria-hidden="true">
                    <Bot size={16} />
                  </span>
                  <div className="msg-bubble typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              )}

              {error && (
                <div className="notice notice-error" role="alert">
                  <AlertTriangle size={18} aria-hidden="true" />
                  <span>{error}</span>
                  <button type="button" className="btn btn-ghost" onClick={retryLast}>
                    {t('state.retry')}
                  </button>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form className="chat-form" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="chat-input">
                {t('ai.placeholder')}
              </label>
              <textarea
                id="chat-input"
                dir="auto"
                rows={1}
                value={input}
                maxLength={MAX_LEN}
                placeholder={t('ai.placeholder')}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}
              />
              <button type="submit" className="btn btn-primary send-btn" disabled={busy || !input.trim()} aria-label={t('ai.send')}>
                <SendHorizontal size={18} className="icon-dir" aria-hidden="true" />
              </button>
            </form>
            <p className="muted small chat-disclaimer">{t('ai.disclaimer')}</p>
          </section>
        </div>
      </div>
    </>
  );
}
