import React, { useState, useMemo } from 'react';
import { txt } from '@/lib/text';
import { Briefcase, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  LabelList, ReferenceLine, Sector,
} from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import ChartTooltip from '@/components/ui/ChartTooltip';
import StatsChartCard from '@/components/shared/stats/StatsChartCard';
import ColoredBar from '@/components/shared/stats/ColoredBar';

export interface EmployeeStatsChartsProps {
  chartsVisible: boolean;
  chartHeight: number;
  isMdUp: boolean;
  primaryHex: string;
  deptData: Array<{ name: string; value: number }>;
  statusData: Array<{ name: string; value: number; fill: string; key?: string }>;
  accountTrendData: Array<{ label: string; count: number }>;
  positionData: Array<{ name: string; value: number; fill: string }>;
  DEPT_COLORS: string[];
  deptIdByName: Record<string, string>;
  onDrillDownDept?: (deptId: string) => void;
  onDrillDownStatus?: (status: string) => void;
}

const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={(outerRadius as number) + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
};

const renderPieShape =
  (activeIndex: number | undefined) =>
  (props: PieSectorDataItem & { index?: number }) => {
    if (props.index === activeIndex) return renderActiveShape(props);
    return <Sector {...props} />;
  };

const DonutCenterLabel: React.FC<{ viewBox?: { cx?: number; cy?: number }; total: number }> = ({
  viewBox,
  total,
}) => {
  const cx = viewBox?.cx ?? 0;
  const cy = viewBox?.cy ?? 0;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.4em" className="fill-muted-foreground" fontSize={10}>
        {txt('employee.stats.total')}
      </tspan>
      <tspan x={cx} dy="1.4em" className="fill-foreground" fontSize={14} fontWeight={600}>
        {total.toLocaleString('vi-VN')}
      </tspan>
    </text>
  );
};

const EmployeeStatsCharts: React.FC<EmployeeStatsChartsProps> = ({
  chartsVisible,
  chartHeight,
  isMdUp,
  primaryHex,
  deptData,
  statusData,
  accountTrendData,
  positionData,
  DEPT_COLORS,
  deptIdByName,
  onDrillDownDept,
  onDrillDownStatus,
}) => {
  const [activeDeptIndex, setActiveDeptIndex] = useState<number | undefined>();
  const [activePositionIndex, setActivePositionIndex] = useState<number | undefined>();

  const deptTotal = useMemo(
    () => deptData.reduce((s, d) => s + d.value, 0),
    [deptData],
  );
  const positionTotal = useMemo(
    () => positionData.reduce((s, d) => s + d.value, 0),
    [positionData],
  );
  const trendAvg = useMemo(() => {
    if (accountTrendData.length === 0) return 0;
    const sum = accountTrendData.reduce((s, d) => s + d.count, 0);
    return Math.round((sum / accountTrendData.length) * 10) / 10;
  }, [accountTrendData]);
  const statusTotal = useMemo(
    () => statusData.reduce((s, d) => s + d.value, 0),
    [statusData],
  );

  if (!chartsVisible) return null;

  const legendWithPercent = (value: string, entry: { color?: string; payload?: { value?: number } }) => {
    const val = entry.payload?.value ?? 0;
    const total = deptTotal || positionTotal || statusTotal;
    const pct = total > 0 ? ` (${((val / total) * 100).toFixed(0)}%)` : '';
    return (
      <span className="text-caption text-muted-foreground">
        {value}
        {pct}
      </span>
    );
  };

  return (
    <div className="space-y-2">
      {(onDrillDownDept || onDrillDownStatus) && (
        <p className="px-0.5 text-[11px] leading-snug text-muted-foreground">
          {txt('employee.stats.chartDrillDownHint')}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <StatsChartCard
          title={txt('employee.stats.departmentChart')}
          icon={PieChartIcon}
          empty={deptData.length === 0}
        >
          {deptData.length > 0 && (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={38}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  shape={renderPieShape(activeDeptIndex)}
                  onMouseEnter={(_, i) => setActiveDeptIndex(i)}
                  onMouseLeave={() => setActiveDeptIndex(undefined)}
                  onClick={(data: { name: string }) => {
                    const id = deptIdByName[data.name];
                    if (id && onDrillDownDept) onDrillDownDept(id);
                  }}
                  style={{ cursor: onDrillDownDept ? 'pointer' : 'default' }}
                  label={false}
                >
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                  <LabelList
                    content={<DonutCenterLabel total={deptTotal} />}
                    position="center"
                  />
                </Pie>
                <Tooltip content={<ChartTooltip total={deptTotal} />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value, entry) => legendWithPercent(value, entry as { color?: string; payload?: { value?: number } })}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </StatsChartCard>

        <StatsChartCard
          title={txt('employee.stats.statusChart')}
          icon={BarChart3}
          empty={statusData.every((d) => d.value === 0)}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={statusData} barSize={isMdUp ? 32 : 28}>
              <defs>
                {statusData.map((entry, i) => (
                  <linearGradient key={i} id={`statusGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.fill} stopOpacity={0.65} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip content={<ChartTooltip total={statusTotal} />} />
              <ColoredBar
                data={statusData}
                dataKey="value"
                radius={[6, 6, 0, 0]}
                name={txt('employee.stats.quantity')}
                getFill={(_, i) => `url(#statusGrad-${i})`}
                onClick={(_data, index) => {
                  const key = statusData[index]?.key;
                  if (key != null && onDrillDownStatus) onDrillDownStatus(key);
                }}
                style={{ cursor: onDrillDownStatus ? 'pointer' : 'default' }}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v) =>
                    typeof v === 'number' ? v.toLocaleString('vi-VN') : String(v ?? '')
                  }
                  style={{ fontSize: 10, fill: 'var(--foreground)', fontWeight: 600 }}
                />
              </ColoredBar>
            </BarChart>
          </ResponsiveContainer>
        </StatsChartCard>

        <StatsChartCard
          title={txt('employee.stats.accountTrendChart')}
          icon={TrendingUp}
          className="md:col-span-2"
          empty={accountTrendData.length === 0}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={accountTrendData}>
              <defs>
                <linearGradient id="colorAccountTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryHex} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryHex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
              />
              <Tooltip content={<ChartTooltip />} />
              {trendAvg > 0 && (
                <ReferenceLine
                  y={trendAvg}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="4 4"
                  label={{
                    value: `TB ${trendAvg.toLocaleString('vi-VN')}`,
                    position: 'insideTopRight',
                    fill: 'var(--muted-foreground)',
                    fontSize: 10,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="count"
                name={txt('employee.stats.newAccounts')}
                stroke={primaryHex}
                strokeWidth={2}
                fill="url(#colorAccountTrend)"
                connectNulls
                dot={{ r: 3, fill: primaryHex, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: primaryHex, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </StatsChartCard>

        {positionData.length > 0 && (
          <StatsChartCard
            title={txt('employee.stats.positionChart')}
            icon={Briefcase}
            iconClassName="text-violet-500"
          >
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMdUp ? 75 : 70}
                  innerRadius={isMdUp ? 42 : 38}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  shape={renderPieShape(activePositionIndex)}
                  onMouseEnter={(_, i) => setActivePositionIndex(i)}
                  onMouseLeave={() => setActivePositionIndex(undefined)}
                  label={
                    isMdUp
                      ? ({ name, percent }) =>
                          (percent ?? 0) >= 0.05
                            ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                            : ''
                      : false
                  }
                  labelLine={false}
                >
                  {positionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList
                    content={<DonutCenterLabel total={positionTotal} />}
                    position="center"
                  />
                </Pie>
                <Tooltip content={<ChartTooltip total={positionTotal} />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value, entry) =>
                    legendWithPercent(value, entry as { color?: string; payload?: { value?: number } })
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </StatsChartCard>
        )}
      </div>
    </div>
  );
};

export default EmployeeStatsCharts;
