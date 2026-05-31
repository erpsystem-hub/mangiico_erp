import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Users,
  Power,
  Hash,
  FolderTree,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  Receipt,
  User,
  FileText,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import { partnerListTrangThaiBadgeConfig } from '../../utils/partner-badges';
import type { PartnerListItem } from '../../core/types';
import type { AppResource } from '@/lib/permissions';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_DETAIL_SMALL } from '@/lib/dialog-sizes';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useCan } from '@/hooks/use-can';
import { useSalesOrdersByKhachHang } from '@/features/kinh-doanh/don-hang/hooks/use-don-hang';
import { salesOrderStatusBadgeConfig } from '@/features/kinh-doanh/don-hang/utils/order-badges';
import { formatCurrency, formatDateShort } from '@/lib/utils';

interface Props {
  listResource: AppResource;
  data: PartnerListItem;
  onClose: () => void;
  onEdit: (item: PartnerListItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: PartnerListItem) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const PartnerListDetail: React.FC<Props> = ({
  listResource,
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const navigate = useNavigate();
  const { canEdit, canDelete } = useResourcePermissions(listResource);
  const canViewOrders = useCan('view', 'salesOrders');
  const { canCreate: canCreateOrder } = useResourcePermissions('salesOrders');
  const isCustomer = listResource === 'customerList';
  const { data: recentOrders = [], isLoading: ordersLoading } = useSalesOrdersByKhachHang(
    data.id,
    { enabled: isCustomer && canViewOrders, limit: 5 },
  );
  const isActive = data.trang_thai === 'Đang hoạt động';
  const trangThaiBadgeConfig = useMemo(() => partnerListTrangThaiBadgeConfig(), []);
  const orderStatusBadgeConfig = useMemo(() => salesOrderStatusBadgeConfig(), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('partnerList.detail.deactivate')
              : txt('partnerList.detail.activate'),
            icon: <Power size={16} />,
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
              <Edit className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {BTN_EDIT()}
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete(data.id);
                onClose();
              }}
              className="h-8 px-3 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 dark:text-rose-400 border border-rose-200 hover:border-rose-300 dark:border-rose-800 dark:hover:border-rose-700"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              {BTN_DELETE()}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <GenericDrawer
      title={txt('partnerList.detail.title')}
      icon={<Users size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={maxWidthClass ?? (stackLevel > 0 ? DRAWER_WIDTH_DETAIL_SMALL : DRAWER_WIDTH_DETAIL)}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Users size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_doi_tac}
          subtitle={data.ma_doi_tac}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
        />

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('partnerList.detail.basicInfo')} icon={<Users size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('partnerList.form.code')} value={data.ma_doi_tac} icon={Hash} />
            <DetailField
              label={txt('partnerList.detail.categoryGroup')}
              value={data.ten_nhom_danh_muc || '—'}
              icon={FolderTree}
            />
            <DetailField
              label={txt('partnerList.detail.category')}
              value={data.ten_danh_muc}
              icon={FolderTree}
            />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
            />
            {data.mo_ta ? (
              <div className="sm:col-span-2">
                <DetailField label={txt('partnerList.form.description')} value={data.mo_ta} icon={FileText} />
              </div>
            ) : null}
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('partnerList.detail.contactInfo')} icon={<Phone size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerList.form.phone')}
              value={data.dien_thoai ?? '—'}
              icon={Phone}
              emptyText={txt('common.emptyCell')}
            />
            <DetailField
              label={txt('partnerList.form.email')}
              value={data.email ?? '—'}
              icon={Mail}
              emptyText={txt('common.emptyCell')}
            />
            <DetailField
              label={txt('partnerList.form.contactPerson')}
              value={data.nguoi_lien_he ?? '—'}
              icon={User}
              emptyText={txt('common.emptyCell')}
            />
            <DetailField
              label={txt('partnerList.form.taxCode')}
              value={data.ma_so_thue ?? '—'}
              icon={Receipt}
              emptyText={txt('common.emptyCell')}
            />
            <div className="sm:col-span-2">
              <DetailField
                label={txt('partnerList.form.address')}
                value={data.dia_chi ?? '—'}
                icon={MapPin}
                emptyText={txt('common.emptyCell')}
              />
            </div>
          </DetailFieldGrid>
        </DetailSection>

        {isCustomer && canViewOrders ? (
          <DetailSection
            title={txt('salesOrder.detail.recentOrders')}
            icon={<ShoppingCart size={14} />}
            headerRight={
              canCreateOrder ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() =>
                    navigate('/kinh-doanh/don-hang', {
                      state: { openCreate: true, presetKhachHangId: data.id },
                    })
                  }
                >
                  <Plus size={14} className="mr-1" />
                  {txt('salesOrder.detail.createOrderForCustomer')}
                </Button>
              ) : null
            }
          >
            {ordersLoading ? (
              <p className="text-sm text-muted-foreground">{txt('salesOrder.loading')}</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">{txt('salesOrder.detail.noRecentOrders')}</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        navigate('/kinh-doanh/don-hang', {
                          state: { viewOrderId: order.id },
                        })
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.ma_don_hang}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateShort(order.ngay_dat)} · {formatCurrency(order.tong_tien)}
                        </p>
                      </div>
                      <EnumBadge value={order.trang_thai} config={orderStatusBadgeConfig} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </DetailSection>
        ) : null}

        <DetailSection title={txt('partnerList.detail.systemInfo')} icon={<Clock size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerList.detail.createdAt')}
              value={formatDate(data.tg_tao)}
              icon={Calendar}
            />
            <DetailField
              label={txt('partnerList.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={Clock}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default PartnerListDetail;
