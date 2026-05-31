import React from 'react';
import { Edit, Power, Trash2 } from 'lucide-react';
import { txt } from '@/lib/text';
import {
  DataTableRowActions,
  TableRowIconButton,
  type RowOverflowMenuItem,
} from '@/components/shared/row-actions';
import type { AppResource } from '@/lib/permissions';
import type { PartnerListItem } from '../../core/types';
import { useCan } from '@/hooks/use-can';

export interface PartnerListTableRowActionsProps {
  listResource: AppResource;
  item: PartnerListItem;
  menuOpenId: string | null;
  onMenuOpenChange: (id: string | null) => void;
  onEdit: (item: PartnerListItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: PartnerListItem) => void;
  compact?: boolean;
}

export function PartnerListTableRowActions({
  listResource,
  item,
  menuOpenId,
  onMenuOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
  compact = false,
}: PartnerListTableRowActionsProps) {
  const close = () => onMenuOpenChange(null);
  const canEdit = useCan('edit', listResource);
  const canDelete = useCan('delete', listResource);

  const toggleLabel =
    item.trang_thai === 'Đang hoạt động'
      ? txt('partnerList.detail.deactivate')
      : txt('partnerList.detail.activate');

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
