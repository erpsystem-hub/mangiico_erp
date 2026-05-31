import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { OrderLineBomItem } from '../core/order-line-bom-types';

interface Props {
  item: OrderLineBomItem;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onView: (item: OrderLineBomItem) => void;
  onEdit: (item: OrderLineBomItem) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  compact?: boolean;
}

export function OrderLineBomRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onView,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  compact = false,
}: Props) {
  const close = () => onMenuOpenChange(null);

  const overflowItems: RowOverflowMenuItem[] = [
    {
      key: 'view',
      label: txt('common.view'),
      icon: <Eye size={14} />,
      onClick: () => {
        onView(item);
        close();
      },
    },
    ...(canEdit
      ? [
          {
            key: 'edit',
            label: txt('common.edit'),
            icon: <Edit size={14} />,
            onClick: () => {
              onEdit(item);
              close();
            },
          },
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
          },
        ]
      : []),
  ];

  const primary = canEdit ? (
    <TableRowIconButton
      icon={Edit}
      label={txt('common.edit')}
      size={compact ? 'compact' : 'default'}
      variant="primary"
      onClick={() => onEdit(item)}
    />
  ) : (
    <TableRowIconButton
      icon={Eye}
      label={txt('common.view')}
      size={compact ? 'compact' : 'default'}
      onClick={() => onView(item)}
    />
  );

  return (
    <DataTableRowActions
      rowId={item.id}
      compact={compact}
      menuOpenId={menuOpenId}
      onMenuOpenChange={onMenuOpenChange}
      primary={primary}
      overflowItems={overflowItems}
      overflowTriggerLabel={txt('common.moreRowActions')}
    />
  );
}
