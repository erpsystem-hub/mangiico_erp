import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
  updateMaterialCategoryStatus,
  importMaterialCategories,
} from '../services/danh-muc-nguyen-lieu-service';
import type { MaterialCategoryFormValues } from '../core/schema';
import type { MaterialCategory } from '../core/types';
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

const listQueryKey = queryKeys.materialCategories.all;

export const useMaterialCategories = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getMaterialCategories,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateMaterialCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMaterialCategory,
    onSuccess: (created) => {
      queryClient.setQueryData<MaterialCategory[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort((a, b) => a.duong_dan.localeCompare(b.duong_dan))
          : [created],
      );
      toast.success(txt('materialCategory.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateMaterialCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaterialCategoryFormValues }) =>
      updateMaterialCategory(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<MaterialCategory[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.materialCategories.detail(updated.id), updated);
      toast.success(txt('materialCategory.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateStatusMaterialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiHoatDong }) =>
      updateMaterialCategoryStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<MaterialCategory[]>(listQueryKey, (old) =>
        old?.map((d) =>
          d.id === variables.id ? { ...d, trang_thai: variables.status } : d,
        ),
      );
      toast.success(txt('materialCategory.toast.updateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteMaterialCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMaterialCategory,
    onSuccess: (_, id) => {
      queryClient.setQueryData<MaterialCategory[]>(listQueryKey, (old) =>
        old?.filter((d) => d.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.materialCategories.detail(id) });
      toast.success(txt('materialCategory.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportMaterialCategories = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importMaterialCategories,
    onSuccess: async (result) => {
      const fresh = await getMaterialCategories();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('materialCategory.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
