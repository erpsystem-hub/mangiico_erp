import React from 'react';
import { Layers } from 'lucide-react';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function buildProductCategoryLevelBadgeConfig(): BadgeConfig<number> {
  return {
    1: {
      label: txt('productCategory.levelBadge', { level: 1 }),
      color: 'primary',
      icon: <Layers size={10} className="shrink-0" />,
    },
    2: {
      label: txt('productCategory.levelBadge', { level: 2 }),
      color: 'sky',
      icon: <Layers size={10} className="shrink-0" />,
    },
  };
}

export function productCategoryTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('productCategory.active'), color: 'primary' },
    'Ngừng hoạt động': { label: txt('productCategory.inactive'), color: 'slate' },
  };
}
