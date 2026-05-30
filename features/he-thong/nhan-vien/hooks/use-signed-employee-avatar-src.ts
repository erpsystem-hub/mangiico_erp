import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { SIGNED_AVATAR_STALE_TIME_MS, SERVER_GC_TIME_MS } from '@/lib/supabase/query-config';
import {
  avatarsObjectPathFromStored,
  createSignedAvatarUrl,
} from '@/features/he-thong/nhan-vien/services/avatar-storage';

/**
 * Chuỗi dùng cho `<img src>`: data URL, URL ngoài, hoặc signed URL từ path Storage (bucket private).
 * Signed URL được cache qua TanStack Query theo object path (~11h stale).
 */
export function useSignedEmployeeAvatarSrc(stored: string | null | undefined): string {
  const directSrc = useMemo((): string | null => {
    const s = stored?.trim() ?? '';
    if (!s) return '';
    if (s.startsWith('data:image/')) return s;
    if (s.startsWith('http') && !s.includes('.supabase.co')) return s;
    return null;
  }, [stored]);

  const objectPath = useMemo(() => {
    if (directSrc !== null) return null;
    const s = stored?.trim() ?? '';
    if (!s) return null;
    return avatarsObjectPathFromStored(s);
  }, [stored, directSrc]);

  const { data: signedUrl } = useQuery({
    queryKey: queryKeys.avatars.signed(objectPath ?? ''),
    queryFn: async () => {
      if (!objectPath) return '';
      const url = await createSignedAvatarUrl(objectPath);
      return url ?? '';
    },
    enabled: Boolean(objectPath),
    staleTime: SIGNED_AVATAR_STALE_TIME_MS,
    gcTime: SERVER_GC_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (directSrc !== null) return directSrc;
  if (!objectPath) return '';
  return signedUrl ?? '';
}
