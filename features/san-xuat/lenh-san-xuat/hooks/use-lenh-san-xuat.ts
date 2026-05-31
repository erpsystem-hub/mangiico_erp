import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductionOrders,
  getProductionOrderById,
  getProductionOrderLines,
  updateProductionOrderStatus,
} from '../services/lenh-san-xuat-service';
import type { TrangThaiLenhSx } from '../core/constants';
import type { ProductionOrder } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.productionOrders.all;
const linesQueryKey = queryKeys.productionOrders.lines;

export const useProductionOrders = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getProductionOrders,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useProductionOrderDetail = (id: string | undefined, options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && id));
  return useQuery({
    queryKey: queryKeys.productionOrders.detail(id ?? ''),
    queryFn: () => getProductionOrderById(id!),
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export const useProductionOrderLines = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: linesQueryKey,
    queryFn: getProductionOrderLines,
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export const useUpdateProductionOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiLenhSx }) =>
      updateProductionOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<ProductionOrder[]>(listQueryKey, (old) => {
        if (!old) return old;
        const idx = old.findIndex((o) => o.id === updated.id);
        if (idx < 0) return old;
        const next = [...old];
        next[idx] = updated;
        return next.sort(
          (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
        );
      });
      queryClient.setQueryData(queryKeys.productionOrders.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: linesQueryKey });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
        refetchType: 'none',
      });
      queryClient.setQueryData(queryKeys.salesOrders.detail(updated.id), (old) => {
        const cached = old as ProductionOrder | undefined;
        if (!cached) return cached;
        return { ...cached, trang_thai: updated.trang_thai, tg_cap_nhat: updated.tg_cap_nhat };
      });
      toast.success(txt('productionOrder.toast.statusUpdateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
