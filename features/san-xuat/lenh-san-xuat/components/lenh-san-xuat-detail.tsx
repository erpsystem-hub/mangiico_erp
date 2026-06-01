import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  MapPin,
  FileText,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import { salesOrderStatusBadgeConfig } from '@/features/kinh-doanh/don-hang/utils/order-badges';
import type { ProductionOrder, ProductionOrderLine } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import ProductionOrderProductsSection from './production-order-products-section';
import ProductionOrderBomSection from './production-order-bom-section';
import { useOrderLineProgress } from '../hooks/use-lenh-san-xuat';

interface Props {
  data: ProductionOrder;
  onClose: () => void;
  onStatusChange?: (item: ProductionOrder) => void;
  onViewLine?: (order: ProductionOrder, line: ProductionOrderLine) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const LenhSanXuatDetail: React.FC<Props> = ({
  data,
  onClose,
  onStatusChange,
  onViewLine,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const navigate = useNavigate();
  const { canEdit } = useResourcePermissions('productionOrders');
  const { data: receivedQtyMap } = useOrderLineProgress(data.id);
  const statusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: txt('productionOrder.detail.changeStatus'),
            icon: <RefreshCw size={16} />,
            onClick: () => onStatusChange(data),
            variant: 'info' as const,
          },
        ]
      : []),
  ];

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
    </div>
  );

  return (
    <GenericDrawer
      title={txt('productionOrder.detail.title')}
      subtitle={data.ma_don_hang}
      icon={<ClipboardList size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <ClipboardList size={28} />
            </DetailSummaryIconTile>
          }
          title={data.ma_don_hang}
          subtitle={data.ten_khach_hang}
          badge={<EnumBadge value={data.trang_thai} config={statusBadgeConfig} />}
        />

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('productionOrder.detail.customerSection')} icon={<Users size={14} />}>
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
                  {txt('productionOrder.detail.viewCustomer')}
                </Button>
              }
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('productionOrder.detail.orderInfo')} icon={<ClipboardList size={14} />}>
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
              <DetailField label={txt('productionOrder.store.branchCol')} value={data.ten_chi_nhanh} />
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

        <ProductionOrderProductsSection order={data} onViewLine={onViewLine} receivedQtyMap={receivedQtyMap} />

        <ProductionOrderBomSection order={data} onViewLine={onViewLine} />

        <DetailSection title={txt('productionOrder.detail.systemInfo')} icon={<Clock size={14} />}>
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

export default LenhSanXuatDetail;
