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
import { txt } from '../../../lib/text';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useStore';
import { useCan } from '../../../hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { matchesSearchTerm } from '../../../lib/searchUtils';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';

import BranchToolbar from './components/chi-nhanh-toolbar';
import BranchTable from './components/chi-nhanh-table';
import ExportDialog from '../../../components/shared/ExportDialog';
import ImportDialog from '../../../components/shared/ImportDialog';

import {
  useBranches,
  useDeleteBranch,
  useUpdateStatusBranch,
  useImportBranches,
} from './hooks/use-chi-nhanh';
import ErrorState from '../../../components/shared/ErrorState';
import { useBranchFilterCounts } from './hooks/use-branch-filter-counts';
import { useBranchStore } from './store/useBranchStore';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES, CONFIRM_DELETE_ALL } from '../../../lib/button-labels';
import { useListWithFilter } from '../../../lib/hooks';
import { useExportData } from '../../../lib/useExportData';
import type { Branch } from './core/types';
import { BRANCH_SEARCHABLE_KEYS } from './utils/search-keys';
import { branchMatchesColumnSearch } from './utils/column-search';

const BranchForm = lazy(() => import('./components/chi-nhanh-form'));
const BranchDetail = lazy(() => import('./components/chi-nhanh-detail'));

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

const BranchPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'branches');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete, canExport, canImport } = useResourcePermissions('branches');
  const navigate = useNavigate();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('branch.noViewPermission'));
    navigate('/he-thong', { replace: true });
  }, [user, canView, navigate]);

  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
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
  } = useBranchStore();

  const { data: branches = [], isLoading, isError, refetch } = useBranches({ enabled: canView });
  const deleteMutation = useDeleteBranch();
  const statusMutation = useUpdateStatusBranch();
  const importMutation = useImportBranches(() => setShowImport(false));

  const { statusCounts } = useBranchFilterCounts(branches, searchTerm, filters);

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_chi_nhanh', label: txt('branch.form.name'), required: true },
      { key: 'ma_chi_nhanh', label: txt('branch.form.code') },
      { key: 'dia_chi', label: txt('branch.form.address') },
      { key: 'dien_thoai', label: txt('branch.form.phone') },
      { key: 'email', label: txt('branch.form.email') },
      { key: 'mo_ta', label: txt('branch.form.description') },
      { key: 'thu_tu', label: txt('branch.store.orderCol') },
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
    if (!viewingBranch) return;
    const fresh = branches.find((b) => b.id === viewingBranch.id);
    if (fresh && fresh !== viewingBranch) queueMicrotask(() => setViewingBranch(fresh));
  }, [branches, viewingBranch]);

  const filterFn = useCallback(
    (item: Branch, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        term,
        BRANCH_SEARCHABLE_KEYS,
      );
      const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      const matchesStatus = f.status.length === 0 || f.status.includes(statusKey);
      const matchesCol = branchMatchesColumnSearch(item, f.columnSearch);
      return matchesSearch && matchesStatus && matchesCol;
    },
    [],
  );

  const filteredBranches = useListWithFilter(branches, searchTerm, filters, filterFn);

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_chi_nhanh', label: txt('branch.exportName') },
      { key: 'ma_chi_nhanh', label: txt('branch.exportCode') },
      { key: 'dia_chi', label: txt('branch.exportAddress') },
      { key: 'dien_thoai', label: txt('branch.exportPhone') },
      { key: 'email', label: txt('branch.exportEmail') },
      { key: 'mo_ta', label: txt('branch.exportDesc') },
      { key: 'trang_thai_text', label: txt('branch.exportStatus') },
    ],
    [],
  );

  const exportMapFn = useCallback(
    (item: Branch) => ({
      ten_chi_nhanh: item.ten_chi_nhanh,
      ma_chi_nhanh: item.ma_chi_nhanh ?? '',
      dia_chi: item.dia_chi ?? '',
      dien_thoai: item.dien_thoai ?? '',
      email: item.email ?? '',
      mo_ta: item.mo_ta ?? '',
      trang_thai_text: item.trang_thai,
    }),
    [],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } =
    useExportData({
      data: filteredBranches,
      isOpen: showExport,
      mapFn: exportMapFn,
      pagination,
      selectedIds,
      keyExtractor: (b) => b.id,
    });

  const visibleColumnKeys = useMemo(
    () => columns.filter((c) => c.visible).map((c) => c.id),
    [columns],
  );

  const handleEdit = (item: Branch) => {
    if (!canEdit) return;
    startTransition(() => {
      setFormOrigin(viewingBranch ? 'detail' : 'list');
      setEditingBranch(item);
      setShowForm(true);
    });
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    confirm({
      title: txt('branch.deleteTitle'),
      message: txt('branch.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        deleteMutation.mutate([id], {
          onSuccess: () => {
            if (viewingBranch && viewingBranch.id === id) setViewingBranch(null);
          },
        });
      },
    });
  };

  const handleStatusChange = (item: Branch) => {
    if (!canEdit) return;
    const newStatus = item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('branch.statusChangeTitle'),
      message: `${txt('branch.statusChangeMessage', { count: 1 })} ${newStatus}?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate(
          { ids: [item.id], status: newStatus },
          {
            onSuccess: (updated) => {
              if (updated && viewingBranch?.id === updated.id) setViewingBranch(updated);
            },
          },
        );
      },
    });
  };

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete) return;
    confirm({
      title: txt('branch.bulkDeleteTitle'),
      message: txt('branch.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        deleteMutation.mutate(ids, {
          onSuccess: () => {
            clearSelection();
            if (viewingBranch && ids.includes(viewingBranch.id)) setViewingBranch(null);
          },
        });
      },
    });
  };

  const handleStatusChangeMany = (ids: string[], status: TrangThaiHoatDong) => {
    if (!canEdit) return;
    confirm({
      title: txt('branch.statusChangeTitle'),
      message: `${txt('branch.statusChangeMessage', { count: ids.length })} ${status}?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate({ ids, status }, { onSuccess: () => clearSelection() });
      },
    });
  };

  const handleExport = () => {
    if (!canExport) return;
    if (filteredBranches.length === 0) {
      toast.warning(txt('branch.noExportData'));
      return;
    }
    setShowExport(true);
  };

  const handleCloseForm = () => {
    const wasEditing = editingBranch;
    const origin = formOrigin;
    setShowForm(false);
    setEditingBranch(null);
    if (origin === 'detail' && viewingBranch && wasEditing && viewingBranch.id === wasEditing.id) {
      const fresh = branches.find((b) => b.id === viewingBranch.id);
      if (fresh) setViewingBranch(fresh);
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
        aria-label={txt('branch.loading')}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <BranchToolbar
          statusCounts={statusCounts}
          onAdd={() => {
            if (!canCreate) return;
            startTransition(() => {
              setFormOrigin('list');
              setEditingBranch(null);
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
              title={txt('branch.listLoadErrorTitle')}
              message={txt('branch.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <BranchTable
              data={filteredBranches}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onView={setViewingBranch}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <BranchForm
              key={editingBranch?.id ?? 'new'}
              initialData={editingBranch}
              onClose={handleCloseForm}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingBranch && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <BranchDetail
              data={viewingBranch}
              onClose={() => setViewingBranch(null)}
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
            fileName="Danh_Sach_Chi_Nhanh"
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
            templateFileName={txt('branch.importTemplateName')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchPage;
