import React from 'react';
import { Edit, Power, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { MaterialCatalogItem } from '../core/types';
import { useCan } from '@/hooks/use-can';

export interface MaterialCatalogTableRowActionsProps {
  item: MaterialCatalogItem;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: (item: MaterialCatalogItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: MaterialCatalogItem) => void;
  compact?: boolean;
}

export function MaterialCatalogTableRowActions({
  item,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
}: MaterialCatalogTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const canEdit = useCan('edit', 'materialCatalog');
  const canDelete = useCan('delete', 'materialCatalog');

  const toggleLabel =
    item.trang_thai === 'Đang hoạt động'
      ? txt('materialCatalog.detail.deactivate')
      : txt('materialCatalog.detail.activate');

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
