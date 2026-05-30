import React from 'react';
import { Edit, Power, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { ProductCatalogItem } from '../core/types';
import { useCan } from '@/hooks/use-can';

export interface ProductCatalogTableRowActionsProps {
  item: ProductCatalogItem;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: (item: ProductCatalogItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: ProductCatalogItem) => void;
  compact?: boolean;
}

export function ProductCatalogTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
}: ProductCatalogTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const canEdit = useCan('edit', 'productCatalog');
  const canDelete = useCan('delete', 'productCatalog');

  const toggleLabel =
    item.trang_thai === 'Đang hoạt động'
      ? txt('productCatalog.detail.deactivate')
      : txt('productCatalog.detail.activate');

  const overflowItems: RowOverflowMenuItem[] = [
    ...(canEdit && onStatusChange
      ? [
          {
            key: 'status',
            label: toggleLabel,
            icon: <Power size={14} />,
            onClick: () => {
              onStatusChange(item);
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
