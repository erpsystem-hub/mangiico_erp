/**
 * Generic types for server-side stats aggregation (reusable across modules).
 */
export interface StatsQueryDateRange {
  asAt: Date;
  rangeStart: Date;
  rangeEnd: Date;
}

/** Base filter params — modules extend with domain-specific filters. */
export interface StatsQueryParams extends StatsQueryDateRange {
  /** ISO strings for stable query keys */
  asAtIso: string;
  rangeStartIso: string;
  rangeEndIso: string;
}
