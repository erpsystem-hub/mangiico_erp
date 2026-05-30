/**
 * Normalize Supabase / PostgREST errors for consistent app handling.
 * Use in SupabaseRepository and any direct Supabase calls.
 */

export interface NormalizedSupabaseError {
  message: string;
  code?: string;
  /** True for network/timeout errors where retry may help */
  retryable?: boolean;
}

/** Thrown when JWT expired or session invalid — triggers centralized sign-out. */
export class AuthSessionError extends Error {
  override name = 'AuthSessionError';

  constructor(message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.') {
    super(message);
  }
}

export function isAuthSessionError(error: unknown): boolean {
  return error instanceof AuthSessionError;
}

/**
 * PostgrestError shape: { code, details, hint, message }
 * Auth errors may have different shape; we handle both.
 */
function isPostgrestError(err: unknown): err is { code?: string; message?: string | null; details?: string } {
  return typeof err === 'object' && err !== null && 'message' in err;
}

function resolveErrorText(raw: unknown, fallback: string): string {
  if (raw == null) return fallback;
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return fallback;
    return trimmed;
  }
  if (raw instanceof Error) return resolveErrorText(raw.message, fallback);
  const asString = String(raw).trim();
  if (!asString || asString === 'null' || asString === 'undefined') return fallback;
  return asString;
}

/** PostgreSQL error codes that are often retryable (e.g. connection) */
const RETRYABLE_CODES = new Set([
  '08000', '08003', '08006', '08001', '08004', '08007', '08P01', '08P02', '08P03',
  'PGRST000', 'PGRST001', 'PGRST002', 'PGRST003',
]);

const AUTH_ERROR_CODE = new Set(['PGRST301', '401', '403']);

function isAuthRelatedError(code: string, message: string): boolean {
  if (AUTH_ERROR_CODE.has(code)) return true;
  return /jwt|token|session|expired|invalid refresh token|not authenticated|authorization required/i.test(
    message,
  );
}

/** No-op khi `error` null/undefined (request thành công). */
export function handleSupabaseError(error: unknown): void {
  if (error == null) return;

  if (!isPostgrestError(error)) {
    const message = resolveErrorText(error, 'Supabase request failed');
    if (isAuthRelatedError('', message)) {
      throw new AuthSessionError();
    }
    throw new Error(message);
  }

  const code = error.code ?? '';
  const message = resolveErrorText(error.message, 'Lỗi kết nối dữ liệu');
  if (isAuthRelatedError(code, message)) {
    throw new AuthSessionError();
  }

  const retryable = RETRYABLE_CODES.has(code) || /timeout|network|ECONNREFUSED|ETIMEDOUT/i.test(message);

  const normalized: NormalizedSupabaseError = { message, code: code || undefined, retryable };
  throw new Error(normalized.message);
}

/**
 * Use in try/catch when you want to get a normalized error without throwing:
 * try { ... } catch (e) { const err = normalizeSupabaseError(e); toast(err.message); }
 */
export function normalizeSupabaseError(error: unknown): NormalizedSupabaseError {
  if (error == null) {
    return { message: 'Lỗi không xác định' };
  }
  if (isAuthSessionError(error)) {
    return { message: error.message };
  }
  if (isPostgrestError(error)) {
    const code = error.code ?? '';
    const message = resolveErrorText(error.message, 'Lỗi kết nối dữ liệu');
    const retryable = RETRYABLE_CODES.has(code) || /timeout|network|ECONNREFUSED|ETIMEDOUT/i.test(message);
    return { message, code: code || undefined, retryable };
  }
  return { message: resolveErrorText(error, 'Lỗi không xác định') };
}
