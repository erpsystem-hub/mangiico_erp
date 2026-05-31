import React, { useEffect, useState } from 'react';
import { RefreshCw, Tag } from 'lucide-react';
import { txt } from '@/lib/text';
import Combobox from '@/components/ui/Combobox';
import GenericDrawer from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import { DIALOG_SIZE } from '@/lib/dialog-sizes';
import type { SalesOrder } from '../core/types';
import { TRANG_THAI_DON_HANG_OPTIONS, type TrangThaiDonHang } from '../core/constants';

const FORM_ID = 'don-hang-status-change-form';

interface Props {
  open: boolean;
  order: SalesOrder | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (status: TrangThaiDonHang) => void | Promise<void>;
}

/**
 * Popup giữa màn đổi trạng thái đơn hàng.
 * Quy chuẩn: `docs/patterns-detail-status-change.md`
 */
const DonHangStatusChangeDialog: React.FC<Props> = ({
  open,
  order,
  isSubmitting = false,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<TrangThaiDonHang>('Nháp');

  useEffect(() => {
    if (!open || !order) return;
    setStatus(order.trang_thai);
  }, [open, order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || status === order.trang_thai) return;
    await Promise.resolve(onSave(status));
  };

  if (!open || !order) return null;

  return (
    <GenericDrawer
      variant="modal"
      maxWidthClass={`w-full ${DIALOG_SIZE.COMPACT}`}
      onClose={onClose}
      title={txt('salesOrder.statusChangeTitle')}
      icon={<RefreshCw size={18} />}
      subtitle={
        <>
          {txt('salesOrder.statusChangeMessage')}{' '}
          <strong className="text-foreground">{order.ma_don_hang}</strong>
        </>
      }
      footer={
        <FormDrawerFooter
          formId={FORM_ID}
          onCancel={onClose}
          isLoading={isSubmitting}
          isEdit
          compact
          saveLabel={txt('common.confirm')}
        />
      }
      footerCompact
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        <Combobox
          label={txt('common.status')}
          icon={Tag}
          options={TRANG_THAI_DON_HANG_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          value={status}
          onChange={(v) => setStatus(String(v) as TrangThaiDonHang)}
          dropdownInPortal
        />
      </form>
    </GenericDrawer>
  );
};

export default DonHangStatusChangeDialog;
