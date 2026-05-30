import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  updateProductCategoryStatus,
  importProductCategories,
} from '../services/danh-muc-hang-hoa-service';
import { getCategoryLinks } from '../services/danh-muc-hang-hoa-links-service';
import type { ProductCategoryFormValues } from '../core/schema';
import type { ProductCategory } from '../core/types';
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

const listQueryKey = queryKeys.productCategories.all;

export const useProductCategories = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getProductCategories,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCategoryLinks = (
  danhMucId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const baseEnabled = useSupabaseReady(options?.enabled !== false);
  const enabled = baseEnabled && Boolean(danhMucId?.trim());
  return useQuery({
    queryKey: queryKeys.productCategories.links(danhMucId ?? ''),
    queryFn: () => getCategoryLinks(danhMucId!),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateProductCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductCategory,
    onSuccess: (created) => {
      queryClient.setQueryData<ProductCategory[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort((a, b) => a.duong_dan.localeCompare(b.duong_dan))
          : [created],
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.links(created.id),
      });
      toast.success(txt('productCategory.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateProductCategory = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductCategoryFormValues }) =>
      updateProductCategory(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProductCategory[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.productCategories.detail(updated.id), updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.links(updated.id),
      });
      toast.success(txt('productCategory.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateStatusProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiHoatDong }) =>
      updateProductCategoryStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<ProductCategory[]>(listQueryKey, (old) =>
        old?.map((d) =>
          d.id === variables.id ? { ...d, trang_thai: variables.status } : d,
        ),
      );
      toast.success(txt('productCategory.toast.updateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: (_, id) => {
      queryClient.setQueryData<ProductCategory[]>(listQueryKey, (old) =>
        old?.filter((d) => d.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.productCategories.detail(id) });
      queryClient.removeQueries({ queryKey: queryKeys.productCategories.links(id) });
      toast.success(txt('productCategory.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportProductCategories = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importProductCategories,
    onSuccess: async (result) => {
      const fresh = await getProductCategories();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('productCategory.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
