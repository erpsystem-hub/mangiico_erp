import React, { useMemo, useState, useCallback } from 'react';
import { txt } from '@/lib/text';
import { QrCode, Download, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import { buildVietQrImageUrl } from '../utils/vietqr-url';
import type { LoaiQuy } from '../core/constants';

export interface VietQrPreviewProps {
  loai_quy: LoaiQuy;
  ma_ngan_hang_bin?: string | null;
  so_tai_khoan?: string | null;
  chu_tai_khoan?: string | null;
  className?: string;
}

const VietQrPreview: React.FC<VietQrPreviewProps> = ({
  loai_quy,
  ma_ngan_hang_bin,
  so_tai_khoan,
  chu_tai_khoan,
  className,
}) => {
  const [imgError, setImgError] = useState(false);

  const imageUrl = useMemo(() => {
    if (loai_quy !== 'Ngân hàng') return null;
    return buildVietQrImageUrl({
      bin: ma_ngan_hang_bin ?? '',
      accountNumber: so_tai_khoan ?? '',
      accountName: chu_tai_khoan ?? '',
      template: 'compact2',
    });
  }, [loai_quy, ma_ngan_hang_bin, so_tai_khoan, chu_tai_khoan]);

  const handleDownload = useCallback(() => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'vietqr.png';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }, [imageUrl]);

  const handleCopyLink = useCallback(async () => {
    if (!imageUrl) return;
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success(txt('financeAccount.qr.copied'));
    } catch {
      toast.error('Không sao chép được link');
    }
  }, [imageUrl]);

  if (loai_quy !== 'Ngân hàng') return null;

  return (
    <div
      className={`rounded-xl border border-border bg-muted/30 p-4 ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <QrCode size={16} className="text-primary shrink-0" />
        {txt('financeAccount.form.qrSection')}
      </div>

      {imageUrl && !imgError ? (
        <div className="flex flex-col items-center gap-3">
          <img
            src={imageUrl}
            alt="VietQR"
            className="max-w-[220px] w-full h-auto rounded-lg border border-border bg-white"
            onError={() => setImgError(true)}
          />
          <div className="flex flex-wrap gap-2 justify-center">
            <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {txt('financeAccount.qr.download')}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleCopyLink}>
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              {txt('financeAccount.qr.copyLink')}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          {txt('financeAccount.qr.placeholder')}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2 text-center">{txt('financeAccount.form.qrHint')}</p>
    </div>
  );
};

export default VietQrPreview;
