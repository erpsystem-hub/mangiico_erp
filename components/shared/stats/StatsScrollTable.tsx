import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatsTableScrollMaxHeight } from './table-scroll';

export interface StatsTableColumn<Row> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  minWidthClass?: string;
  render: (row: Row) => React.ReactNode;
}

export interface StatsScrollTableProps<Row> {
  columns: StatsTableColumn<Row>[];
  rows: Row[];
  keyExtractor: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  maxVisibleRows?: number;
  ariaLabel: string;
  title?: string;
  icon?: LucideIcon;
  className?: string;
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

function StatsScrollTable<Row>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  maxVisibleRows = 10,
  ariaLabel,
  title,
  icon: Icon,
  className,
}: StatsScrollTableProps<Row>) {
  const stickyCol = columns.find((c) => c.sticky);

  return (
    <div className={cn('min-w-0 max-w-full overflow-hidden rounded-xl border border-border bg-card', className)}>
      {title && (
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-primary" aria-hidden />}
            <h3 className="text-xs font-semibold text-foreground">{title}</h3>
          </div>
        </div>
      )}
      <div
        className="max-w-full min-w-0 w-full overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-x touch-pan-y custom-scrollbar rounded-b-xl"
        style={{ maxHeight: getStatsTableScrollMaxHeight(maxVisibleRows) }}
        role="region"
        aria-label={ariaLabel}
      >
        <table className="w-full min-w-[32rem] border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-[4] border-b border-border bg-muted px-3 py-2 font-medium text-muted-foreground',
                    col.sticky && 'left-0 z-[5] border-r',
                    col.minWidthClass,
                    stickyCol?.key === col.key && 'min-w-[9rem] max-w-[14rem] px-4',
                    alignClass[col.align ?? 'left'],
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = keyExtractor(row);
              const clickable = Boolean(onRowClick);
              return (
                <tr
                  key={key}
                  className={cn(
                    'group border-b border-border/50 transition-colors hover:bg-muted/20',
                    clickable && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-3 py-2 group-hover:bg-muted/20',
                        col.sticky &&
                          'sticky left-0 z-[2] border-r border-border bg-card font-medium text-foreground group-hover:bg-muted/20',
                        col.sticky && 'max-w-[14rem] truncate px-4 sm:max-w-none sm:whitespace-normal',
                        alignClass[col.align ?? 'left'],
                        !col.sticky && 'tabular-nums',
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StatsScrollTable;
