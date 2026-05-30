import React, { useMemo } from 'react';
import { txt } from '../../../../lib/text';
import { Edit, Trash2, MapPinned, Power, Phone, Mail, Calendar, Clock, FileText, ArrowUpFromLine, Hash } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import EnumBadge from '../../../../components/ui/EnumBadge';
import type { BadgeConfig } from '../../../../components/ui/EnumBadge';
import { Branch } from '../core/types';
import { formatDate, formatDateTimeShort } from '../../../../lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../../components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '../../../../components/shared/DetailSummaryCard';
import DetailSection from '../../../../components/shared/DetailSection';
import DetailField from '../../../../components/shared/DetailField';
import DetailFieldGrid, { DETAIL_FIELD_SPAN_FULL } from '../../../../components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '../../../../components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../../lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';

interface Props {
  data: Branch;
  onClose: () => void;
  onEdit: (item: Branch) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: Branch) => void;
}

const BranchDetail: React.FC<Props> = ({ data, onClose, onEdit, onDelete, onStatusChange }) => {
  const { canEdit, canDelete } = useResourcePermissions('branches');
  const isActive = data.trang_thai === 'Đang hoạt động';

  const trangThaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Đang hoạt động': { label: txt('branch.active'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('branch.inactive'), color: 'slate' },
  }), []);

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive ? txt('branch.detail.deactivate') : txt('branch.detail.activate'),
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
      {(canEdit || canDelete) ? (
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
      title={txt('branch.detail.title')}
      subtitle={`${txt('branch.detail.subtitle')} · ${data.ma_chi_nhanh ?? '—'}`}
      icon={<MapPinned size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <MapPinned size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_chi_nhanh}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
          subtitle={data.dia_chi ? <p className="m-0 truncate text-muted-foreground">{data.dia_chi}</p> : undefined}
        />

        {toolbarActions.length > 0 && (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        )}

        <DetailSection title={txt('branch.detail.basicInfo')} icon={<MapPinned size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('branch.form.name')} value={data.ten_chi_nhanh} icon={<MapPinned size={12} />} />
            <DetailField label={txt('branch.form.code')} value={data.ma_chi_nhanh ?? '—'} icon={<Hash size={12} />} />
            <DetailField label={txt('branch.detail.order')} value={String(data.thu_tu ?? 0)} icon={<ArrowUpFromLine size={12} />} />
            <DetailField label={txt('common.status')} value={isActive ? txt('branch.active') : txt('branch.inactive')} icon={<Power size={12} />} />
            <DetailField
              className={DETAIL_FIELD_SPAN_FULL}
              label={txt('branch.form.description')}
              value={data.mo_ta ?? ''}
              icon={<FileText size={12} />}
              emptyText="—"
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('branch.detail.contactInfo')} icon={<Phone size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField
              className={DETAIL_FIELD_SPAN_FULL}
              label={txt('branch.form.address')}
              value={data.dia_chi ?? ''}
              icon={<MapPinned size={12} />}
              emptyText="—"
            />
            <DetailField label={txt('branch.form.phone')} value={data.dien_thoai ?? '—'} icon={<Phone size={12} />} />
            <DetailField label={txt('branch.form.email')} value={data.email ?? '—'} icon={<Mail size={12} />} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection title={txt('branch.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('branch.detail.createdAt')} value={formatDateTimeShort(data.tg_tao)} icon={<Calendar size={12} />} />
            <DetailField label={txt('branch.detail.updated')} value={formatDate(data.tg_cap_nhat)} icon={<Calendar size={12} />} />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default BranchDetail;
