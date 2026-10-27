import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageHeader from '../components/PageHeader';

export default function About() {
  const { t } = useLang();
  useDocumentTitle(t('nav.about'));
  const values = ['1', '2', '3'];

  return (
    <>
      <PageHeader title={t('about.title')} subtitle={t('brand.tagline')} />
      <div className="container prose">
        <p className="lead">{t('about.intro')}</p>
        <h2>{t('about.mission.title')}</h2>
        <p>{t('about.mission.text')}</p>
        <h2>{t('about.values.title')}</h2>
        <ul>
          {values.map((v) => (
            <li key={v}>
              <strong>{t(`about.value.${v}.title`)}</strong> — {t(`about.value.${v}.text`)}
            </li>
          ))}
        </ul>
        <h2>{t('about.status.title')}</h2>
        <p>{t('about.status.text')}</p>
        <p>
          <Link to="/contact" className="btn btn-primary">
            {t('nav.contact')}
          </Link>
        </p>
      </div>
    </>
  );
}
