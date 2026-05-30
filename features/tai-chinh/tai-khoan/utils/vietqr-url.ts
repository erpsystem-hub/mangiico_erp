/** URL ảnh QR VietQR công khai (không cần API key). */
export function buildVietQrImageUrl(params: {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount?: string | number;
  memo?: string;
  template?: 'compact' | 'compact2' | 'qr_only';
}): string | null {
  const bin = String(params.bin ?? '').trim();
  const account = String(params.accountNumber ?? '').replace(/\s+/g, '').trim();
  const name = String(params.accountName ?? '').trim();
  if (!bin || !account || !name) return null;

  const template = params.template ?? 'compact2';
  const base = `https://img.vietqr.io/image/${bin}-${account}-${template}.png`;
  const qs = new URLSearchParams();
  qs.set('accountName', name);
  if (params.amount != null && String(params.amount).trim() !== '') {
    qs.set('amount', String(params.amount).replace(/\D/g, ''));
  }
  if (params.memo?.trim()) {
    qs.set('addInfo', params.memo.trim());
  }
  return `${base}?${qs.toString()}`;
}
