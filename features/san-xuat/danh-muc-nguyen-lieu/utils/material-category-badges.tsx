import React from 'react';
import { Layers } from 'lucide-react';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function buildMaterialCategoryLevelBadgeConfig(): BadgeConfig<number> {
  return {
    1: {
      label: txt('materialCategory.levelBadge', { level: 1 }),
      color: 'primary',
      icon: <Layers size={10} className="shrink-0" />,
    },
    2: {
      label: txt('materialCategory.levelBadge', { level: 2 }),
      color: 'sky',
      icon: <Layers size={10} className="shrink-0" />,
    },
  };
}

export function materialCategoryTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('materialCategory.active'), color: 'primary' },
    'Ngừng hoạt động': { label: txt('materialCategory.inactive'), color: 'slate' },
  };
}
