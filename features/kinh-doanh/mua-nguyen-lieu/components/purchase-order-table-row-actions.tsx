import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import { useCan } from '@/hooks/use-can';
import type { PurchaseOrder } from '../core/types';
import { canDeletePurchaseOrder, canEditPurchaseOrder } from '../core/constants';

export interface PurchaseOrderTableRowActionsProps {
  item: PurchaseOrder;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: (item: PurchaseOrder) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function PurchaseOrderTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  compact = false,
}: PurchaseOrderTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const canEditPerm = useCan('edit', 'materialPurchases');
  const canDeletePerm = useCan('delete', 'materialPurchases');
  const canEdit = canEditPerm && canEditPurchaseOrder(item.trang_thai);
  const canDelete = canDeletePerm && canDeletePurchaseOrder(item.trang_thai);

  const overflowItems: RowOverflowMenuItem[] = [
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
  ) : undefined;

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
