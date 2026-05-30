import React, { useMemo, useState } from 'react';
import EnumBadge from '@/components/ui/EnumBadge';
import {
  buildProductCategoryLevelBadgeConfig,
  productCategoryTrangThaiBadgeConfig,
} from '../utils/product-category-badges';
import { txt } from '@/lib/text';
import {
  Edit,
  Trash2,
  Tags,
  Layers,
  ArrowUpFromLine,
  Calendar,
  Clock,
  Power,
  Plus,
  Folder,
  FileText,
  Hash,
  SlidersHorizontal,
  Ruler,
} from 'lucide-react';
import { useCategoryLinks } from '../hooks/use-danh-muc-hang-hoa';
import Button from '@/components/ui/Button';
import { ProductCategory } from '../core/types';
import { formatDate, formatDateTimeShort } from '@/lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '@/components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid, { DETAIL_FIELD_SPAN_FULL } from '@/components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '@/components/shared/DetailToolbar';
import EmptyState from '@/components/shared/EmptyState';
import EmbeddedChildDataGrid from '@/components/shared/EmbeddedChildDataGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { ProductCategoryTableRowActions } from './product-category-table-row-actions';

interface Props {
  data: ProductCategory;
  allCategories: ProductCategory[];
  onClose: () => void;
  onEdit: (item: ProductCategory) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: ProductCategory) => void;
  onAddChild?: (parent: ProductCategory) => void;
  /** Click dòng con mở detail con (drawer do index render, đóng khi Thêm/Sửa/Xóa/Hủy) */
  onViewChild?: (child: ProductCategory) => void;
  /** Drawer nhỏ hơn khi là detail con (stackLevel do index truyền) */
  maxWidthClass?: string;
  stackLevel?: number;
}

const ProductCategoryDetail: React.FC<Props> = ({
  data,
  allCategories,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onAddChild,
  onViewChild,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const { canEdit, canDelete, canCreate } = useResourcePermissions('productCategories');
  const [childMenuOpenId, setChildMenuOpenId] = useState<string | null>(null);
  const isActive = data.trang_thai === 'Đang hoạt động';
  const parentDept = data.cha_id ? allCategories.find((d) => d.id === data.cha_id) : null;

  const levelBadgeConfig = useMemo(() => buildProductCategoryLevelBadgeConfig(), []);
  const statusBadgeConfig = useMemo(() => productCategoryTrangThaiBadgeConfig(), []);
  const isRootLevel = data.cap_do === 1;
  const isLevel2 = data.cap_do === 2;
  const { data: categoryLinks } = useCategoryLinks(data.id, { enabled: isLevel2 });

  const children = useMemo(
    () =>
      allCategories
        .filter((d) => d.cha_id === data.id)
        .sort((a, b) => a.thu_tu - b.thu_tu),
    [allCategories, data.id]
  );

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive ? txt('productCategory.detail.deactivate') : txt('productCategory.detail.activate'),
            icon: <Power size={16} />,
            onClick: () => onStatusChange(data),
            variant: 'info' as const,
          },
        ]
      : []),
  ];

  const renderFooter = (
    <div className="flex w-full items-center justify-between gap-2">
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
      title={txt('productCategory.detail.title')}
      icon={<Tags size={18} />}
      onClose={onClose}
      footer={renderFooter}
      footerCompact
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Tags size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_danh_muc}
          badge={<EnumBadge shape="pill" value={data.trang_thai} config={statusBadgeConfig} />}
        />

        {toolbarActions.length > 0 && (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        )}

        {/* Thông tin cơ bản */}
        <DetailSection title={txt('productCategory.detail.basicInfo')} icon={<Tags size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('productCategory.name')} value={data.ten_danh_muc} icon={<Tags size={12} />} />
            <DetailField
              label={txt('productCategory.code')}
              value={data.ma_danh_muc ?? ''}
              icon={<Hash size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField
              className={DETAIL_FIELD_SPAN_FULL}
              label={txt('productCategory.detail.description')}
              value={data.mo_ta ?? ''}
              icon={<FileText size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField label={txt('productCategory.detail.parent')} value={parentDept ? parentDept.ten_danh_muc : txt('productCategory.detail.noParent')} icon={<Folder size={12} />} emptyText={txt('productCategory.detail.noParent')} />
            <DetailField
              label={txt('productCategory.detail.level')}
              value={
                <EnumBadge
                  shape="rounded"
                  value={data.cap_do}
                  config={levelBadgeConfig}
                  fallbackLabel={txt('productCategory.levelBadge', { level: data.cap_do })}
                />
              }
              icon={<Layers size={12} />}
            />
            <DetailField label={txt('productCategory.detail.order')} value={String(data.thu_tu)} icon={<ArrowUpFromLine size={12} />} />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge shape="pill" value={data.trang_thai} config={statusBadgeConfig} />}
              icon={<Power size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        {isLevel2 ? (
          <>
            <DetailSection
              title={txt('productCategory.detail.attributesSection')}
              icon={<SlidersHorizontal size={14} />}
              variant="primary"
            >
              {(categoryLinks?.attributeLinks.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">{txt('productCategory.detail.noLinks')}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {categoryLinks?.attributeLinks.map((link) => (
                    <li
                      key={link.thuoc_tinh_id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {link.ten_hien_thi}
                      {link.bat_buoc ? (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {txt('productCategory.detail.requiredBadge')}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
            <DetailSection
              title={txt('productCategory.detail.measurementsSection')}
              icon={<Ruler size={14} />}
              variant="primary"
            >
              {(categoryLinks?.measurementLinks.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">{txt('productCategory.detail.noLinks')}</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {categoryLinks?.measurementLinks.map((link) => (
                    <li
                      key={link.thong_so_do_id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      <span>
                        {link.ten_hien_thi}
                        <span className="ml-1 text-muted-foreground font-normal">({link.don_vi})</span>
                      </span>
                      {link.bat_buoc ? (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {txt('productCategory.detail.requiredBadge')}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </DetailSection>
          </>
        ) : null}

        {/* Thông tin hệ thống */}
        <DetailSection title={txt('productCategory.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('productCategory.detail.createdAt')} value={formatDateTimeShort(data.tg_tao)} icon={<Calendar size={12} />} />
            <DetailField label={txt('productCategory.detail.updated')} value={formatDate(data.tg_cap_nhat)} icon={<Calendar size={12} />} />
          </DetailFieldGrid>
        </DetailSection>

        {isRootLevel ? (
          <DetailSection
            title={txt('productCategory.detail.childrenSection')}
            icon={<Tags size={14} />}
            variant="primary"
            headerRight={
              <>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
                  {children.length} {txt('productCategory.footerRecords')}
                </span>
                {onAddChild && canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onAddChild(data)}
                    className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
                  >
                    <Plus size={14} className="mr-1.5" />
                    {txt('productCategory.detail.addChild')}
                  </Button>
                ) : null}
              </>
            }
          >
            {children.length === 0 ? (
              <EmptyState
                title={txt('productCategory.detail.noChildren')}
                description={txt('productCategory.detail.noChildrenHint')}
                icon={<Folder className="h-10 w-10 text-muted-foreground" />}
                action={
                  onAddChild && canCreate ? (
                    <Button type="button" size="sm" onClick={() => onAddChild(data)} className="bg-primary text-white hover:bg-primary/90">
                      <Plus size={14} className="mr-2" />
                      {txt('productCategory.detail.addChild')}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <EmbeddedChildDataGrid<ProductCategory>
                rows={children}
                getRowKey={(child) => child.id}
                labelColumn={{
                  header: txt('productCategory.name'),
                  minWidthClass: 'min-w-[160px]',
                  renderCell: (child) => <span className="font-medium text-foreground">{child.ten_danh_muc}</span>,
                }}
                columns={[
                  {
                    id: 'desc',
                    header: txt('productCategory.store.descCol'),
                    headerClassName: 'max-w-[180px]',
                    cellClassName: 'max-w-[180px]',
                    renderCell: (child) => (
                      <span className="line-clamp-2 text-xs text-muted-foreground">{child.mo_ta ?? '—'}</span>
                    ),
                  },
                  {
                    id: 'status',
                    header: txt('common.status'),
                    renderCell: (child) => <EnumBadge shape="pill" value={child.trang_thai} config={statusBadgeConfig} />,
                  },
                ]}
                actionsColumn={{
                  header: txt('common.actions'),
                  widthClass: 'w-[92px] min-w-[92px]',
                  renderCell: (child) => (
                    <ProductCategoryTableRowActions
                      compact
                      item={child}
                      menuOpenId={childMenuOpenId}
                      onMenuOpenChange={setChildMenuOpenId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onStatusChange={onStatusChange}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ),
                }}
                onRowClick={onViewChild ? (child) => onViewChild(child) : undefined}
                containerClassName="border-0 shadow-none"
              />
            )}
          </DetailSection>
        ) : null}
      </div>
    </GenericDrawer>
  );
};

export default ProductCategoryDetail;
