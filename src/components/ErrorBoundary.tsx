import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

function Fallback({ onReset }: { onReset: () => void }) {
  const { t } = useLang();
  return (
    <div className="container">
      <div className="state state-error" role="alert">
        <AlertTriangle size={36} aria-hidden="true" />
        <h2>{t('boundary.title')}</h2>
        <p>{t('boundary.text')}</p>
        <div className="row gap">
          <button type="button" className="btn btn-primary" onClick={onReset}>
            {t('boundary.reload')}
          </button>
          <a className="btn btn-secondary" href="./">
            {t('boundary.home')}
          </a>
        </div>
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
}
interface State {
  failed: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return <Fallback onReset={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}
