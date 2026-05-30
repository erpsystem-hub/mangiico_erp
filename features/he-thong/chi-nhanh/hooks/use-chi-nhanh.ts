import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranches,
  updateBranchStatus,
  importBranches,
} from '../services/chi-nhanh-service';
import { BranchFormValues } from '../core/schema';
import type { Branch } from '../core/types';
import { toast } from 'sonner';
import { txt } from '../../../../lib/text';
import { queryKeys } from '@/lib/query-keys';
import { masterDataQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const branchesQueryKey = queryKeys.chiNhanh.all;

export const useBranches = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: branchesQueryKey,
    queryFn: getBranches,
    enabled,
    ...masterDataQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateBranch = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: (created) => {
      queryClient.setQueryData<Branch[]>(branchesQueryKey, (old) =>
        old ? [...old, created].sort((a, b) => a.thu_tu - b.thu_tu) : [created],
      );
      toast.success(txt('branch.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateBranch = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BranchFormValues }) => updateBranch(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<Branch[]>(branchesQueryKey, (old) =>
        old?.map((b) => (b.id === updated.id ? updated : b)),
      );
      toast.success(txt('branch.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateStatusBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateBranchStatus(ids, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Branch[]>(branchesQueryKey, (old) =>
        old?.map((b) =>
          variables.ids.includes(b.id) ? { ...b, trang_thai: variables.status } : b,
        ),
      );
      toast.success(txt('branch.toast.statusUpdate', { count: variables.ids.length }));
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteBranches(ids),
    onSuccess: (_, ids) => {
      queryClient.setQueryData<Branch[]>(branchesQueryKey, (old) =>
        old?.filter((b) => !ids.includes(b.id)),
      );
      toast.success(txt('branch.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportBranches = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importBranches,
    onSuccess: async (result) => {
      const fresh = await getBranches();
      queryClient.setQueryData(branchesQueryKey, fresh);
      queryClient.invalidateQueries({
        queryKey: queryKeys.employees.all,
        refetchType: 'none',
      });
      if (result.created > 0) {
        toast.success(txt('branch.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
