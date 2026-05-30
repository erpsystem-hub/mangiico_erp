import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';
import {
  getAllCategoryAttributeLinkKeys,
  getAllCategoryMeasurementLinkKeys,
  toggleCategoryAttributeLink,
  toggleCategoryMeasurementLink,
  type CategoryLinkMatrix,
} from '../services/danh-muc-hang-hoa-links-service';

function cloneMatrix(m: CategoryLinkMatrix): CategoryLinkMatrix {
  const next = new Map<string, Set<string>>();
  for (const [dm, set] of m) {
    next.set(dm, new Set(set));
  }
  return next;
}

function setMatrixLink(
  matrix: CategoryLinkMatrix,
  danhMucId: string,
  masterId: string,
  linked: boolean,
): CategoryLinkMatrix {
  const next = cloneMatrix(matrix);
  let set = next.get(danhMucId);
  if (!set) {
    set = new Set();
    next.set(danhMucId, set);
  }
  if (linked) set.add(masterId);
  else set.delete(masterId);
  return next;
}

export const useCategoryAttributeLinkMatrix = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: queryKeys.productCategories.attributeLinkMatrix,
    queryFn: getAllCategoryAttributeLinkKeys,
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCategoryMeasurementLinkMatrix = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: queryKeys.productCategories.measurementLinkMatrix,
    queryFn: getAllCategoryMeasurementLinkKeys,
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useToggleCategoryAttributeLink = () => {
  const queryClient = useQueryClient();
  const matrixKey = queryKeys.productCategories.attributeLinkMatrix;

  return useMutation({
    mutationFn: ({
      danhMucId,
      thuocTinhId,
      linked,
    }: {
      danhMucId: string;
      thuocTinhId: string;
      linked: boolean;
    }) => toggleCategoryAttributeLink(danhMucId, thuocTinhId, linked),
    onMutate: async ({ danhMucId, thuocTinhId, linked }) => {
      await queryClient.cancelQueries({ queryKey: matrixKey });
      const prev = queryClient.getQueryData<CategoryLinkMatrix>(matrixKey);
      if (prev) {
        queryClient.setQueryData(
          matrixKey,
          setMatrixLink(prev, danhMucId, thuocTinhId, linked),
        );
      }
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(matrixKey, ctx.prev);
      toast.error(getErrorMessage(err));
    },
    onSuccess: (_data, { danhMucId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.links(danhMucId),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matrixKey });
    },
  });
};

export const useToggleCategoryMeasurementLink = () => {
  const queryClient = useQueryClient();
  const matrixKey = queryKeys.productCategories.measurementLinkMatrix;

  return useMutation({
    mutationFn: ({
      danhMucId,
      thongSoDoId,
      linked,
    }: {
      danhMucId: string;
      thongSoDoId: string;
      linked: boolean;
    }) => toggleCategoryMeasurementLink(danhMucId, thongSoDoId, linked),
    onMutate: async ({ danhMucId, thongSoDoId, linked }) => {
      await queryClient.cancelQueries({ queryKey: matrixKey });
      const prev = queryClient.getQueryData<CategoryLinkMatrix>(matrixKey);
      if (prev) {
        queryClient.setQueryData(
          matrixKey,
          setMatrixLink(prev, danhMucId, thongSoDoId, linked),
        );
      }
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(matrixKey, ctx.prev);
      toast.error(getErrorMessage(err));
    },
    onSuccess: (_data, { danhMucId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.productCategories.links(danhMucId),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matrixKey });
    },
  });
};
