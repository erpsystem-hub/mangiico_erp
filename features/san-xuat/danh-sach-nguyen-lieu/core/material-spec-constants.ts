/** Gợi ý mặc định cho combobox thông số nguyên liệu (ngành may) */
export const DEFAULT_MATERIAL_UNITS = [
  'm',
  'kg',
  'cuộn',
  'cái',
  'mét',
  'yard',
  'gói',
  'bộ',
  'kg/m',
] as const;

export const DEFAULT_MATERIAL_COLORS = [
  'Trắng',
  'Đen',
  'Xám',
  'Navy',
  'Be',
  'Kem',
  'Đỏ',
  'Hồng',
  'Xanh lá',
  'Xanh navy',
  'Vàng',
  'Cam',
  'Tím',
  'Nâu',
  'Ghi',
] as const;

export const DEFAULT_MATERIAL_COMPOSITIONS = [
  '100% Cotton',
  '65% Cotton 35% Polyester',
  '100% Polyester',
  '95% Cotton 5% Spandex',
  '100% Viscose',
  '50% Cotton 50% Polyester',
  '100% Nylon',
  '100% Linen',
  'Cotton/Poly blend',
] as const;

export const DEFAULT_MATERIAL_WIDTHS = [
  '140cm',
  '150cm',
  '160cm',
  '170cm',
  '180cm',
  '44"',
  '58"',
  '60"',
] as const;

export const DEFAULT_MATERIAL_ORIGINS = [
  'Việt Nam',
  'Trung Quốc',
  'Hàn Quốc',
  'Đài Loan',
  'Thái Lan',
  'Ấn Độ',
  'Bangladesh',
  'Indonesia',
  'Nhật Bản',
  'Ý',
  'Thổ Nhĩ Kỳ',
] as const;

/** Định lượng GSM thường gặp — lưu dạng số, hiển thị trên combobox */
export const DEFAULT_MATERIAL_GSM = [
  '100',
  '120',
  '130',
  '140',
  '150',
  '160',
  '180',
  '200',
  '220',
  '250',
  '280',
  '300',
] as const;
