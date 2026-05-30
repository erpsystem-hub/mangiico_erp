import type { PublicTableName } from '@/lib/supabase/database.types';
import type { IRepository } from './repository';
import { SupabaseRepository } from './supabase-repository';

export interface CreateRepositoryConfig<T extends { id: string | number }> {
  tableName: PublicTableName;
  select?: string;
}

export function createRepository<T extends { id: string | number }>(
  config: CreateRepositoryConfig<T>,
): IRepository<T> {
  return new SupabaseRepository<T>(config.tableName, { select: config.select });
}
