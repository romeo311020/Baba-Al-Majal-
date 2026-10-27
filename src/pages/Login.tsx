import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AuthError } from '../services/authService';
import DemoAuthNotice from '../components/DemoAuthNotice';
import Logo from '../components/Logo';

export default function Login() {
  const { t } = useLang();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle(t('nav.login'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/profile" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
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
        <h1>{t('auth.login.title')}</h1>
        <DemoAuthNotice />
        <form onSubmit={onSubmit} noValidate={false}>
          <label className="field">
            <span>{t('auth.email')}</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </label>
          <label className="field">
            <span>{t('auth.password')}</span>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? t('state.loading') : t('auth.login.submit')}
          </button>
        </form>
        <p className="muted center-text">
          {t('auth.noaccount')} <Link to="/register">{t('nav.register')}</Link>
        </p>
      </div>
    </div>
  );
}
