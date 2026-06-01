import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWarehouses,
  getWarehouseSlips,
  getWarehouseSlipById,
  getWarehouseSlipLines,
  upsertWarehouseSlip,
  cancelWarehouseSlip,
  deleteWarehouseSlip,
  getBomLinesForProductionOrder,
  getPurchaseLinesForImport,
  getProductLinesForProductionOrder,
  getReceivedQtyByProduct,
  type ProductionOrderProductLine,
} from '../services/phieu-kho-service';
import type { WarehouseSlipFormValues } from '../core/schema';
import type { WarehouseSlip, WarehouseSlipListItem } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.warehouseSlips.all;
const linesQueryKey = queryKeys.warehouseSlips.lines;

export const useWarehouses = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: queryKeys.warehouses.all,
    queryFn: getWarehouses,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useWarehouseSlips = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getWarehouseSlips,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useWarehouseSlipDetail = (id: string | undefined, options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && id));
  return useQuery({
    queryKey: queryKeys.warehouseSlips.detail(id ?? ''),
    queryFn: () => getWarehouseSlipById(id!),
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export const useWarehouseSlipLines = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: linesQueryKey,
    queryFn: getWarehouseSlipLines,
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export const useUpsertWarehouseSlip = (onSuccess?: (saved: WarehouseSlip) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: WarehouseSlipFormValues }) =>
      upsertWarehouseSlip(data, id),
    onSuccess: (saved) => {
      queryClient.setQueryData<WarehouseSlipListItem[]>(listQueryKey, (old) => {
        const next = old ? [...old] : [];
        const listItem: WarehouseSlipListItem = {
          ...saved,
          so_dong: saved.lines?.length ?? 0,
        };
        const idx = next.findIndex((o) => o.id === saved.id);
        if (idx >= 0) next[idx] = listItem;
        else next.unshift(listItem);
        return next.sort(
          (a, b) => new Date(b.tg_cap_nhat).getTime() - new Date(a.tg_cap_nhat).getTime(),
        );
      });
      queryClient.setQueryData(queryKeys.warehouseSlips.detail(saved.id), saved);
      queryClient.invalidateQueries({ queryKey: linesQueryKey });
      toast.success(
        saved.trang_thai === 'Nháp' && !saved.da_post_ton
          ? txt('warehouseSlip.toast.updateSuccess')
          : txt('warehouseSlip.toast.createSuccess'),
      );
      onSuccess?.(saved);
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useCancelWarehouseSlip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelWarehouseSlip,
    onSuccess: (updated) => {
      queryClient.setQueryData<WarehouseSlipListItem[]>(listQueryKey, (old) =>
        old?.map((o) =>
          o.id === updated.id
            ? { ...updated, so_dong: updated.lines?.length ?? o.so_dong }
            : o,
        ),
      );
      queryClient.setQueryData(queryKeys.warehouseSlips.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: linesQueryKey });
      toast.success(txt('warehouseSlip.toast.cancelSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeleteWarehouseSlip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWarehouseSlip,
    onSuccess: (_, id) => {
      queryClient.setQueryData<WarehouseSlipListItem[]>(listQueryKey, (old) =>
        old?.filter((o) => o.id !== id),
      );
      queryClient.removeQueries({ queryKey: queryKeys.warehouseSlips.detail(id) });
      queryClient.invalidateQueries({ queryKey: linesQueryKey });
      toast.success(txt('warehouseSlip.toast.deleteSuccess'));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useBomLinesForProductionOrder = (
  donHangId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && donHangId));
  return useQuery({
    queryKey: ['warehouse-slips', 'bom-import', donHangId ?? ''],
    queryFn: () => getBomLinesForProductionOrder(donHangId!),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const usePurchaseLinesForImport = (
  donMuaId: string | undefined,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && donMuaId));
  return useQuery({
    queryKey: ['warehouse-slips', 'purchase-import', donMuaId ?? ''],
    queryFn: () => getPurchaseLinesForImport(donMuaId!),
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export interface ProductionOrderProductsData {
  products: ProductionOrderProductLine[];
  receivedByProduct: Map<string, number>;
}

/**
 * Tải danh sách sản phẩm lệnh SX + số lượng đã nhập từ phiếu Hoàn thành.
 * excludeSlipId: loại trừ phiếu đang sửa khỏi tính "đã nhập".
 */
export const useProductionOrderProducts = (
  donHangId: string | undefined,
  excludeSlipId?: string,
  options?: { enabled?: boolean },
) => {
  const enabled = useSupabaseReady(Boolean(options?.enabled !== false && donHangId));
  return useQuery<ProductionOrderProductsData>({
    queryKey: ['warehouse-slips', 'order-products', donHangId ?? '', excludeSlipId ?? ''],
    queryFn: async () => {
      const [products, receivedByProduct] = await Promise.all([
        getProductLinesForProductionOrder(donHangId!),
        getReceivedQtyByProduct(donHangId!, excludeSlipId),
      ]);
      return { products, receivedByProduct };
    },
    enabled,
    staleTime: 0,
    gcTime: transactionalCrudListQueryOptions.gcTime,
    refetchOnMount: 'always',
    ...supabaseListQueryRetryOptions,
  });
};

export type { ProductionOrderProductLine };
