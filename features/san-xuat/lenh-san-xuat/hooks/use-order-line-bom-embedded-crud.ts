import { useState, useCallback, useEffect, useRef } from 'react';
import { txt } from '@/lib/text';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import type { OrderLineBomItem } from '../core/order-line-bom-types';
import {
  useOrderLineBom,
  useGenerateOrderLineBom,
  useDeleteOrderLineBom,
} from './use-order-line-bom';

export function useOrderLineBomEmbeddedCrud(
  lineId: string | undefined,
  lineDetailOpen: boolean,
) {
  const confirm = useConfirmStore((s) => s.confirm);
  const { canEdit, canDelete } = useResourcePermissions('productionOrders');

  const [viewingItem, setViewingItem] = useState<OrderLineBomItem | null>(null);
  const [editingItem, setEditingItem] = useState<OrderLineBomItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const viewingRef = useRef<OrderLineBomItem | null>(null);

  const enabled = lineDetailOpen && Boolean(lineId);
  const { data: items = [], isLoading } = useOrderLineBom(lineId, { enabled });
  const generateMutation = useGenerateOrderLineBom(lineId ?? '');
  const deleteMutation = useDeleteOrderLineBom(lineId ?? '');

  useEffect(() => {
    viewingRef.current = viewingItem;
  }, [viewingItem]);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = items.find((r) => r.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [items, viewingItem]);

  const handleView = useCallback((item: OrderLineBomItem) => {
    setViewingItem(item);
  }, []);

  const handleAdd = useCallback(() => {
    if (!canEdit) return;
    setEditingItem(null);
    setShowForm(true);
  }, [canEdit]);

  const handleEdit = useCallback(
    (item: OrderLineBomItem) => {
      if (!canEdit) return;
      setEditingItem(item);
      setShowForm(true);
    },
    [canEdit],
  );

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    const edited = editingItem;
    setEditingItem(null);
    if (edited) {
      const fresh = items.find((r) => r.id === edited.id);
      setViewingItem(fresh ?? null);
    }
  }, [editingItem, items]);

  const handleCloseDetail = useCallback(() => {
    setViewingItem(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (!canDelete) return;
      confirm({
        title: txt('productionOrder.lineBom.deleteTitle'),
        message: txt('productionOrder.lineBom.deleteMessage'),
        variant: 'danger',
        confirmText: CONFIRM_DELETE(),
        onConfirm: () => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              if (viewingRef.current?.id === id) setViewingItem(null);
            },
          });
        },
      });
    },
    [canDelete, confirm, deleteMutation],
  );

  const handleGenerate = useCallback(() => {
    if (!canEdit || !lineId) return;
    const hasExisting = items.length > 0;
    if (!hasExisting) {
      generateMutation.mutate(false);
      return;
    }
    confirm({
      title: txt('productionOrder.lineBom.replaceTitle'),
      message: txt('productionOrder.lineBom.replaceMessage'),
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: () => generateMutation.mutate(true),
    });
  }, [canEdit, lineId, items.length, confirm, generateMutation]);

  return {
    canEdit,
    canDelete,
    items,
    isLoading,
    isGenerating: generateMutation.isPending,
    viewingItem,
    editingItem,
    showForm,
    handleView,
    handleAdd,
    handleEdit,
    handleCloseForm,
    handleCloseDetail,
    handleDelete,
    handleGenerate,
  };
}
