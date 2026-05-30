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
import { useMaterialCategories } from '@/features/san-xuat/danh-muc-nguyen-lieu/hooks/use-danh-muc-nguyen-lieu';
import MaterialCatalogToolbar from './components/danh-sach-nguyen-lieu-toolbar';
import MaterialCatalogTable from './components/danh-sach-nguyen-lieu-table';
import {
  useMaterialCatalogList,
  useDeleteMaterialCatalogItems,
  useUpdateMaterialCatalogStatus,
} from './hooks/use-danh-sach-nguyen-lieu';
import ErrorState from '@/components/shared/ErrorState';
import { useMaterialCatalogStore } from './store/useMaterialCatalogStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import type { MaterialCatalogItem } from './core/types';
import { matchesMaterialCatalogFilters } from './utils/catalog-list-filter';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';

const MaterialCatalogForm = lazy(() => import('./components/danh-sach-nguyen-lieu-form'));
const MaterialCatalogDetail = lazy(() => import('./components/danh-sach-nguyen-lieu-detail'));

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

const MaterialCatalogPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'materialCatalog');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('materialCatalog');
  const navigate = useNavigate();
  const didRedirect = useRef(false);
  const queryClient = useQueryClient();
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialCatalogItem | null>(null);
  const [viewingItem, setViewingItem] = useState<MaterialCatalogItem | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');

  const { searchTerm, filters, resetState, clearSelection, selectedIds } = useMaterialCatalogStore();

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('materialCatalog.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  const { data: categories = [] } = useMaterialCategories({ enabled: canView });
  const { data: items = [], isLoading, isError, refetch } = useMaterialCatalogList({
    enabled: canView,
  });
  const deleteMutation = useDeleteMaterialCatalogItems();
  const statusMutation = useUpdateMaterialCatalogStatus();

  useEffect(() => () => resetState(), [resetState]);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = items.find((a) => a.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [items, viewingItem]);

  const filterFn = useCallback(
    (item: MaterialCatalogItem, term: string, f: typeof filters) =>
      matchesMaterialCatalogFilters(item, categories, term, f),
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
    (item: MaterialCatalogItem) => {
      queryClient.setQueryData(queryKeys.materialCatalog.detail(item.id), item);
      setViewingItem(item);
    },
    [queryClient],
  );

  const handleEdit = (item: MaterialCatalogItem) => {
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
      title: txt('materialCatalog.deleteTitle'),
      message: txt('materialCatalog.deleteMessage'),
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

  const handleStatusChange = (item: MaterialCatalogItem) => {
    if (!canEdit) return;
    const newStatus: TrangThaiHoatDong =
      item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('materialCatalog.statusChangeTitle'),
      message: `${txt('materialCatalog.statusChangeMessage')} ${newStatus}?`,
      confirmText: CONFIRM_YES(),
      onConfirm: () => statusMutation.mutate({ ids: [item.id], status: newStatus }),
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete || ids.length === 0) return;
    confirm({
      title: txt('materialCatalog.bulkDeleteTitle'),
      message: txt('materialCatalog.bulkDeleteMessage', { count: ids.length }),
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
        <MaterialCatalogToolbar
          categories={categories}
          items={items}
          onAdd={() => {
            if (!canCreate) return;
            setFormOrigin('list');
            startTransition(() => setShowForm(true));
          }}
          onDeleteMany={handleDeleteMany}
          onStatusChangeMany={handleStatusChangeMany}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <ErrorState
              title={txt('materialCatalog.listLoadErrorTitle')}
              message={txt('materialCatalog.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <MaterialCatalogTable
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
            <MaterialCatalogForm initialData={editingItem} onClose={handleCloseForm} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <MaterialCatalogDetail
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

export default MaterialCatalogPage;
