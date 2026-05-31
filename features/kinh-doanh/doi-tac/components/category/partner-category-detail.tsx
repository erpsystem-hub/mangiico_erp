import React, { useMemo, useState } from 'react';
import EnumBadge from '@/components/ui/EnumBadge';
import type { AppResource } from '@/lib/permissions';
import type { PartnerCategory, PartnerKind, PartnerListItem } from '../../core/types';
import {
  buildPartnerCategoryLevelBadgeConfig,
  partnerCategoryTrangThaiBadgeConfig,
  partnerListTrangThaiBadgeConfig,
} from '../../utils/partner-badges';
import { txt } from '@/lib/text';
import {
  Edit,
  Trash2,
  Layers,
  ArrowUpFromLine,
  Calendar,
  Clock,
  Power,
  Plus,
  Folder,
  FileText,
  Hash,
  Users,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
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
import { useCan } from '@/hooks/use-can';
import { PartnerCategoryTableRowActions } from './partner-category-table-row-actions';
import { usePartnerList } from '../../hooks/use-doi-tac-list';
import { formatDate, formatDateTimeShort } from '@/lib/utils';

interface Props {
  kind: PartnerKind;
  categoryResource: AppResource;
  listResource: AppResource;
  data: PartnerCategory;
  allCategories: PartnerCategory[];
  onClose: () => void;
  onEdit: (item: PartnerCategory) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (item: PartnerCategory) => void;
  onAddChild?: (parent: PartnerCategory) => void;
  onViewChild?: (child: PartnerCategory) => void;
  /** Mở detail NL chồng drawer (từ DM cấp 2) */
  onViewPartner?: (item: PartnerListItem) => void;
  onAddPartner?: (danhMucId: string) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const PartnerCategoryDetail: React.FC<Props> = ({
  kind,
  categoryResource,
  listResource,
  data,
  allCategories,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onAddChild,
  onViewChild,
  onViewPartner,
  onAddPartner,
  maxWidthClass = DRAWER_WIDTH_DETAIL,
  stackLevel = 0,
}) => {
  const { canEdit, canDelete, canCreate } = useResourcePermissions(categoryResource);
  const canViewPartners = useCan('view', listResource);
  const canCreatePartner = useCan('create', listResource);
  const [childMenuOpenId, setChildMenuOpenId] = useState<string | null>(null);
  const isActive = data.trang_thai === 'Đang hoạt động';
  const parentDept = data.cha_id ? allCategories.find((d) => d.id === data.cha_id) : null;

  const levelBadgeConfig = useMemo(() => buildPartnerCategoryLevelBadgeConfig(), []);
  const statusBadgeConfig = useMemo(() => partnerCategoryTrangThaiBadgeConfig(), []);
  const partnerStatusBadgeConfig = useMemo(() => partnerListTrangThaiBadgeConfig(), []);
  const isRootLevel = data.cap_do === 1;
  const isLevel2 = data.cap_do === 2;

  const { data: allPartners = [], isLoading: partnersLoading } = usePartnerList(kind, {
    enabled: isLevel2 && canViewPartners,
  });

  const partnersInCategory = useMemo(
    () =>
      allPartners
        .filter((m) => m.danh_muc_id === data.id)
        .sort((a, b) => a.ten_doi_tac.localeCompare(b.ten_doi_tac, 'vi')),
    [allPartners, data.id],
  );

  const children = useMemo(
    () =>
      allCategories
        .filter((d) => d.cha_id === data.id)
        .sort((a, b) => a.thu_tu - b.thu_tu),
    [allCategories, data.id],
  );

  const toolbarActions: DetailToolbarAction[] = [
    ...(onStatusChange && canEdit
      ? [
          {
            label: isActive
              ? txt('partnerCategory.detail.deactivate')
              : txt('partnerCategory.detail.activate'),
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
      title={txt('partnerCategory.detail.title')}
      icon={<Layers size={18} />}
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
              <Layers size={26} className="text-white" />
            </DetailSummaryIconTile>
          }
          title={data.ten_danh_muc}
          badge={<EnumBadge shape="pill" value={data.trang_thai} config={statusBadgeConfig} />}
        />

        {toolbarActions.length > 0 && (
          <DetailToolbar actions={toolbarActions} className="bg-card rounded-xl border border-border" />
        )}

        <DetailSection title={txt('partnerCategory.detail.basicInfo')} icon={<Layers size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField label={txt('partnerCategory.name')} value={data.ten_danh_muc} icon={<Layers size={12} />} />
            <DetailField
              label={txt('partnerCategory.code')}
              value={data.ma_danh_muc ?? ''}
              icon={<Hash size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField
              className={DETAIL_FIELD_SPAN_FULL}
              label={txt('partnerCategory.detail.description')}
              value={data.mo_ta ?? ''}
              icon={<FileText size={12} />}
              emptyText={txt('page.profile.emptyField')}
            />
            <DetailField
              label={txt('partnerCategory.detail.parent')}
              value={parentDept ? parentDept.ten_danh_muc : txt('partnerCategory.detail.noParent')}
              icon={<Folder size={12} />}
              emptyText={txt('partnerCategory.detail.noParent')}
            />
            <DetailField
              label={txt('partnerCategory.detail.level')}
              value={
                <EnumBadge
                  shape="rounded"
                  value={data.cap_do}
                  config={levelBadgeConfig}
                  fallbackLabel={txt('partnerCategory.levelBadge', { level: data.cap_do })}
                />
              }
              icon={<Layers size={12} />}
            />
            <DetailField label={txt('partnerCategory.detail.order')} value={String(data.thu_tu)} icon={<ArrowUpFromLine size={12} />} />
            <DetailField
              label={txt('common.status')}
              value={<EnumBadge shape="pill" value={data.trang_thai} config={statusBadgeConfig} />}
              icon={<Power size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        {isLevel2 ? (
          <DetailSection
            title={txt('partnerCategory.detail.partnersSection')}
            icon={<Users size={14} />}
            variant="primary"
            headerRight={
              canViewPartners ? (
                <>
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
                    {partnersInCategory.length} {txt('partnerCategory.footerRecords')}
                  </span>
                  {canCreatePartner && onAddPartner ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddPartner(data.id)}
                      className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
                    >
                      <Plus size={14} className="mr-1.5" />
                      {txt('partnerCategory.detail.addPartner')}
                    </Button>
                  ) : null}
                </>
              ) : null
            }
          >
            {!canViewPartners ? (
              <p className="text-sm text-muted-foreground">
                {txt('partnerCategory.detail.noPartnerListPermission')}
              </p>
            ) : partnersLoading ? (
              <p className="text-sm text-muted-foreground">{txt('partnerList.loading')}</p>
            ) : partnersInCategory.length === 0 ? (
              <EmptyState
                title={txt('partnerCategory.detail.noPartners')}
                description={txt('partnerCategory.detail.noPartnersHint')}
                icon={<Users className="h-10 w-10 text-muted-foreground" />}
                action={
                  canCreatePartner && onAddPartner ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddPartner(data.id)}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <Plus size={14} className="mr-2" />
                      {txt('partnerCategory.detail.addPartner')}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <EmbeddedChildDataGrid<PartnerListItem>
                rows={partnersInCategory}
                getRowKey={(m) => m.id}
                labelColumn={{
                  header: txt('partnerList.form.name'),
                  minWidthClass: 'min-w-[200px]',
                  renderCell: (m) => (
                    <span className="font-medium text-foreground">{m.ten_doi_tac}</span>
                  ),
                }}
                columns={[
                  {
                    id: 'code',
                    header: txt('partnerList.store.codeCol'),
                    headerClassName: 'min-w-[120px]',
                    cellClassName: 'min-w-[120px]',
                    renderCell: (m) => (
                      <span className="font-mono text-xs text-muted-foreground">{m.ma_doi_tac}</span>
                    ),
                  },
                  {
                    id: 'phone',
                    header: txt('partnerList.store.phoneCol'),
                    headerClassName: 'min-w-[128px]',
                    cellClassName: 'min-w-[128px]',
                    renderCell: (m) => (
                      <span className="text-xs text-muted-foreground">{m.dien_thoai || '—'}</span>
                    ),
                  },
                  {
                    id: 'email',
                    header: txt('partnerList.store.emailCol'),
                    headerClassName: 'min-w-[200px] max-w-[320px]',
                    cellClassName: 'min-w-[200px] max-w-[320px]',
                    renderCell: (m) => (
                      <span className="text-xs text-foreground truncate">{m.email || '—'}</span>
                    ),
                  },
                  {
                    id: 'status',
                    header: txt('common.status'),
                    renderCell: (m) => (
                      <EnumBadge shape="pill" value={m.trang_thai} config={partnerStatusBadgeConfig} />
                    ),
                  },
                ]}
                actionsColumn={{
                  header: txt('common.actions'),
                  widthClass: 'w-[52px] min-w-[52px]',
                  renderCell: (m) =>
                    onViewPartner ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={txt('common.view', 'Xem')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPartner(m);
                        }}
                      >
                        <Eye size={14} />
                      </Button>
                    ) : null,
                }}
                onRowClick={onViewPartner ? (m) => onViewPartner(m) : undefined}
                containerClassName="border-0 shadow-none"
              />
            )}
          </DetailSection>
        ) : null}

        <DetailSection title={txt('partnerCategory.detail.systemInfo')} icon={<Clock size={14} />} variant="primary">
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerCategory.detail.createdAt')}
              value={formatDateTimeShort(data.tg_tao)}
              icon={<Calendar size={12} />}
            />
            <DetailField
              label={txt('partnerCategory.detail.updated')}
              value={formatDate(data.tg_cap_nhat)}
              icon={<Calendar size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        {isRootLevel ? (
          <DetailSection
            title={txt('partnerCategory.detail.childrenSection')}
            icon={<Layers size={14} />}
            variant="primary"
            headerRight={
              <>
                <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium tabular-nums text-primary">
                  {children.length} {txt('partnerCategory.footerRecords')}
                </span>
                {onAddChild && canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onAddChild(data)}
                    className="h-8 shrink-0 bg-primary px-3 text-white shadow-sm hover:bg-primary/90"
                  >
                    <Plus size={14} className="mr-1.5" />
                    {txt('partnerCategory.detail.addChild')}
                  </Button>
                ) : null}
              </>
            }
          >
            {children.length === 0 ? (
              <EmptyState
                title={txt('partnerCategory.detail.noChildren')}
                description={txt('partnerCategory.detail.noChildrenHint')}
                icon={<Folder className="h-10 w-10 text-muted-foreground" />}
                action={
                  onAddChild && canCreate ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddChild(data)}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <Plus size={14} className="mr-2" />
                      {txt('partnerCategory.detail.addChild')}
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <EmbeddedChildDataGrid<PartnerCategory>
                rows={children}
                getRowKey={(child) => child.id}
                labelColumn={{
                  header: txt('partnerCategory.name'),
                  minWidthClass: 'min-w-[200px]',
                  renderCell: (child) => (
                    <span className="font-medium text-foreground">{child.ten_danh_muc}</span>
                  ),
                }}
                columns={[
                  {
                    id: 'desc',
                    header: txt('partnerCategory.store.descCol'),
                    headerClassName: 'min-w-[200px] max-w-[320px]',
                    cellClassName: 'min-w-[200px] max-w-[320px]',
                    renderCell: (child) => (
                      <span className="line-clamp-2 text-xs text-muted-foreground">{child.mo_ta ?? '—'}</span>
                    ),
                  },
                  {
                    id: 'status',
                    header: txt('common.status'),
                    renderCell: (child) => (
                      <EnumBadge shape="pill" value={child.trang_thai} config={statusBadgeConfig} />
                    ),
                  },
                ]}
                actionsColumn={{
                  header: txt('common.actions'),
                  widthClass: 'w-[92px] min-w-[92px]',
                  renderCell: (child) => (
                    <PartnerCategoryTableRowActions
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

export default PartnerCategoryDetail;
