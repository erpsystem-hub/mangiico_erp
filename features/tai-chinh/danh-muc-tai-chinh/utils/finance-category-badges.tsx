import React from 'react';
import { Layers } from 'lucide-react';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import { txt } from '@/lib/text';
import type { LoaiDanhMuc } from '../core/constants';

export function buildFinanceCategoryLevelBadgeConfig(): BadgeConfig<number> {
  return {
    1: {
      label: txt('financeCategory.levelBadge', { level: 1 }),
      color: 'primary',
      icon: <Layers size={10} className="shrink-0" />,
    },
    2: {
      label: txt('financeCategory.levelBadge', { level: 2 }),
      color: 'sky',
      icon: <Layers size={10} className="shrink-0" />,
    },
  };
}

export function financeCategoryTrangThaiBadgeConfig(): BadgeConfig<string> {
  return {
    'Đang hoạt động': { label: txt('financeCategory.active'), color: 'primary' },
    'Ngừng hoạt động': { label: txt('financeCategory.inactive'), color: 'slate' },
  };
}

export function financeCategoryLoaiBadgeConfig(): BadgeConfig<LoaiDanhMuc> {
  return {
    Thu: { label: txt('financeCategory.typeThu'), color: 'emerald' },
    Chi: { label: txt('financeCategory.typeChi'), color: 'rose' },
  };
}
