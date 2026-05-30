import React, { useMemo, useState } from 'react';
import EnumBadge from '../../../../components/ui/EnumBadge';
import {
  buildFinanceCategoryLevelBadgeConfig,
  financeCategoryTrangThaiBadgeConfig,
  financeCategoryLoaiBadgeConfig,
} from '../utils/finance-category-badges';
import { txt } from '@/lib/text';
import { Edit, Trash2, Tags, Layers, ArrowUpFromLine, Calendar, Clock, Power, Plus, Folder, FileText, Hash } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import { FinanceCategory } from '../core/types';
import { formatDate, formatDateTimeShort } from '../../../../lib/utils';
import GenericDrawer, { DRAWER_WIDTH_DETAIL } from '../../../../components/shared/GenericDrawer';
import DetailSummaryCard, { DetailSummaryIconTile } from '../../../../components/shared/DetailSummaryCard';
import DetailSection from '../../../../components/shared/DetailSection';
import DetailField from '../../../../components/shared/DetailField';
import DetailFieldGrid, { DETAIL_FIELD_SPAN_FULL } from '../../../../components/shared/DetailFieldGrid';
import DetailToolbar, { DetailToolbarAction } from '../../../../components/shared/DetailToolbar';
import EmptyState from '../../../../components/shared/EmptyState';
import EmbeddedChildDataGrid from '../../../../components/shared/EmbeddedChildDataGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '../../../../lib/button-labels';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { FinanceCategoryTableRowActions } from './finance-category-table-row-actions';

interface Props {
  data: FinanceCategory;
  allCategories: FinanceCategory[];
  onClose: () => void;
  onEdit: (item: FinanceCategory) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: FinanceCategory) => void;
  onAddChild?: (parent: FinanceCategory) => void;
  /** Click dòng con mở detail con (drawer do index render, đóng khi Thêm/Sửa/Xóa/Hủy) */
  onViewChild?: (child: FinanceCategory) => void;
  /** Drawer nhỏ hơn khi là detail con (stackLevel do index truyền) */
  maxWidthClass?: string;
  stackLevel?: number;
}

const FinanceCategoryDetail: React.FC<Props> = ({
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
  const { canEdit, canDelete, canCreate } = useResourcePermissions('financeCategories');
  const [childMenuOpenId, setChildMenuOpenId] = useState<string | null>(null);
  const isActive = data.trang_thai === 'Đang hoạt động';
  const parentDept = data.cha_id ? allCategories.find((d) => d.id === data.cha_id) : null;

  const levelBadgeConfig = useMemo(() => buildFinanceCategoryLevelBadgeConfig(), []);
  const statusBadgeConfig = useMemo(() => financeCategoryTrangThaiBadgeConfig(), []);
  const loaiBadgeConfig = useMemo(() => financeCategoryLoaiBadgeConfig(), []);
  const isRootLevel = data.cap_do === 1;

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
            label: isActive ? txt('financeCategory.detail.deactivate') : txt('financeCategory.detail.activate'),
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
      title={txt('financeCategory.detail.title')}
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
        <DetailSection title={txt('financeCategory.detail.basicInfo')} icon={<Tags size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('financeCategory.name')} value={data.ten_danh_muc} icon={<Tags size={12} />} />
            <DetailField
              label={txt('financeCategory.code')}
              value={data.ma_danh_muc ?? ''}
              icon={<Hash size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField
              label={txt('financeCategory.type')}
              value={<EnumBadge shape="pill" value={data.loai} config={loaiBadgeConfig} />}
              icon={<Tags size={12} />}
            />
            <DetailField
              className={DETAIL_FIELD_SPAN_FULL}
              label={txt('financeCategory.detail.description')}
              value={data.mo_ta ?? ''}
              icon={<FileText size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField label={txt('financeCategory.detail.parent')} value={parentDept ? parentDept.ten_danh_muc : txt('financeCategory.detail.noParent')} icon={<Folder size={12} />} emptyText={txt('financeCategory.detail.noParent')} />
            <DetailField
              label={txt('financeCategory.detail.level')}
              value={
                <EnumBadge
                  shape="rounded"
                  value={data.cap_do}
                  config={levelBadgeConfig}
                  fallbackLabel={txt('financeCategory.levelBadge', { level: data.cap_do })}
                />
              }
              icon={<Layers size={12} />}
            />
            <DetailField label={txt('financeCategory.detail.order')} value={String(data.thu_tu)} icon={<ArrowUpFromLine size={12} />} />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge shape="pill" value={data.trang_thai} config={statusBadgeConfig} />}
              icon={<Power size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        {/* Thông tin hệ thống */}
        <DetailSection title={txt('financeCategory.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('financeCategory.detail.createdAt')} value={formatDateTimeShort(data.tg_tao)} icon={<Calendar size={12} />} />
            <DetailField label={txt('financeCategory.detail.updated')} value={formatDate(data.tg_cap_nhat)} icon={<Calendar size={12} />} />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection
          title={txt('financeCategory.detail.childrenSection')}
          icon={<Tags size={14} />}
          variant="primary"
          headerRight={
            <>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
                {children.length} {txt('financeCategory.footerRecords')}
              </span>
              {onAddChild && canCreate && isRootLevel ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onAddChild(data)}
                  className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
                >
                  <Plus size={14} className="mr-1.5" />
                  {txt('financeCategory.detail.addChild')}
                </Button>
              ) : null}
            </>
          }
        >
          {children.length === 0 ? (
            <EmptyState
              title={txt('financeCategory.detail.noChildren')}
              description={txt('financeCategory.detail.noChildrenHint')}
              icon={<Folder className="h-10 w-10 text-muted-foreground" />}
              action={
                onAddChild && canCreate && isRootLevel ? (
                  <Button type="button" size="sm" onClick={() => onAddChild(data)} className="bg-primary text-white hover:bg-primary/90">
                    <Plus size={14} className="mr-2" />
                    {txt('financeCategory.detail.addChild')}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <EmbeddedChildDataGrid<FinanceCategory>
              rows={children}
              getRowKey={(child) => child.id}
              labelColumn={{
                header: txt('financeCategory.name'),
                minWidthClass: 'min-w-[160px]',
                renderCell: (child) => <span className="font-medium text-foreground">{child.ten_danh_muc}</span>,
              }}
              columns={[
                {
                  id: 'desc',
                  header: txt('financeCategory.store.descCol'),
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
                  <FinanceCategoryTableRowActions
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
      </div>
    </GenericDrawer>
  );
};

export default FinanceCategoryDetail;
