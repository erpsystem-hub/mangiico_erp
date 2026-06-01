import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { txt } from '@/lib/text';
import DocumentListPreviewLayout, {
  type DocumentListDownloadFormat,
} from '@/components/shared/DocumentListPreviewLayout';
import { useWarehouseSlipDetail } from '../hooks/use-phieu-kho';
import PhieuKhoPrintDocument from '../components/phieu-kho-print-document';
import { exportPdf } from '@/lib/export';
import ErrorState from '@/components/shared/ErrorState';
import { SessionInitializingSpinner } from '@/components/auth/SessionInitializingSpinner';
import { useAppSessionReady } from '@/hooks/use-auth-session';

const PhieuKhoPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInitializing } = useAppSessionReady();

  const {
    data: slip,
    isLoading,
    isError,
    refetch,
  } = useWarehouseSlipDetail(id, { enabled: Boolean(id) });

  const handleDownload = useCallback(
    async (format: DocumentListDownloadFormat) => {
      if (format !== 'pdf' || !slip) return;
      const lines = slip.lines ?? [];
      await exportPdf({
        fileName: slip.ma_phieu_kho,
        title:
          slip.loai_phieu === 'Nhập'
            ? txt('warehouseSlip.print.inboundTitle')
            : txt('warehouseSlip.print.outboundTitle'),
        subtitle: `${txt('warehouseSlip.print.slipCode')}: ${slip.ma_phieu_kho}`,
        columns: [
          { key: 'stt', label: txt('warehouseSlip.print.stt') },
          { key: 'ma_hang', label: txt('warehouseSlip.print.itemCode') },
          { key: 'ten_hang', label: txt('warehouseSlip.print.itemName') },
          { key: 'don_vi_tinh', label: txt('warehouseSlip.print.unit') },
          { key: 'so_luong', label: txt('warehouseSlip.print.qty') },
        ],
        rows: lines.map((ln, idx) => ({
          stt: idx + 1,
          ma_hang: ln.ma_hang,
          ten_hang: ln.ten_hang,
          don_vi_tinh: ln.don_vi_tinh,
          so_luong: ln.so_luong,
        })),
      });
    },
    [slip],
  );

  if (isInitializing || isLoading) return <SessionInitializingSpinner />;

  if (isError || !slip) {
    return (
      <ErrorState
        title={txt('warehouseSlip.service.notFound')}
        message={txt('warehouseSlip.listLoadErrorHint')}
        onRetry={() => void refetch()}
        primaryButtons
        className="m-4"
      />
    );
  }

  return (
    <DocumentListPreviewLayout
      previewClassPrefix="phieu-kho"
      pageTitle={txt('warehouseSlip.print.title')}
      onBack={() => navigate(-1)}
      onPrint={() => window.print()}
      onDownload={handleDownload}
    >
      <PhieuKhoPrintDocument slip={slip} />
    </DocumentListPreviewLayout>
  );
};

export default PhieuKhoPrintPage;
