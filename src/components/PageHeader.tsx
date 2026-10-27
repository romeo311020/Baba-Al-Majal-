import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, eyebrow, children }: Props) {
  return (
    <header className="page-header">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="lead">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}
