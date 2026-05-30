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
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useStore';
import { useCan } from '../../../hooks/use-can';
import { useAppSessionReady } from '@/hooks/use-auth-session';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useTabSearchParam } from '@/hooks/use-tab-search-param';
import { List, BarChart3 } from 'lucide-react';
import TabGroup from '@/components/ui/TabGroup';

import { queryKeys } from '@/lib/query-keys';
import { defaultServerQueryOptions, masterDataQueryOptions, SERVER_GC_TIME_MS } from '@/lib/supabase/query-config';
import { useDepartments } from '../phong-ban/hooks/use-phong-ban';
import { usePositions } from '../chuc-vu/hooks/use-chuc-vu';
import { useBranches } from '../chi-nhanh/hooks/use-chi-nhanh';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import EmployeeToolbar from './components/nhan-vien-toolbar';
import EmployeeTable from './components/nhan-vien-table';
import { patchEmployeesListCaches } from './utils/patch-employees-cache';

import {
  useEmployeesList,
  useDeleteWithUndo,
  useUpdateStatusEmployee,
} from './hooks/use-nhan-vien';
import { getEmployeeById } from './services/nhan-vien-service';
import { useEmployeeStore } from './store/useEmployeeStore';
import { Employee } from './core/types';
import { STATUS_OPTIONS, type TrangThaiNhanVien } from './core/constants';
import { useConfirmStore } from '../../../store/useConfirmStore';
import { CONFIRM_DELETE, CONFIRM_DELETE_ALL, CONFIRM_YES } from '../../../lib/button-labels';
import { getLanguage } from '../../../lib/utils';
import { useListWithFilter } from '../../../lib/hooks';
import { matchesSearchTerm } from '../../../lib/searchUtils';
import { employeeMatchesColumnSearch } from './utils/column-search';
import { NHAN_VIEN_SEARCHABLE_KEYS } from './utils/search-keys';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';
import EmployeeStatusChangeDialog from './components/nhan-vien-status-change-dialog';
import ErrorState from '../../../components/shared/ErrorState';

const EmployeeForm = lazy(() => import('./components/nhan-vien-form'));
const EmployeeDetail = lazy(() => import('./components/nhan-vien-detail'));
const EmployeeStats = lazy(() => import('./components/nhan-vien-stats'));

/** Chọn trạng thái Hoạt động / Khóa trong dialog xác nhận (có state để switch hiển thị đúng). */
const EmployeeStatusSwitchPicker: React.FC<{
  initial: TrangThaiNhanVien;
  onSelectionChange: (s: TrangThaiNhanVien) => void;
}> = ({ initial, onSelectionChange }) => {
  const [st, setSt] = useState<TrangThaiNhanVien>(initial);
  return (
    <ToggleSwitch
      checked={st === 'Hoạt động'}
      onChange={(checked) => {
        const next: TrangThaiNhanVien = checked ? 'Hoạt động' : 'Khóa';
        setSt(next);
        onSelectionChange(next);
      }}
      label={txt('common.status')}
      description={
        st === 'Hoạt động'
          ? txt('employee.form.statusSwitchActiveHint')
          : txt('employee.form.statusSwitchLockedHint')
      }
    />
  );
};

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

const EmployeePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const canView = useCan('view', 'employees');
  const { isInitializing } = useAppSessionReady();
  const { canCreate, canEdit, canDelete } = useResourcePermissions('employees');
  const navigate = useNavigate();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!user || canView || didRedirect.current) return;
    didRedirect.current = true;
    toast.error(txt('employee.noViewPermission'));
    navigate('/he-thong', { replace: true });
  }, [user, canView, navigate]);

  const [activeTab, setActiveTab] = useTabSearchParam(['list', 'stats'] as const, 'list');

  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<Employee | null>(null);
  const [formOrigin, setFormOrigin] = useState<FormOrigin>('list');

  const viewingEmpRef = useRef<Employee | null>(null);
  const editingEmpRef = useRef<Employee | null>(null);
  const formOriginRef = useRef<FormOrigin>('list');
  const employeesRef = useRef<Employee[]>([]);

  const {
    searchTerm, filters, sort, pagination, setPage,
    resetState, clearSelection, setFilter,
  } = useEmployeeStore();

  const queryClient = useQueryClient();
  const { data: departments = [] } = useDepartments({ enabled: canView });
  const { data: positions = [] } = usePositions({ enabled: canView });
  const { data: branches = [] } = useBranches({ enabled: canView });

  const {
    employees: employeesDisplay,
    total: listTotal,
    isLoading,
    isServerPaginated,
    mode: listMode,
    isError: listIsError,
    refetch: refetchList,
  } = useEmployeesList({
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort,
    enabled: canView && activeTab === 'list',
  });

  const prevListMode = useRef(listMode);
  useEffect(() => {
    if (prevListMode.current !== listMode && listMode === 'server') {
      setPage(1);
    }
    prevListMode.current = listMode;
  }, [listMode, setPage]);

  useEffect(() => {
    if (!isServerPaginated) return;
    setPage(1);
  }, [sort.column, sort.direction, isServerPaginated, setPage]);

  useEffect(() => { viewingEmpRef.current = viewingEmp; }, [viewingEmp]);
  useEffect(() => { editingEmpRef.current = editingEmp; }, [editingEmp]);
  useEffect(() => { formOriginRef.current = formOrigin; }, [formOrigin]);
  useEffect(() => { employeesRef.current = employeesDisplay; }, [employeesDisplay]);

  /** Warm master data cache khi idle — TanStack dedupe hooks con. */
  useEffect(() => {
    if (!canView) return;
    const prefetchMaster = () => {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.departments.all,
        queryFn: () => import('../phong-ban/services/phong-ban-service').then((m) => m.getDepartments()),
        ...masterDataQueryOptions,
        staleTime: Infinity,
        gcTime: SERVER_GC_TIME_MS,
      });
      void queryClient.prefetchQuery({
        queryKey: queryKeys.positions.all,
        queryFn: () => import('../chuc-vu/services/chuc-vu-service').then((m) => m.getPositions()),
        ...masterDataQueryOptions,
        staleTime: Infinity,
        gcTime: SERVER_GC_TIME_MS,
      });
    };
    const idleId =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(prefetchMaster, { timeout: 3000 })
        : window.setTimeout(prefetchMaster, 500);
    return () => {
      if (typeof cancelIdleCallback !== 'undefined' && typeof idleId === 'number') {
        cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId as number);
      }
    };
  }, [queryClient, canView]);

  const { deleteWithUndo } = useDeleteWithUndo();
  const statusMutation = useUpdateStatusEmployee();
  const confirm = useConfirmStore((s) => s.confirm);

  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  // Đồng bộ viewing với dữ liệu server (full list); đóng drawer nếu bản ghi không còn (vd. đã xóa ngoài app).
  useEffect(() => {
    if (!viewingEmp) return;
    const row = employeesDisplay.find((e) => e.id === viewingEmp.id);
    if (!row) {
      queueMicrotask(() => setViewingEmp(null));
      return;
    }
    if (row !== viewingEmp) queueMicrotask(() => setViewingEmp(row));
  }, [employeesDisplay, viewingEmp]);

  const filterFn = useCallback(
    (emp: Employee, term: string, f: typeof filters) => {
      const matchesSearch = matchesSearchTerm(
        emp as unknown as Record<string, unknown>,
        term,
        NHAN_VIEN_SEARCHABLE_KEYS,
      );
      const matchesStatus = f.trang_thai.length === 0 || f.trang_thai.includes(emp.trang_thai);
      const matchesDept =
        f.id_phong_ban.length === 0 ||
        (emp.id_phong_ban != null && f.id_phong_ban.includes(emp.id_phong_ban));
      const matchesPos =
        f.id_chuc_vu.length === 0 ||
        (emp.id_chuc_vu != null && f.id_chuc_vu.includes(emp.id_chuc_vu));
      const matchesBranch =
        f.id_chi_nhanh.length === 0 ||
        (emp.id_chi_nhanh ?? []).some((id) => f.id_chi_nhanh.includes(id));
      const matchesColumnText = employeeMatchesColumnSearch(emp, f.columnSearch);
      return matchesSearch && matchesStatus && matchesDept && matchesPos && matchesBranch && matchesColumnText;
    },
    [],
  );

  const filteredEmployees = useListWithFilter(employeesDisplay, searchTerm, filters, filterFn);

  const sortedEmployees = useMemo(() => {
    if (isServerPaginated) return filteredEmployees;
    if (!sort.column || !sort.direction) return filteredEmployees;
    const sorted = [...filteredEmployees];
    sorted.sort((a, b) => {
      const key = sort.column as keyof Employee;
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';
      const cmp =
        typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal), getLanguage());
      return sort.direction === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [filteredEmployees, sort, isServerPaginated]);

  /**
   * Mở form sửa: list không còn ship `hinh_anh` (P1.1) nên cần fetch full row qua
   * cache TanStack Query trước khi gán `editingEmp` để form pre-fill avatar đúng.
   */
  const handleEdit = useCallback(
    (item: Employee) => {
      if (!canEdit) return;
      const origin: FormOrigin = viewingEmpRef.current ? 'detail' : 'list';
      startTransition(() => {
        setFormOrigin(origin);
        setEditingEmp(item);
        setShowForm(true);
      });
      void (async () => {
        try {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.employees.detail(item.id),
            exact: true,
            refetchType: 'none',
          });
          const full = await queryClient.fetchQuery({
            queryKey: queryKeys.employees.detail(item.id),
            queryFn: () => getEmployeeById(item.id),
            ...defaultServerQueryOptions,
          });
          if (full == null) {
            queryClient.removeQueries({ queryKey: queryKeys.employees.detail(item.id) });
            patchEmployeesListCaches(queryClient, (old) => old.filter((e) => e.id !== item.id), -1);
            toast.error(txt('employee.service.notFound'));
            startTransition(() => {
              setShowForm(false);
              setEditingEmp(null);
            });
            return;
          }
          startTransition(() => setEditingEmp(full));
        } catch {
          // Giữ dữ liệu từ list nếu fetch full row thất bại.
        }
      })();
    },
    [queryClient, canEdit],
  );

  /** Detail drawer: luôn refetch full row (có `hinh_anh`) khi mở — invalidate trước để không dùng cache còn “fresh” nhưng đã lệch DB. */
  const handleView = useCallback(
    (item: Employee) => {
      void (async () => {
        try {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.employees.detail(item.id),
            exact: true,
            refetchType: 'none',
          });
          const full = await queryClient.fetchQuery({
            queryKey: queryKeys.employees.detail(item.id),
            queryFn: () => getEmployeeById(item.id),
            ...defaultServerQueryOptions,
          });
          if (full == null) {
            queryClient.removeQueries({ queryKey: queryKeys.employees.detail(item.id) });
            patchEmployeesListCaches(queryClient, (old) => old.filter((e) => e.id !== item.id), -1);
            toast.error(txt('employee.service.notFound'));
            return;
          }
          startTransition(() => setViewingEmp(full));
        } catch {
          startTransition(() => setViewingEmp(item));
        }
      })();
    },
    [queryClient],
  );

  const closeDetail = useCallback(() => setViewingEmp(null), []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    const ed = editingEmpRef.current;
    if (formOriginRef.current === 'detail' && ed) {
      const fresh = employeesRef.current.find((e) => e.id === ed.id);
      setViewingEmp(fresh ?? null);
    }
    setEditingEmp(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      if (!canDelete) return;
      const emp = employeesRef.current.find((e) => e.id === id);
      if (!emp) return;
      confirm({
        title: txt('employee.deleteConfirmTitle'),
        message: `${txt('employee.deleteConfirmMessage')} "${emp.ho_va_ten}"? ${txt('employee.deleteConfirmNote')}`,
        variant: 'danger',
        confirmText: CONFIRM_DELETE(),
        onConfirm: async () => {
          await deleteWithUndo([emp], {
            onDone: () => {
              if (viewingEmpRef.current?.id === id) setViewingEmp(null);
              if (editingEmpRef.current?.id === id) setShowForm(false);
            },
          });
        },
      });
    },
    [confirm, deleteWithUndo, canDelete],
  );

  const handleStatusChange = useCallback((item: Employee) => {
    if (!canEdit) return;
    setStatusChangeTarget(item);
  }, [canEdit]);

  const handleStatusSave = useCallback(
    async (status: TrangThaiNhanVien) => {
      if (!canEdit || !statusChangeTarget) return;
      const targetId = statusChangeTarget.id;
      await statusMutation.mutateAsync({ ids: [targetId], status });
      setViewingEmp((prev) => (prev?.id === targetId ? { ...prev, trang_thai: status } : prev));
      setStatusChangeTarget(null);
    },
    [statusChangeTarget, statusMutation, canEdit],
  );

  const handleDeleteMany = (ids: string[]) => {
    if (!canDelete) return;
    const emps = employeesDisplay.filter((e) => ids.includes(e.id));
    confirm({
      title: txt('employee.bulkDeleteTitle'),
      message: txt('employee.bulkDeleteMessage', { count: ids.length }),
      variant: 'danger',
      confirmText: CONFIRM_DELETE_ALL(),
      onConfirm: async () => {
        await deleteWithUndo(emps, { onDone: clearSelection });
      },
    });
  };

  const handleStatusChangeMany = (ids: string[], status: TrangThaiNhanVien) => {
    if (!canEdit) return;
    const label = STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
    confirm({
      title: txt('employee.bulkStatusTitle'),
      message: `${txt('employee.bulkStatusMessage', { count: ids.length })} "${label}"?`,
      variant: 'warning',
      confirmText: CONFIRM_YES(),
      onConfirm: async () => {
        await statusMutation.mutateAsync({ ids, status });
        clearSelection();
      },
    });
  };

  if (isInitializing) {
    return <SessionInitializingSpinner />;
  }

  if (!canView) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[40vh] px-4"
        aria-busy="true"
        aria-label={txt('employee.title')}
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
            { id: 'list', label: txt('employee.tabList'), icon: List },
            { id: 'stats', label: txt('employee.tabStats'), icon: BarChart3 },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === 'list' ? (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden relative z-0">
          <EmployeeToolbar
            employees={employeesDisplay}
            departments={departments}
            positions={positions}
            branches={branches}
            onAdd={() => {
              if (!canCreate) return;
              startTransition(() => {
                setFormOrigin('list');
                setEditingEmp(null);
                setShowForm(true);
              });
            }}
            onDeleteMany={handleDeleteMany}
            onStatusChangeMany={handleStatusChangeMany}
          />

          <div className="flex-1 min-h-0">
            {listIsError ? (
              <ErrorState
                title={txt('employee.listLoadErrorTitle')}
                message={txt('employee.listLoadErrorHint')}
                onRetry={() => refetchList()}
                primaryButtons
                className="m-4 border-0 shadow-none"
              />
            ) : (
            <EmployeeTable
              data={sortedEmployees}
              isLoading={isLoading}
              employeesForFilterCounts={employeesDisplay}
              departments={departments}
              positions={positions}
              branches={branches}
              serverSidePagination={isServerPaginated}
              serverTotalRecords={listTotal}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col mt-1.5 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
            <Suspense
              fallback={
                <div className="flex flex-1 items-center justify-center min-h-[320px]">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              }
            >
              <EmployeeStats
                onDrillDownDept={(deptId) => {
                  setFilter('id_phong_ban', [deptId]);
                  setActiveTab('list');
                }}
                onDrillDownStatus={(status) => {
                  setFilter('trang_thai', [status]);
                  setActiveTab('list');
                }}
              />
            </Suspense>
          </div>
        </div>
      )}

      <AnimatePresence mode="sync">
        {showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <EmployeeForm
              key={editingEmp?.id ?? 'new'}
              initialData={editingEmp}
              departments={departments}
              positions={positions}
              onClose={closeForm}
            />
          </Suspense>
        )}
        {viewingEmp && !showForm && (
          <Suspense fallback={<DrawerLazyFallback />}>
            <EmployeeDetail
              data={viewingEmp}
              onClose={closeDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          </Suspense>
        )}
        {statusChangeTarget && (
          <Suspense fallback={null}>
            <EmployeeStatusChangeDialog
              open
              employee={statusChangeTarget}
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

export default EmployeePage;
