import { describe, expect, it } from 'vitest';
import type { Department } from '../../phong-ban/core/types';
import type { Position } from '../core/types';
import {
  buildFlatGroupedRows,
  buildFlatUngroupedPositionRows,
  fkMatchesFilter,
  normFkId,
} from './group-positions-by-department';

const labels = { unassigned: 'Chưa gán', unknownDept: 'Phòng lạ' };

function dept(id: string | number, duong_dan: string): Department {
  return {
    id: String(id),
    ten_phong_ban: `Phòng ${id}`,
    cha_id: null,
    duong_dan,
    cap_do: 1,
    thu_tu: 1,
    trang_thai: 'Đang hoạt động',
    tg_tao: '',
    tg_cap_nhat: '',
  };
}

function pos(id: string, phong_ban_id: string | number, ten = 'CV'): Position {
  return {
    id,
    ten_chuc_vu: ten,
    mo_ta: null,
    phong_ban_id: phong_ban_id as string,
    cap_bac: '4',
    thu_tu: 1,
    trang_thai: 'Đang hoạt động',
    tg_tao: '',
    tg_cap_nhat: '',
  };
}

describe('normFkId', () => {
  it('normalizes number and string ids', () => {
    expect(normFkId(5)).toBe('5');
    expect(normFkId('5')).toBe('5');
    expect(normFkId(null)).toBeNull();
  });
});

describe('fkMatchesFilter', () => {
  it('matches across number/string filter values', () => {
    expect(fkMatchesFilter(5, ['5'])).toBe(true);
    expect(fkMatchesFilter('5', [5 as unknown as string])).toBe(true);
    expect(fkMatchesFilter(5, ['6'])).toBe(false);
    expect(fkMatchesFilter(5, [])).toBe(true);
  });
});

describe('buildFlatGroupedRows', () => {
  it('groups positions when phong_ban_id is number and department id is string', () => {
    const departments = [dept('1', '/1')];
    const positions = [pos('p1', 1, 'Giám đốc')];
    const rows = buildFlatGroupedRows(positions, departments, { column: null, direction: null }, labels);
    expect(rows.some((r) => r.kind === 'position')).toBe(true);
    expect(rows.filter((r) => r.kind === 'position')).toHaveLength(1);
  });

  it('buildFlatUngroupedPositionRows returns sorted positions', () => {
    const rows = buildFlatUngroupedPositionRows(
      [pos('p2', '1', 'B'), pos('p1', '1', 'A')],
      { column: 'ten_chuc_vu', direction: 'asc' },
    );
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.kind === 'position')).toBe(true);
  });
});
