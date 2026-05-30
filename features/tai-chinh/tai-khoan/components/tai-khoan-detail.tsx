import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import {
  Edit,
  Trash2,
  Landmark,
  Power,
  MapPinned,
  Building2,
  CreditCard,
  User,
  Wallet,
  Calendar,
  Clock,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import type { FinanceAccount } from '../core/types';
import { formatCurrency, formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import VietQrPreview from './vietqr-preview';

interface Props {
  data: FinanceAccount;
  onClose: () => void;
  onEdit: (item: FinanceAccount) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: FinanceAccount) => void;
}

const FinanceAccountDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { canEdit, canDelete } = useResourcePermissions('financeAccounts');
  const isActive = data.trang_thai === 'Đang hoạt động';

  const trangThaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Đang hoạt động': { label: txt('financeAccount.active'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('financeAccount.inactive'), color: 'slate' },
  }), []);

  const loaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Tiền mặt': { label: txt('financeAccount.fundTypeCash'), color: 'amber' },
    'Ngân hàng': { label: txt('financeAccount.fundTypeBank'), color: 'blue' },
  }), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('financeAccount.detail.deactivate')
              : txt('financeAccount.detail.activate'),
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
      title={txt('financeAccount.detail.title')}
      subtitle={txt('financeAccount.detail.subtitle')}
      icon={<Landmark size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Landmark size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_quy}
          badge={
            <div className="flex flex-wrap gap-1.5">
              <EnumBadge value={data.loai_quy} config={loaiBadgeConfig} />
              <EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />
            </div>
          }
          subtitle={
            data.ten_chi_nhanh ? (
              <p className="m-0 truncate text-muted-foreground">{data.ten_chi_nhanh}</p>
            ) : undefined
          }
        />

        {toolbarActions.length > 0 && (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        )}

        <DetailSection
          title={txt('financeAccount.detail.basicInfo')}
          icon={<Landmark size={14} />}
          variant="primary"
        >
          <DetailFieldGrid>
            <DetailField label={txt('financeAccount.form.name')} value={data.ten_quy} icon={<Landmark size={12} />} />
            <DetailField
              label={txt('financeAccount.form.fundType')}
              value={data.loai_quy}
              icon={<Wallet size={12} />}
            />
            <DetailField
              label={txt('financeAccount.form.branch')}
              value={data.ten_chi_nhanh ?? '—'}
              icon={<MapPinned size={12} />}
            />
            <DetailField
              label={txt('financeAccount.form.openingBalance')}
              value={formatCurrency(data.so_du_khoi_dau)}
              icon={<Wallet size={12} />}
            />
            <DetailField
              label={txt('common.status')}
              value={isActive ? txt('financeAccount.active') : txt('financeAccount.inactive')}
              icon={<Power size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        {data.loai_quy === 'Ngân hàng' && (
          <DetailSection
            title={txt('financeAccount.detail.bankInfo')}
            icon={<Building2 size={14} />}
            variant="primary"
          >
            <DetailFieldGrid>
              <DetailField
                label={txt('financeAccount.form.bank')}
                value={data.ngan_hang ?? '—'}
                icon={<Building2 size={12} />}
              />
              <DetailField
                label={txt('financeAccount.exportBin')}
                value={data.ma_ngan_hang_bin ?? '—'}
                icon={<Building2 size={12} />}
              />
              <DetailField
                label={txt('financeAccount.form.accountNumber')}
                value={data.so_tai_khoan ?? '—'}
                icon={<CreditCard size={12} />}
              />
              <DetailField
                label={txt('financeAccount.form.accountHolder')}
                value={data.chu_tai_khoan ?? '—'}
                icon={<User size={12} />}
              />
            </DetailFieldGrid>
            <VietQrPreview
              className="mt-4"
              loai_quy={data.loai_quy}
              ma_ngan_hang_bin={data.ma_ngan_hang_bin}
              so_tai_khoan={data.so_tai_khoan}
              chu_tai_khoan={data.chu_tai_khoan}
            />
          </DetailSection>
        )}

        <DetailSection
          title={txt('financeAccount.detail.systemInfo')}
          icon={<Clock size={14} />}
          variant="primary"
        >
          <DetailFieldGrid>
            <DetailField
              label={txt('financeAccount.detail.createdAt')}
              value={formatDateTimeShort(data.tg_tao)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('financeAccount.detail.updated')}
              value={formatDate(data.tg_cap_nhat)}
              icon={<Calendar size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default FinanceAccountDetail;
