/** PostgREST không tìm thấy FK trong schema cache (chưa migration / chưa reload schema). */
export function isPostgrestRelationshipError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return /could not find a relationship|schema cache|PGRST200/i.test(msg);
}

/** RPC chưa được apply hoặc chưa có trong schema cache. */
export function isPostgrestRpcMissingError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return /could not find the function|PGRST202|function.*does not exist/i.test(msg);
}
