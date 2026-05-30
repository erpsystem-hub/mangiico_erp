import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { txt } from '@/lib/text';

export interface StatsChartCardProps {
  title: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

const StatsChartCard: React.FC<StatsChartCardProps> = ({
  title,
  icon: Icon,
  iconClassName = 'text-primary',
  action,
  empty = false,
  emptyMessage,
  className,
  children,
}) => (
  <div className={cn('min-w-0 rounded-xl border border-border bg-card p-3.5', className)}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon size={14} className={cn('shrink-0', iconClassName)} aria-hidden />}
        <h3 className="truncate text-xs font-semibold text-foreground">{title}</h3>
      </div>
      {action}
    </div>
    {empty ? (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Inbox size={28} className="mb-2 text-muted-foreground/50" aria-hidden />
        <p className="text-xs text-muted-foreground">
          {emptyMessage ?? txt('employee.stats.noData')}
        </p>
      </div>
    ) : (
      children
    )}
  </div>
);

export default StatsChartCard;
