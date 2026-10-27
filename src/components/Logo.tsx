import { Link } from 'react-router-dom';
import { asset } from '../utils/assets';
import { useLang } from '../context/LanguageContext';

interface Props {
  size?: number;
  hideText?: boolean;
  onClick?: () => void;
}

/** الشعار الفعلي للمنصة: الرمز من public/assets/brand + اسم نصي بخطوط الموقع */
export default function Logo({ size = 40, hideText = false, onClick }: Props) {
  const { t } = useLang();
  return (
    <Link to="/" className="logo" aria-label={t('brand.aria')} onClick={onClick}>
      <img src={asset('assets/brand/logo-mark.svg')} alt="" width={size} height={size} />
      {!hideText && (
        <span className="logo-text">
          <strong lang="ar">يلا رياضة</strong>
          <small lang="en">YALLA RIYADA</small>
        </span>
      )}
    </Link>
  );
}
