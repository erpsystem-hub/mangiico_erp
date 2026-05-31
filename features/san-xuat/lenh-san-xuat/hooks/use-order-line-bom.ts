import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderLineBom,
  getTemplateMaterialIdsForCategory,
  generateOrderLineBomFromCategory,
  createOrderLineBom,
  updateOrderLineBom,
  deleteOrderLineBom,
} from '../services/order-line-bom-service';
import type { OrderLineBomFormValues } from '../core/order-line-bom-schema';
import type { OrderLineBomItem } from '../core/order-line-bom-types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const lineBomKey = (lineId: string) => queryKeys.productionOrders.lineBom(lineId);

export const useOrderLineBom = (
  lineId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && lineId));
  return useQuery({
    queryKey: lineBomKey(lineId ?? ''),
    queryFn: () => getOrderLineBom(lineId!),
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export const useTemplateMaterialIds = (
  danhMucId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && danhMucId));
  return useQuery({
    queryKey: ['production-orders', 'line-bom-template', danhMucId ?? ''],
    queryFn: () => getTemplateMaterialIdsForCategory(danhMucId!),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useGenerateOrderLineBom = (lineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (replace: boolean) => generateOrderLineBomFromCategory(lineId, replace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineBomKey(lineId) });
      toast.success(txt('productionOrder.lineBom.toast.generateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useCreateOrderLineBom = (lineId: string, lineQty: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderLineBomFormValues) => createOrderLineBom(lineId, lineQty, data),
    onSuccess: (created) => {
      queryClient.setQueryData<OrderLineBomItem[]>(lineBomKey(lineId), (old) => {
        const list = old ?? [];
        const idx = list.findIndex((r) => r.id === created.id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = created;
          return next;
        }
        return [...list, created].sort((a, b) => a.thu_tu - b.thu_tu || a.id.localeCompare(b.id));
      });
      toast.success(txt('productionOrder.lineBom.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdateOrderLineBom = (lineId: string, lineQty: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderLineBomFormValues }) =>
      updateOrderLineBom(id, lineId, lineQty, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<OrderLineBomItem[]>(lineBomKey(lineId), (old) => {
        if (!old) return [updated];
        return old.map((r) => (r.id === updated.id ? updated : r));
      });
      toast.success(txt('productionOrder.lineBom.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteOrderLineBom = (lineId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrderLineBom(id, lineId),
    onSuccess: (_void, id) => {
      queryClient.setQueryData<OrderLineBomItem[]>(lineBomKey(lineId), (old) =>
        (old ?? []).filter((r) => r.id !== id),
      );
      toast.success(txt('productionOrder.lineBom.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
