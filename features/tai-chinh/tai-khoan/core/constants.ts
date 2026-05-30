export const LOAI_QUY_VALUES = ['Tiền mặt', 'Ngân hàng'] as const;
export type LoaiQuy = (typeof LOAI_QUY_VALUES)[number];

export interface VnBank {
  code: string;
  name: string;
  bin: string;
}

/** Danh sách ngân hàng VN (BIN VietQR) — snapshot phục vụ chọn ngân hàng + QR. */
export const VN_BANKS: readonly VnBank[] = [
  { code: 'ICB', name: 'Ngân hàng TMCP Công thương Việt Nam', bin: '970415' },
  { code: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', bin: '970436' },
  { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', bin: '970418' },
  { code: 'VBA', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', bin: '970405' },
  { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', bin: '970407' },
  { code: 'MB', name: 'Ngân hàng TMCP Quân đội', bin: '970422' },
  { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', bin: '970416' },
  { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', bin: '970432' },
  { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', bin: '970423' },
  { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', bin: '970403' },
  { code: 'HDB', name: 'Ngân hàng TMCP Phát triển TP.HCM', bin: '970437' },
  { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', bin: '970443' },
  { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', bin: '970441' },
  { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải', bin: '970426' },
  { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông', bin: '970448' },
  { code: 'SEAB', name: 'Ngân hàng TMCP Đông Nam Á', bin: '970440' },
  { code: 'LPB', name: 'Ngân hàng TMCP Bưu điện Liên Việt', bin: '970449' },
  { code: 'EIB', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', bin: '970431' },
  { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn', bin: '970429' },
  { code: 'VCCB', name: 'Ngân hàng TMCP Bản Việt', bin: '970454' },
  { code: 'NAB', name: 'Ngân hàng TMCP Nam Á', bin: '970428' },
  { code: 'ABB', name: 'Ngân hàng TMCP An Bình', bin: '970425' },
  { code: 'PGB', name: 'Ngân hàng TMCP Xăng dầu Petrolimex', bin: '970430' },
  { code: 'GPB', name: 'Ngân hàng Thương mại TNHH MTV Dầu khí Toàn cầu', bin: '970408' },
  { code: 'BAB', name: 'Ngân hàng TMCP Bắc Á', bin: '970409' },
  { code: 'KLB', name: 'Ngân hàng TMCP Kiên Long', bin: '970452' },
  { code: 'VAB', name: 'Ngân hàng TMCP Việt Á', bin: '970427' },
  { code: 'NCB', name: 'Ngân hàng TMCP Quốc Dân', bin: '970419' },
  { code: 'IVB', name: 'Ngân hàng TNHH Indovina', bin: '970434' },
  { code: 'WVN', name: 'Ngân hàng TNHH MTV Woori Việt Nam', bin: '970457' },
  { code: 'SHBVN', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', bin: '970424' },
  { code: 'UOB', name: 'Ngân hàng United Overseas Bank', bin: '970458' },
  { code: 'SCVN', name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', bin: '970410' },
  { code: 'PBVN', name: 'Ngân hàng TNHH MTV Public Việt Nam', bin: '970439' },
  { code: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam', bin: '970456' },
  { code: 'HSBC', name: 'Ngân hàng TNHH MTV HSBC Việt Nam', bin: '970442' },
] as const;

export function findBankByBin(bin: string | null | undefined): VnBank | undefined {
  if (!bin) return undefined;
  const key = String(bin).trim();
  return VN_BANKS.find((b) => b.bin === key);
}

export function findBankByCode(code: string | null | undefined): VnBank | undefined {
  if (!code) return undefined;
  const key = String(code).trim().toUpperCase();
  return VN_BANKS.find((b) => b.code === key);
}
