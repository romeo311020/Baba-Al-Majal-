import type { Team } from '../types';

/**
 * شارة فريق مولَّدة (اختصار + لون) — لا نستخدم شعارات الأندية الحقيقية.
 * عند ربط مصدر بيانات مرخّص يمكن استبدالها بصورة الشعار الرسمي.
 */
export default function TeamBadge({ team, size = 44 }: { team: Team; size?: number }) {
  return (
    <span
      className="team-badge"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.3),
        background: `linear-gradient(135deg, ${team.color}, color-mix(in srgb, ${team.color} 45%, #0b1224))`,
      }}
    >
      {team.short}
    </span>
  );
}
