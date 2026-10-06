import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'accent' | 'excellent' | 'strong' | 'good' | 'partial';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return <span className={`badge badge-${tone} ${className}`.trim()}>{children}</span>;
}
