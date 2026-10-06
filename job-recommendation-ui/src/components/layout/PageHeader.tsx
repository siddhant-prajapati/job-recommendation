import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../common/Icons';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      {backTo ? (
        <Link to={backTo} className="back-link">
          <ArrowLeftIcon />
          {backLabel}
        </Link>
      ) : null}
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
    </header>
  );
}
