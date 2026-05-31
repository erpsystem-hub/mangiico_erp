import React, { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense, startTransition } from 'react';
import { txt } from '@/lib/text';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { FolderTree, SlidersHorizontal, Ruler } from 'lucide-react';
import { useAuthStore } from '@/store/useStore';
import { useCan } from '@/hooks/use-can';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useTabSearchParam } from '@/hooks/use-tab-search-param';
import TabGroup from '@/components/ui/TabGroup';
import DanhMucHangHoaToolbar from './components/danh-muc-hang-hoa-toolbar';
import CategoryLinkMatrixPanel from './components/category-link-matrix-panel';
import ProductCategoryList from './components/danh-muc-hang-hoa-list';
import ExportDialog from '@/components/shared/ExportDialog';
import ImportDialog from '@/components/shared/ImportDialog';
import {
  useProductCategories,
  useDeleteProductCategory,
  useUpdateStatusProductCategory,
  useImportProductCategories,
} from './hooks/use-danh-muc-hang-hoa';
import {
  useCategoryAttributeLinkMatrix,
  useCategoryMeasurementLinkMatrix,
  useToggleCategoryAttributeLink,
  useToggleCategoryMeasurementLink,
} from './hooks/use-category-link-matrix';
import { useProductAttributes } from '@/features/san-xuat/thuoc-tinh-hang-hoa/hooks/use-thuoc-tinh-hang-hoa';
import { useMeasurementSpecs } from '@/features/san-xuat/thong-so-do/hooks/use-thong-so-do';
import ErrorState from '@/components/shared/ErrorState';
import { useProductCategoryStore } from './store/useProductCategoryStore';
import { useConfirmStore } from '@/store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL, CONFIRM_YES } from '@/lib/button-labels';
import { useListWithFilter } from '@/lib/hooks';
import { useExportData } from '@/lib/useExportData';
import { DRAWER_WIDTH_DETAIL_SMALL, DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import { ProductCategory } from './core/types';
import type { ProductCategoryFormValues } from './core/schema';
import { parseTrangThaiHoatDongImport } from '@/lib/constants/trang-thai';
import { productCategoryMatchesColumnSearch } from './utils/column-search';
import { compareProductCategories } from './utils/product-category-sort';
import { matchesSearchTerm } from '@/lib/searchUtils';
import { PRODUCT_CATEGORY_SEARCHABLE_KEYS } from './utils/search-keys';
import { useBomEmbeddedCrud } from '@/features/san-xuat/bom/hooks/use-bom-embedded-crud';
import BomEmbeddedOverlays from '@/features/san-xuat/bom/components/bom-embedded-overlays';

const ProductCategoryForm = lazy(() => import('./components/danh-muc-hang-hoa-form'));
const ProductCategoryDetail = lazy(() => import('./components/danh-muc-hang-hoa-detail'));

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

const ProductCategoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'productCategories');
  const { canCreate, canEdit, canDelete, canExport, canImport } =
    useResourcePermissions('productCategories');
  const navigate = useNavigate();
  const didRedirect = useRef(false);
  const [activeTab, setActiveTab] = useTabSearchParam(
    ['danh-muc', 'thuoc-tinh', 'so-do'] as const,
    'danh-muc',
  );
  const canViewAttributes = useCan('view', 'productAttributes');
  const canViewMeasurements = useCan('view', 'measurementSpecs');

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('productCategory.noViewPermission'));
    navigate('/san-xuat', { replace: true });
  }, [user, canView, navigate]);

  const confirm = useConfirmStore((s) => s.confirm);
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
  } = useProductCategoryStore();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductCategory | null>(null);
  /** Drawer chi tiết xếp chồng: [gốc từ danh sách, con, cháu, …]. Đóng tầng i → slice(0, i). */
  const [detailStack, setDetailStack] = useState<ProductCategory[]>([]);
  const [addChildOf, setAddChildOf] = useState<ProductCategory | null>(null);
  const [formOrigin, setFormOrigin] = useState<'list' | 'detail'>('list');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const bomCrud = useBomEmbeddedCrud(detailStack.length > 0);

  const matrixTabActive = activeTab === 'thuoc-tinh' || activeTab === 'so-do';

  const { data: categories = [], isLoading, isError, refetch } = useProductCategories({
    enabled: canView && (activeTab === 'danh-muc' || matrixTabActive),
  });

  const {
    data: attributeLinkMatrix,
    isLoading: attrMatrixLoading,
    isError: attrMatrixError,
    refetch: refetchAttrMatrix,
  } = useCategoryAttributeLinkMatrix({
    enabled: canView && activeTab === 'thuoc-tinh',
  });

  const {
    data: measurementLinkMatrix,
    isLoading: measMatrixLoading,
    isError: measMatrixError,
    refetch: refetchMeasMatrix,
  } = useCategoryMeasurementLinkMatrix({
    enabled: canView && activeTab === 'so-do',
  });

  const { data: attributes = [] } = useProductAttributes({
    enabled: canView && canViewAttributes && activeTab === 'thuoc-tinh',
  });

  const { data: measurements = [] } = useMeasurementSpecs({
    enabled: canView && canViewMeasurements && activeTab === 'so-do',
  });

  const toggleAttrLink = useToggleCategoryAttributeLink();
  const toggleMeasLink = useToggleCategoryMeasurementLink();
  const [matrixPendingKey, setMatrixPendingKey] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== 'danh-muc') {
      setShowForm(false);
      setEditingItem(null);
      setDetailStack([]);
      setAddChildOf(null);
      setShowExport(false);
      setShowImport(false);
    }
  }, [activeTab]);
  const deleteMutation = useDeleteProductCategory();
  const statusMutation = useUpdateStatusProductCategory();
  const importMutation = useImportProductCategories(() => setShowImport(false));

  const IMPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_danh_muc', label: txt('productCategory.name'), required: true },
      { key: 'ma_danh_muc', label: txt('productCategory.code') },
      { key: 'mo_ta', label: txt('productCategory.store.descCol') },
      { key: 'cha_id', label: txt('productCategory.detail.parent') },
      { key: 'thu_tu', label: txt('productCategory.detail.order') },
      { key: 'trang_thai', label: txt('common.status') },
    ],
    []
  );

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  // Đồng bộ từng phần tử stack với dữ liệu mới sau refetch
  useEffect(() => {
    queueMicrotask(() => {
      setDetailStack((stack) => {
        if (stack.length === 0) return stack;
        return stack
          .map((d) => categories.find((x) => x.id === d.id))
          .filter((x): x is ProductCategory => x != null);
      });
    });
  }, [categories]);

  const filterFn = useCallback(
    (item: ProductCategory, term: string, f: typeof filters) => {
      const parentName = item.cha_id
        ? categories.find((p) => p.id === item.cha_id)?.ten_danh_muc ?? ''
        : '';
      const matchesSearch = matchesSearchTerm(
        { ...(item as unknown as Record<string, unknown>), ten_danh_muc_cha: parentName },
        term,
        [...PRODUCT_CATEGORY_SEARCHABLE_KEYS]
      );
      const matchesCol = productCategoryMatchesColumnSearch(item, f.columnSearch, parentName);
      const statusKey = item.trang_thai === 'Đang hoạt động' ? 'Active' : 'Inactive';
      const matchesStatus = f.status.length === 0 || f.status.includes(statusKey);
      const matchesRoot =
        f.id_danh_muc_goc.length === 0 ||
        (() => {
          const visibleIds = new Set<string>();
          let current = new Set<string>(f.id_danh_muc_goc);
          while (current.size > 0) {
            current.forEach((id) => visibleIds.add(id));
            const next = new Set<string>();
            categories.forEach((d) => {
              if (d.cha_id && current.has(d.cha_id)) next.add(d.id);
            });
            current = next;
          }
          return visibleIds.has(item.id);
        })();
      return matchesSearch && matchesCol && matchesStatus && matchesRoot;
    },
    [categories]
  );

  const filteredCategories = useListWithFilter(
    categories,
    searchTerm,
    filters,
    filterFn
  );

  const sortedFilteredCategories = useMemo(() => {
    const list = [...filteredCategories];
    const { column, direction } = sort;
    if (!column || !direction) return list;
    const mul = direction === 'asc' ? 1 : -1;
    list.sort((a, b) => mul * compareProductCategories(a, b, column, categories));
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
    [sortedFilteredCategories.length]
  );

  const EXPORT_COLUMNS = useMemo(
    () => [
      { key: 'ten_danh_muc', label: txt('productCategory.exportName') },
      { key: 'ma_danh_muc', label: txt('productCategory.exportCode') },
      { key: 'ten_cha', label: txt('productCategory.exportParent') },
      { key: 'mo_ta', label: txt('productCategory.store.descCol') },
      { key: 'cap_do_text', label: txt('productCategory.exportLevel') },
      { key: 'thu_tu', label: txt('productCategory.exportOrder') },
      { key: 'trang_thai_text', label: txt('productCategory.exportStatus') },
    ],
    []
  );

  const exportMapFn = useCallback(
    (item: ProductCategory) => {
      const parentName = item.cha_id
        ? categories.find((p) => p.id === item.cha_id)?.ten_danh_muc ?? ''
        : '';
      return {
        ten_danh_muc: item.ten_danh_muc,
        ma_danh_muc: item.ma_danh_muc ?? '',
        ten_cha: parentName,
        mo_ta: item.mo_ta ?? '',
        cap_do_text: txt('productCategory.levelBadge', { level: item.cap_do }),
        thu_tu: item.thu_tu,
        trang_thai_text:
          item.trang_thai === 'Đang hoạt động'
            ? txt('productCategory.active')
            : txt('productCategory.inactive'),
      };
    },
    [categories]
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
    [EXPORT_COLUMNS]
  );

  const handleEdit = (item: ProductCategory) => {
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
      title: txt('productCategory.deleteTitle'),
      message: txt('productCategory.deleteMessage'),
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

  const handleStatusChange = (item: ProductCategory) => {
    if (!canEdit) return;
    const newStatus = item.trang_thai === 'Đang hoạt động' ? 'Ngừng hoạt động' : 'Đang hoạt động';
    const statusLabel = newStatus === 'Đang hoạt động' ? txt('productCategory.active') : txt('productCategory.inactive');
    confirm({
      title: txt('productCategory.statusChangeTitle'),
      message: txt('productCategory.statusChangeMessage', { name: item.ten_danh_muc, status: statusLabel }),
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
      title: txt('productCategory.deleteTitle'),
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

  const handleStatusChangeMany = (status: import('@/lib/constants/trang-thai').TrangThaiHoatDong) => {
    if (!canEdit) return;
    const ids = Array.from(selectedIds);
    const statusLabel = status === 'Đang hoạt động' ? txt('productCategory.active') : txt('productCategory.inactive');
    confirm({
      title: txt('productCategory.statusChangeTitle'),
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
    const rows: ProductCategoryFormValues[] = data.map((row) => ({
      ten_danh_muc: String(row.ten_danh_muc ?? '').trim(),
      ma_danh_muc:
        row.ma_danh_muc != null && String(row.ma_danh_muc).trim() !== ''
          ? String(row.ma_danh_muc).trim()
          : null,
      mo_ta: row.mo_ta != null ? String(row.mo_ta).trim() : undefined,
      cha_id: row.cha_id != null && String(row.cha_id).trim() !== '' ? String(row.cha_id).trim() : '',
      thu_tu: Number(row.thu_tu) || 0,
      trang_thai: parseTrangThaiHoatDongImport(row.trang_thai),
      thuoc_tinh_links: [],
      thong_so_do_links: [],
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

  const handleAddChild = (parent: ProductCategory) => {
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
      toast.warning(txt('productCategory.noExportData'));
      return;
    }
    setShowExport(true);
  };

  if (!canView) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] px-4"
        aria-busy="true"
        aria-label={txt('productCategory.loading')}
      >
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-page relative">
      <div className="shrink-0 relative z-0">
        <TabGroup
          tabs={[
            { id: 'danh-muc', label: txt('productCategory.tabCategories'), icon: FolderTree },
            { id: 'thuoc-tinh', label: txt('productCategory.tabAttributes'), icon: SlidersHorizontal },
            { id: 'so-do', label: txt('productCategory.tabMeasurements'), icon: Ruler },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'danh-muc' ? (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
          <DanhMucHangHoaToolbar
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
                title={txt('productCategory.listLoadErrorTitle')}
                message={txt('productCategory.listLoadErrorHint')}
                onRetry={() => refetch()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
              <ProductCategoryList
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
      ) : activeTab === 'thuoc-tinh' ? (
        <CategoryLinkMatrixPanel
          mode="attribute"
          categories={categories}
          attributes={attributes}
          linkMatrix={attributeLinkMatrix}
          isLoading={isLoading || attrMatrixLoading}
          isError={isError || attrMatrixError}
          onRetry={() => {
            void refetch();
            void refetchAttrMatrix();
          }}
          canEdit={canEdit}
          pendingKey={matrixPendingKey}
          onToggle={(danhMucId, masterId, linked) => {
            if (!canEdit) return;
            const key = `${danhMucId}:${masterId}`;
            setMatrixPendingKey(key);
            toggleAttrLink.mutate(
              { danhMucId, thuocTinhId: masterId, linked },
              { onSettled: () => setMatrixPendingKey(null) },
            );
          }}
        />
      ) : (
        <CategoryLinkMatrixPanel
          mode="measurement"
          categories={categories}
          measurements={measurements}
          linkMatrix={measurementLinkMatrix}
          isLoading={isLoading || measMatrixLoading}
          isError={isError || measMatrixError}
          onRetry={() => {
            void refetch();
            void refetchMeasMatrix();
          }}
          canEdit={canEdit}
          pendingKey={matrixPendingKey}
          onToggle={(danhMucId, masterId, linked) => {
            if (!canEdit) return;
            const key = `${danhMucId}:${masterId}`;
            setMatrixPendingKey(key);
            toggleMeasLink.mutate(
              { danhMucId, thongSoDoId: masterId, linked },
              { onSettled: () => setMatrixPendingKey(null) },
            );
          }}
        />
      )}

      <AnimatePresence>
        {activeTab === 'danh-muc' && showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <ProductCategoryForm
              initialData={editingItem}
              allCategories={categories}
              onClose={handleCloseForm}
              defaultParentId={addChildOf?.id}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'danh-muc' && detailStack.length > 0 && !showForm ? (
          <Suspense fallback={<DrawerLazyFallback />}>
            <>
              {detailStack.map((dept, index) => (
                <ProductCategoryDetail
                  key={`${dept.id}-${index}`}
                  data={dept}
                  allCategories={categories}
                  onClose={() => setDetailStack((s) => s.slice(0, index))}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onAddChild={handleAddChild}
                  onViewChild={(child) => {
                    setDetailStack((s) => {
                      const last = s[s.length - 1];
                      if (!last || child.cha_id !== last.id) return s;
                      return [...s, child];
                    });
                  }}
                  maxWidthClass={index > 0 ? DRAWER_WIDTH_DETAIL_SMALL : undefined}
                  stackLevel={index}
                  onViewBom={bomCrud.handleViewBom}
                  onAddBom={
                    dept.cap_do === 2 ? () => bomCrud.handleAddBomForCategory(dept.id) : undefined
                  }
                  onEditBom={bomCrud.handleEditBom}
                  onDeleteBom={bomCrud.handleDeleteBom}
                  onStatusChangeBom={bomCrud.handleBomStatusChange}
                />
              ))}
            </>
          </Suspense>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'danh-muc' && showExport && (
          <ExportDialog
            open={showExport}
            onClose={() => setShowExport(false)}
            columns={EXPORT_COLUMNS}
            data={exportData}
            paginatedData={paginatedExportData}
            selectedData={selectedExportData}
            fileName="Danh_Muc_Hang_Hoa"
            visibleColumnKeys={visibleColumnKeys}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeTab === 'danh-muc' && showImport && (
          <ImportDialog
            open={showImport}
            onClose={() => setShowImport(false)}
            columns={IMPORT_COLUMNS}
            onImport={handleImportData}
            templateFileName={txt('productCategory.importTemplateName')}
          />
        )}
      </AnimatePresence>

      <BomEmbeddedOverlays
        stackLevel={bomCrud.bomStackLevel}
        viewingBom={bomCrud.viewingBom}
        editingBom={bomCrud.editingBom}
        showForm={bomCrud.showBomForm}
        presetDanhMucId={bomCrud.presetDanhMucId}
        presetNguyenLieuId={bomCrud.presetNguyenLieuId}
        lockDanhMuc={bomCrud.lockDanhMuc}
        lockNguyenLieu={bomCrud.lockNguyenLieu}
        onCloseForm={bomCrud.handleCloseBomForm}
        onCloseDetail={bomCrud.handleCloseBomDetail}
        onEdit={bomCrud.handleEditBom}
        onDelete={bomCrud.handleDeleteBom}
        onStatusChange={bomCrud.handleBomStatusChange}
      />
    </div>
  );
};

export default ProductCategoryPage;
