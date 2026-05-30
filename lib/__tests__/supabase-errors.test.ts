import { describe, expect, it } from 'vitest';
import { AuthSessionError, handleSupabaseError, normalizeSupabaseError } from '../supabase/errors';
import { getErrorMessage } from '../utils';

describe('handleSupabaseError', () => {
  it('no-ops when error is null (successful Supabase response)', () => {
    expect(() => handleSupabaseError(null)).not.toThrow();
    expect(() => handleSupabaseError(undefined)).not.toThrow();
  });

  it('throws readable message for PostgREST error', () => {
    expect(() =>
      handleSupabaseError({ message: 'duplicate key', code: '23505' }),
    ).toThrow('duplicate key');
  });

  it('throws AuthSessionError for JWT-related PostgREST error', () => {
    expect(() => handleSupabaseError({ message: 'JWT expired', code: 'PGRST301' })).toThrow(
      AuthSessionError,
    );
  });
});

describe('getErrorMessage', () => {
  it('maps null and Error("null") to fallback', () => {
    expect(getErrorMessage(null)).toBe('Lỗi không xác định');
    expect(getErrorMessage(new Error('null'))).toBe('Lỗi không xác định');
  });

  it('keeps real error text', () => {
    expect(getErrorMessage(new Error('Trùng tên chi nhánh'))).toBe('Trùng tên chi nhánh');
  });
});

describe('normalizeSupabaseError', () => {
  it('returns fallback for null input', () => {
    expect(normalizeSupabaseError(null).message).toBe('Lỗi không xác định');
  });
});
