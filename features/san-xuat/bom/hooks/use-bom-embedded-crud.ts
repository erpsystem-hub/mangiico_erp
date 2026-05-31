import { useState, useCallback, useEffect, useRef } from 'react';
import { txt } from '@/lib/text';
import { useQueryClient } from '@tanstack/react-query';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES } from '@/lib/button-labels';
import { queryKeys } from '@/lib/query-keys';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { BomItem } from '../core/types';
import {
  useBomList,
  useDeleteBomItems,
  useUpdateBomStatus,
} from './use-bom';

export type BomEmbeddedParent = 'product' | 'material';
export type BomEmbeddedFormOrigin = 'productDetail' | 'materialDetail' | 'bomDetail';

export function useBomEmbeddedCrud(parentDetailOpen: boolean) {
  const queryClient = useQueryClient();
  const confirm = useConfirmStore((s) => s.confirm);
  const canViewBom = useCan('view', 'bom');
  const {
    canCreate: canCreateBom,
    canEdit: canEditBom,
    canDelete: canDeleteBom,
  } = useResourcePermissions('bom');

  const [viewingBom, setViewingBom] = useState<BomItem | null>(null);
  const [editingBom, setEditingBom] = useState<BomItem | null>(null);
  const [showBomForm, setShowBomForm] = useState(false);
  const [bomFormOrigin, setBomFormOrigin] = useState<BomEmbeddedFormOrigin>('productDetail');
  const [presetSanPhamId, setPresetSanPhamId] = useState<string | undefined>();
  const [presetNguyenLieuId, setPresetNguyenLieuId] = useState<string | undefined>();
  const [lockSanPham, setLockSanPham] = useState(false);
  const [lockNguyenLieu, setLockNguyenLieu] = useState(false);

  const viewingBomRef = useRef<BomItem | null>(null);
  const bomFormOriginRef = useRef<BomEmbeddedFormOrigin>('productDetail');

  const bomOverlayActive = parentDetailOpen || showBomForm || Boolean(viewingBom);
  const { data: bomItems = [], isLoading: bomLoading } = useBomList({
    enabled: canViewBom && bomOverlayActive,
  });
  const deleteBomMutation = useDeleteBomItems();
  const statusBomMutation = useUpdateBomStatus();

  useEffect(() => {
    viewingBomRef.current = viewingBom;
  }, [viewingBom]);
  useEffect(() => {
    bomFormOriginRef.current = bomFormOrigin;
  }, [bomFormOrigin]);

  useEffect(() => {
    if (!viewingBom) return;
    const fresh = bomItems.find((b) => b.id === viewingBom.id);
    if (fresh && fresh !== viewingBom) queueMicrotask(() => setViewingBom(fresh));
  }, [bomItems, viewingBom]);

  const bomStackLevel = parentDetailOpen ? 1 : 0;

  const handleViewBom = useCallback(
    (item: BomItem) => {
      if (!canViewBom) return;
      queryClient.setQueryData(queryKeys.bom.detail(item.id), item);
      setViewingBom(item);
    },
    [canViewBom, queryClient],
  );

  const handleAddBomForProduct = useCallback(
    (sanPhamId: string) => {
      if (!canCreateBom) return;
      setPresetSanPhamId(sanPhamId);
      setPresetNguyenLieuId(undefined);
      setLockSanPham(true);
      setLockNguyenLieu(false);
      setEditingBom(null);
      setBomFormOrigin('productDetail');
      setShowBomForm(true);
    },
    [canCreateBom],
  );

  const handleAddBomForMaterial = useCallback(
    (nguyenLieuId: string) => {
      if (!canCreateBom) return;
      setPresetSanPhamId(undefined);
      setPresetNguyenLieuId(nguyenLieuId);
      setLockSanPham(false);
      setLockNguyenLieu(true);
      setEditingBom(null);
      setBomFormOrigin('materialDetail');
      setShowBomForm(true);
    },
    [canCreateBom],
  );

  const handleEditBom = useCallback(
    (item: BomItem) => {
      if (!canEditBom) return;
      const origin: BomEmbeddedFormOrigin = viewingBomRef.current ? 'bomDetail' : bomFormOriginRef.current;
      setBomFormOrigin(origin);
      setPresetSanPhamId(undefined);
      setPresetNguyenLieuId(undefined);
      setLockSanPham(false);
      setLockNguyenLieu(false);
      setEditingBom(item);
      setShowBomForm(true);
    },
    [canEditBom],
  );

  const handleCloseBomForm = useCallback(() => {
    setShowBomForm(false);
    const edited = editingBom;
    setEditingBom(null);
    setPresetSanPhamId(undefined);
    setPresetNguyenLieuId(undefined);
    setLockSanPham(false);
    setLockNguyenLieu(false);
    if (bomFormOriginRef.current === 'bomDetail' && edited) {
      const fresh = bomItems.find((b) => b.id === edited.id);
      setViewingBom(fresh ?? null);
    }
    setBomFormOrigin('productDetail');
  }, [editingBom, bomItems]);

  const handleCloseBomDetail = useCallback(() => {
    setViewingBom(null);
  }, []);

  const handleDeleteBom = useCallback(
    (id: string) => {
      if (!canDeleteBom) return;
      confirm({
        title: txt('bom.deleteTitle'),
        message: txt('bom.deleteMessage'),
        variant: 'danger',
        confirmText: CONFIRM_DELETE(),
        onConfirm: () => {
          deleteBomMutation.mutate([id], {
            onSuccess: () => {
              if (viewingBomRef.current?.id === id) setViewingBom(null);
            },
          });
        },
      });
    },
    [canDeleteBom, confirm, deleteBomMutation],
  );

  const handleBomStatusChange = useCallback(
    (item: BomItem) => {
      if (!canEditBom) return;
      const newStatus: TrangThaiHoatDong =
        item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
      confirm({
        title: txt('bom.statusChangeTitle'),
        message: `${txt('bom.statusChangeMessage')} ${newStatus}?`,
        confirmText: CONFIRM_YES(),
        onConfirm: () =>
          statusBomMutation.mutate(
            { ids: [item.id], status: newStatus },
            {
              onSuccess: () => {
                if (viewingBomRef.current?.id === item.id) {
                  setViewingBom((prev) => (prev ? { ...prev, trang_thai: newStatus } : null));
                }
              },
            },
          ),
      });
    },
    [canEditBom, confirm, statusBomMutation],
  );

  return {
    canViewBom,
    canCreateBom,
    canEditBom,
    canDeleteBom,
    bomItems,
    bomLoading,
    bomStackLevel,
    viewingBom,
    editingBom,
    showBomForm,
    presetSanPhamId,
    presetNguyenLieuId,
    lockSanPham,
    lockNguyenLieu,
    handleViewBom,
    handleAddBomForProduct,
    handleAddBomForMaterial,
    handleEditBom,
    handleCloseBomForm,
    handleCloseBomDetail,
    handleDeleteBom,
    handleBomStatusChange,
  };
}
