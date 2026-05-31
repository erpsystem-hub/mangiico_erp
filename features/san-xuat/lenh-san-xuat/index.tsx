import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { txt } from '@/lib/text';
import { AnimatePresence } from 'framer-motion';
import { List, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { usePartnerList } from '@/features/kinh-doanh/doi-tac/hooks/use-doi-tac-list';
import { useTabSearchParam } from '@/hooks/use-tab-search-param';
import TabGroup from '@/components/ui/TabGroup';
import LenhSanXuatToolbar from './components/lenh-san-xuat-toolbar';
import LenhSanXuatTable from './components/lenh-san-xuat-table';
import LenhSanXuatLinesToolbar from './components/lenh-san-xuat-lines-toolbar';
import LenhSanXuatLinesTable from './components/lenh-san-xuat-lines-table';
import {
  useProductionOrders,
  useProductionOrderDetail,
  useProductionOrderLines,
  useUpdateProductionOrderStatus,
} from './hooks/use-lenh-san-xuat';
import { getProductionOrderById } from './services/lenh-san-xuat-service';
import ErrorState from '@/components/shared/ErrorState';
import { useProductionOrderStore } from './store/useProductionOrderStore';
import { useProductionOrderLineStore } from './store/useProductionOrderLineStore';
import { useListWithFilter } from '@/lib/hooks';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { queryKeys } from '@/lib/query-keys';
import type { ProductionOrder, ProductionOrderLineRow } from './core/types';
import type { TrangThaiLenhSx } from './core/constants';
import { matchesProductionOrderFilters } from './utils/production-order-list-filter';
import { matchesProductionOrderLineFilters } from './utils/production-order-line-list-filter';
import {
  productionLineFromRow,
  productionOrderFromLineRow,
} from './utils/production-order-line-mapper';

const LenhSanXuatDetail = lazy(() => import('./components/lenh-san-xuat-detail'));
const LenhSanXuatLineDetail = lazy(() => import('./components/lenh-san-xuat-line-detail'));
const LenhSanXuatStatusChangeDialog = lazy(
  () => import('./components/lenh-san-xuat-status-change-dialog'),
);

type LenhSxLocationState = {
  viewOrderId?: string;
};

const TAB_IDS = ['danh-sach', 'chi-tiet'] as const;

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

const LenhSanXuatPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'productionOrders');
  const { isInitializing } = useAppSessionReady();
  const { canEdit } = useResourcePermissions('productionOrders');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const didRedirect = useRef(false);

  const [activeTab, setActiveTab] = useTabSearchParam(TAB_IDS, 'danh-sach');
  const [viewingItem, setViewingItem] = useState<ProductionOrder | null>(null);
  const [viewingLineRow, setViewingLineRow] = useState<ProductionOrderLineRow | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<ProductionOrder | null>(null);

  const { searchTerm, filters, resetState, sort } = useProductionOrderStore();
  const {
    searchTerm: lineSearchTerm,
    filters: lineFilters,
    resetState: resetLineState,
    sort: lineSort,
  } = useProductionOrderLineStore();

  const { data: orders = [], isLoading, isError, refetch } = useProductionOrders({
    enabled: canView && activeTab === 'danh-sach',
  });
  const {
    data: lines = [],
    isLoading: isLinesLoading,
    isError: isLinesError,
    refetch: refetchLines,
  } = useProductionOrderLines({
    enabled: canView && activeTab === 'chi-tiet',
  });
  const { data: customers = [] } = usePartnerList('khach_hang', { enabled: canView });
  const statusMutation = useUpdateProductionOrderStatus();

  const pendingViewId = (location.state as LenhSxLocationState | null)?.viewOrderId;
  const { data: pendingViewOrder } = useProductionOrderDetail(pendingViewId, {
    enabled: canView && Boolean(pendingViewId),
  });

  const viewingOrderId = viewingItem?.id;
  const { data: viewingOrderDetail } = useProductionOrderDetail(viewingOrderId, {
    enabled: canView && Boolean(viewingOrderId) && activeTab === 'danh-sach',
  });

  const fetchOrderDetail = useCallback(
    async (id: string) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.productionOrders.detail(id),
      });
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.productionOrders.detail(id),
        queryFn: () => getProductionOrderById(id),
        staleTime: 0,
      });
      return full ?? null;
    },
    [queryClient],
  );

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('productionOrder.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  useEffect(
    () => () => {
      resetState();
      resetLineState();
    },
    [resetState, resetLineState],
  );

  useEffect(() => {
    if (!viewingOrderDetail) return;
    setViewingItem((prev) => {
      if (!prev || prev.id !== viewingOrderDetail.id) return prev;
      return viewingOrderDetail;
    });
  }, [viewingOrderDetail]);

  useEffect(() => {
    const state = location.state as LenhSxLocationState | null;
    if (!state?.viewOrderId) return;

    setActiveTab('danh-sach');
    void fetchOrderDetail(state.viewOrderId).then((full) => {
      if (full) setViewingItem(full);
    });

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, fetchOrderDetail, setActiveTab]);

  useEffect(() => {
    if (!pendingViewId || !pendingViewOrder) return;
    setActiveTab('danh-sach');
    setViewingItem(pendingViewOrder);
  }, [pendingViewId, pendingViewOrder, setActiveTab]);

  const filterFn = useCallback(
    (item: ProductionOrder, term: string, f: typeof filters) =>
      matchesProductionOrderFilters(item, term, f),
    [],
  );

  const lineFilterFn = useCallback(
    (item: ProductionOrderLineRow, term: string, f: typeof lineFilters) =>
      matchesProductionOrderLineFilters(item, term, f),
    [],
  );

  const filteredOrders = useListWithFilter(orders, searchTerm, filters, filterFn);
  const filteredLines = useListWithFilter(lines, lineSearchTerm, lineFilters, lineFilterFn);

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
      const av = a[column as keyof ProductionOrder];
      const bv = b[column as keyof ProductionOrder];
      if (column === 'ngay_dat' || column === 'ngay_giao_du_kien' || column === 'tg_cap_nhat') {
        return mul * String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredOrders, sort]);

  const sortedFilteredLines = useMemo(() => {
    const list = [...filteredLines];
    const { column, direction } = lineSort;
    if (!column || !direction) return list;
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = a[column as keyof ProductionOrderLineRow];
      const bv = b[column as keyof ProductionOrderLineRow];
      if (column === 'ngay_dat' || column === 'ngay_giao_du_kien') {
        return mul * String(av ?? '').localeCompare(String(bv ?? ''));
      }
      if (column === 'so_luong') {
        return mul * (Number(av) - Number(bv));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredLines, lineSort]);

  const handleView = useCallback(
    (item: ProductionOrder) => {
      setViewingItem(item);
      void fetchOrderDetail(item.id).then((full) => {
        if (full) setViewingItem(full);
        else toast.error(txt('productionOrder.service.notFound'));
      });
    },
    [fetchOrderDetail],
  );

  const detailData = viewingOrderDetail ?? viewingItem;

  const handleViewLine = useCallback((row: ProductionOrderLineRow) => {
    setViewingLineRow(row);
  }, []);

  const handleCloseLineDetail = useCallback(() => {
    setViewingLineRow(null);
  }, []);

  const handleCloseOrderDetail = useCallback(() => {
    if (statusChangeTarget) return;
    setViewingItem(null);
  }, [statusChangeTarget]);

  const handleStatusChange = useCallback(
    (item: ProductionOrder) => {
      if (!canEdit) return;
      setStatusChangeTarget(item);
    },
    [canEdit],
  );

  const handleStatusSave = useCallback(
    async (status: TrangThaiLenhSx) => {
      if (!canEdit || !statusChangeTarget) return;
      const targetId = statusChangeTarget.id;
      const updated = await statusMutation.mutateAsync({ id: targetId, status });
      setViewingItem((prev) => (prev?.id === targetId ? updated : prev));
      setStatusChangeTarget(null);
    },
    [statusChangeTarget, statusMutation, canEdit],
  );

  const tabs = useMemo(
    () => [
      { id: 'danh-sach' as const, label: txt('productionOrder.tabList'), icon: List },
      { id: 'chi-tiet' as const, label: txt('productionOrder.tabLines'), icon: Package },
    ],
    [],
  );

  if (isInitializing) return <SessionInitializingSpinner />;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-sm text-muted-foreground">
        {txt('productionOrder.noViewPermission')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="shrink-0 relative z-0">
        <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'danh-sach' ? (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <LenhSanXuatToolbar orders={orders} customers={customers} />

          <div className="flex-1 min-h-0 flex flex-col">
            {isError ? (
              <ErrorState
                title={txt('productionOrder.listLoadErrorTitle')}
                message={txt('productionOrder.listLoadErrorHint')}
                onRetry={() => refetch()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
              <LenhSanXuatTable
                data={sortedFilteredOrders}
                isLoading={isLoading}
                onView={handleView}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <LenhSanXuatLinesToolbar lines={lines} customers={customers} />

          <div className="flex-1 min-h-0 flex flex-col">
            {isLinesError ? (
              <ErrorState
                title={txt('productionOrder.linesLoadErrorTitle')}
                message={txt('productionOrder.linesLoadErrorHint')}
                onRetry={() => refetchLines()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
              <LenhSanXuatLinesTable
                data={sortedFilteredLines}
                isLoading={isLinesLoading}
                onView={handleViewLine}
              />
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeTab === 'danh-sach' && viewingItem && detailData && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <LenhSanXuatDetail
              data={detailData}
              onClose={handleCloseOrderDetail}
              onStatusChange={handleStatusChange}
            />
          </Suspense>
        )}
        {activeTab === 'chi-tiet' && viewingLineRow && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <LenhSanXuatLineDetail
              order={productionOrderFromLineRow(viewingLineRow)}
              line={productionLineFromRow(viewingLineRow)}
              onClose={handleCloseLineDetail}
            />
          </Suspense>
        )}
        {statusChangeTarget && (
          <Suspense fallback={null}>
            <LenhSanXuatStatusChangeDialog
              open
              order={statusChangeTarget}
              isSubmitting={statusMutation.isPending}
              onClose={() => setStatusChangeTarget(null)}
              onSave={handleStatusSave}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LenhSanXuatPage;
