import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getBomItems,
  getBomItemById,
  createBomItem,
  updateBomItem,
  deleteBomItems,
  updateBomStatus,
} from '../services/bom-service';
import type { BomFormValues } from '../core/schema';
import type { BomItem } from '../core/types';
import { useProductCategories } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.bom.all;

function useProductCategoriesForBom(): ProductCategory[] {
  const { data = [] } = useProductCategories();
  return data;
}

export const useBomList = (options?: { enabled?: boolean }) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const { data: categories = [], isSuccess: categoriesLoaded } = useProductCategories({
    enabled: sessionReady,
  });

  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getBomItems(categories),
    enabled: sessionReady && categoriesLoaded,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useBomDetail = (id: string | undefined, options?: { enabled?: boolean }) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const categories = useProductCategoriesForBom();
  const enabled = sessionReady && Boolean(id?.trim());

  return useQuery({
    queryKey: queryKeys.bom.detail(id ?? ''),
    queryFn: () => getBomItemById(id!, categories),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateBomItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useProductCategoriesForBom();

  return useMutation({
    mutationFn: (data: BomFormValues) => createBomItem(data, categories),
    onSuccess: (created) => {
      queryClient.setQueryData<BomItem[]>(listQueryKey, (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.setQueryData(queryKeys.bom.detail(created.id), created);
      toast.success(txt('bom.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateBomItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useProductCategoriesForBom();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BomFormValues }) =>
      updateBomItem(id, data, categories),
    onSuccess: (updated) => {
      queryClient.setQueryData<BomItem[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.bom.detail(updated.id), updated);
      toast.success(txt('bom.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteBomItems = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBomItems,
    onSuccess: (_data, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<BomItem[]>(listQueryKey, (old) =>
        old?.filter((d) => !idSet.has(d.id)),
      );
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: queryKeys.bom.detail(id) });
      });
      toast.success(txt('bom.toast.deleteSuccess', { count: ids.length }));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateBomStatus = () => {
  const queryClient = useQueryClient();
  const categories = useProductCategoriesForBom();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateBomStatus(ids, status, categories),
    onSuccess: (updated, { ids, status }) => {
      if (updated) {
        queryClient.setQueryData<BomItem[]>(listQueryKey, (old) =>
          old?.map((d) => (d.id === updated.id ? updated : d)),
        );
        queryClient.setQueryData(queryKeys.bom.detail(updated.id), updated);
      } else {
        queryClient.setQueryData<BomItem[]>(listQueryKey, (old) =>
          old?.map((d) => (ids.includes(d.id) ? { ...d, trang_thai: status } : d)),
        );
      }
      toast.success(txt('bom.toast.statusUpdate', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
