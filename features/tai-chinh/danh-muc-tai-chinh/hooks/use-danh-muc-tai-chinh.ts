import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFinanceCategories,
  createFinanceCategory,
  updateFinanceCategory,
  deleteFinanceCategory,
  updateFinanceCategoryStatus,
  importFinanceCategories,
} from '../services/danh-muc-tai-chinh-service';
import type { FinanceCategoryFormValues } from '../core/schema';
import type { FinanceCategory } from '../core/types';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.financeCategories.all;

export const useFinanceCategories = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getFinanceCategories,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateFinanceCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFinanceCategory,
    onSuccess: (created) => {
      queryClient.setQueryData<FinanceCategory[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort((a, b) => a.duong_dan.localeCompare(b.duong_dan))
          : [created],
      );
      toast.success(txt('financeCategory.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateFinanceCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinanceCategoryFormValues }) =>
      updateFinanceCategory(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<FinanceCategory[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.financeCategories.detail(updated.id), updated);
      toast.success(txt('financeCategory.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateStatusFinanceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiHoatDong }) =>
      updateFinanceCategoryStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<FinanceCategory[]>(listQueryKey, (old) =>
        old?.map((d) =>
          d.id === variables.id ? { ...d, trang_thai: variables.status } : d,
        ),
      );
      toast.success(txt('financeCategory.toast.updateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteFinanceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFinanceCategory,
    onSuccess: (_, id) => {
      queryClient.setQueryData<FinanceCategory[]>(listQueryKey, (old) =>
        old?.filter((d) => d.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.financeCategories.detail(id) });
      toast.success(txt('financeCategory.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportFinanceCategories = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importFinanceCategories,
    onSuccess: async (result) => {
      const fresh = await getFinanceCategories();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('financeCategory.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
