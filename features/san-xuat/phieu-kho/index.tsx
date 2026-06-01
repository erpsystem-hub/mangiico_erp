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
import { List, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useTabSearchParam } from '@/hooks/use-tab-search-param';
import TabGroup from '@/components/ui/TabGroup';
import PhieuKhoToolbar from './components/phieu-kho-toolbar';
import PhieuKhoTable from './components/phieu-kho-table';
import PhieuKhoLinesToolbar from './components/phieu-kho-lines-toolbar';
import PhieuKhoLinesTable from './components/phieu-kho-lines-table';
import {
  useWarehouseSlips,
  useWarehouseSlipDetail,
  useWarehouseSlipLines,
  useDeleteWarehouseSlip,
  useCancelWarehouseSlip,
} from './hooks/use-phieu-kho';
import { getWarehouseSlipById } from './services/phieu-kho-service';
import ErrorState from '@/components/shared/ErrorState';
import { useWarehouseSlipStore } from './store/useWarehouseSlipStore';
import { useWarehouseSlipLineStore } from './store/useWarehouseSlipLineStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { queryKeys } from '@/lib/query-keys';
import type { WarehouseSlip, WarehouseSlipListItem } from './core/types';
import { matchesWarehouseSlipFilters } from './utils/warehouse-slip-list-filter';
import { matchesWarehouseSlipLineFilters } from './utils/warehouse-slip-line-list-filter';
import {
  canDeleteWarehouseSlip,
  canEditWarehouseSlip,
  warehouseSlipNoViewMessage,
} from './core/constants';

const PhieuKhoForm = lazy(() => import('./components/phieu-kho-form'));
const PhieuKhoDetail = lazy(() => import('./components/phieu-kho-detail'));

type PhieuKhoLocationState = {
  openCreate?: boolean;
  viewSlipId?: string;
};

const TAB_IDS = ['danh-sach', 'chi-tiet'] as const;

type FormOrigin = 'list' | 'detail';

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

const PhieuKhoPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'warehouseSlips');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('warehouseSlips');
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const didRedirect = useRef(false);
  const confirm = useConfirmStore((s) => s.confirm);

  const [activeTab, setActiveTab] = useTabSearchParam(TAB_IDS, 'danh-sach');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseSlip | null>(null);
  const [viewingItem, setViewingItem] = useState<WarehouseSlip | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');

  const { searchTerm, filters, resetState, clearSelection, sort } = useWarehouseSlipStore();
  const {
    searchTerm: lineSearchTerm,
    filters: lineFilters,
    resetState: resetLineState,
    sort: lineSort,
  } = useWarehouseSlipLineStore();

  const { data: slips = [], isLoading, isError, refetch } = useWarehouseSlips({
    enabled: canView && activeTab === 'danh-sach',
  });
  const {
    data: lines = [],
    isLoading: isLinesLoading,
    isError: isLinesError,
    refetch: refetchLines,
  } = useWarehouseSlipLines({
    enabled: canView && activeTab === 'chi-tiet',
  });

  const deleteMutation = useDeleteWarehouseSlip();
  const cancelMutation = useCancelWarehouseSlip();

  const pendingViewId = (location.state as PhieuKhoLocationState | null)?.viewSlipId;
  const { data: pendingViewSlip } = useWarehouseSlipDetail(pendingViewId, {
    enabled: canView && Boolean(pendingViewId),
  });

  const viewingSlipId = viewingItem?.id;
  const { data: viewingSlipDetail } = useWarehouseSlipDetail(viewingSlipId, {
    enabled: canView && Boolean(viewingSlipId) && activeTab === 'danh-sach',
  });

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(warehouseSlipNoViewMessage());
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
    if (!viewingItem) return;
    const fresh = slips.find((s) => s.id === viewingItem.id);
    if (!fresh) return;
    queueMicrotask(() => {
      setViewingItem((prev) => {
        if (!prev || prev.id !== fresh.id) return prev;
        const cached = queryClient.getQueryData<WarehouseSlip>(
          queryKeys.warehouseSlips.detail(fresh.id),
        );
        const detailLines = cached?.lines?.length ? cached.lines : prev.lines;
        return { ...fresh, lines: detailLines ?? fresh.lines };
      });
      queryClient.setQueryData(queryKeys.warehouseSlips.detail(fresh.id), (old) => {
        const cached = old as WarehouseSlip | undefined;
        if (!cached?.lines?.length) return fresh;
        return { ...fresh, lines: cached.lines };
      });
    });
  }, [slips, viewingItem?.id, queryClient]);

  useEffect(() => {
    const state = location.state as PhieuKhoLocationState | null;
    if (!state) return;

    if (state.openCreate && canCreate) {
      startTransition(() => {
        setFormOrigin('list');
        setEditingItem(null);
        setShowForm(true);
      });
    }

    if (state.viewSlipId) {
      setActiveTab('danh-sach');
      const cached = slips.find((s) => s.id === state.viewSlipId);
      if (cached) {
        queryClient.setQueryData(queryKeys.warehouseSlips.detail(cached.id), cached);
        setViewingItem(cached);
      }
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, canCreate, slips, navigate, queryClient, setActiveTab]);

  useEffect(() => {
    if (!pendingViewId || !pendingViewSlip) return;
    setActiveTab('danh-sach');
    setViewingItem(pendingViewSlip);
  }, [pendingViewId, pendingViewSlip, setActiveTab]);

  useEffect(() => {
    if (!viewingSlipDetail) return;
    setViewingItem((prev) => {
      if (!prev || prev.id !== viewingSlipDetail.id) return prev;
      return viewingSlipDetail;
    });
  }, [viewingSlipDetail]);

  const filterFn = useCallback(
    (item: WarehouseSlipListItem, term: string, f: typeof filters) =>
      matchesWarehouseSlipFilters(item, term, f),
    [],
  );

  const lineFilterFn = useCallback(
    (item: (typeof lines)[number], term: string, f: typeof lineFilters) =>
      matchesWarehouseSlipLineFilters(item, term, f),
    [],
  );

  const filteredSlips = useListWithFilter(slips, searchTerm, filters, filterFn);
  const filteredLines = useListWithFilter(lines, lineSearchTerm, lineFilters, lineFilterFn);

  const sortedFilteredSlips = useMemo(() => {
    const list = [...filteredSlips];
    const { column, direction } = sort;
    if (!column || !direction) {
      return list.sort(
        (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
      );
    }
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = a[column as keyof WarehouseSlipListItem];
      const bv = b[column as keyof WarehouseSlipListItem];
      if (column === 'so_dong') return mul * (Number(av) - Number(bv));
      if (column === 'ngay_phieu' || column === 'tg_cap_nhat') {
        return mul * String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredSlips, sort]);

  const sortedFilteredLines = useMemo(() => {
    const list = [...filteredLines];
    const { column, direction } = lineSort;
    if (!column || !direction) return list;
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = a[column as keyof (typeof lines)[number]];
      const bv = b[column as keyof (typeof lines)[number]];
      if (column === 'so_luong') return mul * (Number(av) - Number(bv));
      if (column === 'ngay_phieu') {
        return mul * String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return mul * String(av ?? '').localeCompare(String(bv ?? ''), 'vi');
    });
    return list;
  }, [filteredLines, lineSort]);

  const fetchSlipDetail = useCallback(
    async (id: string) => {
      const full = await queryClient.fetchQuery({
        queryKey: queryKeys.warehouseSlips.detail(id),
        queryFn: () => getWarehouseSlipById(id),
      });
      return full ?? null;
    },
    [queryClient],
  );

  const handlePrint = useCallback(
    (item: WarehouseSlip | WarehouseSlipListItem) => {
      navigate(`/san-xuat/phieu-kho/${item.id}/in`);
    },
    [navigate],
  );

  const handleView = useCallback(
    async (item: WarehouseSlipListItem) => {
      queryClient.setQueryData(queryKeys.warehouseSlips.detail(item.id), item);
      setViewingItem(item);
      const full = await fetchSlipDetail(item.id);
      if (full) setViewingItem(full);
      else toast.error(txt('warehouseSlip.service.notFound'));
    },
    [fetchSlipDetail, queryClient],
  );

  const handleEdit = async (item: WarehouseSlip | WarehouseSlipListItem) => {
    if (!canEdit) return;
    if (!canEditWarehouseSlip(item.trang_thai, item.da_post_ton)) {
      toast.error(txt('warehouseSlip.editBlockedStatus'));
      return;
    }
    const full =
      'lines' in item && item.lines?.length ? item : await fetchSlipDetail(item.id);
    if (!full) {
      toast.error(txt('warehouseSlip.service.notFound'));
      return;
    }
    startTransition(() => {
      setFormOrigin(viewingItem ? 'detail' : 'list');
      setEditingItem(full);
      setShowForm(true);
    });
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: txt('warehouseSlip.deleteTitle'),
      message: txt('warehouseSlip.deleteMessage'),
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
      const s = slips.find((x) => x.id === id);
      return s && !canDeleteWarehouseSlip(s.trang_thai, s.da_post_ton);
    });
    if (blocked.length > 0) {
      toast.error(txt('warehouseSlip.deleteBlockedStatus'));
      return;
    }
    confirm({
      title: txt('warehouseSlip.bulkDeleteTitle'),
      message: txt('warehouseSlip.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
        setViewingItem(null);
        clearSelection();
      },
    });
  };

  const handleCancelSlip = useCallback(
    (item: WarehouseSlip) => {
      if (!canEdit) return;
      confirm({
        title: txt('warehouseSlip.cancelTitle'),
        message: txt('warehouseSlip.cancelMessage'),
        variant: 'danger',
        confirmText: txt('warehouseSlip.detail.cancelSlip'),
        onConfirm: () => {
          cancelMutation.mutate(item.id, {
            onSuccess: (updated) => {
              setViewingItem(updated);
            },
          });
        },
      });
    },
    [canEdit, confirm, cancelMutation],
  );

  const handleCloseForm = () => {
    const wasEditing = editingItem;
    setShowForm(false);
    setEditingItem(null);
    if (formOrigin === 'detail' && wasEditing && viewingItem?.id === wasEditing.id) {
      const cached = queryClient.getQueryData<WarehouseSlip>(
        queryKeys.warehouseSlips.detail(wasEditing.id),
      );
      if (cached) setViewingItem(cached);
      else {
        const fresh = slips.find((s) => s.id === wasEditing.id);
        if (fresh) setViewingItem(fresh);
      }
    }
    setFormOrigin('list');
  };

  const handleCloseDetail = useCallback(() => {
    if (showForm) return;
    setViewingItem(null);
  }, [showForm]);

  const detailData = viewingSlipDetail ?? viewingItem;

  const tabs = useMemo(
    () => [
      { id: 'danh-sach' as const, label: txt('warehouseSlip.tabList'), icon: List },
      { id: 'chi-tiet' as const, label: txt('warehouseSlip.tabLines'), icon: Package },
    ],
    [],
  );

  if (isInitializing) return <SessionInitializingSpinner />;

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-sm text-muted-foreground">
        {warehouseSlipNoViewMessage()}
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
          <PhieuKhoToolbar
            slips={slips}
            onAdd={() => {
              if (!canCreate) return;
              setFormOrigin('list');
              setEditingItem(null);
              startTransition(() => setShowForm(true));
            }}
            onDeleteMany={handleDeleteMany}
          />

          <div className="flex-1 min-h-0 flex flex-col">
            {isError ? (
              <ErrorState
                title={txt('warehouseSlip.listLoadErrorTitle')}
                message={txt('warehouseSlip.listLoadErrorHint')}
                onRetry={() => refetch()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
              <PhieuKhoTable
                data={sortedFilteredSlips}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onPrint={handlePrint}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <PhieuKhoLinesToolbar lines={lines} />

          <div className="flex-1 min-h-0 flex flex-col">
            {isLinesError ? (
              <ErrorState
                title={txt('warehouseSlip.linesLoadErrorTitle')}
                message={txt('warehouseSlip.linesLoadErrorHint')}
                onRetry={() => refetchLines()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
              <PhieuKhoLinesTable data={sortedFilteredLines} isLoading={isLinesLoading} />
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeTab === 'danh-sach' && viewingItem && detailData && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <PhieuKhoDetail
              data={detailData}
              onClose={handleCloseDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrint={handlePrint}
              onCancel={handleCancelSlip}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <PhieuKhoForm
              initialData={editingItem}
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

export default PhieuKhoPage;
