import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  lazy,
  Suspense,
  startTransition,
} from 'react';
import { txt } from '@/lib/text';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { usePartnerCategories } from './hooks/use-doi-tac-category';
import PartnerListToolbar from './components/list/partner-list-toolbar';
import PartnerListTable from './components/list/partner-list-table';
import {
  usePartnerList,
  useDeletePartnerListItems,
  useUpdatePartnerListStatus,
} from './hooks/use-doi-tac-list';
import ErrorState from '@/components/shared/ErrorState';
import { usePartnerListStore } from './store/usePartnerListStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { partnerListResource } from './core/constants';
import type { PartnerKind, PartnerListItem } from './core/types';
import { matchesPartnerListFilters } from './utils/partner-list-filter';

const PartnerListForm = lazy(() => import('./components/list/partner-list-form'));
const PartnerListDetail = lazy(() => import('./components/list/partner-list-detail'));

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

export interface PartnerListTabProps {
  kind: PartnerKind;
  initialDanhMucIds?: string[];
  onNavigateToList?: (danhMucIds: string[]) => void;
}

const PartnerListTab: React.FC<PartnerListTabProps> = ({
  kind,
  initialDanhMucIds,
}) => {
  const listResource = partnerListResource(kind);
  const canView = useCan('view', listResource);
  const { canCreate, canEdit, canDelete } = useResourcePermissions(listResource);
  const queryClient = useQueryClient();
  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerListItem | null>(null);
  const [viewingItem, setViewingItem] = useState<PartnerListItem | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [createDefaultDanhMucId, setCreateDefaultDanhMucId] = useState<string | undefined>();

  const { searchTerm, filters, resetState, clearSelection, selectedIds, setFilter } =
    usePartnerListStore();

  useEffect(() => () => resetState(), [resetState]);

  useEffect(() => {
    if (!initialDanhMucIds?.length) return;
    setFilter('id_danh_muc_goc', initialDanhMucIds);
  }, [initialDanhMucIds, setFilter]);

  const { data: categories = [] } = usePartnerCategories(kind, { enabled: canView });
  const { data: items = [], isLoading, isError, refetch } = usePartnerList(kind, {
    enabled: canView,
  });
  const deleteMutation = useDeletePartnerListItems(kind);
  const statusMutation = useUpdatePartnerListStatus(kind);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = items.find((a) => a.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [items, viewingItem]);

  const filterFn = useCallback(
    (item: PartnerListItem, term: string, f: typeof filters) =>
      matchesPartnerListFilters(item, categories, term, f),
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
    (item: PartnerListItem) => {
      queryClient.setQueryData(queryKeys.partnerList(kind).detail(item.id), item);
      setViewingItem(item);
    },
    [kind, queryClient],
  );

  const handleEdit = (item: PartnerListItem) => {
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
      title: txt('partnerList.deleteTitle'),
      message: txt('partnerList.deleteMessage'),
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

  const handleStatusChange = (item: PartnerListItem) => {
    if (!canEdit) return;
    const newStatus: TrangThaiHoatDong =
      item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('partnerList.statusChangeTitle'),
      message: `${txt('partnerList.statusChangeMessage')} ${newStatus}?`,
      confirmText: CONFIRM_YES(),
      onConfirm: () => statusMutation.mutate({ ids: [item.id], status: newStatus }),
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete || ids.length === 0) return;
    confirm({
      title: txt('partnerList.bulkDeleteTitle'),
      message: txt('partnerList.bulkDeleteMessage', { count: ids.length }),
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
    setCreateDefaultDanhMucId(undefined);
    if (formOrigin === 'detail' && wasEditing && viewingItem?.id === wasEditing.id) {
      const fresh = items.find((d) => d.id === wasEditing.id);
      if (fresh) setViewingItem(fresh);
    }
    setFormOrigin('list');
  };

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-sm text-muted-foreground">
        {txt('partnerList.noViewPermission')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <PartnerListToolbar
          listResource={listResource}
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
              title={txt('partnerList.listLoadErrorTitle')}
              message={txt('partnerList.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <PartnerListTable
              listResource={listResource}
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
            <PartnerListForm
              kind={kind}
              initialData={editingItem}
              defaultDanhMucId={createDefaultDanhMucId}
              onClose={handleCloseForm}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <PartnerListDetail
              listResource={listResource}
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

export default PartnerListTab;
