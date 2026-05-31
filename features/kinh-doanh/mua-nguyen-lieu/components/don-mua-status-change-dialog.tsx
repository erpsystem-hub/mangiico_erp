import React, { useEffect, useState } from 'react';
import { RefreshCw, Tag } from 'lucide-react';
import { txt } from '@/lib/text';
import Combobox from '@/components/ui/Combobox';
import GenericDrawer from '@/components/shared/GenericDrawer';
import FormDrawerFooter from '@/components/shared/FormDrawerFooter';
import { DIALOG_SIZE } from '@/lib/dialog-sizes';
import type { PurchaseOrder } from '../core/types';
import { TRANG_THAI_DON_MUA_OPTIONS, type TrangThaiDonMua } from '../core/constants';

const FORM_ID = 'don-mua-status-change-form';

interface Props {
  open: boolean;
  order: PurchaseOrder | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSave: (status: TrangThaiDonMua) => void | Promise<void>;
}

const DonMuaStatusChangeDialog: React.FC<Props> = ({
  open,
  order,
  isSubmitting = false,
  onClose,
  onSave,
}) => {
  const [status, setStatus] = useState<TrangThaiDonMua>('Nháp');

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
      title={txt('purchaseOrder.statusChangeTitle')}
      icon={<RefreshCw size={18} />}
      subtitle={
        <>
          {txt('purchaseOrder.statusChangeMessage')}{' '}
          <strong className="text-foreground">{order.ma_don_mua}</strong>
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
          options={TRANG_THAI_DON_MUA_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          value={status}
          onChange={(v) => setStatus(String(v) as TrangThaiDonMua)}
          dropdownInPortal
        />
      </form>
    </GenericDrawer>
  );
};

export default DonMuaStatusChangeDialog;
