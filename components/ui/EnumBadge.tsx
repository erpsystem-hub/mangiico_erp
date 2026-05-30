import React from 'react';
import { cn } from '../../lib/utils';
import { BADGE_COLOR_CLASSES, type SemanticColor } from '@/lib/theme/tokens';

export type BadgeColor = SemanticColor;

export interface BadgeConfigItem {
  label: string;
  color: BadgeColor;
  icon?: React.ReactNode;
}

export type BadgeConfig<T extends string | number = string | number> = Record<T, BadgeConfigItem>;

export type EnumBadgeShape = 'pill' | 'rounded';

export interface EnumBadgeProps {
  value: string | number | undefined | null;
  config: BadgeConfig<string | number>;
  fallbackLabel?: string;
  className?: string;
  shape?: EnumBadgeShape;
  truncate?: boolean;
}

const EnumBadge: React.FC<EnumBadgeProps> = ({
  value,
  config,
  fallbackLabel = '—',
  className,
  shape = 'pill',
  truncate = false,
}) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const item = config[value];
  const label = item?.label ?? fallbackLabel;
  const colorClasses = item
    ? BADGE_COLOR_CLASSES[item.color] ?? BADGE_COLOR_CLASSES.slate
    : BADGE_COLOR_CLASSES.slate;
  const labelStr = String(label);

  return (
    <span
      title={truncate ? labelStr : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border transition-colors',
        shape === 'pill' ? 'rounded-full' : 'rounded-md',
        truncate && 'max-w-full min-w-0',
        colorClasses,
        className,
      )}
    >
      {item?.icon != null && <span className="shrink-0">{item.icon}</span>}
      <span className={cn(truncate && 'min-w-0 truncate')}>{labelStr}</span>
    </span>
  );
};

export default EnumBadge;
