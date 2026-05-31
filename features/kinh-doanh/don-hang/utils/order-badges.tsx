import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function salesOrderStatusBadgeConfig(): BadgeConfig<string> {
  return {
    Nháp: { label: txt('salesOrder.status.nhap'), color: 'slate' },
    Mới: { label: txt('salesOrder.status.moi'), color: 'sky' },
    'Hoàn thành': { label: txt('salesOrder.status.hoanThanh'), color: 'primary' },
    Hủy: { label: txt('salesOrder.status.huy'), color: 'rose' },
  };
}
