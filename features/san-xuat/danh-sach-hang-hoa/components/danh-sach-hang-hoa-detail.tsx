import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { Edit, Trash2, Package, Power, Hash, FolderTree, Calendar, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import EnumBadge from '@/components/ui/EnumBadge';
import type { BadgeConfig } from '@/components/ui/EnumBadge';
import type { ProductCatalogItem } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { useProductAttributeValues } from '../hooks/use-danh-sach-hang-hoa';
import ProductAttributeValuesSection from './product-attribute-values-section';

interface Props {
  data: ProductCatalogItem;
  onClose: () => void;
  onEdit: (item: ProductCatalogItem) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: ProductCatalogItem) => void;
}

const ProductCatalogDetail: React.FC<Props> = ({
  data,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const { canEdit, canDelete } = useResourcePermissions('productCatalog');
  const isActive = data.trang_thai === 'Đang hoạt động';
  const { data: attributeValues = [] } = useProductAttributeValues(data.id);

  const trangThaiBadgeConfig = useMemo((): BadgeConfig<string> => ({
    'Đang hoạt động': { label: txt('common.activeStatus'), color: 'emerald' },
    'Ngừng hoạt động': { label: txt('common.inactiveStatus'), color: 'slate' },
  }), []);

  const template = useMemo(
    () =>
      attributeValues.map((a) => ({
        thuoc_tinh_id: a.thuoc_tinh_id,
        ten_hien_thi: a.ten_hien_thi,
        bat_buoc: a.bat_buoc,
        thu_tu: a.thu_tu,
      })),
    [attributeValues],
  );

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('productCatalog.detail.deactivate')
              : txt('productCatalog.detail.activate'),
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
      title={txt('productCatalog.detail.title')}
      subtitle={txt('productCatalog.detail.subtitle')}
      icon={<Package size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={DRAWER_WIDTH_DETAIL}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Package size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_san_pham}
          subtitle={data.ma_san_pham}
          badge={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
        />

        {toolbarActions.length > 0 ? (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        ) : null}

        <DetailSection title={txt('productCatalog.detail.basicInfo')} icon={<Package size={14} />}>
          <DetailFieldGrid>
            <DetailField label={txt('productCatalog.form.code')} value={data.ma_san_pham} icon={Hash} />
            <DetailField
              label={txt('productCatalog.detail.categoryGroup')}
              value={data.ten_nhom_danh_muc || '—'}
              icon={FolderTree}
            />
            <DetailField
              label={txt('productCatalog.detail.category')}
              value={data.ten_danh_muc}
              icon={FolderTree}
            />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge value={data.trang_thai} config={trangThaiBadgeConfig} />}
            />
            {data.mo_ta ? (
              <div className="sm:col-span-2">
                <DetailField label={txt('productCatalog.form.description')} value={data.mo_ta} />
              </div>
            ) : null}
          </DetailFieldGrid>
        </DetailSection>

        <ProductAttributeValuesSection
          template={template}
          values={attributeValues.map((a) => ({
            thuoc_tinh_id: a.thuoc_tinh_id,
            gia_tri: a.gia_tri,
          }))}
          onChange={() => {}}
          readOnly
        />

        <DetailSection title={txt('productCatalog.detail.systemInfo')} icon={<Clock size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('productCatalog.detail.createdAt')}
              value={formatDate(data.tg_tao)}
              icon={Calendar}
            />
            <DetailField
              label={txt('productCatalog.detail.updated')}
              value={formatDateTimeShort(data.tg_cap_nhat)}
              icon={Clock}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>
    </GenericDrawer>
  );
};

export default ProductCatalogDetail;
