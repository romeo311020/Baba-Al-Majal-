import { Suspense, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import ErrorBoundary from '../components/ErrorBoundary';
import { PageLoader } from '../components/StateViews';
import { useLang } from '../context/LanguageContext';

export default function MainLayout() {
  const { pathname } = useLocation();
  const { t } = useLang();
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="app-shell">
      {/* رابط التخطي: زر (وليس #anchor) لأن المسارات تستخدم # مع HashRouter */}
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        {t('a11y.skip')}
      </button>
      <ScrollToTop />
      <Header />
      <main id="main" ref={mainRef} tabIndex={-1} className="page" key={pathname}>
        {/* ErrorBoundary داخل key المسار: خطأ في صفحة لا يعطّل الصفحات الأخرى */}
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
