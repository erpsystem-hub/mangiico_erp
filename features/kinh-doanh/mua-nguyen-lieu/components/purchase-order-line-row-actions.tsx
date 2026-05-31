import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { PurchaseOrderLine } from '../core/types';

export interface PurchaseOrderLineRowActionsProps {
  line: PurchaseOrderLine;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  compact?: boolean;
}

export function PurchaseOrderLineRowActions({
  line,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  compact = false,
}: PurchaseOrderLineRowActionsProps) {
  const close = () => onMenuOpenChange(null);

  const overflowItems: RowOverflowMenuItem[] = [
    ...(canDelete
      ? [
          {
            key: 'delete',
            label: txt('common.delete'),
            icon: <Trash2 size={14} />,
            variant: 'destructive' as const,
            onClick: () => {
              onDelete();
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
      onClick={onEdit}
    />
  ) : undefined;

  return (
    <DataTableRowActions
      rowId={line.id}
      compact={compact}
      menuOpenId={menuOpenId}
      onMenuOpenChange={onMenuOpenChange}
      primary={primary}
      overflowItems={overflowItems}
      overflowTriggerLabel={txt('common.moreRowActions')}
    />
  );
}
