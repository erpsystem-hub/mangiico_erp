import React, { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DRAWER_WIDTH_DETAIL_SMALL, DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import type { BomItem } from '../core/types';

const BomForm = lazy(() => import('./bom-form'));
const BomDetail = lazy(() => import('./bom-detail'));

const DrawerLazyFallback: React.FC = () => (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/30 pointer-events-none"
    style={{ zIndex: DRAWER_Z_CONTENT_BASE }}
  >
    <div
      className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
      aria-hidden
    />
  </div>
);

interface Props {
  stackLevel: number;
  viewingBom: BomItem | null;
  editingBom: BomItem | null;
  showForm: boolean;
  presetSanPhamId?: string;
  presetNguyenLieuId?: string;
  lockSanPham?: boolean;
  lockNguyenLieu?: boolean;
  onCloseForm: () => void;
  onCloseDetail: () => void;
  onEdit: (item: BomItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (item: BomItem) => void;
}

const BomEmbeddedOverlays: React.FC<Props> = ({
  stackLevel,
  viewingBom,
  editingBom,
  showForm,
  presetSanPhamId,
  presetNguyenLieuId,
  lockSanPham,
  lockNguyenLieu,
  onCloseForm,
  onCloseDetail,
  onEdit,
  onDelete,
  onStatusChange,
}) => (
  <AnimatePresence mode="sync">
    {showForm ? (
      <Suspense fallback={<DrawerLazyFallback />}>
        <BomForm
          key={editingBom?.id ?? `new-${presetSanPhamId ?? ''}-${presetNguyenLieuId ?? ''}`}
          initialData={editingBom}
          presetSanPhamId={presetSanPhamId}
          presetNguyenLieuId={presetNguyenLieuId}
          lockSanPham={lockSanPham}
          lockNguyenLieu={lockNguyenLieu}
          onClose={onCloseForm}
          stackLevel={stackLevel + (viewingBom ? 1 : 0)}
        />
      </Suspense>
    ) : null}
    {viewingBom && !showForm ? (
      <Suspense fallback={<DrawerLazyFallback />}>
        <BomDetail
          data={viewingBom}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          maxWidthClass={DRAWER_WIDTH_DETAIL_SMALL}
          stackLevel={stackLevel}
        />
      </Suspense>
    ) : null}
  </AnimatePresence>
);

export default BomEmbeddedOverlays;
