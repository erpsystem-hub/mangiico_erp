import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  getPurchaseOrdersByNhaCungCap,
  upsertPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
} from '../services/don-mua-nguyen-lieu-service';
import type { TrangThaiDonMua } from '../core/constants';
import type { PurchaseOrderFormValues } from '../core/schema';
import type { PurchaseOrder } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.purchaseOrders.all;

export const usePurchaseOrders = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getPurchaseOrders,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const usePurchaseOrdersByNhaCungCap = (
  nhaCungCapId: string | undefined,
  options?: { enabled?: boolean; limit?: number },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && nhaCungCapId));
  return useQuery({
    queryKey: queryKeys.purchaseOrders.byNhaCungCap(nhaCungCapId ?? ''),
    queryFn: () => getPurchaseOrdersByNhaCungCap(nhaCungCapId!, options?.limit ?? 5),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const usePurchaseOrderDetail = (id: string | undefined, options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && id));
  return useQuery({
    queryKey: queryKeys.purchaseOrders.detail(id ?? ''),
    queryFn: () => getPurchaseOrderById(id!),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useUpsertPurchaseOrder = (onSuccess?: (saved: PurchaseOrder) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: PurchaseOrderFormValues }) =>
      upsertPurchaseOrder(data, id),
    onSuccess: (saved) => {
      queryClient.setQueryData<PurchaseOrder[]>(listQueryKey, (old) => {
        const next = old ? [...old] : [];
        const idx = next.findIndex((o) => o.id === saved.id);
        if (idx >= 0) next[idx] = saved;
        else next.unshift(saved);
        return next.sort(
          (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
        );
      });
      queryClient.setQueryData(queryKeys.purchaseOrders.detail(saved.id), saved);
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.byNhaCungCap(saved.nha_cung_cap_id),
      });
      toast.success(
        saved.id
          ? txt('purchaseOrder.toast.updateSuccess')
          : txt('purchaseOrder.toast.createSuccess'),
      );
      onSuccess?.(saved);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: (_, id) => {
      const removed = queryClient
        .getQueryData<PurchaseOrder[]>(listQueryKey)
        ?.find((o) => o.id === id);
      queryClient.setQueryData<PurchaseOrder[]>(listQueryKey, (old) =>
        old?.filter((o) => o.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.purchaseOrders.detail(id) });
      if (removed?.nha_cung_cap_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.purchaseOrders.byNhaCungCap(removed.nha_cung_cap_id),
        });
      }
      toast.success(txt('purchaseOrder.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TrangThaiDonMua }) =>
      updatePurchaseOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<PurchaseOrder[]>(listQueryKey, (old) =>
        old?.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
      );
      queryClient.setQueryData(queryKeys.purchaseOrders.detail(updated.id), updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.byNhaCungCap(updated.nha_cung_cap_id),
        refetchType: 'none',
      });
      toast.success(txt('purchaseOrder.toast.statusUpdateSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
