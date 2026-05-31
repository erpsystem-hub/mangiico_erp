import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import {
  Edit,
  Trash2,
  Package,
  Hash,
  ListOrdered,
  FileText,
  Clock,
  Calendar,
  SlidersHorizontal,
  Ruler,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_DETAIL_SMALL } from '@/lib/dialog-sizes';
import DetailSummaryCard, { DetailSummaryIconTile } from '@/components/shared/DetailSummaryCard';
import DetailSection from '@/components/shared/DetailSection';
import DetailField from '@/components/shared/DetailField';
import DetailFieldGrid from '@/components/shared/DetailFieldGrid';
import { BTN_CLOSE, BTN_EDIT, BTN_DELETE } from '@/lib/button-labels';
import { formatCurrency, formatDateTimeShort } from '@/lib/utils';
import type { SalesOrder, SalesOrderLine } from '../core/types';
import { useCategoryLinks } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import {
  mergeLineAttributeValuesWithTemplate,
  mergeLineMeasurementValuesWithTemplate,
} from '../utils/order-line-values';

interface Props {
  order: SalesOrder;
  line: SalesOrderLine;
  onClose: () => void;
  onEdit: (line: SalesOrderLine) => void;
  onDelete: (line: SalesOrderLine) => void;
  canEdit: boolean;
  canDelete: boolean;
  maxWidthClass?: string;
  stackLevel?: number;
}

const DonHangLineDetail: React.FC<Props> = ({
  order,
  line,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  maxWidthClass = DRAWER_WIDTH_DETAIL_SMALL,
  stackLevel = 1,
}) => {
  const sessionReady = useSupabaseReady();
  const danhMucId = line.danh_muc_id;
  const { data: categoryLinks } = useCategoryLinks(danhMucId, {
    enabled: Boolean(danhMucId?.trim()) && sessionReady,
  });

  const attributeRows = useMemo(() => {
    const template = categoryLinks?.attributeLinks ?? [];
    if (!template.length) return line.thuoc_tinh_values ?? [];
    return mergeLineAttributeValuesWithTemplate(template, line.thuoc_tinh_values ?? []).map(
      (v) => {
        const meta = template.find((t) => t.thuoc_tinh_id === v.thuoc_tinh_id);
        return {
          ...v,
          ten_hien_thi: meta?.ten_hien_thi ?? v.thuoc_tinh_id,
          bat_buoc: meta?.bat_buoc,
        };
      },
    );
  }, [categoryLinks?.attributeLinks, line.thuoc_tinh_values]);

  const measurementRows = useMemo(() => {
    const template = categoryLinks?.measurementLinks ?? [];
    if (!template.length) return line.thong_so_do_values ?? [];
    return mergeLineMeasurementValuesWithTemplate(template, line.thong_so_do_values ?? []).map(
      (v) => {
        const meta = template.find((t) => t.thong_so_do_id === v.thong_so_do_id);
        return {
          ...v,
          ten_hien_thi: meta?.ten_hien_thi ?? v.thong_so_do_id,
          don_vi: meta?.don_vi ?? '',
          bat_buoc: meta?.bat_buoc,
        };
      },
    );
  }, [categoryLinks?.measurementLinks, line.thong_so_do_values]);

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
              onClick={() => onEdit(line)}
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
              onClick={() => onDelete(line)}
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
      title={txt('salesOrder.detail.lineDetailTitle')}
      subtitle={`${line.ten_danh_muc} · ${order.ma_don_hang}`}
      icon={<Package size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={maxWidthClass}
      stackLevel={stackLevel}
    >
      <div className="space-y-5">
        <DetailSummaryCard
          leading={
            <DetailSummaryIconTile>
              <Package size={28} />
            </DetailSummaryIconTile>
          }
          title={line.ten_danh_muc}
          subtitle={line.ma_danh_muc ?? undefined}
        >
          <p className="text-lg font-semibold text-primary tabular-nums">
            {formatCurrency(line.thanh_tien)}
          </p>
        </DetailSummaryCard>

        <DetailSection title={txt('salesOrder.form.linesSection')} icon={<Package size={14} />}>
          <DetailFieldGrid>
            <DetailField
              label={txt('partnerList.store.codeCol')}
              value={line.ma_danh_muc ?? undefined}
              icon={<Hash size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.category')}
              value={line.ten_danh_muc}
              icon={<Package size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.qty')}
              value={`${line.so_luong} ${line.don_vi_tinh}`}
              icon={<ListOrdered size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.unitPrice')}
              value={formatCurrency(line.don_gia)}
              icon={<Hash size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.lineTotal')}
              value={formatCurrency(line.thanh_tien)}
              icon={<Hash size={12} />}
            />
            <DetailField
              label={txt('salesOrder.form.lineNote')}
              value={line.ghi_chu ?? undefined}
              icon={<FileText size={12} />}
            />
          </DetailFieldGrid>
        </DetailSection>

        <DetailSection
          title={txt('salesOrder.form.attributesSection')}
          icon={<SlidersHorizontal size={14} />}
        >
          {attributeRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{txt('salesOrder.form.attributesEmpty')}</p>
          ) : (
            <DetailFieldGrid>
              {attributeRows.map((attr) => (
                <DetailField
                  key={attr.thuoc_tinh_id}
                  label={attr.ten_hien_thi}
                  value={attr.gia_tri?.trim() ? attr.gia_tri : undefined}
                  icon={<SlidersHorizontal size={12} />}
                />
              ))}
            </DetailFieldGrid>
          )}
        </DetailSection>

        <DetailSection title={txt('salesOrder.form.measurementsSection')} icon={<Ruler size={14} />}>
          {measurementRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">{txt('salesOrder.form.measurementsEmpty')}</p>
          ) : (
            <DetailFieldGrid>
              {measurementRows.map((spec) => (
                <DetailField
                  key={spec.thong_so_do_id}
                  label={`${spec.ten_hien_thi}${spec.don_vi ? ` (${spec.don_vi})` : ''}`}
                  value={
                    spec.gia_tri != null
                      ? `${spec.gia_tri}${spec.don_vi ? ` ${spec.don_vi}` : ''}`
                      : undefined
                  }
                  icon={<Ruler size={12} />}
                />
              ))}
            </DetailFieldGrid>
          )}
        </DetailSection>

        {line.tg_tao || line.tg_cap_nhat ? (
          <DetailSection title={txt('salesOrder.detail.systemInfo')} icon={<Clock size={14} />}>
            <DetailFieldGrid>
              {line.tg_tao ? (
                <DetailField
                  label={txt('partnerCategory.detail.createdAt')}
                  value={formatDateTimeShort(line.tg_tao)}
                  icon={<Calendar size={12} />}
                />
              ) : null}
              {line.tg_cap_nhat ? (
                <DetailField
                  label={txt('partnerCategory.detail.updated')}
                  value={formatDateTimeShort(line.tg_cap_nhat)}
                  icon={<Calendar size={12} />}
                />
              ) : null}
            </DetailFieldGrid>
          </DetailSection>
        ) : null}
      </div>
    </GenericDrawer>
  );
};

export default DonHangLineDetail;
