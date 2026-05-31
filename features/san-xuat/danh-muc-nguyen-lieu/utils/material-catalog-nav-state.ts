/** State truyền qua react-router khi mở Danh sách nguyên liệu từ Danh mục NL */
export type MaterialCatalogNavState = {
  viewMaterialId?: string;
  createWithDanhMucId?: string;
};

export function isMaterialCatalogNavState(value: unknown): value is MaterialCatalogNavState {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    (o.viewMaterialId === undefined || typeof o.viewMaterialId === 'string') &&
    (o.createWithDanhMucId === undefined || typeof o.createWithDanhMucId === 'string')
  );
}
