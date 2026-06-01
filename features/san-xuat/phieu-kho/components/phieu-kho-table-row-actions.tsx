import React from 'react';
import { Edit, Eye, Printer, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import { useCan } from '@/hooks/use-can';
import type { WarehouseSlipListItem } from '../core/types';
import {
  canDeleteWarehouseSlip,
  canEditWarehouseSlip,
} from '../core/constants';

export interface PhieuKhoTableRowActionsProps {
  item: WarehouseSlipListItem;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onView?: (item: WarehouseSlipListItem) => void;
  onEdit: (item: WarehouseSlipListItem) => void;
  onDelete: (id: string) => void;
  onPrint: (item: WarehouseSlipListItem) => void;
  compact?: boolean;
}

export function PhieuKhoTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onView,
  onEdit,
  onDelete,
  onPrint,
  compact = false,
}: PhieuKhoTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const canEditPerm = useCan('edit', 'warehouseSlips');
  const canDeletePerm = useCan('delete', 'warehouseSlips');
  const canEdit = canEditPerm && canEditWarehouseSlip(item.trang_thai, item.da_post_ton);
  const canDelete = canDeletePerm && canDeleteWarehouseSlip(item.trang_thai, item.da_post_ton);

  const overflowItems: RowOverflowMenuItem[] = [
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
    {
      key: 'print',
      label: txt('warehouseSlip.detail.print'),
      icon: <Printer size={14} />,
      onClick: () => {
        onPrint(item);
        close();
      },
    },
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

  const primary =
    onView != null ? (
      <TableRowIconButton
        icon={Eye}
        label={txt('common.view')}
        size={compact ? 'compact' : 'default'}
        variant="primary"
        onClick={() => onView(item)}
      />
    ) : canEdit ? (
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
