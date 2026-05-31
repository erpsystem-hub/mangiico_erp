/** State truyền qua react-router khi mở Danh sách đối tác từ Nhóm đối tác */
export type PartnerListNavState = {
  viewPartnerId?: string;
  createWithDanhMucId?: string;
  initialDanhMucIds?: string[];
};

export function isPartnerListNavState(value: unknown): value is PartnerListNavState {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    (o.viewPartnerId === undefined || typeof o.viewPartnerId === 'string') &&
    (o.createWithDanhMucId === undefined || typeof o.createWithDanhMucId === 'string') &&
    (o.initialDanhMucIds === undefined ||
      (Array.isArray(o.initialDanhMucIds) &&
        o.initialDanhMucIds.every((x) => typeof x === 'string')))
  );
}
