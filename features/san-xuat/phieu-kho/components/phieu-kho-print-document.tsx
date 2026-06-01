import React from 'react';
import { txt } from '@/lib/text';
import type { WarehouseSlip } from '../core/types';
import { formatDate } from '@/lib/utils';

export interface PhieuKhoPrintDocumentProps {
  slip: WarehouseSlip;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

const PhieuKhoPrintDocument: React.FC<PhieuKhoPrintDocumentProps> = ({
  slip,
  companyName = 'CÔNG TY …',
  companyAddress = 'Địa chỉ …',
  companyPhone = 'ĐT: …',
}) => {
  const title =
    slip.loai_phieu === 'Nhập'
      ? txt('warehouseSlip.print.inboundTitle')
      : txt('warehouseSlip.print.outboundTitle');
  const lines = slip.lines ?? [];

  return (
    <div className="p-8 text-black text-[13px] leading-relaxed print:p-6">
      <div className="text-center border-b border-black/20 pb-4 mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide">{companyName}</p>
        <p className="text-xs mt-1">{companyAddress}</p>
        <p className="text-xs">{companyPhone}</p>
        <h1 className="text-xl font-bold uppercase mt-4 tracking-wide">{title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-sm">
        <p>
          <span className="font-semibold">{txt('warehouseSlip.print.slipCode')}:</span>{' '}
          {slip.ma_phieu_kho}
        </p>
        <p>
          <span className="font-semibold">{txt('warehouseSlip.print.slipDate')}:</span>{' '}
          {formatDate(slip.ngay_phieu)}
        </p>
        <p>
          <span className="font-semibold">{txt('warehouseSlip.print.warehouse')}:</span>{' '}
          {slip.ten_kho}
        </p>
        <p>
          <span className="font-semibold">{txt('warehouseSlip.print.purpose')}:</span>{' '}
          {slip.muc_dich}
        </p>
        {slip.ten_kho_dich ? (
          <p>
            <span className="font-semibold">{txt('warehouseSlip.print.destWarehouse')}:</span>{' '}
            {slip.ten_kho_dich}
          </p>
        ) : null}
        {slip.ma_don_hang ? (
          <p>
            <span className="font-semibold">{txt('warehouseSlip.print.productionOrder')}:</span>{' '}
            {slip.ma_don_hang}
          </p>
        ) : null}
        {slip.ma_don_mua ? (
          <p>
            <span className="font-semibold">{txt('warehouseSlip.print.purchaseOrder')}:</span>{' '}
            {slip.ma_don_mua}
          </p>
        ) : null}
        {slip.ghi_chu ? (
          <p className="col-span-2">
            <span className="font-semibold">{txt('warehouseSlip.print.note')}:</span> {slip.ghi_chu}
          </p>
        ) : null}
      </div>

      <table className="w-full border-collapse text-sm mb-8">
        <thead>
          <tr className="border border-black/30 bg-black/5">
            <th className="border border-black/30 px-2 py-1.5 w-10 text-center">
              {txt('warehouseSlip.print.stt')}
            </th>
            <th className="border border-black/30 px-2 py-1.5 text-left">
              {txt('warehouseSlip.print.itemCode')}
            </th>
            <th className="border border-black/30 px-2 py-1.5 text-left">
              {txt('warehouseSlip.print.itemName')}
            </th>
            <th className="border border-black/30 px-2 py-1.5 w-16 text-center">
              {txt('warehouseSlip.print.unit')}
            </th>
            <th className="border border-black/30 px-2 py-1.5 w-24 text-right">
              {txt('warehouseSlip.print.qty')}
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((ln, idx) => (
            <tr key={ln.id}>
              <td className="border border-black/30 px-2 py-1.5 text-center tabular-nums">
                {idx + 1}
              </td>
              <td className="border border-black/30 px-2 py-1.5 font-mono text-xs">{ln.ma_hang}</td>
              <td className="border border-black/30 px-2 py-1.5">{ln.ten_hang}</td>
              <td className="border border-black/30 px-2 py-1.5 text-center">{ln.don_vi_tinh}</td>
              <td className="border border-black/30 px-2 py-1.5 text-right tabular-nums">
                {ln.so_luong}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4 mt-12 text-center text-sm">
        <div>
          <p className="font-semibold mb-16">{txt('warehouseSlip.print.preparedBy')}</p>
          <p className="italic text-xs text-black/60">(Ký, họ tên)</p>
        </div>
        <div>
          <p className="font-semibold mb-16">{txt('warehouseSlip.print.warehouseKeeper')}</p>
          <p className="italic text-xs text-black/60">(Ký, họ tên)</p>
        </div>
        <div>
          <p className="font-semibold mb-16">{txt('warehouseSlip.print.accountant')}</p>
          <p className="italic text-xs text-black/60">(Ký, họ tên)</p>
        </div>
      </div>
    </div>
  );
};

export default PhieuKhoPrintDocument;
