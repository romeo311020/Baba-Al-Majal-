import type { CSSProperties } from 'react';
import type { SportId } from '../types';
import { getSport } from '../data/sports';

interface Props {
  sport: SportId | 'multi';
  className?: string;
}

/**
 * رسم أصلي مولَّد (تدرّج + خطوط ملعب + رمز الرياضة) يُستخدم مكان الصور
 * إلى أن تُربط صور مرخّصة. لا توجد صور فوتوغرافية في المشروع.
 */
export default function SportArt({ sport, className = '' }: Props) {
  const s = sport === 'multi' ? undefined : getSport(sport);
  const style = { '--accent': s?.accent ?? '#2f7bff' } as CSSProperties;
  return (
    <div className={`sport-art ${className}`} style={style} aria-hidden="true">
      <svg className="sport-art-lines" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <circle cx="100" cy="60" r="34" />
        <circle cx="100" cy="60" r="3" />
        <path d="M100 0 V120" />
        <path d="M0 24 H34 V96 H0" />
        <path d="M200 24 H166 V96 H200" />
      </svg>
      <span className="sport-art-emoji">{s?.emoji ?? '🏅'}</span>
    </div>
  );
}
