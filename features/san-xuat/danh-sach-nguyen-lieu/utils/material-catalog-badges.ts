import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function materialCatalogTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('common.activeStatus'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('common.inactiveStatus'), color: 'slate' },
  };
}
