/**
 * Types for Employee Stats / Dashboard (Mangiico)
 */
import type { LucideIcon } from 'lucide-react';
import type { DateRangePresetId } from './stats-constants';

export interface StatsDateRange {
  preset: DateRangePresetId;
  start: Date;
  end: Date;
  label: string;
}

export interface DeptChartItem {
  name: string;
  value: number;
}

export interface StatusChartItem {
  key: string;
  name: string;
  value: number;
  fill: string;
}

export interface AccountTrendChartItem {
  label: string;
  count: number;
}

export interface PositionChartItem {
  name: string;
  value: number;
  fill: string;
}

export interface DeptSummaryRow {
  name: string;
  total: number;
  active: number;
  locked: number;
  rate: string;
}

export interface StatsTrends {
  totalDelta: number;
  activeDelta: number;
  newInPeriod: number;
  newPrevMonth: number;
  totalYoY?: number;
  activeYoY?: number;
}

export interface KpiItem {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  pct: string | null;
  delta: number | null;
}

export interface StatsMiniSummary {
  newInPeriod: number;
  topDept: { name: string; value: number } | null;
}

export interface StatsExportMeta {
  dateRangeLabel: string;
  filterDeptLabels: string[];
  filterStatusLabels: string[];
  exportedAt: string;
}

/** Params gửi lên RPC `get_nhan_vien_stats`. */
export interface EmployeeStatsFilterParams {
  asAt: Date;
  rangeStart: Date;
  rangeEnd: Date;
  filterDept: string[];
  filterStatus: string[];
}

/** Payload JSONB từ RPC — aggregate server-side. */
export interface EmployeeStatsServerPayload {
  summary: { tong: number; hoat_dong: number; khoa: number };
  new_in_period: number;
  yoy: { tong: number; hoat_dong: number };
  delta: { new_this_month: number; new_prev_month: number };
  by_phong_ban: Array<{
    id_phong_ban: number | null;
    tong: number;
    hoat_dong: number;
    khoa: number;
  }>;
  by_chuc_vu: Array<{ id_chuc_vu: number; so_nhan_vien: number }>;
  trend_12m: Array<{ thang: string; so_luong: number }>;
}
