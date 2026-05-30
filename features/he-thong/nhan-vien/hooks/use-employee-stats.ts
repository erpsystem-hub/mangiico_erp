import { useMemo } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { txt } from '@/lib/text';
import type { Department } from '../../phong-ban/core/types';
import type { Position } from '../../chuc-vu/core/types';
import {
  DEPT_COLORS,
  POSITION_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  DEFAULT_KPI_IDS,
} from '../core/stats-constants';
import type {
  StatsDateRange,
  KpiItem,
  StatsTrends,
  StatsMiniSummary,
  EmployeeStatsServerPayload,
} from '../core/stats-types';
import type { TrangThaiNhanVien } from '../core/constants';
import {
  deptNameFromId,
  positionNameFromId,
  trendMonthToLabel,
} from '../utils/employee-stats-server';

const STATUS_KEYS: TrangThaiNhanVien[] = ['Hoạt động', 'Khóa'];

export interface MapEmployeeStatsParams {
  payload: EmployeeStatsServerPayload;
  departments: Department[];
  positions: Position[];
  dateRange: StatsDateRange;
  visibleKpiIds?: string[];
}

export function mapEmployeeStatsFromServer({
  payload,
  departments,
  positions,
  dateRange,
  visibleKpiIds = [...DEFAULT_KPI_IDS],
}: MapEmployeeStatsParams) {
  const deptNameById = new Map(departments.map((d) => [d.id, d.ten_phong_ban]));
  const posNameById = new Map(positions.map((p) => [p.id, p.ten_chuc_vu]));

  const total = payload.summary.tong;
  const active = payload.summary.hoat_dong;
  const locked = payload.summary.khoa;

  const pct = (n: number) => (total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0%');

  const trends: StatsTrends = {
    totalDelta: payload.delta.new_this_month,
    activeDelta: payload.delta.new_this_month - payload.delta.new_prev_month,
    newInPeriod: payload.new_in_period,
    newPrevMonth: payload.delta.new_prev_month,
    totalYoY: total - payload.yoy.tong,
    activeYoY:
      payload.yoy.tong > 0 ? active - payload.yoy.hoat_dong : undefined,
  };

  const deptData = payload.by_phong_ban
    .map((row) => ({
      name: deptNameFromId(row.id_phong_ban, deptNameById),
      value: row.tong,
    }))
    .sort((a, b) => b.value - a.value);

  const statusData = STATUS_KEYS.map((key) => ({
    key,
    name: STATUS_LABELS[key],
    value: key === 'Hoạt động' ? active : locked,
    fill: STATUS_COLORS[key],
  }));

  const accountTrendData = payload.trend_12m.map((row) => ({
    label: trendMonthToLabel(row.thang),
    count: row.so_luong,
  }));

  const positionData = payload.by_chuc_vu
    .map((row, i) => ({
      name: positionNameFromId(row.id_chuc_vu, posNameById),
      value: row.so_nhan_vien,
      fill: POSITION_COLORS[i % POSITION_COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const deptSummary = payload.by_phong_ban
    .map((row) => ({
      name: deptNameFromId(row.id_phong_ban, deptNameById),
      total: row.tong,
      active: row.hoat_dong,
      locked: row.khoa,
      rate: row.tong > 0 ? ((row.hoat_dong / row.tong) * 100).toFixed(0) : '0',
    }))
    .sort((a, b) => b.total - a.total);

  const miniSummary: StatsMiniSummary = {
    newInPeriod: trends.newInPeriod,
    topDept: deptData[0] ?? null,
  };

  const allKpis: KpiItem[] = [
    {
      id: 'total',
      label: txt('employee.stats.totalEmployees'),
      value: total,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      pct: null,
      delta: trends.totalDelta,
    },
    {
      id: 'active',
      label: txt('employee.statusActive'),
      value: active,
      icon: UserCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      pct: pct(active),
      delta: trends.activeDelta,
    },
    {
      id: 'locked',
      label: txt('employee.statusLocked'),
      value: locked,
      icon: UserX,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      pct: pct(locked),
      delta: null,
    },
  ];

  const kpis = allKpis.filter((k) => visibleKpiIds.includes(k.id));

  return {
    total,
    active,
    locked,
    trends,
    deptData,
    statusData,
    accountTrendData,
    positionData,
    deptSummary,
    miniSummary,
    kpis,
    DEPT_COLORS,
    isEmpty: total === 0,
    dateRange,
  };
}

/** Hook wrapper — map server payload → view model. */
export function useEmployeeStatsFromServer({
  payload,
  departments,
  positions,
  dateRange,
  visibleKpiIds = [...DEFAULT_KPI_IDS],
}: MapEmployeeStatsParams) {
  return useMemo(
    () =>
      mapEmployeeStatsFromServer({
        payload,
        departments,
        positions,
        dateRange,
        visibleKpiIds,
      }),
    [payload, departments, positions, dateRange, visibleKpiIds],
  );
}
