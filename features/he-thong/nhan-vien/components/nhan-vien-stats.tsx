import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import { txt } from '@/lib/text';
import { Building2, Tag, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import MultiSelect from '@/components/ui/MultiSelect';
import DateRangePicker from '@/components/ui/DateRangePicker';
import DashboardToolbar from '@/components/shared/DashboardToolbar';
import LoadingSpinnerWithText from '@/components/shared/LoadingSpinnerWithText';
import StatsKpiGrid from '@/components/shared/stats/StatsKpiGrid';
import StatsScrollTable from '@/components/shared/stats/StatsScrollTable';
import StatsExportMenu from '@/components/shared/stats/StatsExportMenu';
import type { StatsTableColumn } from '@/components/shared/stats/StatsScrollTable';
import { useDepartments } from '../../phong-ban/hooks/use-phong-ban';
import { usePositions } from '../../chuc-vu/hooks/use-chuc-vu';
import { useAuthStore } from '@/store/useStore';
import { STATUS_OPTIONS } from '../core/constants';
import {
  DATE_RANGE_PRESETS,
  DEFAULT_KPI_IDS,
  STATS_KPI_STORAGE_KEY,
  STATS_CHART_HEIGHT,
  STATS_CHART_HEIGHT_MOBILE,
  DEPT_STATS_TABLE_BODY_VISIBLE_ROWS,
  type DateRangePresetId,
} from '../core/stats-constants';
import { useMediaQuery } from '@/lib/use-media-query';
import { getDateRangeFromPreset } from '../utils/stats-date-range';
import { clampDateRangeForRole, canExportStats } from '../utils/stats-permissions';
import { useEmployeeStatsFromServer } from '../hooks/use-employee-stats';
import { useEmployeeStatsQuery } from '../hooks/use-employee-stats-query';
import type { EmployeeStatsServerPayload } from '../core/stats-types';
import type { DeptSummaryRow } from '../core/stats-types';
import { exportEmployeeStats } from '../utils/export-stats-report';
import type { StatsExportFormat } from '@/lib/export/stats-report';
import { formatDateTime } from '@/lib/utils';
import { usePrimaryColor } from '@/lib/theme-utils';
import StatsKpiConfigPopover from './StatsKpiConfigPopover';

const EmployeeStatsCharts = lazy(() => import('./EmployeeStatsCharts'));

const ChartsFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {[1, 2].map((i) => (
      <div key={i} className="bg-card rounded-xl border border-border p-3.5 h-[250px] animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-3" />
        <div className="h-[200px] bg-muted/30 rounded-lg" />
      </div>
    ))}
  </div>
);

interface EmployeeStatsProps {
  onDrillDownDept?: (deptId: string) => void;
  onDrillDownStatus?: (status: string) => void;
}

const EMPTY_STATS_PAYLOAD: EmployeeStatsServerPayload = {
  summary: { tong: 0, hoat_dong: 0, khoa: 0 },
  new_in_period: 0,
  yoy: { tong: 0, hoat_dong: 0 },
  delta: { new_this_month: 0, new_prev_month: 0 },
  by_phong_ban: [],
  by_chuc_vu: [],
  trend_12m: [],
};

function loadVisibleKpiIds(): string[] {
  try {
    const raw = localStorage.getItem(STATS_KPI_STORAGE_KEY);
    if (!raw) return [...DEFAULT_KPI_IDS];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_KPI_IDS];
  } catch {
    return [...DEFAULT_KPI_IDS];
  }
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({
  onDrillDownDept,
  onDrillDownStatus,
}) => {
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const userRole = useAuthStore((s) => s.user?.role);
  const { hex: primaryHex } = usePrimaryColor();
  const isMdUp = useMediaQuery('(min-width: 768px)');
  const chartHeight = isMdUp ? STATS_CHART_HEIGHT : STATS_CHART_HEIGHT_MOBILE;

  const [filterDept, setFilterDept] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePresetId>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [chartsVisible, setChartsVisible] = useState(false);
  const [visibleKpiIds, setVisibleKpiIds] = useState<string[]>(loadVisibleKpiIds);

  const dateRange = useMemo(() => {
    const range = getDateRangeFromPreset(
      dateRangePreset,
      customStart ? new Date(customStart) : undefined,
      customEnd ? new Date(customEnd) : undefined,
    );
    return clampDateRangeForRole(range, userRole);
  }, [dateRangePreset, customStart, customEnd, userRole]);

  const { data: statsPayload, isLoading } = useEmployeeStatsQuery({
    asAt: dateRange.end,
    rangeStart: dateRange.start,
    rangeEnd: dateRange.end,
    filterDept,
    filterStatus,
  });

  const {
    trends,
    deptData,
    statusData,
    accountTrendData,
    positionData,
    deptSummary,
    miniSummary,
    kpis,
    DEPT_COLORS,
    isEmpty,
  } = useEmployeeStatsFromServer({
    payload: statsPayload ?? EMPTY_STATS_PAYLOAD,
    departments,
    positions,
    dateRange,
    visibleKpiIds,
  });

  useEffect(() => {
    const timer = setTimeout(() => setChartsVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const departmentOptions = departments.map((d) => ({ label: d.ten_phong_ban, value: d.id }));
  const statusOptions = STATUS_OPTIONS.map((s) => ({ label: s.label, value: String(s.value) }));
  const statsActiveFilterCount = (filterDept.length > 0 ? 1 : 0) + (filterStatus.length > 0 ? 1 : 0);

  const handleClearStatsFilters = () => {
    setFilterDept([]);
    setFilterStatus([]);
  };

  const statsFilterGroups = useMemo(
    () => [
      {
        key: 'dept',
        label: txt('employee.stats.department'),
        icon: Building2,
        options: departmentOptions,
        value: filterDept,
        onChange: (val: string[]) => setFilterDept(val),
      },
      {
        key: 'status',
        label: txt('employee.stats.status'),
        icon: Tag,
        options: statusOptions,
        value: filterStatus,
        onChange: (val: string[]) => setFilterStatus(val),
      },
    ],
    [departmentOptions, statusOptions, filterDept, filterStatus],
  );

  const handleExportReport = useCallback(
    async (format: StatsExportFormat) => {
      if (!canExportStats(userRole)) return;
      const exportedAt = formatDateTime(new Date());
      const filterDeptLabels = filterDept.map(
        (id) => departments.find((d) => d.id === id)?.ten_phong_ban ?? id,
      );
      const filterStatusLabels = filterStatus.map(
        (v) => STATUS_OPTIONS.find((s) => String(s.value) === v)?.label ?? v,
      );
      const meta = {
        dateRangeLabel: dateRange.label,
        filterDeptLabels,
        filterStatusLabels,
        exportedAt,
      };
      try {
        await exportEmployeeStats(format, meta, kpis, deptSummary);
        toast.success(txt('employee.stats.exportSuccess'), {
          description: txt('employee.stats.exportSuccessDesc'),
        });
      } catch {
        toast.error(txt('employee.stats.exportError'));
      }
    },
    [userRole, filterDept, filterStatus, dateRange.label, departments, kpis, deptSummary],
  );

  const deptTableColumns = useMemo((): StatsTableColumn<DeptSummaryRow>[] => [
    {
      key: 'name',
      header: txt('employee.stats.department'),
      sticky: true,
      align: 'left',
      render: (row) => row.name,
    },
    {
      key: 'total',
      header: txt('employee.stats.total'),
      align: 'center',
      render: (row) => <span className="font-semibold text-foreground">{row.total}</span>,
    },
    {
      key: 'active',
      header: txt('employee.stats.workingShort'),
      align: 'center',
      render: (row) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">{row.active}</span>
      ),
    },
    {
      key: 'locked',
      header: txt('employee.stats.lockedShort'),
      align: 'center',
      render: (row) => (
        <span className="font-medium text-rose-600 dark:text-rose-400">{row.locked}</span>
      ),
    },
    {
      key: 'rate',
      header: txt('employee.stats.activeRate'),
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${row.rate}%` }} />
          </div>
          <span className="font-medium tabular-nums text-muted-foreground">{row.rate}%</span>
        </div>
      ),
    },
  ], []);

  const handleToggleKpi = (id: string) => {
    const next = visibleKpiIds.includes(id)
      ? visibleKpiIds.filter((k) => k !== id)
      : [...visibleKpiIds, id];
    if (next.length === 0) return;
    setVisibleKpiIds(next);
    localStorage.setItem(STATS_KPI_STORAGE_KEY, JSON.stringify(next));
  };

  const deptIdByName = useMemo(() => {
    const m: Record<string, string> = {};
    departments.forEach((d) => {
      m[d.ten_phong_ban] = d.id;
    });
    return m;
  }, [departments]);

  const dateRangePickerPresets = DATE_RANGE_PRESETS.map((p) => ({ id: p.id, label: p.label }));

  const renderFilters = (
    <>
      <DateRangePicker
        presets={dateRangePickerPresets}
        value={{ preset: dateRangePreset, customStart, customEnd }}
        onChange={(v) => {
          setDateRangePreset(v.preset as DateRangePresetId);
          setCustomStart(v.customStart);
          setCustomEnd(v.customEnd);
        }}
        displayLabel={dateRange.label}
      />
      <MultiSelect
        options={departmentOptions}
        value={filterDept}
        onChange={setFilterDept}
        icon={Building2}
        placeholder={txt('employee.stats.department')}
        className="w-[150px]"
      />
      <MultiSelect
        options={statusOptions}
        value={filterStatus}
        onChange={setFilterStatus}
        icon={Tag}
        placeholder={txt('employee.stats.status')}
        className="w-[140px]"
      />
    </>
  );

  const renderExportAction = canExportStats(userRole) ? (
    <StatsExportMenu onExport={handleExportReport} compact={false} />
  ) : null;

  const renderMobileExportAction = canExportStats(userRole) ? (
    <StatsExportMenu onExport={handleExportReport} compact />
  ) : null;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="shrink-0 py-3 px-3 sm:px-4 border-b border-border/50 bg-muted/20">
          <LoadingSpinnerWithText text={txt('employee.stats.loading')} centered />
        </div>
        <div className="flex-1 p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-2.5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-16 bg-muted/60 rounded" />
                    <div className="h-5 w-10 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3.5 h-[250px] animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-3" />
                <div className="h-[200px] bg-muted/30 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmptyView = !isLoading && isEmpty;

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full flex-col">
      <DashboardToolbar
        filters={renderFilters}
        actions={
          <div className="flex items-center gap-2">
            <StatsKpiConfigPopover visibleKpiIds={visibleKpiIds} onToggle={handleToggleKpi} />
            {renderExportAction}
          </div>
        }
        mobileActions={renderMobileExportAction}
        filterGroups={statsFilterGroups}
        activeFilterCount={statsActiveFilterCount}
        onClearFilters={handleClearStatsFilters}
        className="static z-auto"
        hideBack
      />

      <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="min-w-0 max-w-full space-y-3 p-3 sm:p-4 pb-4">
          {isEmptyView ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Inbox size={40} className="mx-auto text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">{txt('employee.stats.noData')}</h3>
              <p className="text-xs text-muted-foreground mb-4">
                {statsActiveFilterCount > 0
                  ? txt('employee.stats.noDataHint')
                  : txt('employee.stats.noEmployeeInPeriod')}
              </p>
              {statsActiveFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearStatsFilters}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {txt('employee.stats.clearFilters')}
                </button>
              )}
            </div>
          ) : (
            <>
              <StatsKpiGrid items={kpis} columns={3} />

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-0.5 flex-wrap">
                <span>
                  {txt('employee.stats.newAccountsInPeriod')}{' '}
                  <strong className="text-foreground font-semibold">{miniSummary.newInPeriod}</strong>
                </span>
                {miniSummary.topDept && (
                  <>
                    <span className="text-border">|</span>
                    <span>
                      {txt('employee.stats.largestDepartment')}{' '}
                      <strong className="text-foreground font-semibold">
                        {miniSummary.topDept.name} ({miniSummary.topDept.value})
                      </strong>
                    </span>
                  </>
                )}
                {(trends.totalYoY !== undefined || trends.activeYoY !== undefined) && (
                  <>
                    <span className="text-border">|</span>
                    <span>
                      {txt('employee.stats.comparedLastYear')}{' '}
                      <strong
                        className={
                          trends.totalYoY != null && trends.totalYoY >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-500 dark:text-rose-400'
                        }
                      >
                        {trends.totalYoY != null
                          ? trends.totalYoY >= 0
                            ? `+${trends.totalYoY}`
                            : trends.totalYoY
                          : '—'}
                      </strong>
                      {trends.activeYoY != null && (
                        <>
                          {' '}
                          · {txt('employee.stats.workingShort')}{' '}
                          <strong
                            className={
                              trends.activeYoY >= 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-500 dark:text-rose-400'
                            }
                          >
                            {trends.activeYoY >= 0 ? `+${trends.activeYoY}` : trends.activeYoY}
                          </strong>
                        </>
                      )}
                    </span>
                  </>
                )}
              </div>

              {chartsVisible && (
                <Suspense fallback={<ChartsFallback />}>
                  <EmployeeStatsCharts
                    chartsVisible={chartsVisible}
                    chartHeight={chartHeight}
                    isMdUp={isMdUp}
                    primaryHex={primaryHex}
                    deptData={deptData}
                    statusData={statusData}
                    accountTrendData={accountTrendData}
                    positionData={positionData}
                    DEPT_COLORS={DEPT_COLORS}
                    deptIdByName={deptIdByName}
                    onDrillDownDept={onDrillDownDept}
                    onDrillDownStatus={onDrillDownStatus}
                  />
                </Suspense>
              )}

              {deptSummary.length > 0 && (
                <StatsScrollTable
                  title={txt('employee.stats.departmentTable')}
                  icon={Building2}
                  ariaLabel={txt('employee.stats.departmentTable')}
                  columns={deptTableColumns}
                  rows={deptSummary}
                  keyExtractor={(row) => row.name}
                  maxVisibleRows={DEPT_STATS_TABLE_BODY_VISIBLE_ROWS}
                  onRowClick={
                    onDrillDownDept
                      ? (row) => {
                          const deptId = deptIdByName[row.name];
                          if (deptId) onDrillDownDept(deptId);
                        }
                      : undefined
                  }
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;
