import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getMaterialCatalogItems,
  getMaterialCatalogItemById,
  createMaterialCatalogItem,
  updateMaterialCatalogItem,
  deleteMaterialCatalogItems,
  updateMaterialCatalogStatus,
} from '../services/danh-sach-nguyen-lieu-service';
import type { MaterialCatalogFormValues } from '../core/schema';
import type { MaterialCatalogItem } from '../core/types';
import { useMaterialCategories } from '@/features/san-xuat/danh-muc-nguyen-lieu/hooks/use-danh-muc-nguyen-lieu';
import type { MaterialCategory } from '@/features/san-xuat/danh-muc-nguyen-lieu/core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.materialCatalog.all;

function useCategoriesForCatalog(): MaterialCategory[] {
  const { data = [] } = useMaterialCategories();
  return data;
}

export const useMaterialCatalogList = (options?: { enabled?: boolean }) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const { data: categories = [], isSuccess: categoriesLoaded } = useMaterialCategories({
    enabled: sessionReady,
  });

  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getMaterialCatalogItems(categories),
    enabled: sessionReady && categoriesLoaded,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useMaterialCatalogDetail = (
  id: string | undefined,
  options?: { enabled?: boolean },
) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const categories = useCategoriesForCatalog();
  const enabled = sessionReady && Boolean(id?.trim());

  return useQuery({
    queryKey: queryKeys.materialCatalog.detail(id ?? ''),
    queryFn: () => getMaterialCatalogItemById(id!, categories),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateMaterialCatalogItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForCatalog();

  return useMutation({
    mutationFn: (data: MaterialCatalogFormValues) => createMaterialCatalogItem(data, categories),
    onSuccess: (created) => {
      queryClient.setQueryData<MaterialCatalogItem[]>(listQueryKey, (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.setQueryData(queryKeys.materialCatalog.detail(created.id), created);
      toast.success(txt('materialCatalog.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateMaterialCatalogItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForCatalog();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaterialCatalogFormValues }) =>
      updateMaterialCatalogItem(id, data, categories),
    onSuccess: (updated) => {
      queryClient.setQueryData<MaterialCatalogItem[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.materialCatalog.detail(updated.id), updated);
      toast.success(txt('materialCatalog.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteMaterialCatalogItems = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterialCatalogItems,
    onSuccess: (_data, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<MaterialCatalogItem[]>(listQueryKey, (old) =>
        old?.filter((d) => !idSet.has(d.id)),
      );
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: queryKeys.materialCatalog.detail(id) });
      });
      toast.success(txt('materialCatalog.toast.deleteSuccess', { count: ids.length }));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateMaterialCatalogStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateMaterialCatalogStatus(ids, status),
    onSuccess: (updated, { ids, status }) => {
      if (updated) {
        queryClient.setQueryData<MaterialCatalogItem[]>(listQueryKey, (old) =>
          old?.map((d) => (d.id === updated.id ? { ...d, trang_thai: status } : d)),
        );
      } else {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
      toast.success(txt('materialCatalog.toast.statusUpdate', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
