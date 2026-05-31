import React from 'react';
import { Edit, Power, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { PartnerCategory } from '../../core/types';

export interface PartnerCategoryTableRowActionsProps {
  item: PartnerCategory;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: (item: PartnerCategory) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: PartnerCategory) => void;
  canEdit: boolean;
  canDelete: boolean;
  compact?: boolean;
}

export function PartnerCategoryTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  canEdit,
  canDelete,
  compact = false,
}: PartnerCategoryTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const toggleLabel =
    item.trang_thai === 'Đang hoạt động'
      ? txt('partnerCategory.detail.deactivate')
      : txt('partnerCategory.detail.activate');

  const overflowItems: RowOverflowMenuItem[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            key: 'toggle',
            label: toggleLabel,
            icon: <Power size={14} />,
            onClick: () => {
              onStatusChange(item);
              close();
            },
          } satisfies RowOverflowMenuItem,
        ]
      : []),
    ...(canDelete
      ? [
          {
            key: 'delete',
            label: txt('common.delete'),
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: () => {
              onDelete(item.id);
              close();
            },
          } satisfies RowOverflowMenuItem,
        ]
      : []),
  ];

  if (!canEdit && overflowItems.length === 0) return null;

  return (
    <DataTableRowActions
      rowId={item.id}
      compact={compact}
      menuOpenId={menuOpenId}
      onMenuOpenChange={onMenuOpenChange}
      primary={
        canEdit ? (
          <TableRowIconButton
            icon={Edit}
            label={txt('common.edit')}
            size={compact ? 'compact' : 'default'}
            variant="primary"
            onClick={() => onEdit(item)}
          />
        ) : undefined
      }
      overflowItems={overflowItems}
      overflowTriggerLabel={txt('common.moreRowActions')}
    />
  );
}
