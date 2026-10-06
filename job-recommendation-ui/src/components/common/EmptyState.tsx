import type { ReactNode } from 'react';
import { InboxIcon } from './Icons';

type EmptyStateProps = {
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="state-card">
      <span className="state-icon">
        <InboxIcon />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
