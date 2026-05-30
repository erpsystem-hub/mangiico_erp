/**
 * Query keys tập trung — tránh lệch chuỗi khi invalidate / prefetch (TanStack Query + Supabase).
 */
/** Tham số fetch danh sách nhân viên (client mode). */
export const EMPLOYEES_LIST_QUERY_PARAMS = {
  limit: 5000,
  offset: 0,
  orderBy: 'ten_tai_khoan',
  ascending: true,
} as const;

export const queryKeys = {
  employees: {
    all: ['employees'] as const,
    count: ['employees', 'count'] as const,
    /** Danh sách client mode — full array. */
    list: (params: {
      limit: number;
      offset: number;
      orderBy: string;
      ascending: boolean;
    }) => ['employees', 'list', params] as const,
    /** Server pagination — một trang + total. */
    page: (params: {
      limit: number;
      offset: number;
      orderBy: string;
      ascending: boolean;
    }) => ['employees', 'page', params] as const,
    stats: (params: {
      asAt: string;
      rangeStart: string;
      rangeEnd: string;
      filterDept: string[];
      filterStatus: string[];
    }) => ['employees', 'stats', params] as const,
    /** Prefix: invalidate mọi query `['employee', id]` */
    anyDetail: ['employee'] as const,
    detail: (id: string) => ['employee', id] as const,
  },
  departments: {
    all: ['departments'] as const,
  },
  /** Segment thứ 2 đổi khi schema fetch chức vụ đổi — tránh dùng cache persist cũ thiếu field. */
  positions: {
    all: ['positions', 'v2'] as const,
  },
  roles: {
    all: ['roles'] as const,
  },
  jobLevels: {
    all: ['job-levels'] as const,
  },
  thongTinToChuc: {
    singleton: ['thong-tin-to-chuc', 'singleton'] as const,
  },
  avatars: {
    /** Signed URL theo object path — cache ~11h (< TTL 12h Storage). */
    signed: (objectPath: string) => ['avatars', 'signed', objectPath] as const,
  },
} as const;
