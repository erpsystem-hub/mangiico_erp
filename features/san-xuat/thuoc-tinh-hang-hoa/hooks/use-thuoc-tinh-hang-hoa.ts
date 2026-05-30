import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getProductAttributes,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttributes,
  updateProductAttributeStatus,
  importProductAttributes,
} from '../services/thuoc-tinh-hang-hoa-service';
import { ProductAttributeFormValues } from '../core/schema';
import type { ProductAttribute } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import { transactionalCrudListQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.productAttributes.all;

export const useProductAttributes = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getProductAttributes,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateProductAttribute = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProductAttribute,
    onSuccess: (created) => {
      queryClient.setQueryData<ProductAttribute[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort(
              (a, b) =>
                (a.thu_tu ?? 0) - (b.thu_tu ?? 0) ||
                a.ten_hien_thi.localeCompare(b.ten_hien_thi, 'vi'),
            )
          : [created],
      );
      queryClient.setQueryData(queryKeys.productAttributes.detail(created.id), created);
      toast.success(txt('productAttribute.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateProductAttribute = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductAttributeFormValues }) =>
      updateProductAttribute(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProductAttribute[]>(listQueryKey, (old) =>
        old?.map((a) => (a.id === updated.id ? updated : a)),
      );
      queryClient.setQueryData(queryKeys.productAttributes.detail(updated.id), updated);
      toast.success(txt('productAttribute.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateStatusProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateProductAttributeStatus(ids, status),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<ProductAttribute[]>(listQueryKey, (old) =>
        old?.map((a) =>
          variables.ids.includes(a.id) ? { ...a, trang_thai: variables.status } : a,
        ),
      );
      if (updated) {
        queryClient.setQueryData(queryKeys.productAttributes.detail(updated.id), updated);
      }
      toast.success(txt('productAttribute.toast.statusUpdate', { count: variables.ids.length }));
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useDeleteProductAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteProductAttributes(ids),
    onSuccess: (_, ids) => {
      queryClient.setQueryData<ProductAttribute[]>(listQueryKey, (old) =>
        old?.filter((a) => !ids.includes(a.id)),
      );
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: queryKeys.productAttributes.detail(id) });
      }
      toast.success(txt('productAttribute.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportProductAttributes = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importProductAttributes,
    onSuccess: async (result) => {
      const fresh = await getProductAttributes();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('productAttribute.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
