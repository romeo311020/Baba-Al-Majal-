import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AuthError } from '../services/authService';
import DemoAuthNotice from '../components/DemoAuthNotice';
import Logo from '../components/Logo';

export default function Register() {
  const { t } = useLang();
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle(t('nav.register'));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/profile" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t('auth.error.weak'));
      return;
    }
    setBusy(true);
    try {
      await signUp(name, email, password);
      navigate('/profile', { replace: true });
    } catch (err) {
      const code = err instanceof AuthError ? err.code : 'generic';
      setError(t(`auth.error.${code}`));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <Logo />
        <h1>{t('auth.register.title')}</h1>
        <DemoAuthNotice />
        <form onSubmit={onSubmit}>
          <label className="field">
            <span>{t('auth.name')}</span>
            <input type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </label>
          <label className="field">
            <span>{t('auth.email')}</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </label>
          <label className="field">
            <span>{t('auth.password')}</span>
            <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
            <small className="muted">{t('auth.password.hint')}</small>
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? t('state.loading') : t('auth.register.submit')}
          </button>
          <p className="muted small">
            {t('auth.agree')} <Link to="/terms">{t('nav.terms')}</Link> · <Link to="/privacy">{t('nav.privacy')}</Link>
          </p>
        </form>
        <p className="muted center-text">
          {t('auth.hasaccount')} <Link to="/login">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
}
