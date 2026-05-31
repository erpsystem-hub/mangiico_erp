import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  lazy,
  Suspense,
  startTransition,
} from 'react';
import { txt } from '@/lib/text';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { usePartnerList } from '@/features/kinh-doanh/doi-tac/hooks/use-doi-tac-list';
import DonMuaToolbar from './components/don-mua-toolbar';
import DonMuaTable from './components/don-mua-table';
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  usePurchaseOrderDetail,
  useUpdatePurchaseOrderStatus,
  useUpsertPurchaseOrder,
} from './hooks/use-don-mua-nguyen-lieu';
import { getPurchaseOrderById } from './services/don-mua-nguyen-lieu-service';
import ErrorState from '@/components/shared/ErrorState';
import { usePurchaseOrderStore } from './store/usePurchaseOrderStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { queryKeys } from '@/lib/query-keys';
import type { PurchaseOrder, PurchaseOrderLine } from './core/types';
import type { TrangThaiDonMua } from './core/constants';
import { matchesPurchaseOrderFilters } from './utils/purchase-list-filter';
import { canDeletePurchaseOrder, canEditPurchaseOrder } from './core/constants';
import { purchaseOrderToFormValues } from './utils/purchase-form-mapper';

const DonMuaForm = lazy(() => import('./components/don-mua-form'));
const DonMuaDetail = lazy(() => import('./components/don-mua-detail'));
const DonMuaStatusChangeDialog = lazy(() => import('./components/don-mua-status-change-dialog'));
const DonMuaLineForm = lazy(() => import('./components/don-mua-line-form'));

type DonMuaLocationState = {
  openCreate?: boolean;
  presetNhaCungCapId?: string;
  viewOrderId?: string;
};

const DrawerLazyFallback: React.FC = () => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
    style={{ zIndex: DRAWER_Z_CONTENT_BASE }}
  >
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
      aria-hidden
    />
  </div>
);

type FormOrigin = 'list' | 'detail';

type LineFormState = { mode: 'add' } | { mode: 'edit'; line: PurchaseOrderLine } | null;

const MuaNguyenLieuPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'materialPurchases');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('materialPurchases');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const didRedirect = useRef(false);
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PurchaseOrder | null>(null);
  const [viewingItem, setViewingItem] = useState<PurchaseOrder | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<PurchaseOrder | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [presetNhaCungCapId, setPresetNhaCungCapId] = useState<string | undefined>();
  const [lineForm, setLineForm] = useState<LineFormState>(null);

  const { searchTerm, filters, resetState, clearSelection, sort } = usePurchaseOrderStore();

  const { data: orders = [], isLoading, isError, refetch } = usePurchaseOrders({ enabled: canView });
  const { data: suppliers = [] } = usePartnerList('nha_cung_cap', { enabled: canView });
  const deleteMutation = useDeletePurchaseOrder();
  const statusMutation = useUpdatePurchaseOrderStatus();
  const upsertLineMutation = useUpsertPurchaseOrder();

  const pendingViewId = (location.state as DonMuaLocationState | null)?.viewOrderId;
  const { data: pendingViewOrder } = usePurchaseOrderDetail(pendingViewId, {
    enabled: canView && Boolean(pendingViewId),
  });

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('purchaseOrder.noViewPermission'));
    navigate('/kinh-doanh', { replace: true });
  }, [user, canView, navigate]);

  useEffect(() => () => resetState(), [resetState]);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = orders.find((o) => o.id === viewingItem.id);
    if (!fresh) return;
    queueMicrotask(() => {
      setViewingItem((prev) => {
        if (!prev || prev.id !== fresh.id) return prev;
        const cached = queryClient.getQueryData<PurchaseOrder>(
          queryKeys.purchaseOrders.detail(fresh.id),
        );
        const lines = cached?.lines?.length ? cached.lines : prev.lines;
        return { ...fresh, lines: lines ?? fresh.lines };
      });
      queryClient.setQueryData(queryKeys.purchaseOrders.detail(fresh.id), (old) => {
        const cached = old as PurchaseOrder | undefined;
        if (!cached?.lines?.length) return fresh;
        return { ...fresh, lines: cached.lines };
      });
    });
  }, [orders, viewingItem?.id, queryClient]);

  useEffect(() => {
    const state = location.state as DonMuaLocationState | null;
    if (!state) return;

    if (state.openCreate && canCreate) {
      startTransition(() => {
        setFormOrigin('list');
        setEditingItem(null);
        setPresetNhaCungCapId(state.presetNhaCungCapId);
        setShowForm(true);
      });
    }

    if (state.viewOrderId) {
      const cached = orders.find((o) => o.id === state.viewOrderId);
      if (cached) {
        queryClient.setQueryData(queryKeys.purchaseOrders.detail(cached.id), cached);
        setViewingItem(cached);
      }
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, canCreate, orders, navigate, queryClient]);

  useEffect(() => {
    if (!pendingViewId || !pendingViewOrder) return;
    setViewingItem(pendingViewOrder);
  }, [pendingViewId, pendingViewOrder]);

  const filterFn = useCallback(
    (item: PurchaseOrder, term: string, f: typeof filters) =>
      matchesPurchaseOrderFilters(item, term, f),
    [],
  );

  const filteredOrders = useListWithFilter(orders, searchTerm, filters, filterFn);

  const sortedFilteredOrders = useMemo(() => {
    const list = [...filteredOrders];
    const { column, direction } = sort;
    if (!column || !direction) {
      return list.sort(
        (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
      );
    }
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = a[column as keyof PurchaseOrder];
      const bv = b[column as keyof PurchaseOrder];
      if (column === 'tong_tien') return mul * (Number(av) - Number(bv));
      if (column === 'ngay_dat' || column === 'tg_cap_nhat') {
        return mul * String(av).localeCompare(String(bv));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredOrders, sort]);

  const fetchOrderDetail = useCallback(
    async (id: string) => {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.purchaseOrders.detail(id),
        queryFn: () => getPurchaseOrderById(id),
      });
      return full ?? null;
    },
    [queryClient],
  );

  const handleView = useCallback(
    async (item: PurchaseOrder) => {
      const full = await fetchOrderDetail(item.id);
      if (full) setViewingItem(full);
      else toast.error(txt('purchaseOrder.service.notFound'));
    },
    [fetchOrderDetail],
  );

  const handleEdit = async (item: PurchaseOrder) => {
    if (!canEdit) return;
    if (!canEditPurchaseOrder(item.trang_thai)) {
      toast.error(txt('purchaseOrder.editBlockedStatus'));
      return;
    }
    const full =
      item.lines?.length ? item : await fetchOrderDetail(item.id);
    if (!full) {
      toast.error(txt('purchaseOrder.service.notFound'));
      return;
    }
    startTransition(() => {
      setFormOrigin(viewingItem ? 'detail' : 'list');
      setEditingItem(full);
      setPresetNhaCungCapId(undefined);
      setShowForm(true);
    });
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: txt('purchaseOrder.deleteTitle'),
      message: txt('purchaseOrder.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            if (viewingItem?.id === id) setViewingItem(null);
            clearSelection();
          },
        });
      },
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete || ids.length === 0) return;
    const blocked = ids.filter((id) => {
      const o = orders.find((x) => x.id === id);
      return o && !canDeletePurchaseOrder(o.trang_thai);
    });
    if (blocked.length > 0) {
      toast.error(txt('purchaseOrder.deleteBlockedStatus'));
      return;
    }
    confirm({
      title: txt('purchaseOrder.bulkDeleteTitle'),
      message: txt('purchaseOrder.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
        setViewingItem(null);
        clearSelection();
      },
    });
  };

  const handleCloseForm = () => {
    const wasEditing = editingItem;
    setShowForm(false);
    setEditingItem(null);
    setPresetNhaCungCapId(undefined);
    if (formOrigin === 'detail' && wasEditing && viewingItem?.id === wasEditing.id) {
      const cached = queryClient.getQueryData<PurchaseOrder>(
        queryKeys.purchaseOrders.detail(wasEditing.id),
      );
      if (cached) setViewingItem(cached);
      else {
        const fresh = orders.find((o) => o.id === wasEditing.id);
        if (fresh) setViewingItem(fresh);
      }
    }
    setFormOrigin('list');
  };

  const handleDeleteLine = useCallback(
    (order: PurchaseOrder, line: PurchaseOrderLine) => {
      if (!canEdit) return;
      const remaining = (order.lines ?? []).filter((ln) => ln.id !== line.id);
      if (remaining.length === 0) {
        toast.error(txt('purchaseOrder.validation.linesMin'));
        return;
      }
      confirm({
        title: txt('purchaseOrder.detail.deleteLineTitle'),
        message: txt('purchaseOrder.detail.deleteLineMessage', {
          material: line.ten_nguyen_lieu,
          code: order.ma_don_mua,
        }),
        variant: 'danger',
        confirmText: CONFIRM_DELETE(),
        onConfirm: () => {
          upsertLineMutation.mutate(
            {
              id: order.id,
              data: purchaseOrderToFormValues({ ...order, lines: remaining }),
            },
            {
              onSuccess: (saved) => {
                setViewingItem(saved);
              },
            },
          );
        },
      });
    },
    [canEdit, confirm, upsertLineMutation],
  );

  const handleAddLine = useCallback(
    (order: PurchaseOrder) => {
      if (!canEdit) return;
      if (!canEditPurchaseOrder(order.trang_thai)) {
        toast.error(txt('purchaseOrder.editBlockedStatus'));
        return;
      }
      setLineForm({ mode: 'add' });
    },
    [canEdit],
  );

  const handleEditLine = useCallback(
    (_order: PurchaseOrder, line: PurchaseOrderLine) => {
      if (!canEdit) return;
      setLineForm({ mode: 'edit', line });
    },
    [canEdit],
  );

  const handleCloseLineForm = useCallback(() => {
    setLineForm(null);
  }, []);

  const handleLineSaved = useCallback((saved: PurchaseOrder) => {
    setViewingItem(saved);
  }, []);

  const handleCloseOrderDetail = useCallback(() => {
    if (showForm || lineForm) return;
    setViewingItem(null);
  }, [showForm, lineForm]);

  const handleStatusChange = useCallback(
    (item: PurchaseOrder) => {
      if (!canEdit) return;
      setStatusChangeTarget(item);
    },
    [canEdit],
  );

  const handleStatusSave = useCallback(
    async (status: TrangThaiDonMua) => {
      if (!canEdit || !statusChangeTarget) return;
      const targetId = statusChangeTarget.id;
      const updated = await statusMutation.mutateAsync({ id: targetId, status });
      setViewingItem((prev) => (prev?.id === targetId ? updated : prev));
      setStatusChangeTarget(null);
    },
    [statusChangeTarget, statusMutation, canEdit],
  );

  if (isInitializing) return <SessionInitializingSpinner />;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-sm text-muted-foreground">
        {txt('purchaseOrder.noViewPermission')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <DonMuaToolbar
          orders={orders}
          suppliers={suppliers}
          onAdd={() => {
            if (!canCreate) return;
            setFormOrigin('list');
            setEditingItem(null);
            setPresetNhaCungCapId(undefined);
            startTransition(() => setShowForm(true));
          }}
          onDeleteMany={handleDeleteMany}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <ErrorState
              title={txt('purchaseOrder.listLoadErrorTitle')}
              message={txt('purchaseOrder.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <DonMuaTable
              data={sortedFilteredOrders}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {viewingItem && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <DonMuaDetail
              data={viewingItem}
              onClose={handleCloseOrderDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onAddLine={handleAddLine}
              onEditLine={handleEditLine}
              onDeleteLine={handleDeleteLine}
            />
          </Suspense>
        )}
        {viewingItem && lineForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <DonMuaLineForm
              order={viewingItem}
              initialLine={lineForm.mode === 'edit' ? lineForm.line : null}
              onClose={handleCloseLineForm}
              onSaved={handleLineSaved}
              stackLevel={showForm ? 2 : 1}
            />
          </Suspense>
        )}
        {statusChangeTarget && (
          <Suspense fallback={null}>
            <DonMuaStatusChangeDialog
              open
              order={statusChangeTarget}
              isSubmitting={statusMutation.isPending}
              onClose={() => setStatusChangeTarget(null)}
              onSave={handleStatusSave}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <DonMuaForm
              initialData={editingItem}
              presetNhaCungCapId={presetNhaCungCapId}
              onClose={handleCloseForm}
              onSaved={(saved) => {
                setViewingItem(saved);
              }}
              stackLevel={viewingItem ? 1 : 0}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MuaNguyenLieuPage;
