import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPartnerCategories,
  createPartnerCategory,
  updatePartnerCategory,
  deletePartnerCategory,
  updatePartnerCategoryStatus,
  importPartnerCategories,
} from '../services/doi-tac-category-service';
import type { PartnerCategoryFormValues } from '../core/schema';
import type { PartnerCategory, PartnerKind } from '../core/types';
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

export const usePartnerCategories = (
  kind: PartnerKind,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getPartnerCategories(kind),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreatePartnerCategory = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useMutation({
    mutationFn: (data: PartnerCategoryFormValues) => createPartnerCategory(kind, data),
    onSuccess: (created) => {
      queryClient.setQueryData<PartnerCategory[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort((a, b) => a.duong_dan.localeCompare(b.duong_dan))
          : [created],
      );
      toast.success(txt('partnerCategory.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdatePartnerCategory = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartnerCategoryFormValues }) =>
      updatePartnerCategory(kind, id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<PartnerCategory[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.partnerCategories(kind).detail(updated.id), updated);
      toast.success(txt('partnerCategory.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateStatusPartnerCategory = (kind: PartnerKind) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiHoatDong }) =>
      updatePartnerCategoryStatus(kind, id, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<PartnerCategory[]>(listQueryKey, (old) =>
        old?.map((d) =>
          d.id === variables.id ? { ...d, trang_thai: variables.status } : d,
        ),
      );
      toast.success(txt('partnerCategory.toast.updateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeletePartnerCategory = (kind: PartnerKind) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useMutation({
    mutationFn: (id: string) => deletePartnerCategory(kind, id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<PartnerCategory[]>(listQueryKey, (old) =>
        old?.filter((d) => d.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.partnerCategories(kind).detail(id) });
      toast.success(txt('partnerCategory.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportPartnerCategories = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerCategories(kind).all;
  return useMutation({
    mutationFn: (rows: PartnerCategoryFormValues[]) => importPartnerCategories(kind, rows),
    onSuccess: async (result) => {
      const fresh = await getPartnerCategories(kind);
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('partnerCategory.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
