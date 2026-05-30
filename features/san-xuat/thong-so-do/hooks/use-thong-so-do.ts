import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TrangThaiHoatDong } from '@/lib/constants/trang-thai';
import {
  getMeasurementSpecs,
  createMeasurementSpec,
  updateMeasurementSpec,
  deleteMeasurementSpecs,
  updateMeasurementSpecStatus,
  importMeasurementSpecs,
} from '../services/thong-so-do-service';
import { MeasurementSpecFormValues } from '../core/schema';
import type { MeasurementSpec } from '../core/types';
import { toast } from 'sonner';
import { txt } from '@/lib/text';
import { queryKeys } from '@/lib/query-keys';
import { transactionalCrudListQueryOptions, supabaseListQueryRetryOptions } from '@/lib/supabase/query-config';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import { getErrorMessage } from '@/lib/utils';

const listQueryKey = queryKeys.measurementSpecs.all;

export const useMeasurementSpecs = (options?: { enabled?: boolean }) => {
  const enabled = useSupabaseReady(options?.enabled !== false);
  return useQuery({
    queryKey: listQueryKey,
    queryFn: getMeasurementSpecs,
    enabled,
    ...transactionalCrudListQueryOptions,
    ...supabaseListQueryRetryOptions,
  });
};

export const useCreateMeasurementSpec = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMeasurementSpec,
    onSuccess: (created) => {
      queryClient.setQueryData<MeasurementSpec[]>(listQueryKey, (old) =>
        old
          ? [...old, created].sort(
              (a, b) =>
                (a.thu_tu ?? 0) - (b.thu_tu ?? 0) ||
                a.ten_hien_thi.localeCompare(b.ten_hien_thi, 'vi'),
            )
          : [created],
      );
      queryClient.setQueryData(queryKeys.measurementSpecs.detail(created.id), created);
      toast.success(txt('measurementSpec.toast.createSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateMeasurementSpec = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MeasurementSpecFormValues }) =>
      updateMeasurementSpec(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<MeasurementSpec[]>(listQueryKey, (old) =>
        old?.map((a) => (a.id === updated.id ? updated : a)),
      );
      queryClient.setQueryData(queryKeys.measurementSpecs.detail(updated.id), updated);
      toast.success(txt('measurementSpec.toast.updateSuccess'));
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useUpdateStatusMeasurementSpec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: TrangThaiHoatDong }) =>
      updateMeasurementSpecStatus(ids, status),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData<MeasurementSpec[]>(listQueryKey, (old) =>
        old?.map((a) =>
          variables.ids.includes(a.id) ? { ...a, trang_thai: variables.status } : a,
        ),
      );
      if (updated) {
        queryClient.setQueryData(queryKeys.measurementSpecs.detail(updated.id), updated);
      }
      toast.success(txt('measurementSpec.toast.statusUpdate', { count: variables.ids.length }));
    },
    onError: (err: unknown) => toast.error(`Lỗi: ${getErrorMessage(err)}`),
  });
};

export const useDeleteMeasurementSpec = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteMeasurementSpecs(ids),
    onSuccess: (_, ids) => {
      queryClient.setQueryData<MeasurementSpec[]>(listQueryKey, (old) =>
        old?.filter((a) => !ids.includes(a.id)),
      );
      for (const id of ids) {
        queryClient.removeQueries({ queryKey: queryKeys.measurementSpecs.detail(id) });
      }
      toast.success(txt('measurementSpec.toast.deleteSuccess', { count: ids.length }));
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};

export const useImportMeasurementSpecs = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importMeasurementSpecs,
    onSuccess: async (result) => {
      const fresh = await getMeasurementSpecs();
      queryClient.setQueryData(listQueryKey, fresh);
      if (result.created > 0) {
        toast.success(txt('measurementSpec.toast.importSuccess', { count: result.created }));
      }
      if (result.errors.length > 0) {
        toast.warning(result.errors.slice(0, 3).join('; '));
      }
      onSuccess?.();
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err)),
  });
};
