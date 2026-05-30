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
import { matchesSearchTerm } from '@/lib/searchUtils';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

import MeasurementSpecToolbar from './components/thong-so-do-toolbar';
import MeasurementSpecTable from './components/thong-so-do-table';
import ExportDialog from '@/components/shared/ExportDialog';
import ImportDialog from '@/components/shared/ImportDialog';

import {
  useMeasurementSpecs,
  useDeleteMeasurementSpec,
  useUpdateStatusMeasurementSpec,
  useImportMeasurementSpecs,
} from './hooks/use-thong-so-do';
import ErrorState from '@/components/shared/ErrorState';
import { useMeasurementSpecFilterCounts } from './hooks/use-measurement-spec-filter-counts';
import { useMeasurementSpecStore } from './store/useMeasurementSpecStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES, CONFIRM_DELETE_ALL } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { useExportData } from '@/lib/useExportData';
import type { MeasurementSpec } from './core/types';
import { MEASUREMENT_SPEC_SEARCHABLE_KEYS } from './utils/search-keys';
import { measurementSpecMatchesColumnSearch } from './utils/column-search';

const MeasurementSpecForm = lazy(() => import('./components/thong-so-do-form'));
const MeasurementSpecDetail = lazy(() => import('./components/thong-so-do-detail'));

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

const MeasurementSpecPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'measurementSpecs');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete, canExport, canImport } =
    useResourcePermissions('measurementSpecs');
  const navigate = useNavigate();
  const didRedirect = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('measurementSpec.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MeasurementSpec | null>(null);
  const [viewingItem, setViewingItem] = useState<MeasurementSpec | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const {
    searchTerm,
    filters,
    resetState,
    clearSelection,
    selectedIds,
    pagination,
    columns,
  } = useMeasurementSpecStore();

  const { data: items = [], isLoading, isError, refetch } = useMeasurementSpecs({
    enabled: canView,
  });
  const deleteMutation = useDeleteMeasurementSpec();
  const statusMutation = useUpdateStatusMeasurementSpec();
  const importMutation = useImportMeasurementSpecs(() => setShowImport(false));

  const { statusCounts } = useMeasurementSpecFilterCounts(items, searchTerm, filters);

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_hien_thi', label: txt('measurementSpec.form.displayName'), required: true },
      { key: 'don_vi', label: txt('measurementSpec.form.unit'), required: true },
      { key: 'trang_thai', label: txt('common.status') },
    ],
    [],
  );

  const handleImportData = useCallback(
    async (data: Record<string, unknown>[]) => {
      if (!canImport) return;
      await importMutation.mutateAsync(data);
    },
    [importMutation, canImport],
  );

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    if (!viewingItem) return;
    const fresh = items.find((a) => a.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [items, viewingItem]);

  const filterFn = useCallback(
    (item: MeasurementSpec, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        term,
        [...MEASUREMENT_SPEC_SEARCHABLE_KEYS],
      );
      const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      const matchesStatus = f.status.length === 0 || f.status.includes(statusKey);
      const matchesCol = measurementSpecMatchesColumnSearch(item, f.columnSearch);
      return matchesSearch && matchesStatus && matchesCol;
    },
    [],
  );

  const filteredItems = useListWithFilter(items, searchTerm, filters, filterFn);

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_hien_thi', label: txt('measurementSpec.exportDisplayName') },
      { key: 'don_vi', label: txt('measurementSpec.exportUnit') },
      { key: 'trang_thai_text', label: txt('measurementSpec.exportStatus') },
    ],
    [],
  );

  const exportMapFn = useCallback(
    (item: MeasurementSpec) => ({
      ten_hien_thi: item.ten_hien_thi,
      don_vi: item.don_vi,
      trang_thai_text: item.trang_thai,
    }),
    [],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } =
    useExportData({
      data: filteredItems,
      isOpen: showExport,
      mapFn: exportMapFn,
      pagination,
      selectedIds,
      keyExtractor: (a) => a.id,
    });

  const visibleColumnKeys = useMemo(
    () => columns.filter((c) => c.visible).map((c) => c.id),
    [columns],
  );

  const knownUnits = useMemo(() => items.map((i) => i.don_vi), [items]);

  const handleView = useCallback(
    (item: MeasurementSpec) => {
      queryClient.setQueryData(queryKeys.measurementSpecs.detail(item.id), item);
      setViewingItem(item);
    },
    [queryClient],
  );

  const handleEdit = (item: MeasurementSpec) => {
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
      title: txt('measurementSpec.deleteTitle'),
      message: txt('measurementSpec.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        deleteMutation.mutate([id], {
          onSuccess: () => {
            if (viewingItem && viewingItem.id === id) setViewingItem(null);
          },
        });
      },
    });
  };

  const handleStatusChange = (item: MeasurementSpec) => {
    if (!canEdit) return;
    const newStatus = item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('measurementSpec.statusChangeTitle'),
      message: `${txt('measurementSpec.statusChangeMessage', { count: 1 })} ${newStatus}?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate(
          { ids: [item.id], status: newStatus },
          {
            onSuccess: (updated) => {
              if (updated && viewingItem?.id === updated.id) setViewingItem(updated);
            },
          },
        );
      },
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete) return;
    confirm({
      title: txt('measurementSpec.bulkDeleteTitle'),
      message: txt('measurementSpec.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        deleteMutation.mutate(ids, {
          onSuccess: () => {
            clearSelection();
            if (viewingItem && ids.includes(viewingItem.id)) setViewingItem(null);
          },
        });
      },
    });
  };

  const handleStatusChangeMany = (ids: string[], status: TrangThaiHoatDong) => {
    if (!canEdit) return;
    confirm({
      title: txt('measurementSpec.statusChangeTitle'),
      message: `${txt('measurementSpec.statusChangeMessage', { count: ids.length })} ${status}?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate({ ids, status }, { onSuccess: () => clearSelection() });
      },
    });
  };

  const handleExport = () => {
    if (!canExport) return;
    if (filteredItems.length === 0) {
      toast.warning(txt('measurementSpec.noExportData'));
      return;
    }
    setShowExport(true);
  };

  const handleCloseForm = () => {
    const wasEditing = editingItem;
    const origin = formOrigin;
    setShowForm(false);
    setEditingItem(null);
    if (origin === 'detail' && viewingItem && wasEditing && viewingItem.id === wasEditing.id) {
      const fresh = items.find((a) => a.id === viewingItem.id);
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
        aria-label={txt('measurementSpec.loading')}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <MeasurementSpecToolbar
          statusCounts={statusCounts}
          onAdd={() => {
            if (!canCreate) return;
            startTransition(() => {
              setFormOrigin('list');
              setEditingItem(null);
              setShowForm(true);
            });
          }}
          onExport={handleExport}
          onImport={() => {
            if (!canImport) return;
            setShowImport(true);
          }}
          onDeleteMany={handleDeleteMany}
          onStatusChangeMany={handleStatusChangeMany}
        />

        <div className="flex-1 min-h-0">
          {isError ? (
            <ErrorState
              title={txt('measurementSpec.listLoadErrorTitle')}
              message={txt('measurementSpec.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <MeasurementSpecTable
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
            <MeasurementSpecForm
              key={editingItem?.id ?? 'new'}
              initialData={editingItem}
              knownUnits={knownUnits}
              onClose={handleCloseForm}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <MeasurementSpecDetail
              data={viewingItem}
              onClose={() => setViewingItem(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExport && (
          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            columns={EXPORT_COLUMNS}
            data={exportData}
            paginatedData={paginatedExportData}
            selectedData={selectedExportData}
            fileName="Danh_Sach_Thong_So_Do"
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && (
          <ImportDialog
            open={showImport}
            onClose={() => setShowImport(false)}
            columns={IMPORT_COLUMNS}
            onImport={handleImportData}
            templateFileName={txt('measurementSpec.importTemplateName')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MeasurementSpecPage;
