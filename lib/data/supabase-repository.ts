import { getSupabase } from '@/lib/supabase/client';
import { ensureAuthenticated } from '@/lib/auth/session-manager';
import { handleSupabaseError } from '@/lib/supabase/errors';
import type { Json, PublicTableName } from '@/lib/supabase/database.types';
import type {
  IRepository,
  RepositoryGetByIdOptions,
  RepositoryListResult,
  RepositoryMutationOptions,
  RepositoryQueryOptions,
} from './repository';

/** Giới hạn mặc định mỗi lần getAll — tránh tải bảng lớn một lượt (PostgREST/Supabase). Tăng limit trong RepositoryQueryOptions nếu cần. */
export const SUPABASE_DEFAULT_MAX_ROWS = 5_000;

/** Tránh mutation treo vô hạn — UI luôn nhận reject sau timeout. */
export const SUPABASE_REQUEST_TIMEOUT_MS = 30_000;

async function withSupabaseTimeout<T>(label: string, promise: PromiseLike<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Hết thời gian chờ phản hồi Supabase (${label})`));
    }, SUPABASE_REQUEST_TIMEOUT_MS);
  });
  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

function ensureClient() {
  const client = getSupabase();
  if (!client) throw new Error('Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return client;
}

async function ensureAuthenticatedClient() {
  await ensureAuthenticated();
  return ensureClient();
}

/**
 * Supabase-backed repository implementing IRepository.
 * Supports optional select string for relation queries (e.g. '*, phong_ban(ten_phong_ban)').
 */
export class SupabaseRepository<T extends { id: string | number }> implements IRepository<T> {
  constructor(
    private readonly tableName: PublicTableName,
    private readonly options?: { select?: string },
  ) {}

  private get select() {
    return this.options?.select ?? '*';
  }

  private mutationSelect(opts?: RepositoryMutationOptions): string {
    return opts?.returningSelect ?? this.select;
  }

  async count(): Promise<number> {
    const supabase = ensureClient();
    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });
    if (error) handleSupabaseError(error);
    return count ?? 0;
  }

  async getPage(options?: RepositoryQueryOptions): Promise<RepositoryListResult<T>> {
    const supabase = ensureClient();
    const select = options?.select ?? this.select;
    let query = supabase.from(this.tableName).select(select, { count: 'exact' });
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending !== false });
    }
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? SUPABASE_DEFAULT_MAX_ROWS;
    query = query.range(offset, offset + limit - 1);
    const { data, error, count } = await query;
    if (error) handleSupabaseError(error);
    return { items: (data ?? []) as unknown as T[], total: count ?? 0 };
  }

  async getAll(options?: RepositoryQueryOptions): Promise<T[]> {
    const { items } = await this.getPage(options);
    return items;
  }

  async getById(id: string | number, options?: RepositoryGetByIdOptions): Promise<T | null> {
    const supabase = await ensureAuthenticatedClient();
    const select = options?.select ?? this.select;
    const { data, error } = await withSupabaseTimeout(
      `${this.tableName}.getById`,
      supabase.from(this.tableName).select(select).eq('id', id as never).maybeSingle(),
    );
    if (error) handleSupabaseError(error);
    return data as unknown as T | null;
  }

  async insert(row: Omit<T, 'id'> & { id?: string }, opts?: RepositoryMutationOptions): Promise<T> {
    const supabase = await ensureAuthenticatedClient();
    const payload = { ...row } as Record<string, Json>;
    if (payload.id === undefined) delete payload.id;
    const { data, error } = await withSupabaseTimeout(
      `${this.tableName}.insert`,
      supabase
        .from(this.tableName)
        .insert(payload as never)
        .select(this.mutationSelect(opts))
        .single(),
    );
    if (error) handleSupabaseError(error);
    return data as unknown as T;
  }

  async update(id: string | number, partial: Partial<T>, opts?: RepositoryMutationOptions): Promise<T> {
    const supabase = await ensureAuthenticatedClient();
    const payload = { ...partial } as Record<string, Json>;
    delete payload.id;
    const { data, error } = await withSupabaseTimeout(
      `${this.tableName}.update`,
      supabase
        .from(this.tableName)
        .update(payload)
        .eq('id', id as never)
        .select(this.mutationSelect(opts))
        .single(),
    );
    if (error) handleSupabaseError(error);
    return data as unknown as T;
  }

  async updateMany(
    ids: (string | number)[],
    partial: Partial<T>,
    opts?: RepositoryMutationOptions,
  ): Promise<void> {
    if (ids.length === 0) return;
    const supabase = await ensureAuthenticatedClient();
    const payload = { ...partial } as Record<string, Json>;
    delete payload.id;
    const { error } = await withSupabaseTimeout(
      `${this.tableName}.updateMany`,
      supabase.from(this.tableName).update(payload).in('id', ids as never),
    );
    if (error) handleSupabaseError(error);
  }

  async remove(ids: (string | number)[]): Promise<void> {
    if (ids.length === 0) return;
    const supabase = await ensureAuthenticatedClient();
    const { error } = await withSupabaseTimeout(
      `${this.tableName}.remove`,
      supabase.from(this.tableName).delete().in('id', ids as never),
    );
    if (error) handleSupabaseError(error);
  }

  async upsert(rows: (Omit<T, 'id'> & { id?: string }) | ((Omit<T, 'id'> & { id?: string })[])): Promise<T[]> {
    const supabase = await ensureAuthenticatedClient();
    const arr = Array.isArray(rows) ? rows : [rows];
    const payload = arr.map((r) => ({ ...r } as Record<string, Json>));
    const { data, error } = await supabase
      .from(this.tableName)
      .upsert(payload as never, { onConflict: 'id' })
      .select(this.select);
    if (error) handleSupabaseError(error);
    return (data ?? []) as unknown as T[];
  }
}
