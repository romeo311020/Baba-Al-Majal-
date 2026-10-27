import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
  to?: string;
  linkLabel?: string;
}

export default function SectionHeader({ title, subtitle, to, linkLabel }: Props) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {to && linkLabel && (
        <Link to={to} className="link-more">
          {linkLabel}
          <ArrowRight size={16} className="icon-dir" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
