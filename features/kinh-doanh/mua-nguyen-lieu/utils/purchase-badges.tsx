import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function purchaseOrderStatusBadgeConfig(): BadgeConfig<string> {
  return {
    Nháp: { label: txt('purchaseOrder.status.nhap'), color: 'slate' },
    'Đã đặt': { label: txt('purchaseOrder.status.daDat'), color: 'sky' },
    'Đang giao': { label: txt('purchaseOrder.status.dangGiao'), color: 'amber' },
    'Đã nhận': { label: txt('purchaseOrder.status.daNhan'), color: 'primary' },
    Hủy: { label: txt('purchaseOrder.status.huy'), color: 'rose' },
  };
}
