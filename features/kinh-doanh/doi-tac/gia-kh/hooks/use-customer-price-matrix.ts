import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';
import { txt } from '@/lib/text';
import {
  ensurePriceMatrix,
  getAllCustomerPriceMatrix,
  getProductGroupColumns,
  saveCustomerPriceRatio,
  serializePriceMatrix,
  setMatrixHeSo,
  type CustomerPriceMatrix,
  type CustomerPriceMatrixStored,
} from '../services/kh-he-so-gia-service';

export const useProductGroupColumns = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: queryKeys.customerPriceMatrix.productGroups,
    queryFn: getProductGroupColumns,
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCustomerPriceMatrix = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: queryKeys.customerPriceMatrix.all,
    queryFn: getAllCustomerPriceMatrix,
    select: (stored): CustomerPriceMatrix => ensurePriceMatrix(stored),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useSaveCustomerPriceRatio = () => {
  const queryClient = useQueryClient();
  const matrixKey = queryKeys.customerPriceMatrix.all;

  return useMutation({
    mutationFn: ({
      danhMucKhachHangId,
      nhomSanPhamId,
      heSoGia,
    }: {
      danhMucKhachHangId: string;
      nhomSanPhamId: string;
      heSoGia: number | null;
    }) => saveCustomerPriceRatio(danhMucKhachHangId, nhomSanPhamId, heSoGia),
    onMutate: async ({ danhMucKhachHangId, nhomSanPhamId, heSoGia }) => {
      await queryClient.cancelQueries({ queryKey: matrixKey });
      const prev = queryClient.getQueryData<CustomerPriceMatrixStored>(matrixKey);
      if (prev != null) {
        queryClient.setQueryData(
          matrixKey,
          serializePriceMatrix(
            setMatrixHeSo(prev, danhMucKhachHangId, nhomSanPhamId, heSoGia),
          ),
        );
      }
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(matrixKey, ctx.prev);
      toast.error(getErrorMessage(err));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matrixKey });
    },
    onSuccess: () => {
      toast.success(txt('customerPrice.toast.saveSuccess'));
    },
  });
};
