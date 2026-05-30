import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getFinanceAccounts,
  createFinanceAccount,
  updateFinanceAccount,
  deleteFinanceAccounts,
  updateFinanceAccountStatus,
  importFinanceAccounts,
} from '../services/tai-khoan-service';
import { FinanceAccountFormValues } from '../core/schema';
import type { FinanceAccount } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import { transactionalCrudListQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';
import type { Branch } from '@/features/he-thong/chi-nhanh/core/types';

const listQueryKey = queryKeys.financeAccounts.all;

export const useFinanceAccounts = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getFinanceAccounts,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateFinanceAccount = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFinanceAccount,
    onSuccess: (created) => {
      queryClient.setQueryData<FinanceAccount[]>(listQueryKey, (old) =>
        old ? [...old, created].sort((a, b) => a.ten_quy.localeCompare(b.ten_quy, 'vi')) : [created],
      );
      queryClient.setQueryData(queryKeys.financeAccounts.detail(created.id), created);
      toast.success(txt('financeAccount.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateFinanceAccount = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinanceAccountFormValues }) =>
      updateFinanceAccount(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<FinanceAccount[]>(listQueryKey, (old) =>
        old?.map((a) => (a.id === updated.id ? updated : a)),
      );
      queryClient.setQueryData(queryKeys.financeAccounts.detail(updated.id), updated);
      toast.success(txt('financeAccount.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateStatusFinanceAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateFinanceAccountStatus(ids, status),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<FinanceAccount[]>(listQueryKey, (old) =>
        old?.map((a) =>
          variables.ids.includes(a.id) ? { ...a, trang_thai: variables.status } : a,
        ),
      );
      if (updated) {
        queryClient.setQueryData(queryKeys.financeAccounts.detail(updated.id), updated);
      }
      toast.success(txt('financeAccount.toast.statusUpdate', { count: variables.ids.length }));
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useDeleteFinanceAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteFinanceAccounts(ids),
    onSuccess: (_, ids) => {
      queryClient.setQueryData<FinanceAccount[]>(listQueryKey, (old) =>
        old?.filter((a) => !ids.includes(a.id)),
      );
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: queryKeys.financeAccounts.detail(id) });
      }
      toast.success(txt('financeAccount.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportFinanceAccounts = (branches: Branch[], onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rows: Record<string, unknown>[]) => importFinanceAccounts(rows, branches),
    onSuccess: async (result) => {
      const fresh = await getFinanceAccounts();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('financeAccount.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
