import type { DateRangeValue } from '@/components/ui/DateRangePicker';
import type { TrangThaiLenhSx } from './constants';
import type {
  SalesOrderLineAttributeValue,
  SalesOrderLineMeasurementValue,
} from '@/features/kinh-doanh/don-hang/core/types';

export type {
  SalesOrder as ProductionOrder,
  SalesOrderLine as ProductionOrderLine,
  SalesOrderLineAttributeValue,
  SalesOrderLineMeasurementValue,
  SalesOrderFilters as ProductionOrderFilters,
} from '@/features/kinh-doanh/don-hang/core/types';

/** Dòng sản phẩm phẳng trên tab Chi tiết — kèm thông tin đơn cha. */
export interface ProductionOrderLineRow {
  id: string;
  don_hang_id: string;
  danh_muc_id: string;
  ma_don_hang: string;
  khach_hang_id: string;
  ten_khach_hang: string;
  trang_thai: TrangThaiLenhSx;
  ngay_dat: string;
  ngay_giao_du_kien: string | null;
  ma_danh_muc: string;
  ten_danh_muc: string;
  ten_nhom_danh_muc: string;
  so_luong: number;
  don_vi_tinh: string;
  ghi_chu: string | null;
  thu_tu: number;
  tg_tao?: string;
  tg_cap_nhat?: string;
  thuoc_tinh_values?: SalesOrderLineAttributeValue[];
  thong_so_do_values?: SalesOrderLineMeasurementValue[];
}

export interface ProductionOrderLineFilters {
  status: string[];
  khach_hang_ids: string[];
  columnSearch: Record<string, string>;
  dateRange: DateRangeValue;
}
