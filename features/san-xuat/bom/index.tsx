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
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { useProductCategories } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import BomToolbar from './components/bom-toolbar';
import BomTable from './components/bom-table';
import {
  useBomList,
  useDeleteBomItems,
  useUpdateBomStatus,
} from './hooks/use-bom';
import ErrorState from '@/components/shared/ErrorState';
import { useBomStore } from './store/useBomStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import type { BomItem } from './core/types';
import { matchesBomFilters } from './utils/bom-list-filter';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

const BomForm = lazy(() => import('./components/bom-form'));
const BomDetail = lazy(() => import('./components/bom-detail'));

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

const BomPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'bom');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('bom');
  const navigate = useNavigate();
  const didRedirect = useRef(false);
  const queryClient = useQueryClient();
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BomItem | null>(null);
  const [viewingItem, setViewingItem] = useState<BomItem | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');

  const { searchTerm, filters, resetState } = useBomStore();

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('bom.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  const { data: categories = [] } = useProductCategories({ enabled: canView });
  const { data: items = [], isLoading, isError, refetch } = useBomList({ enabled: canView });
  const deleteMutation = useDeleteBomItems();
  const statusMutation = useUpdateBomStatus();

  useEffect(() => () => resetState(), [resetState]);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = items.find((a) => a.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [items, viewingItem]);

  const filterFn = useCallback(
    (item: BomItem, term: string, f: typeof filters) =>
      matchesBomFilters(item, categories, term, f),
    [categories],
  );

  const filteredItems = useListWithFilter(items, searchTerm, filters, filterFn);

  const statusCounts = useMemo(
    () => ({
      Active: filteredItems.filter((d) => d.trang_thai === 'Đang hoạt động').length,
      Inactive: filteredItems.filter((d) => d.trang_thai === 'Ngừng hoạt động').length,
    }),
    [filteredItems],
  );

  const handleView = useCallback(
    (item: BomItem) => {
      queryClient.setQueryData(queryKeys.bom.detail(item.id), item);
      setViewingItem(item);
    },
    [queryClient],
  );

  const handleEdit = (item: BomItem) => {
    if (!canEdit) return;
    startTransition(() => {
      setFormOrigin(viewingItem ? 'detail' : 'list');
      setEditingItem(item);
      setShowForm(true);
    });
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: txt('bom.deleteTitle'),
      message: txt('bom.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        deleteMutation.mutate([id], {
          onSuccess: () => {
            if (viewingItem?.id === id) setViewingItem(null);
          },
        });
      },
    });
  };

  const handleStatusChange = (item: BomItem) => {
    if (!canEdit) return;
    const newStatus: TrangThaiHoatDong =
      item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('bom.statusChangeTitle'),
      message: `${txt('bom.statusChangeMessage')} ${newStatus}?`,
      confirmText: CONFIRM_YES(),
      onConfirm: () => statusMutation.mutate({ ids: [item.id], status: newStatus }),
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete || ids.length === 0) return;
    confirm({
      title: txt('bom.bulkDeleteTitle'),
      message: txt('bom.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: () => deleteMutation.mutate(ids),
    });
  };

  const handleStatusChangeMany = (ids: string[], status: TrangThaiHoatDong) => {
    if (!canEdit || ids.length === 0) return;
    statusMutation.mutate({ ids, status });
  };

  const handleCloseForm = () => {
    const wasEditing = editingItem;
    setShowForm(false);
    setEditingItem(null);
    if (formOrigin === 'detail' && wasEditing && viewingItem?.id === wasEditing.id) {
      const fresh = items.find((d) => d.id === wasEditing.id);
      if (fresh) setViewingItem(fresh);
    }
    setFormOrigin('list');
  };

  if (isInitializing) {
    return <SessionInitializingSpinner />;
  }

  if (!canView) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] px-4"
        aria-busy="true"
      />
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <BomToolbar
          categories={categories}
          items={items}
          onAdd={() => {
            if (!canCreate) return;
            setFormOrigin('list');
            setEditingItem(null);
            startTransition(() => setShowForm(true));
          }}
          onDeleteMany={handleDeleteMany}
          onStatusChangeMany={handleStatusChangeMany}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <ErrorState
              title={txt('bom.listLoadErrorTitle')}
              message={txt('bom.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <BomTable
              data={filteredItems}
              isLoading={isLoading}
              statusCounts={statusCounts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onView={handleView}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <BomForm initialData={editingItem} onClose={handleCloseForm} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <BomDetail
              data={viewingItem}
              onClose={() => setViewingItem(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BomPage;
