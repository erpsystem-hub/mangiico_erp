import React from 'react';

/** Props tương thích Recharts Tooltip (active, payload, label) */
export interface ChartTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadItem[];
  label?: string;
  /** Tổng để hiển thị phần trăm (tuỳ chọn) */
  total?: number;
  valueFormatter?: (value: number) => string;
}

const defaultFormat = (n: number) => n.toLocaleString('vi-VN');

const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active: isActive,
  payload,
  label,
  total,
  valueFormatter = defaultFormat,
}) => {
  if (!isActive || !payload?.length) return null;

  const computedTotal =
    total ??
    payload.reduce((sum, p) => sum + (typeof p.value === 'number' ? p.value : 0), 0);

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label != null && label !== '' && (
        <p className="mb-1 font-medium text-foreground">{label}</p>
      )}
      {payload.map((p, i) => {
        const val = typeof p.value === 'number' ? p.value : 0;
        const pct =
          computedTotal > 0 ? ` (${((val / computedTotal) * 100).toFixed(1)}%)` : '';
        return (
          <p key={i} className="text-muted-foreground">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color ?? p.fill }}
            />
            {p.name}:{' '}
            <span className="font-semibold text-foreground">
              {valueFormatter(val)}
              {pct}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export default ChartTooltip;
