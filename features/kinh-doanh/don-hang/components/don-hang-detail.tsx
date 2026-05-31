import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  ShoppingCart,
  Calendar,
  MapPin,
  FileText,
  Users,
  Clock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import { salesOrderStatusBadgeConfig } from '../utils/order-badges';
import type { SalesOrder } from '../core/types';
import { canDeleteSalesOrder } from '../core/constants';
import { formatCurrency, formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';

interface Props {
  data: SalesOrder;
  onClose: () => void;
  onEdit: (item: SalesOrder) => void;
  onDelete: (id: string) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const DonHangDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const navigate = useNavigate();
  const { canEdit, canDelete: canDeletePerm } = useResourcePermissions('salesOrders');
  const canDelete = canDeletePerm && canDeleteSalesOrder(data.trang_thai);
  const statusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);
  const lines = data.lines ?? [];

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border border-border"
      >
        {BTN_CLOSE()}
      </Button>
      {canEdit || canDelete ? (
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              size="sm"
              onClick={() => {
                onEdit(data);
                onClose();
              }}
              className="h-8 px-3 text-xs bg-primary text-white shadow-sm hover:bg-primary/90"
            >
              <Edit size={14} className="mr-1.5" />
              {BTN_EDIT()}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(data.id)}
              className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30"
            >
              <Trash2 size={14} className="mr-1.5" />
              {BTN_DELETE()}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <GenericDrawer
      title={txt('salesOrder.detail.title')}
      subtitle={data.ma_don_hang}
      icon={<ShoppingCart size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <ShoppingCart size={28} />
            </DetailSummaryIconTile>
          }
          title={data.ma_don_hang}
          subtitle={data.ten_khach_hang}
          badge={<EnumBadge value={data.trang_thai} config={statusBadgeConfig} />}
        >
          <p className="text-lg font-semibold text-primary tabular-nums">
            {formatCurrency(data.tong_tien)}
          </p>
        </DetailSummaryCard>

        <DetailSection title={txt('salesOrder.detail.customerSection')} icon={<Users size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('salesOrder.store.customerCol')} value={data.ten_khach_hang} />
            <DetailField
              label={txt('partnerList.store.codeCol')}
              value={data.ma_khach_hang}
              trailing={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => navigate('/kinh-doanh/danh-sach-khach-hang')}
                >
                  {txt('salesOrder.detail.viewCustomer')}
                </Button>
              }
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('salesOrder.detail.orderInfo')} icon={<ShoppingCart size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('salesOrder.form.orderDate')}
              value={formatDate(data.ngay_dat)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.deliveryDate')}
              value={data.ngay_giao_du_kien ? formatDate(data.ngay_giao_du_kien) : undefined}
              icon={<Calendar size={12} />}
            />
            {data.ten_chi_nhanh && (
              <DetailField label={txt('salesOrder.store.branchCol')} value={data.ten_chi_nhanh} />
            )}
            <DetailField
              label={txt('salesOrder.form.deliveryAddress')}
              value={data.dia_chi_giao ?? undefined}
              icon={<MapPin size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.note')}
              value={data.ghi_chu ?? undefined}
              icon={<FileText size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection
          title={txt('salesOrder.detail.linesSection')}
          icon={<ShoppingCart size={14} />}
          headerRight={
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {lines.length} {txt('salesOrder.footerRecords')}
            </span>
          }
        >
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">{txt('salesOrder.detail.noLines')}</p>
          ) : (
            <EmbeddedChildDataGrid
              rows={lines}
              getRowKey={(ln) => ln.id}
              labelColumn={{
                header: txt('salesOrder.form.product'),
                minWidthClass: 'min-w-[180px]',
                renderCell: (ln) => (
                  <span className="font-medium text-foreground">{ln.ten_san_pham}</span>
                ),
              }}
              columns={[
                {
                  id: 'code',
                  header: txt('partnerList.store.codeCol'),
                  headerClassName: 'min-w-[100px]',
                  renderCell: (ln) => (
                    <span className="font-mono text-xs text-muted-foreground">{ln.ma_san_pham}</span>
                  ),
                },
                {
                  id: 'qty',
                  header: txt('salesOrder.form.qty'),
                  renderCell: (ln) => (
                    <span className="tabular-nums">
                      {ln.so_luong} {ln.don_vi_tinh}
                    </span>
                  ),
                },
                {
                  id: 'price',
                  header: txt('salesOrder.form.unitPrice'),
                  renderCell: (ln) => (
                    <span className="tabular-nums">{formatCurrency(ln.don_gia)}</span>
                  ),
                },
                {
                  id: 'total',
                  header: txt('salesOrder.form.lineTotal'),
                  renderCell: (ln) => (
                    <span className="font-medium tabular-nums">{formatCurrency(ln.thanh_tien)}</span>
                  ),
                },
              ]}
              actionsColumn={{
                header: '',
                widthClass: 'w-0 min-w-0 p-0',
                renderCell: () => null,
              }}
              containerClassName="border-0 shadow-none"
            />
          )}
        </DetailSection>

        <DetailSection title={txt('salesOrder.detail.systemInfo')} icon={<Clock size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerCategory.detail.createdAt')}
              value={formatDateTimeShort(data.tg_tao)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('partnerCategory.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={<Calendar size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default DonHangDetail;
