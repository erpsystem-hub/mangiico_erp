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
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import DanhMucNguyenLieuToolbar from './components/danh-muc-nguyen-lieu-toolbar';
import MaterialCategoryList from './components/danh-muc-nguyen-lieu-list';
import ExportDialog from '@/components/shared/ExportDialog';
import ImportDialog from '@/components/shared/ImportDialog';
import {
  useMaterialCategories,
  useDeleteMaterialCategory,
  useUpdateStatusMaterialCategory,
  useImportMaterialCategories,
} from './hooks/use-danh-muc-nguyen-lieu';
import ErrorState from '@/components/shared/ErrorState';
import { useMaterialCategoryStore } from './store/useMaterialCategoryStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL, CONFIRM_YES } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { useExportData } from '@/lib/useExportData';
import { DRAWER_WIDTH_DETAIL_SMALL, DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import type { MaterialCatalogItem } from '@/features/san-xuat/danh-sach-nguyen-lieu/core/types';
import {
  useMaterialCatalogList,
  useDeleteMaterialCatalogItems,
  useUpdateMaterialCatalogStatus,
} from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { MaterialCategory } from './core/types';
import type { MaterialCategoryFormValues } from './core/schema';
import { parseTrangThaiHoatDongImport } from '@/lib/constants/trang-thai';
import { materialCategoryMatchesColumnSearch } from './utils/column-search';
import { compareMaterialCategories } from './utils/material-category-sort';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { MATERIAL_CATEGORY_SEARCHABLE_KEYS } from './utils/search-keys';
import { getVisibleMaterialCategoryIdsUnderRoots } from './utils/material-category-filter';

const MaterialCategoryForm = lazy(() => import('./components/danh-muc-nguyen-lieu-form'));
const MaterialCategoryDetail = lazy(() => import('./components/danh-muc-nguyen-lieu-detail'));
const MaterialCatalogForm = lazy(
  () => import('@/features/san-xuat/danh-sach-nguyen-lieu/components/danh-sach-nguyen-lieu-form'),
);
const MaterialCatalogDetail = lazy(
  () => import('@/features/san-xuat/danh-sach-nguyen-lieu/components/danh-sach-nguyen-lieu-detail'),
);

type MaterialFormOrigin = 'categoryDetail' | 'materialDetail';

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

const MaterialCategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'materialCategories');
  const { canCreate, canEdit, canDelete, canExport, canImport } =
    useResourcePermissions('materialCategories');
  const navigate = useNavigate();
  const didRedirect = useRef(false);

  const confirm = useConfirmStore((s) => s.confirm);
  const queryClient = useQueryClient();
  const canViewMaterialCatalog = useCan('view', 'materialCatalog');
  const {
    canCreate: canCreateMaterial,
    canEdit: canEditMaterial,
    canDelete: canDeleteMaterial,
  } = useResourcePermissions('materialCatalog');
  const {
    searchTerm,
    filters,
    resetState,
    selectedIds,
    columns,
    sort,
    clearSelection,
    toggleSelection,
    toggleAllSelection,
  } = useMaterialCategoryStore();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MaterialCategory | null>(null);
  const [detailStack, setDetailStack] = useState<MaterialCategory[]>([]);
  const [addChildOf, setAddChildOf] = useState<MaterialCategory | null>(null);
  const [formOrigin, setFormOrigin] = useState<'list' | 'detail'>('list');
  const [viewingMaterial, setViewingMaterial] = useState<MaterialCatalogItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialCatalogItem | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialCreateDanhMucId, setMaterialCreateDanhMucId] = useState<string | undefined>();
  const [materialFormOrigin, setMaterialFormOrigin] = useState<MaterialFormOrigin>('categoryDetail');
  const viewingMaterialRef = useRef<MaterialCatalogItem | null>(null);
  const materialFormOriginRef = useRef<MaterialFormOrigin>('categoryDetail');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('materialCategory.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  const { data: categories = [], isLoading, isError, refetch } = useMaterialCategories({
    enabled: canView,
  });

  const materialOverlayActive =
    detailStack.length > 0 || showMaterialForm || Boolean(viewingMaterial);
  const { data: materials = [] } = useMaterialCatalogList({
    enabled: canView && canViewMaterialCatalog && materialOverlayActive,
  });
  const deleteMaterialMutation = useDeleteMaterialCatalogItems();
  const statusMaterialMutation = useUpdateMaterialCatalogStatus();

  useEffect(() => {
    viewingMaterialRef.current = viewingMaterial;
  }, [viewingMaterial]);
  useEffect(() => {
    materialFormOriginRef.current = materialFormOrigin;
  }, [materialFormOrigin]);

  useEffect(() => {
    if (!viewingMaterial) return;
    const fresh = materials.find((m) => m.id === viewingMaterial.id);
    if (fresh && fresh !== viewingMaterial) queueMicrotask(() => setViewingMaterial(fresh));
  }, [materials, viewingMaterial]);

  const materialStackLevel = Math.max(detailStack.length, 1);

  const deleteMutation = useDeleteMaterialCategory();
  const statusMutation = useUpdateStatusMaterialCategory();
  const importMutation = useImportMaterialCategories(() => setShowImport(false));

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_danh_muc', label: txt('materialCategory.name'), required: true },
      { key: 'ma_danh_muc', label: txt('materialCategory.code') },
      { key: 'mo_ta', label: txt('materialCategory.store.descCol') },
      { key: 'cha_id', label: txt('materialCategory.detail.parent') },
      { key: 'thu_tu', label: txt('materialCategory.detail.order') },
      { key: 'trang_thai', label: txt('common.status') },
    ],
    [],
  );

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  useEffect(() => {
    queueMicrotask(() => {
      setDetailStack((stack) => {
        if (stack.length === 0) return stack;
        return stack
          .map((d) => categories.find((x) => x.id === d.id))
          .filter((x): x is MaterialCategory => x != null);
      });
    });
  }, [categories]);

  const filterFn = useCallback(
    (item: MaterialCategory, term: string, f: typeof filters) => {
      const parentName = item.cha_id
        ? categories.find((p) => p.id === item.cha_id)?.ten_danh_muc ?? ''
        : '';
      const matchesSearch = matchesSearchTerm(
        { ...(item as unknown as Record<string, unknown>), ten_danh_muc_cha: parentName },
        term,
        [...MATERIAL_CATEGORY_SEARCHABLE_KEYS],
      );
      const matchesCol = materialCategoryMatchesColumnSearch(item, f.columnSearch, parentName);
      const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      const matchesStatus = f.status.length === 0 || f.status.includes(statusKey);
      const visibleUnderRoots =
        f.id_danh_muc_goc.length > 0
          ? getVisibleMaterialCategoryIdsUnderRoots(categories, f.id_danh_muc_goc)
          : null;
      const matchesRoot = visibleUnderRoots == null || visibleUnderRoots.has(item.id);
      return matchesSearch && matchesCol && matchesStatus && matchesRoot;
    },
    [categories],
  );

  const filteredCategories = useListWithFilter(categories, searchTerm, filters, filterFn);

  const sortedFilteredCategories = useMemo(() => {
    const list = [...filteredCategories];
    const { column, direction } = sort;
    if (!column || !direction) return list;
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => mul * compareMaterialCategories(a, b, column, categories));
    return list;
  }, [filteredCategories, sort, categories]);

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [sortedFilteredCategories.length]);

  const maxPage = Math.max(1, Math.ceil(sortedFilteredCategories.length / pageSize));
  useEffect(() => {
    queueMicrotask(() => setPage((p) => Math.min(p, maxPage)));
  }, [pageSize, maxPage]);

  const exportPagination = useMemo(
    () => ({ page: 1, pageSize: Math.max(sortedFilteredCategories.length, 1) }),
    [sortedFilteredCategories.length],
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_danh_muc', label: txt('materialCategory.exportName') },
      { key: 'ma_danh_muc', label: txt('materialCategory.exportCode') },
      { key: 'ten_cha', label: txt('materialCategory.exportParent') },
      { key: 'mo_ta', label: txt('materialCategory.store.descCol') },
      { key: 'cap_do_text', label: txt('materialCategory.exportLevel') },
      { key: 'thu_tu', label: txt('materialCategory.exportOrder') },
      { key: 'trang_thai_text', label: txt('materialCategory.exportStatus') },
    ],
    [],
  );

  const exportMapFn = useCallback(
    (item: MaterialCategory) => {
      const parentName = item.cha_id
        ? categories.find((p) => p.id === item.cha_id)?.ten_danh_muc ?? ''
        : '';
      return {
        ten_danh_muc: item.ten_danh_muc,
        ma_danh_muc: item.ma_danh_muc ?? '',
        ten_cha: parentName,
        mo_ta: item.mo_ta ?? '',
        cap_do_text: txt('materialCategory.levelBadge', { level: item.cap_do }),
        thu_tu: item.thu_tu,
        trang_thai_text:
          item.trang_thai === 'Đang hoạt động'
            ? txt('materialCategory.active')
            : txt('materialCategory.inactive'),
      };
    },
    [categories],
  );

  const {
    exportData,
    paginatedData: paginatedExportData,
    selectedData: selectedExportData,
  } = useExportData({
    data: sortedFilteredCategories,
    isOpen: showExport,
    mapFn: exportMapFn,
    pagination: exportPagination,
    selectedIds,
    keyExtractor: (item) => item.id,
  });

  const visibleColumnKeys = useMemo(
    () => EXPORT_COLUMNS.map((c) => c.key),
    [EXPORT_COLUMNS],
  );

  const handleEdit = (item: MaterialCategory) => {
    if (!canEdit) return;
    setFormOrigin(detailStack.length > 0 ? 'detail' : 'list');
    setDetailStack((s) => (s.length ? [s[0]] : []));
    setEditingItem(item);
    startTransition(() => setShowForm(true));
  };

  const handleDelete = (id: string) => {
    if (!canDelete) return;
    if (detailStack.length > 1) setDetailStack((s) => (s.length ? [s[0]] : []));
    confirm({
      title: txt('materialCategory.deleteTitle'),
      message: txt('materialCategory.deleteMessage'),
      variant: 'danger',
      confirmText: CONFIRM_DELETE(),
      onConfirm: async () => {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            setDetailStack((s) => {
              const idx = s.findIndex((d) => d.id === id);
              if (idx < 0) return s;
              return s.slice(0, idx);
            });
          },
        });
      },
    });
  };

  const handleStatusChange = (item: MaterialCategory) => {
    if (!canEdit) return;
    const newStatus = item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    const statusLabel =
      newStatus === 'Đang hoạt động' ? txt('materialCategory.active') : txt('materialCategory.inactive');
    confirm({
      title: txt('materialCategory.statusChangeTitle'),
      message: txt('materialCategory.statusChangeMessage', {
        name: item.ten_danh_muc,
        status: statusLabel,
      }),
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        statusMutation.mutate(
          { id: item.id, status: newStatus },
          {
            onSuccess: () => {
              setDetailStack((s) =>
                s.map((d) => (d.id === item.id ? { ...d, trang_thai: newStatus } : d)),
              );
            },
          },
        );
      },
    });
  };

  const handleDeleteMany = () => {
    if (!canDelete) return;
    const ids = Array.from(selectedIds);
    confirm({
      title: txt('materialCategory.deleteTitle'),
      message: txt('common.deleteManyConfirm', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        for (const id of ids) {
          await deleteMutation.mutateAsync(id).catch(() => {});
        }
        clearSelection();
        setDetailStack((s) => s.filter((d) => !ids.includes(d.id)));
      },
    });
  };

  const handleStatusChangeMany = (
    status: import('@/lib/constants/trang-thai').TrangThaiHoatDong,
  ) => {
    if (!canEdit) return;
    const ids = Array.from(selectedIds);
    const statusLabel =
      status === 'Đang hoạt động' ? txt('materialCategory.active') : txt('materialCategory.inactive');
    confirm({
      title: txt('materialCategory.statusChangeTitle'),
      message: txt('common.statusChangeManyConfirm', { count: ids.length, status: statusLabel }),
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        for (const id of ids) {
          await statusMutation.mutateAsync({ id, status });
        }
        clearSelection();
      },
    });
  };

  const handleImportData = async (data: Record<string, unknown>[]) => {
    if (!canImport) return;
    const rows: MaterialCategoryFormValues[] = data.map((row) => ({
      ten_danh_muc: String(row.ten_danh_muc ?? '').trim(),
      ma_danh_muc:
        row.ma_danh_muc != null && String(row.ma_danh_muc).trim() !== ''
          ? String(row.ma_danh_muc).trim()
          : null,
      mo_ta: row.mo_ta != null ? String(row.mo_ta).trim() : undefined,
      cha_id: row.cha_id != null && String(row.cha_id).trim() !== '' ? String(row.cha_id).trim() : '',
      thu_tu: Number(row.thu_tu) || 0,
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
    }));
    await importMutation.mutateAsync(rows);
  };

  const handleCloseForm = () => {
    const wasEditing = editingItem;
    setShowForm(false);
    setAddChildOf(null);
    if (formOrigin === 'detail' && wasEditing && detailStack[0]?.id === wasEditing.id) {
      const fresh = categories.find((d) => d.id === wasEditing.id);
      setDetailStack((s) => {
        if (s.length === 0) return s;
        if (!fresh) return [];
        return [fresh, ...s.slice(1)];
      });
    }
    setEditingItem(null);
    setFormOrigin('list');
  };

  const handleViewMaterial = useCallback(
    (item: MaterialCatalogItem) => {
      if (!canViewMaterialCatalog) return;
      queryClient.setQueryData(queryKeys.materialCatalog.detail(item.id), item);
      startTransition(() => {
        setMaterialFormOrigin('categoryDetail');
        setViewingMaterial(item);
      });
    },
    [canViewMaterialCatalog, queryClient],
  );

  const handleAddMaterial = useCallback(
    (danhMucId: string) => {
      if (!canCreateMaterial) return;
      setMaterialCreateDanhMucId(danhMucId);
      setEditingMaterial(null);
      setMaterialFormOrigin('categoryDetail');
      startTransition(() => setShowMaterialForm(true));
    },
    [canCreateMaterial],
  );

  const handleEditMaterial = useCallback(
    (item: MaterialCatalogItem) => {
      if (!canEditMaterial) return;
      const origin: MaterialFormOrigin = viewingMaterialRef.current ? 'materialDetail' : 'categoryDetail';
      startTransition(() => {
        setMaterialFormOrigin(origin);
        setEditingMaterial(item);
        setShowMaterialForm(true);
      });
    },
    [canEditMaterial],
  );

  const handleCloseMaterialForm = useCallback(() => {
    setShowMaterialForm(false);
    const edited = editingMaterial;
    setEditingMaterial(null);
    setMaterialCreateDanhMucId(undefined);
    if (materialFormOriginRef.current === 'materialDetail' && edited) {
      const fresh = materials.find((m) => m.id === edited.id);
      startTransition(() => setViewingMaterial(fresh ?? null));
    }
    setMaterialFormOrigin('categoryDetail');
  }, [editingMaterial, materials]);

  const handleCloseMaterialDetail = useCallback(() => {
    setViewingMaterial(null);
  }, []);

  const handleDeleteMaterial = useCallback(
    (id: string) => {
      if (!canDeleteMaterial) return;
      confirm({
        title: txt('materialCatalog.deleteTitle'),
        message: txt('materialCatalog.deleteMessage'),
        variant: 'danger',
        confirmText: CONFIRM_DELETE(),
        onConfirm: () => {
          deleteMaterialMutation.mutate([id], {
            onSuccess: () => {
              if (viewingMaterialRef.current?.id === id) setViewingMaterial(null);
            },
          });
        },
      });
    },
    [canDeleteMaterial, confirm, deleteMaterialMutation],
  );

  const handleMaterialStatusChange = useCallback(
    (item: MaterialCatalogItem) => {
      if (!canEditMaterial) return;
      const newStatus: TrangThaiHoatDong =
        item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
      confirm({
        title: txt('materialCatalog.statusChangeTitle'),
        message: `${txt('materialCatalog.statusChangeMessage')} ${newStatus}?`,
        confirmText: CONFIRM_YES(),
        onConfirm: () =>
          statusMaterialMutation.mutate(
            { ids: [item.id], status: newStatus },
            {
              onSuccess: () => {
                if (viewingMaterialRef.current?.id === item.id) {
                  setViewingMaterial((prev) =>
                    prev ? { ...prev, trang_thai: newStatus } : null,
                  );
                }
              },
            },
          ),
      });
    },
    [canEditMaterial, confirm, statusMaterialMutation],
  );

  const handleAddChild = (parent: MaterialCategory) => {
    if (!canCreate) return;
    setDetailStack((s) => (s.length ? [s[0]] : []));
    setAddChildOf(parent);
    setEditingItem(null);
    setFormOrigin('detail');
    startTransition(() => setShowForm(true));
  };

  const handleExport = () => {
    if (!canExport) return;
    if (sortedFilteredCategories.length === 0) {
      toast.warning(txt('materialCategory.noExportData'));
      return;
    }
    setShowExport(true);
  };

  if (!canView) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] px-4"
        aria-busy="true"
        aria-label={txt('materialCategory.loading')}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
        <DanhMucNguyenLieuToolbar
          categories={categories}
          selectedCount={selectedIds.size}
          onAdd={() => {
            if (!canCreate) return;
            setFormOrigin('list');
            startTransition(() => setShowForm(true));
          }}
          onExport={handleExport}
          onImport={() => setShowImport(true)}
          onDeleteMany={handleDeleteMany}
          onStatusChangeMany={handleStatusChangeMany}
        />

        <div className="flex-1 min-h-0 flex flex-col">
          {isError ? (
            <ErrorState
              title={txt('materialCategory.listLoadErrorTitle')}
              message={txt('materialCategory.listLoadErrorHint')}
              onRetry={() => refetch()}
              primaryButtons
              className="m-4 border-0 shadow-none"
            />
          ) : (
            <MaterialCategoryList
              data={sortedFilteredCategories}
              allCategories={categories}
              columns={columns}
              selectedIds={selectedIds}
              onToggleSelection={toggleSelection}
              onToggleAllSelection={toggleAllSelection}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onView={(d) => startTransition(() => setDetailStack([d]))}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <MaterialCategoryForm
              initialData={editingItem}
              allCategories={categories}
              onClose={handleCloseForm}
              defaultParentId={addChildOf?.id}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {showMaterialForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <MaterialCatalogForm
              key={editingMaterial?.id ?? `new-${materialCreateDanhMucId ?? ''}`}
              initialData={editingMaterial}
              defaultDanhMucId={materialCreateDanhMucId}
              onClose={handleCloseMaterialForm}
              stackLevel={materialStackLevel + (viewingMaterial ? 1 : 0)}
            />
          </Suspense>
        )}
        {viewingMaterial && !showMaterialForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <MaterialCatalogDetail
              data={viewingMaterial}
              onClose={handleCloseMaterialDetail}
              onEdit={handleEditMaterial}
              onDelete={handleDeleteMaterial}
              onStatusChange={handleMaterialStatusChange}
              maxWidthClass={DRAWER_WIDTH_DETAIL_SMALL}
              stackLevel={materialStackLevel}
            />
          </Suspense>
        )}
        {detailStack.length > 0 && !showForm && !showMaterialForm && !viewingMaterial ? (
          <Suspense fallback={<DrawerLazyFallback />}>
            <>
              {detailStack.map((dept, index) => (
                <MaterialCategoryDetail
                  key={`${dept.id}-${index}`}
                  data={dept}
                  allCategories={categories}
                  onClose={() => setDetailStack((s) => s.slice(0, index))}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddChild={handleAddChild}
                  onViewMaterial={handleViewMaterial}
                  onAddMaterial={handleAddMaterial}
                  onViewChild={(child) => {
                    setDetailStack((s) => {
                      const last = s[s.length - 1];
                      if (!last || child.cha_id !== last.id) return s;
                      return [...s, child];
                    });
                  }}
                  maxWidthClass={index > 0 ? DRAWER_WIDTH_DETAIL_SMALL : undefined}
                  stackLevel={index}
                />
              ))}
            </>
          </Suspense>
        ) : null}
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
            fileName="Danh_Muc_Nguyen_Lieu"
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
            templateFileName={txt('materialCategory.importTemplateName')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialCategoryPage;
