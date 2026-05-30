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

import FinanceAccountToolbar from './components/tai-khoan-toolbar';
import FinanceAccountTable from './components/tai-khoan-table';
import ExportDialog from '@/components/shared/ExportDialog';
import ImportDialog from '@/components/shared/ImportDialog';

import {
  useFinanceAccounts,
  useDeleteFinanceAccount,
  useUpdateStatusFinanceAccount,
  useImportFinanceAccounts,
} from './hooks/use-tai-khoan';
import { useBranches } from '@/features/he-thong/chi-nhanh/hooks/use-chi-nhanh';
import ErrorState from '@/components/shared/ErrorState';
import { useFinanceAccountFilterCounts } from './hooks/use-finance-account-filter-counts';
import { useFinanceAccountStore } from './store/useFinanceAccountStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_YES, CONFIRM_DELETE_ALL } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { useExportData } from '@/lib/useExportData';
import type { FinanceAccount } from './core/types';
import { FINANCE_ACCOUNT_SEARCHABLE_KEYS } from './utils/search-keys';
import { financeAccountMatchesColumnSearch } from './utils/column-search';

const FinanceAccountForm = lazy(() => import('./components/tai-khoan-form'));
const FinanceAccountDetail = lazy(() => import('./components/tai-khoan-detail'));

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

const FinanceAccountPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'financeAccounts');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete, canExport, canImport } =
    useResourcePermissions('financeAccounts');
  const navigate = useNavigate();
  const didRedirect = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('financeAccount.noViewPermission'));
    navigate('/tai-chinh', { replace: true });
  }, [user, canView, navigate]);

  const confirm = useConfirmStore((s) => s.confirm);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FinanceAccount | null>(null);
  const [viewingItem, setViewingItem] = useState<FinanceAccount | null>(null);
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
  } = useFinanceAccountStore();

  const { data: accounts = [], isLoading, isError, refetch } = useFinanceAccounts({
    enabled: canView,
  });
  const { data: branches = [] } = useBranches({ enabled: canView });
  const deleteMutation = useDeleteFinanceAccount();
  const statusMutation = useUpdateStatusFinanceAccount();
  const importMutation = useImportFinanceAccounts(branches, () => setShowImport(false));

  const { loaiCounts, branchCounts, statusCounts } = useFinanceAccountFilterCounts(
    accounts,
    searchTerm,
    filters,
  );

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_quy', label: txt('financeAccount.form.name'), required: true },
      { key: 'loai_quy', label: txt('financeAccount.form.fundType'), required: true },
      { key: 'ma_chi_nhanh', label: txt('branch.form.code') },
      { key: 'ten_chi_nhanh', label: txt('financeAccount.form.branch') },
      { key: 'ngan_hang', label: txt('financeAccount.form.bank') },
      { key: 'ma_ngan_hang_bin', label: txt('financeAccount.exportBin') },
      { key: 'so_tai_khoan', label: txt('financeAccount.form.accountNumber') },
      { key: 'chu_tai_khoan', label: txt('financeAccount.form.accountHolder') },
      { key: 'so_du_khoi_dau', label: txt('financeAccount.form.openingBalance') },
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
    const fresh = accounts.find((a) => a.id === viewingItem.id);
    if (fresh && fresh !== viewingItem) queueMicrotask(() => setViewingItem(fresh));
  }, [accounts, viewingItem]);

  const filterFn = useCallback(
    (item: FinanceAccount, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(
        item as unknown as Record<string, unknown>,
        term,
        [...FINANCE_ACCOUNT_SEARCHABLE_KEYS],
      );
      const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      const matchesStatus = f.status.length === 0 || f.status.includes(statusKey);
      const matchesLoai = f.loai_quy.length === 0 || f.loai_quy.includes(item.loai_quy);
      const matchesBranch =
        f.chi_nhanh_id.length === 0 ||
        (item.chi_nhanh_id != null && f.chi_nhanh_id.includes(item.chi_nhanh_id));
      const matchesCol = financeAccountMatchesColumnSearch(item, f.columnSearch);
      return matchesSearch && matchesStatus && matchesLoai && matchesBranch && matchesCol;
    },
    [],
  );

  const filteredAccounts = useListWithFilter(accounts, searchTerm, filters, filterFn);

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_quy', label: txt('financeAccount.exportName') },
      { key: 'loai_quy', label: txt('financeAccount.exportFundType') },
      { key: 'ten_chi_nhanh', label: txt('financeAccount.exportBranch') },
      { key: 'ngan_hang', label: txt('financeAccount.exportBank') },
      { key: 'ma_ngan_hang_bin', label: txt('financeAccount.exportBin') },
      { key: 'so_tai_khoan', label: txt('financeAccount.exportAccountNo') },
      { key: 'chu_tai_khoan', label: txt('financeAccount.exportHolder') },
      { key: 'so_du_khoi_dau', label: txt('financeAccount.exportOpeningBalance') },
      { key: 'trang_thai_text', label: txt('financeAccount.exportStatus') },
    ],
    [],
  );

  const exportMapFn = useCallback(
    (item: FinanceAccount) => ({
      ten_quy: item.ten_quy,
      loai_quy: item.loai_quy,
      ten_chi_nhanh: item.ten_chi_nhanh ?? '',
      ngan_hang: item.ngan_hang ?? '',
      ma_ngan_hang_bin: item.ma_ngan_hang_bin ?? '',
      so_tai_khoan: item.so_tai_khoan ?? '',
      chu_tai_khoan: item.chu_tai_khoan ?? '',
      so_du_khoi_dau: item.so_du_khoi_dau,
      trang_thai_text: item.trang_thai,
    }),
    [],
  );

  const { exportData, paginatedData: paginatedExportData, selectedData: selectedExportData } =
    useExportData({
      data: filteredAccounts,
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

  const handleView = useCallback(
    (item: FinanceAccount) => {
      queryClient.setQueryData(queryKeys.financeAccounts.detail(item.id), item);
      setViewingItem(item);
    },
    [queryClient],
  );

  const handleEdit = (item: FinanceAccount) => {
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
      title: txt('financeAccount.deleteTitle'),
      message: txt('financeAccount.deleteMessage'),
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

  const handleStatusChange = (item: FinanceAccount) => {
    if (!canEdit) return;
    const newStatus = item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    confirm({
      title: txt('financeAccount.statusChangeTitle'),
      message: `${txt('financeAccount.statusChangeMessage', { count: 1 })} ${newStatus}?`,
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
      title: txt('financeAccount.bulkDeleteTitle'),
      message: txt('financeAccount.bulkDeleteMessage', { count: ids.length }),
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
      title: txt('financeAccount.statusChangeTitle'),
      message: `${txt('financeAccount.statusChangeMessage', { count: ids.length })} ${status}?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate({ ids, status }, { onSuccess: () => clearSelection() });
      },
    });
  };

  const handleExport = () => {
    if (!canExport) return;
    if (filteredAccounts.length === 0) {
      toast.warning(txt('financeAccount.noExportData'));
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
      const fresh = accounts.find((a) => a.id === viewingItem.id);
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
        aria-label={txt('financeAccount.loading')}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <FinanceAccountToolbar
          statusCounts={statusCounts}
          loaiCounts={loaiCounts}
          branchCounts={branchCounts}
          branches={branches}
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
              title={txt('financeAccount.listLoadErrorTitle')}
              message={txt('financeAccount.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <FinanceAccountTable
              data={filteredAccounts}
              isLoading={isLoading}
              branches={branches}
              loaiCounts={loaiCounts}
              branchCounts={branchCounts}
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
            <FinanceAccountForm
              key={editingItem?.id ?? 'new'}
              initialData={editingItem}
              onClose={handleCloseForm}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingItem && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <FinanceAccountDetail
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
            fileName="Danh_Sach_Tai_Khoan"
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
            templateFileName={txt('financeAccount.importTemplateName')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinanceAccountPage;
