export const TRANG_THAI_LENH_SX = ['Chuyển sản xuất', 'Hoàn thành'] as const;
export type TrangThaiLenhSx = (typeof TRANG_THAI_LENH_SX)[number];

export const TRANG_THAI_LENH_SX_OPTIONS = TRANG_THAI_LENH_SX.map((value) => ({
  value,
  label: value,
}));

export function isProductionOrderStatus(status: string): status is TrangThaiLenhSx {
  return (TRANG_THAI_LENH_SX as readonly string[]).includes(status);
}
