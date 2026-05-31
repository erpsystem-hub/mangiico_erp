import React from 'react';
import { Layers } from 'lucide-react';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';

export function buildPartnerCategoryLevelBadgeConfig(): BadgeConfig<number> {
  return {
    1: {
      label: txt('partnerCategory.levelBadge', { level: 1 }),
      color: 'primary',
      icon: <Layers size={10} className="shrink-0" />,
    },
    2: {
      label: txt('partnerCategory.levelBadge', { level: 2 }),
      color: 'sky',
      icon: <Layers size={10} className="shrink-0" />,
    },
  };
}

export function partnerCategoryTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('partnerCategory.active'), color: 'primary' },
    'Ngừng hoạt động': { label: txt('partnerCategory.inactive'), color: 'slate' },
  };
}

export function partnerListTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('partnerList.active'), color: 'primary' },
    'Ngừng hoạt động': { label: txt('partnerList.inactive'), color: 'slate' },
  };
}
