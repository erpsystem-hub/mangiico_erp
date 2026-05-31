import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getPartnerListItems,
  getPartnerListItemById,
  createPartnerListItem,
  updatePartnerListItem,
  deletePartnerListItems,
  updatePartnerListStatus,
} from '../services/doi-tac-list-service';
import type { PartnerListFormValues } from '../core/schema';
import type { PartnerKind, PartnerListItem } from '../core/types';
import { usePartnerCategories } from './use-doi-tac-category';
import type { PartnerCategory } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import {
  transactionalCrudListQueryOptions,
  supabaseListQueryRetryOptions,
} from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

function useCategoriesForPartnerList(kind: PartnerKind): PartnerCategory[] {
  const { data = [] } = usePartnerCategories(kind);
  return data;
}

export const usePartnerList = (kind: PartnerKind, options?: { enabled?: boolean }) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const listQueryKey = queryKeys.partnerList(kind).all;
  const { data: categories = [], isSuccess: categoriesLoaded } = usePartnerCategories(kind, {
    enabled: sessionReady,
  });

  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getPartnerListItems(kind, categories),
    enabled: sessionReady && categoriesLoaded,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const usePartnerListDetail = (
  kind: PartnerKind,
  id: string | undefined,
  options?: { enabled?: boolean },
) => {
  const sessionReady = useSupabaseReady(options?.enabled !== false);
  const categories = useCategoriesForPartnerList(kind);
  const enabled = sessionReady && Boolean(id?.trim());

  return useQuery({
    queryKey: queryKeys.partnerList(kind).detail(id ?? ''),
    queryFn: () => getPartnerListItemById(kind, id!, categories),
    enabled,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreatePartnerListItem = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForPartnerList(kind);
  const listQueryKey = queryKeys.partnerList(kind).all;

  return useMutation({
    mutationFn: (data: PartnerListFormValues) => createPartnerListItem(kind, data, categories),
    onSuccess: (created) => {
      queryClient.setQueryData<PartnerListItem[]>(listQueryKey, (old) =>
        old ? [created, ...old] : [created],
      );
      queryClient.setQueryData(queryKeys.partnerList(kind).detail(created.id), created);
      toast.success(txt('partnerList.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdatePartnerListItem = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const categories = useCategoriesForPartnerList(kind);
  const listQueryKey = queryKeys.partnerList(kind).all;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartnerListFormValues }) =>
      updatePartnerListItem(kind, id, data, categories),
    onSuccess: (updated) => {
      queryClient.setQueryData<PartnerListItem[]>(listQueryKey, (old) =>
        old?.map((d) => (d.id === updated.id ? updated : d)),
      );
      queryClient.setQueryData(queryKeys.partnerList(kind).detail(updated.id), updated);
      toast.success(txt('partnerList.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useDeletePartnerListItems = (kind: PartnerKind, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerList(kind).all;

  return useMutation({
    mutationFn: (ids: string[]) => deletePartnerListItems(kind, ids),
    onSuccess: (_data, ids) => {
      const idSet = new Set(ids);
      queryClient.setQueryData<PartnerListItem[]>(listQueryKey, (old) =>
        old?.filter((d) => !idSet.has(d.id)),
      );
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: queryKeys.partnerList(kind).detail(id) });
      });
      toast.success(txt('partnerList.toast.deleteSuccess', { count: ids.length }));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useUpdatePartnerListStatus = (kind: PartnerKind) => {
  const queryClient = useQueryClient();
  const listQueryKey = queryKeys.partnerList(kind).all;

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updatePartnerListStatus(kind, ids, status),
    onSuccess: (updated, { ids, status }) => {
      if (updated) {
        queryClient.setQueryData<PartnerListItem[]>(listQueryKey, (old) =>
          old?.map((d) => (d.id === updated.id ? { ...d, trang_thai: status } : d)),
        );
      } else {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
      toast.success(txt('partnerList.toast.statusUpdate', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
