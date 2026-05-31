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
import DonHangToolbar from './components/don-hang-toolbar';
import DonHangTable from './components/don-hang-table';
import {
  useSalesOrders,
  useDeleteSalesOrder,
  useSalesOrderDetail,
} from './hooks/use-don-hang';
import { getSalesOrderById } from './services/don-hang-service';
import ErrorState from '@/components/shared/ErrorState';
import { useSalesOrderStore } from './store/useSalesOrderStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { queryKeys } from '@/lib/query-keys';
import type { SalesOrder } from './core/types';
import { matchesSalesOrderFilters } from './utils/order-list-filter';
import { canDeleteSalesOrder } from './core/constants';

const DonHangForm = lazy(() => import('./components/don-hang-form'));
const DonHangDetail = lazy(() => import('./components/don-hang-detail'));

type DonHangLocationState = {
  openCreate?: boolean;
  presetKhachHangId?: string;
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

const DonHangPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'salesOrders');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('salesOrders');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const didRedirect = useRef(false);
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesOrder | null>(null);
  const [viewingItem, setViewingItem] = useState<SalesOrder | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [presetKhachHangId, setPresetKhachHangId] = useState<string | undefined>();

  const { searchTerm, filters, resetState, clearSelection, sort } = useSalesOrderStore();

  const { data: orders = [], isLoading, isError, refetch } = useSalesOrders({ enabled: canView });
  const { data: customers = [] } = usePartnerList('khach_hang', { enabled: canView });
  const deleteMutation = useDeleteSalesOrder();

  const pendingViewId = (location.state as DonHangLocationState | null)?.viewOrderId;
  const { data: pendingViewOrder } = useSalesOrderDetail(pendingViewId, {
    enabled: canView && Boolean(pendingViewId),
  });

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('salesOrder.noViewPermission'));
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
        const cached = queryClient.getQueryData<SalesOrder>(
          queryKeys.salesOrders.detail(fresh.id),
        );
        const lines = cached?.lines?.length ? cached.lines : prev.lines;
        return { ...fresh, lines: lines ?? fresh.lines };
      });
      queryClient.setQueryData(queryKeys.salesOrders.detail(fresh.id), (old) => {
        const cached = old as SalesOrder | undefined;
        if (!cached?.lines?.length) return fresh;
        return { ...fresh, lines: cached.lines };
      });
    });
  }, [orders, viewingItem?.id, queryClient]);

  useEffect(() => {
    const state = location.state as DonHangLocationState | null;
    if (!state) return;

    if (state.openCreate && canCreate) {
      startTransition(() => {
        setFormOrigin('list');
        setEditingItem(null);
        setPresetKhachHangId(state.presetKhachHangId);
        setShowForm(true);
      });
    }

    if (state.viewOrderId) {
      const cached = orders.find((o) => o.id === state.viewOrderId);
      if (cached) {
        queryClient.setQueryData(queryKeys.salesOrders.detail(cached.id), cached);
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
    (item: SalesOrder, term: string, f: typeof filters) =>
      matchesSalesOrderFilters(item, term, f),
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
      const av = a[column as keyof SalesOrder];
      const bv = b[column as keyof SalesOrder];
      if (column === 'tong_tien') return mul * (Number(av) - Number(bv));
      if (column === 'ngay_dat' || column === 'tg_cap_nhat') {
        return mul * (String(av).localeCompare(String(bv)));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredOrders, sort]);

  const fetchOrderDetail = useCallback(
    async (id: string) => {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.salesOrders.detail(id),
        queryFn: () => getSalesOrderById(id),
      });
      return full ?? null;
    },
    [queryClient],
  );

  const handleView = useCallback(
    async (item: SalesOrder) => {
      const full = await fetchOrderDetail(item.id);
      if (full) setViewingItem(full);
      else toast.error(txt('salesOrder.service.notFound'));
    },
    [fetchOrderDetail],
  );

  const handleEdit = async (item: SalesOrder) => {
    if (!canEdit) return;
    const full =
      item.lines?.length ? item : await fetchOrderDetail(item.id);
    if (!full) {
      toast.error(txt('salesOrder.service.notFound'));
      return;
    }
    startTransition(() => {
      setFormOrigin(viewingItem ? 'detail' : 'list');
      setEditingItem(full);
      setPresetKhachHangId(undefined);
      setShowForm(true);
    });
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: txt('salesOrder.deleteTitle'),
      message: txt('salesOrder.deleteMessage'),
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
      return o && !canDeleteSalesOrder(o.trang_thai);
    });
    if (blocked.length > 0) {
      toast.error(txt('salesOrder.deleteBlockedStatus'));
      return;
    }
    confirm({
      title: txt('salesOrder.bulkDeleteTitle'),
      message: txt('salesOrder.bulkDeleteMessage', { count: ids.length }),
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
    setPresetKhachHangId(undefined);
    if (formOrigin === 'detail' && wasEditing && viewingItem?.id === wasEditing.id) {
      const cached = queryClient.getQueryData<SalesOrder>(
        queryKeys.salesOrders.detail(wasEditing.id),
      );
      if (cached) setViewingItem(cached);
      else {
        const fresh = orders.find((o) => o.id === wasEditing.id);
        if (fresh) setViewingItem(fresh);
      }
    }
    setFormOrigin('list');
  };

  if (isInitializing) return <SessionInitializingSpinner />;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-sm text-muted-foreground">
        {txt('salesOrder.noViewPermission')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <DonHangToolbar
          orders={orders}
          customers={customers}
          onAdd={() => {
            if (!canCreate) return;
            setFormOrigin('list');
            setEditingItem(null);
            setPresetKhachHangId(undefined);
            startTransition(() => setShowForm(true));
          }}
          onDeleteMany={handleDeleteMany}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <ErrorState
              title={txt('salesOrder.listLoadErrorTitle')}
              message={txt('salesOrder.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <DonHangTable
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
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <DonHangForm
              initialData={editingItem}
              presetKhachHangId={presetKhachHangId}
              onClose={handleCloseForm}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <DonHangDetail
              data={viewingItem}
              onClose={() => setViewingItem(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonHangPage;
