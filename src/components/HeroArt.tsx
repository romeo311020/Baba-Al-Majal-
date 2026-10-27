import { asset } from '../utils/assets';

/** رسم الواجهة الرئيسية: ملعب بمنظور + أضواء + بطاقات رياضات عائمة (SVG أصلي) */
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 600 470" role="img" aria-hidden="true">
      <defs>
        <radialGradient id="ha-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#2f7bff" stopOpacity=".38" />
          <stop offset="1" stopColor="#2f7bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ha-pitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12306b" />
          <stop offset="1" stopColor="#0b1b44" />
        </linearGradient>
        <linearGradient id="ha-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity=".34" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="260" rx="300" ry="220" fill="url(#ha-glow)" />
      <path d="M90 0 L200 250 L120 250 Z" fill="url(#ha-beam)" />
      <path d="M510 0 L400 250 L480 250 Z" fill="url(#ha-beam)" />
      <path d="M60 420 L170 230 H430 L540 420 Z" fill="url(#ha-pitch)" stroke="#2f7bff" strokeOpacity=".55" strokeWidth="2" />
      <g fill="none" stroke="#7fb0ff" strokeOpacity=".55" strokeWidth="2">
        <path d="M115 325 H485" />
        <ellipse cx="300" cy="325" rx="64" ry="20" />
        <path d="M222 230 L206 262 H394 L378 230" />
        <path d="M262 230 L254 246 H346 L338 230" />
      </g>
      <g transform="translate(236 96)">
        <image href={asset('assets/brand/logo-mark.svg')} width="128" height="128" />
      </g>
      <g fontSize="26" textAnchor="middle">
        <g transform="translate(80 120)">
          <rect x="-30" y="-30" width="60" height="60" rx="16" fill="#0f1a33" stroke="#2f7bff" strokeOpacity=".5" />
          <text y="9">⚽</text>
        </g>
        <g transform="translate(530 150)">
          <rect x="-30" y="-30" width="60" height="60" rx="16" fill="#0f1a33" stroke="#22d3ee" strokeOpacity=".5" />
          <text y="9">🏀</text>
        </g>
        <g transform="translate(120 330)">
          <rect x="-28" y="-28" width="56" height="56" rx="16" fill="#0f1a33" stroke="#7c5cff" strokeOpacity=".5" />
          <text y="9">🎾</text>
        </g>
        <g transform="translate(490 340)">
          <rect x="-28" y="-28" width="56" height="56" rx="16" fill="#0f1a33" stroke="#f5b942" strokeOpacity=".5" />
          <text y="9">🏐</text>
        </g>
      </g>
    </svg>
  );
}
