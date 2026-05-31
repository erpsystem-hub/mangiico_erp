import React from 'react';
import { Eye } from 'lucide-react';
import { txt } from '@/lib/text';
import { DataTableRowActions, TableRowIconButton } from '@/components/shared/row-actions';
import type { ProductionOrder } from '../core/types';

export interface ProductionOrderTableRowActionsProps {
  item: ProductionOrder;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onView: (item: ProductionOrder) => void;
  compact?: boolean;
}

export function ProductionOrderTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onView,
  compact = false,
}: ProductionOrderTableRowActionsProps) {
  return (
    <DataTableRowActions
      rowId={item.id}
      compact={compact}
      menuOpenId={menuOpenId}
      onMenuOpenChange={onMenuOpenChange}
      primary={
        <TableRowIconButton
          icon={Eye}
          label={txt('common.view')}
          size={compact ? 'compact' : 'default'}
          variant="primary"
          onClick={() => onView(item)}
        />
      }
      overflowItems={[]}
      overflowTriggerLabel={txt('common.moreRowActions')}
    />
  );
}
