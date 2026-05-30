import { describe, expect, it, beforeEach, vi } from 'vitest';
import { can } from '../permissions';
import type { User } from '@/types';
import { usePermissionGrantStore } from '@/store/usePermissionGrantStore';

vi.mock('@/lib/permission-matrix-env', () => ({
  isPermissionMatrixEnabled: () => true,
}));

const admin: User = {
  id: '1',
  email: 'a@test.com',
  role: 'admin',
  created_at: '',
};

const member: User = {
  id: '2',
  email: 'u@test.com',
  role: 'user',
  created_at: '',
  id_chuc_vu: '1',
};

beforeEach(() => {
  usePermissionGrantStore.getState().clearMatrix();
});

describe('can', () => {
  it('returns false when user is null', () => {
    expect(can(null, 'view', 'employees')).toBe(false);
  });

  it('user without id_chuc_vu cannot access when matrix enabled', () => {
    expect(can(admin, 'delete', 'employees')).toBe(false);
  });

  it('member can view but not delete employees (legacy matrix off)', () => {
    usePermissionGrantStore.getState().clearMatrix();
    expect(can(member, 'view', 'employees')).toBe(true);
    expect(can(member, 'delete', 'employees')).toBe(false);
  });

  it('member can edit profile', () => {
    usePermissionGrantStore.getState().clearMatrix();
    expect(can(member, 'edit', 'profile')).toBe(true);
  });

  it('matrix: member with only view on nhan-vien cannot delete', () => {
    usePermissionGrantStore.getState().setMatrixGrants({
      'he-thong/nhan-vien': ['view'],
    });
    expect(can(member, 'view', 'employees')).toBe(true);
    expect(can(member, 'export', 'employees')).toBe(true);
    expect(can(member, 'import', 'employees')).toBe(true);
    expect(can(member, 'edit', 'employees')).toBe(false);
    expect(can(member, 'delete', 'employees')).toBe(false);
  });

  it('matrix: member with update on nhan-vien can edit', () => {
    usePermissionGrantStore.getState().setMatrixGrants({
      'he-thong/nhan-vien': ['view', 'update'],
    });
    expect(can(member, 'edit', 'employees')).toBe(true);
  });

  it('matrix: all grants full actions on module', () => {
    usePermissionGrantStore.getState().setMatrixGrants({
      'he-thong/nhan-vien': ['all'],
    });
    expect(can(member, 'delete', 'employees')).toBe(true);
  });

  it('matrix: departments — no grant and cap_bac≠1 cannot view', () => {
    usePermissionGrantStore.getState().setMatrixGrants(
      { 'he-thong/nhan-vien': ['view'] },
      2
    );
    expect(can(member, 'view', 'departments')).toBe(false);
    expect(can(member, 'edit', 'departments')).toBe(false);
  });

  it('matrix: departments — cap_bac=1 bypasses matrix for view/create/edit/delete/export/import', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/nhan-vien': ['view'] }, 1);
    expect(can(member, 'view', 'departments')).toBe(true);
    expect(can(member, 'create', 'departments')).toBe(true);
    expect(can(member, 'edit', 'departments')).toBe(true);
    expect(can(member, 'delete', 'departments')).toBe(true);
    expect(can(member, 'export', 'departments')).toBe(true);
    expect(can(member, 'import', 'departments')).toBe(true);
  });

  it('matrix: departments — view on phong-ban module grants view only', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/phong-ban': ['view'] }, 2);
    expect(can(member, 'view', 'departments')).toBe(true);
    expect(can(member, 'delete', 'departments')).toBe(false);
  });

  it('matrix: departments — admin token in matrix grants full CRUD', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/phong-ban': ['admin'] }, 9);
    expect(can(member, 'delete', 'departments')).toBe(true);
  });

  it('matrix: cap_bac=1 + only view on nhan-vien grants CRUD on all mapped modules', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/nhan-vien': ['view'] }, 1);
    const resources = ['employees', 'departments', 'positions', 'company', 'permissions'] as const;
    for (const resource of resources) {
      expect(can(member, 'create', resource)).toBe(true);
      expect(can(member, 'edit', resource)).toBe(true);
      expect(can(member, 'delete', resource)).toBe(true);
    }
  });

  it('matrix: admin on nhan-vien grants CRUD employees only, not other modules', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/nhan-vien': ['admin'] }, 2);
    expect(can(member, 'create', 'employees')).toBe(true);
    expect(can(member, 'edit', 'employees')).toBe(true);
    expect(can(member, 'delete', 'employees')).toBe(true);
    expect(can(member, 'delete', 'departments')).toBe(false);
    expect(can(member, 'delete', 'positions')).toBe(false);
    expect(can(member, 'edit', 'company')).toBe(false);
    expect(can(member, 'edit', 'permissions')).toBe(false);
  });

  it('matrix: admin on chuc-vu grants CRUD positions only', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/chuc-vu': ['admin'] }, 2);
    expect(can(member, 'delete', 'positions')).toBe(true);
    expect(can(member, 'delete', 'employees')).toBe(false);
  });

  it('matrix: admin on thong-tin-to-chuc grants edit company only', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/thong-tin-to-chuc': ['admin'] }, 2);
    expect(can(member, 'edit', 'company')).toBe(true);
    expect(can(member, 'delete', 'company')).toBe(true);
    expect(can(member, 'edit', 'employees')).toBe(false);
  });

  it('matrix: admin on phan-quyen grants edit permissions only', () => {
    usePermissionGrantStore.getState().setMatrixGrants({ 'he-thong/phan-quyen': ['admin'] }, 2);
    expect(can(member, 'edit', 'permissions')).toBe(true);
    expect(can(member, 'delete', 'permissions')).toBe(true);
    expect(can(member, 'edit', 'employees')).toBe(false);
  });
});
