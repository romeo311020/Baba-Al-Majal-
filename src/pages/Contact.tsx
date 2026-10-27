import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ApiError } from '../services/config';
import { sendContact } from '../services/contactApi';
import PageHeader from '../components/PageHeader';

export default function Contact() {
  const { t } = useLang();
  useDocumentTitle(t('nav.contact'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await sendContact({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      // لا نُظهر "تم الإرسال" إلا بعد تأكيد الخادم فعلًا
      setError(err instanceof ApiError && err.network ? t('contact.error.noserver') : t('contact.error.generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title={t('contact.title')} subtitle={t('contact.sub')} />
      <div className="container narrow-page">
        {sent ? (
          <div className="card center-text" role="status">
            <CheckCircle2 size={40} className="ok-icon" aria-hidden="true" />
            <h2>{t('contact.sent.title')}</h2>
            <p className="muted">{t('contact.sent.text')}</p>
            <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>
              {t('contact.another')}
            </button>
          </div>
        ) : (
          <form className="card" onSubmit={onSubmit}>
            <label className="field">
              <span>{t('auth.name')}</span>
              <input type="text" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="field">
              <span>{t('auth.email')}</span>
              <input type="email" required maxLength={120} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" dir="ltr" />
            </label>
            <label className="field">
              <span>{t('contact.message')}</span>
              <textarea required rows={6} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} dir="auto" />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? t('state.loading') : t('contact.send')}
            </button>
            <p className="muted small">{t('contact.note')}</p>
          </form>
        )}
      </div>
    </>
  );
}
