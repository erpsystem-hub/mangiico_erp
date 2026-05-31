import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSalesOrders,
  getSalesOrderById,
  getSalesOrdersByKhachHang,
  upsertSalesOrder,
  deleteSalesOrder,
} from '../services/don-hang-service';
import type { SalesOrderFormValues } from '../core/schema';
import type { SalesOrder } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.salesOrders.all;

export const useSalesOrders = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getSalesOrders,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useSalesOrdersByKhachHang = (
  khachHangId: string | undefined,
  options?: { enabled?: boolean; limit?: number },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && khachHangId));
  return useQuery({
    queryKey: queryKeys.salesOrders.byKhachHang(khachHangId ?? ''),
    queryFn: () => getSalesOrdersByKhachHang(khachHangId!, options?.limit ?? 5),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useSalesOrderDetail = (id: string | undefined, options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && id));
  return useQuery({
    queryKey: queryKeys.salesOrders.detail(id ?? ''),
    queryFn: () => getSalesOrderById(id!),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useUpsertSalesOrder = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: SalesOrderFormValues }) =>
      upsertSalesOrder(data, id),
    onSuccess: (saved) => {
      queryClient.setQueryData<SalesOrder[]>(listQueryKey, (old) => {
        const next = old ? [...old] : [];
        const idx = next.findIndex((o) => o.id === saved.id);
        if (idx >= 0) next[idx] = saved;
        else next.unshift(saved);
        return next.sort(
          (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
        );
      });
      queryClient.setQueryData(queryKeys.salesOrders.detail(saved.id), saved);
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.byKhachHang(saved.khach_hang_id),
      });
      toast.success(
        saved.id
          ? txt('salesOrder.toast.updateSuccess')
          : txt('salesOrder.toast.createSuccess'),
      );
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSalesOrder,
    onSuccess: (_, id) => {
      const removed = queryClient
        .getQueryData<SalesOrder[]>(listQueryKey)
        ?.find((o) => o.id === id);
      queryClient.setQueryData<SalesOrder[]>(listQueryKey, (old) =>
        old?.filter((o) => o.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.salesOrders.detail(id) });
      if (removed?.khach_hang_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.salesOrders.byKhachHang(removed.khach_hang_id),
        });
      }
      toast.success(txt('salesOrder.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
