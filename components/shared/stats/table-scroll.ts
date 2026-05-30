/** Chiều cao scroll bảng thống kê (header + N dòng body). */
const TABLE_HEAD_ROW_REM = 2.75;
const TABLE_BODY_ROW_REM = 2.35;

export function getStatsTableScrollMaxHeight(visibleRows = 10): string {
  return `min(70vh, calc(${TABLE_HEAD_ROW_REM}rem + ${visibleRows} * ${TABLE_BODY_ROW_REM}rem))`;
}
