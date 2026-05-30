
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  RADIO_SELECTED_COLOR_CLASSES,
  SEMANTIC_COLOR_DOT_HEX,
  type SemanticColor,
} from '@/lib/theme/tokens';
import type { BadgeColor } from './EnumBadge';

export interface RadioOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: BadgeColor;
}

export interface RadioGroupProps {
  label?: string;
  labelIcon?: React.ReactNode;
  options: RadioOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  layout?: 'auto' | 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  showColorDot?: boolean;
  showCheck?: boolean;
  /** @deprecated Dùng layout thay direction */
  direction?: 'horizontal' | 'vertical';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  labelIcon,
  options,
  value,
  onChange,
  error,
  required,
  disabled = false,
  className,
  layout = 'auto',
  size = 'md',
  showColorDot = false,
  showCheck = false,
  direction,
}) => {
  const resolvedLayout = (() => {
    if (direction === 'vertical') return 'vertical';
    if (direction === 'horizontal') return 'horizontal';
    if (layout !== 'auto') return layout;
    return options.length <= 4 ? 'horizontal' : 'grid';
  })();

  const isSegmented = resolvedLayout === 'horizontal';
  const isGrid = resolvedLayout === 'grid';
  const isVertical = resolvedLayout === 'vertical';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-3.5 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 text-sm gap-2',
  };

  const containerClass = cn(
    isSegmented && 'inline-flex flex-wrap rounded-lg border border-border bg-muted/30 p-0.5 w-full',
    isSegmented && size === 'sm' && 'min-h-10 items-stretch',
    isGrid && 'grid grid-cols-2 gap-1.5',
    isVertical && 'flex flex-col gap-1.5',
    disabled && 'opacity-50 pointer-events-none',
  );

  const renderOption = (option: RadioOption) => {
    const isSelected = value === option.value;
    const color = option.color as SemanticColor | undefined;

    const selectedClasses = color
      ? cn(RADIO_SELECTED_COLOR_CLASSES[color] ?? RADIO_SELECTED_COLOR_CLASSES.slate, 'ring-1')
      : 'bg-background text-foreground shadow-sm border-border ring-1 ring-border/50';

    const unselectedClasses =
      'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent';

    return (
      <button
        key={option.value}
        type="button"
        onClick={() => !disabled && onChange(option.value)}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 select-none border',
          sizeClasses[size],
          isSegmented && 'flex-1 min-w-0',
          isSegmented && size === 'sm' && 'min-h-9',
          isSelected ? cn(selectedClasses, 'font-semibold') : unselectedClasses,
        )}
      >
        {showColorDot && color && (
          <span
            className="shrink-0 w-2 h-2 rounded-full transition-opacity duration-200"
            style={{
              backgroundColor: SEMANTIC_COLOR_DOT_HEX[color] ?? SEMANTIC_COLOR_DOT_HEX.slate,
              opacity: isSelected ? 1 : 0.4,
            }}
          />
        )}

        {!showColorDot && option.icon && (
          <span className={cn('shrink-0 transition-opacity', isSelected ? 'opacity-100' : 'opacity-50')}>
            {option.icon}
          </span>
        )}

        <span className="truncate">{option.label}</span>

        {showCheck && isSelected && (
          <Check size={13} className="shrink-0 ml-auto" strokeWidth={2.5} />
        )}
      </button>
    );
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="text-sm font-medium leading-none mb-1.5 flex items-center gap-1.5 text-foreground">
          {labelIcon && <span className="text-muted-foreground shrink-0">{labelIcon}</span>}
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={containerClass}>{options.map(renderOption)}</div>
      {error && <p className="text-xs font-medium text-destructive mt-1.5 ml-1">{error}</p>}
    </div>
  );
};

export default RadioGroup;
