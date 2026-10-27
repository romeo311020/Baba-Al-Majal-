import { useLang } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageHeader from '../components/PageHeader';

const SECTIONS = ['1', '2', '3', '4', '5'];

/** ⚠️ مسودة عامة للتوضيح وليست استشارة قانونية — راجعها مع مختص قبل الإطلاق */
export default function Terms() {
  const { t } = useLang();
  useDocumentTitle(t('nav.terms'));
  return (
    <>
      <PageHeader title={t('terms.title')} subtitle={t('legal.draft')} />
      <div className="container prose">
        <p className="notice notice-demo">{t('legal.draft.note')}</p>
        {SECTIONS.map((s) => (
          <section key={s}>
            <h2>{t(`terms.s${s}.title`)}</h2>
            <p>{t(`terms.s${s}.text`)}</p>
          </section>
        ))}
      </div>
    </>
  );
}
