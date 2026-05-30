import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getProductCatalogItems,
  getProductCatalogItemById,
  createProductCatalogItem,
  updateProductCatalogItem,
  deleteProductCatalogItems,
  updateProductCatalogStatus,
} from '../services/danh-sach-hang-hoa-service';
import { getProductAttributeValues } from '../services/san-pham-thuoc-tinh-service';
import type { ProductCatalogFormValues } from '../core/schema';
import type { ProductCatalogItem } from '../core/types';
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

const listQueryKey = queryKeys.productCatalog.all;

function useCategoriesForCatalog(): ProductCategory[] {
  const { data = [] } = useProductCategories();
  return data;
}

export const useProductCatalogList = (options?: { enabled?: boolean }) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const { data: categories = [], isSuccess: categoriesLoaded } = useProductCategories({
    enabled: sessionReady,
  });

  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getProductCatalogItems(categories),
    enabled: sessionReady && categoriesLoaded,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useProductCatalogDetail = (
  id: string | undefined,
  options?: { enabled?: boolean },
) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const categories = useCategoriesForCatalog();
  const enabled = sessionReady && Boolean(id?.trim());

  return useQuery({
    queryKey: queryKeys.productCatalog.detail(id ?? ''),
    queryFn: () => getProductCatalogItemById(id!, categories),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useProductAttributeValues = (
  sanPhamId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const enabled = sessionReady && Boolean(sanPhamId?.trim());

  return useQuery({
    queryKey: queryKeys.productCatalog.attributeValues(sanPhamId ?? ''),
    queryFn: () => getProductAttributeValues(sanPhamId!),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateProductCatalogItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForCatalog();

  return useMutation({
    mutationFn: (data: ProductCatalogFormValues) => createProductCatalogItem(data, categories),
    onSuccess: (created) => {
      queryClient.setQueryData<ProductCatalogItem[]>(listQueryKey, (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.setQueryData(queryKeys.productCatalog.detail(created.id), created);
      toast.success(txt('productCatalog.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateProductCatalogItem = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForCatalog();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductCatalogFormValues }) =>
      updateProductCatalogItem(id, data, categories),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProductCatalogItem[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.productCatalog.detail(updated.id), updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCatalog.attributeValues(updated.id),
      });
      toast.success(txt('productCatalog.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteProductCatalogItems = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProductCatalogItems,
    onSuccess: (_data, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<ProductCatalogItem[]>(listQueryKey, (old) =>
        old?.filter((d) => !idSet.has(d.id)),
      );
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: queryKeys.productCatalog.detail(id) });
      });
      toast.success(txt('productCatalog.toast.deleteSuccess', { count: ids.length }));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateProductCatalogStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateProductCatalogStatus(ids, status),
    onSuccess: (updated, { ids, status }) => {
      if (updated) {
        queryClient.setQueryData<ProductCatalogItem[]>(listQueryKey, (old) =>
          old?.map((d) => (d.id === updated.id ? { ...d, trang_thai: status } : d)),
        );
      } else {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
      toast.success(txt('productCatalog.toast.statusUpdate', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
