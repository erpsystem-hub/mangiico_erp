import React, { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DRAWER_Z_CONTENT_BASE } from '@/lib/dialog-sizes';
import type { OrderLineBomItem } from '../core/order-line-bom-types';

const OrderLineBomForm = lazy(() => import('./order-line-bom-form'));
const OrderLineBomDetail = lazy(() => import('./order-line-bom-detail'));

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
  lineId: string;
  lineQty: number;
  danhMucId: string;
  stackLevel: number;
  viewingItem: OrderLineBomItem | null;
  editingItem: OrderLineBomItem | null;
  showForm: boolean;
  existingMaterialIds: string[];
  canEdit: boolean;
  canDelete: boolean;
  onCloseForm: () => void;
  onCloseDetail: () => void;
  onEdit: (item: OrderLineBomItem) => void;
  onDelete: (id: string) => void;
}

const OrderLineBomOverlays: React.FC<Props> = ({
  lineId,
  lineQty,
  danhMucId,
  stackLevel,
  viewingItem,
  editingItem,
  showForm,
  existingMaterialIds,
  canEdit,
  canDelete,
  onCloseForm,
  onCloseDetail,
  onEdit,
  onDelete,
}) => (
  <AnimatePresence mode="sync">
    {showForm ? (
      <Suspense fallback={<DrawerLazyFallback />}>
        <OrderLineBomForm
          key={editingItem?.id ?? 'new'}
          lineId={lineId}
          lineQty={lineQty}
          danhMucId={danhMucId}
          initialData={editingItem}
          existingMaterialIds={existingMaterialIds}
          onClose={onCloseForm}
          stackLevel={stackLevel + (viewingItem ? 1 : 0)}
        />
      </Suspense>
    ) : null}
    {viewingItem && !showForm ? (
      <Suspense fallback={<DrawerLazyFallback />}>
        <OrderLineBomDetail
          data={viewingItem}
          canEdit={canEdit}
          canDelete={canDelete}
          onClose={onCloseDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          stackLevel={stackLevel}
        />
      </Suspense>
    ) : null}
  </AnimatePresence>
);

export default OrderLineBomOverlays;
