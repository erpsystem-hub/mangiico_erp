import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function warehouseSlipStatusBadgeConfig(): BadgeConfig<string> {
  return {
    Nháp: { label: txt('warehouseSlip.status.nhap'), color: 'slate' },
    'Hoàn thành': { label: txt('warehouseSlip.status.hoanThanh'), color: 'primary' },
    Hủy: { label: txt('warehouseSlip.status.huy'), color: 'rose' },
  };
}

export function warehouseSlipTypeBadgeConfig(): BadgeConfig<string> {
  return {
    Nhập: { label: txt('warehouseSlip.type.nhap'), color: 'emerald' },
    Xuất: { label: txt('warehouseSlip.type.xuat'), color: 'amber' },
  };
}
