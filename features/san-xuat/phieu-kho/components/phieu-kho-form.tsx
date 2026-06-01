import React, { useEffect, useMemo, useState } from 'react';
import { txt } from '@/lib/text';
import { toast } from 'sonner';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ScrollText,
  Calendar,
  FileText,
  ArrowDownUp,
  Tag,
  Download,
} from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Combobox from '@/components/ui/Combobox';
import Button from '@/components/ui/Button';
import { warehouseSlipSchema, type WarehouseSlipFormValues } from '../core/schema';
import type { WarehouseSlip, WarehouseSlipLineDraft } from '../core/types';
import type { TrangThaiPhieuKho } from '../core/constants';
import {
  LOAI_PHIEU_KHO,
  MUC_DICH_NHAP,
  mucDichOptionsForLoai,
  needsKhoDich,
} from '../core/constants';
import {
  useUpsertWarehouseSlip,
  useWarehouses,
  useBomLinesForProductionOrder,
  usePurchaseLinesForImport,
  useProductionOrderProducts,
} from '../hooks/use-phieu-kho';
import { useProductionOrders } from '@/features/san-xuat/lenh-san-xuat/hooks/use-lenh-san-xuat';
import { usePurchaseOrders } from '@/features/kinh-doanh/mua-nguyen-lieu/hooks/use-don-mua-nguyen-lieu';
import { useMaterialCatalogList } from '@/features/san-xuat/danh-sach-nguyen-lieu/hooks/use-danh-sach-nguyen-lieu';
import { useProductCategories } from '@/features/san-xuat/danh-muc-hang-hoa/hooks/use-danh-muc-hang-hoa';
import { useSupabaseReady } from '@/lib/supabase/use-supabase-list-enabled';
import GenericDrawer from '@/components/shared/GenericDrawer';
import { DRAWER_WIDTH_FORM, getDrawerWidthClass } from '@/lib/dialog-sizes';
import FormSection from '@/components/shared/FormSection';
import FormGrid, { FORM_GRID_SPAN_FULL } from '@/components/shared/FormGrid';
import WarehouseSelect from './warehouse-select';
import ProductionOrderSelect from './production-order-select';
import PurchaseOrderSelect from './purchase-order-select';
import WarehouseSlipLinesEditor from './warehouse-slip-lines-editor';
import ProductionOrderProductsEditor, {
  type ProductQtyMap,
} from './production-order-products-editor';
import {
  draftRowsToFormLines,
  formLinesToDraftRows,
  slipLinesToDraftRows,
  warehouseSlipToFormValues,
} from '../utils/warehouse-slip-form-mapper';
import { BTN_CANCEL } from '@/lib/button-labels';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_VALUES: WarehouseSlipFormValues = {
  ma_phieu_kho: '',
  loai_phieu: 'Nhập',
  muc_dich: MUC_DICH_NHAP[0],
  kho_id: '',
  kho_dich_id: null,
  ngay_phieu: todayIsoDate(),
  chi_nhanh_id: null,
  nhan_vien_id: null,
  don_hang_id: null,
  don_mua_id: null,
  ghi_chu: null,
  trang_thai: 'Nháp',
  lines: [],
};

interface Props {
  initialData?: WarehouseSlip | null;
  onClose: () => void;
  onSaved?: (saved: WarehouseSlip) => void;
  maxWidthClass?: string;
  stackLevel?: number;
}

const PhieuKhoForm: React.FC<Props> = ({
  initialData,
  onClose,
  onSaved,
  maxWidthClass,
  stackLevel = 0,
}) => {
  const isEdit = !!initialData;
  const sessionReady = useSupabaseReady();
  const upsertMutation = useUpsertWarehouseSlip((saved) => {
    onSaved?.(saved);
    onClose();
  });

  const { data: warehouses = [] } = useWarehouses({ enabled: sessionReady });
  const { data: productionOrders = [] } = useProductionOrders({ enabled: sessionReady });
  const { data: purchaseOrders = [] } = usePurchaseOrders({ enabled: sessionReady });
  const { data: materials = [] } = useMaterialCatalogList({ enabled: sessionReady });
  const { data: categories = [] } = useProductCategories({ enabled: sessionReady });

  const [draftLines, setDraftLines] = useState<WarehouseSlipLineDraft[]>(() =>
    initialData?.lines?.length ? slipLinesToDraftRows(initialData.lines) : [],
  );

  /** SL nhập cho từng danh_muc_id (chỉ dùng khi isNhapSanXuatByOrder) */
  const [nhapByProduct, setNhapByProduct] = useState<ProductQtyMap>(() => {
    if (
      initialData?.muc_dich === 'Nhập sản xuất' &&
      initialData.don_hang_id &&
      initialData.lines?.length
    ) {
      const map: ProductQtyMap = {};
      for (const ln of initialData.lines) {
        if (ln.loai_hang === 'thanh_pham' && ln.danh_muc_id) {
          map[String(ln.danh_muc_id)] =
            (map[String(ln.danh_muc_id)] ?? 0) + Number(ln.so_luong);
        }
      }
      return map;
    }
    return {};
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<WarehouseSlipFormValues>({
    resolver: zodResolver(warehouseSlipSchema) as Resolver<WarehouseSlipFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  const loaiPhieu = watch('loai_phieu');
  const mucDich = watch('muc_dich');
  const donHangId = watch('don_hang_id')?.trim() || undefined;
  const donMuaId = watch('don_mua_id')?.trim() || undefined;

  const isNhapSanXuatByOrder =
    loaiPhieu === 'Nhập' && mucDich === 'Nhập sản xuất' && Boolean(donHangId);

  const { refetch: refetchBom, isFetching: isImportingBom } = useBomLinesForProductionOrder(
    donHangId,
    { enabled: false },
  );
  const { refetch: refetchPurchase, isFetching: isImportingPurchase } =
    usePurchaseLinesForImport(donMuaId, { enabled: false });

  const {
    data: orderProductsData,
    isLoading: isLoadingOrderProducts,
  } = useProductionOrderProducts(
    isNhapSanXuatByOrder ? donHangId : undefined,
    initialData?.id ? String(initialData.id) : undefined,
    { enabled: isNhapSanXuatByOrder },
  );

  const mucDichOptions = useMemo(
    () =>
      mucDichOptionsForLoai(loaiPhieu).map((md) => ({
        value: md,
        label: md,
      })),
    [loaiPhieu],
  );

  const loaiOptions = LOAI_PHIEU_KHO.map((loai) => ({ value: loai, label: loai }));

  useEffect(() => {
    if (initialData) {
      reset(warehouseSlipToFormValues(initialData));
      setDraftLines(
        initialData.lines?.length ? slipLinesToDraftRows(initialData.lines) : [],
      );
      if (initialData.muc_dich === 'Nhập sản xuất' && initialData.don_hang_id) {
        const map: ProductQtyMap = {};
        for (const ln of initialData.lines ?? []) {
          if (ln.loai_hang === 'thanh_pham' && ln.danh_muc_id) {
            map[String(ln.danh_muc_id)] =
              (map[String(ln.danh_muc_id)] ?? 0) + Number(ln.so_luong);
          }
        }
        setNhapByProduct(map);
      } else {
        setNhapByProduct({});
      }
    } else {
      reset({ ...DEFAULT_VALUES, ngay_phieu: todayIsoDate() });
      setDraftLines([]);
      setNhapByProduct({});
    }
  }, [initialData, reset]);

  useEffect(() => {
    const allowed = mucDichOptionsForLoai(loaiPhieu);
    if (!allowed.includes(mucDich as (typeof allowed)[number])) {
      setValue('muc_dich', allowed[0]);
    }
    if (loaiPhieu === 'Xuất') {
      setValue('don_mua_id', null);
    }
    // don_hang_id is shared: used by Xuất sản xuất AND Nhập sản xuất; only clear for non-relevant types
    if (loaiPhieu !== 'Nhập' && loaiPhieu !== 'Xuất') {
      setValue('don_hang_id', null);
    }
  }, [loaiPhieu, mucDich, setValue]);

  useEffect(() => {
    if (!needsKhoDich(mucDich)) {
      setValue('kho_dich_id', null);
    }
    // Clear don_hang_id when switching away from Nhập sản xuất (or Xuất sản xuất)
    if (mucDich !== 'Nhập sản xuất' && mucDich !== 'Xuất sản xuất') {
      setValue('don_hang_id', null);
    }
  }, [mucDich, setValue]);

  // When orderProducts load fresh for a new slip, set nhapByProduct = còn lại
  useEffect(() => {
    if (!orderProductsData || isEdit) return;
    const { products, receivedByProduct } = orderProductsData;
    const map: ProductQtyMap = {};
    for (const p of products) {
      const received = receivedByProduct[p.danh_muc_id] ?? 0;
      const remaining = Math.max(0, p.so_luong_lenh - received);
      map[p.danh_muc_id] = remaining;
    }
    setNhapByProduct(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderProductsData]);

  const showImportBom = loaiPhieu === 'Xuất' && mucDich === 'Xuất sản xuất' && Boolean(donHangId);
  const showImportPurchase =
    loaiPhieu === 'Nhập' && mucDich === 'Nhập mua hàng' && Boolean(donMuaId);
  const showProductionOrderSelector =
    (loaiPhieu === 'Xuất' && mucDich === 'Xuất sản xuất') ||
    (loaiPhieu === 'Nhập' && mucDich === 'Nhập sản xuất');

  const saveSlip = (data: WarehouseSlipFormValues, status: TrangThaiPhieuKho) => {
    let lines;
    if (isNhapSanXuatByOrder && orderProductsData) {
      const { products } = orderProductsData;
      lines = products
        .filter((p) => (nhapByProduct[p.danh_muc_id] ?? 0) > 0)
        .map((p, i) => ({
          loai_hang: 'thanh_pham' as const,
          nguyen_lieu_id: null,
          danh_muc_id: p.danh_muc_id,
          so_luong: nhapByProduct[p.danh_muc_id] ?? 0,
          don_vi_tinh: p.don_vi_tinh,
          ghi_chu: null,
          thu_tu: i + 1,
        }));
    } else {
      lines = draftRowsToFormLines(draftLines);
    }

    if (lines.length === 0) {
      toast.error(txt('warehouseSlip.validation.linesRequired'));
      return;
    }
    if (needsKhoDich(data.muc_dich) && !data.kho_dich_id?.trim()) {
      toast.error(txt('warehouseSlip.validation.destWarehouseRequired'));
      return;
    }
    upsertMutation.mutate({
      id: initialData?.id,
      data: {
        ...data,
        ma_phieu_kho: data.ma_phieu_kho?.trim() || null,
        kho_dich_id: data.kho_dich_id?.trim() || null,
        chi_nhanh_id: data.chi_nhanh_id?.trim() || null,
        nhan_vien_id: data.nhan_vien_id?.trim() || null,
        don_hang_id: data.don_hang_id?.trim() || null,
        don_mua_id: data.don_mua_id?.trim() || null,
        ghi_chu: data.ghi_chu?.trim() || null,
        trang_thai: status,
        lines,
      },
    });
  };


  const onInvalid = () => {
    toast.error(txt('warehouseSlip.form.validationError'));
  };

  const submitWithStatus = (status: TrangThaiPhieuKho) => {
    setValue('trang_thai', status);

    // Khi đang dùng bảng sản phẩm theo đơn, lines trong form rỗng (Zod sẽ fail).
    // Sync nhapByProduct → form lines trước khi Zod validate.
    if (isNhapSanXuatByOrder && orderProductsData) {
      const syncedLines = orderProductsData.products
        .filter((p) => (nhapByProduct[p.danh_muc_id] ?? 0) > 0)
        .map((p, i) => ({
          loai_hang: 'thanh_pham' as const,
          nguyen_lieu_id: null as string | null,
          danh_muc_id: p.danh_muc_id,
          so_luong: nhapByProduct[p.danh_muc_id] ?? 0,
          don_vi_tinh: p.don_vi_tinh,
          ghi_chu: null as string | null,
          thu_tu: i + 1,
        }));
      setValue('lines', syncedLines);
    }

    void handleSubmit((data) => saveSlip(data, status), onInvalid)();
  };

  const handleImportBom = async () => {
    if (!donHangId) return;
    const result = await refetchBom();
    const imported = result.data ?? [];
    if (imported.length === 0) {
      toast.error(txt('warehouseSlip.detail.noLines'));
      return;
    }
    setDraftLines(formLinesToDraftRows(imported));
    toast.success(txt('warehouseSlip.toast.importBomSuccess'));
  };

  const handleImportPurchase = async () => {
    if (!donMuaId) return;
    const result = await refetchPurchase();
    const imported = result.data ?? [];
    if (imported.length === 0) {
      toast.error(txt('warehouseSlip.detail.noLines'));
      return;
    }
    setDraftLines(formLinesToDraftRows(imported));
    toast.success(txt('warehouseSlip.toast.importPurchaseSuccess'));
  };

  const drawerWidth =
    maxWidthClass ?? (stackLevel > 0 ? getDrawerWidthClass(stackLevel) : DRAWER_WIDTH_FORM);

  const renderFooter = (
    <div className="flex items-center justify-between w-full gap-2 flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="h-8 px-3 text-xs border-border text-muted-foreground"
      >
        {BTN_CANCEL()}
      </Button>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={upsertMutation.isPending}
          onClick={() => submitWithStatus('Nháp')}
          className="h-8 px-3 text-xs"
        >
          {txt('warehouseSlip.form.saveDraft')}
        </Button>
        <Button
          type="button"
          size="sm"
          isLoading={upsertMutation.isPending}
          onClick={() => submitWithStatus('Hoàn thành')}
          className="h-8 px-3 text-xs bg-primary text-white shadow-sm hover:bg-primary/90"
        >
          {txt('warehouseSlip.form.saveComplete')}
        </Button>
      </div>
    </div>
  );

  return (
    <GenericDrawer
      title={isEdit ? txt('warehouseSlip.form.editTitle') : txt('warehouseSlip.form.createTitle')}
      subtitle={initialData?.ma_phieu_kho}
      icon={<ScrollText size={20} />}
      onClose={onClose}
      footer={renderFooter}
      maxWidthClass={drawerWidth}
      stackLevel={stackLevel}
    >
      <form id="phieu-kho-form" className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <FormSection title={txt('warehouseSlip.detail.slipInfo')} icon={<ScrollText size={14} />}>
          <FormGrid>
            <Controller
              name="loai_phieu"
              control={control}
              render={({ field }) => (
                <Combobox
                  label={txt('warehouseSlip.form.type')}
                  icon={ArrowDownUp}
                  required
                  options={loaiOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                  error={errors.loai_phieu?.message}
                  dropdownInPortal
                />
              )}
            />
            <Controller
              name="muc_dich"
              control={control}
              render={({ field }) => (
                <Combobox
                  label={txt('warehouseSlip.form.purpose')}
                  icon={Tag}
                  required
                  options={mucDichOptions}
                  value={field.value}
                  onChange={(v) => field.onChange(String(v ?? ''))}
                  error={errors.muc_dich?.message}
                  dropdownInPortal
                />
              )}
            />
            <Controller
              name="kho_id"
              control={control}
              render={({ field }) => (
                <WarehouseSelect
                  warehouses={warehouses}
                  value={field.value}
                  onChange={field.onChange}
                  label={txt('warehouseSlip.form.warehouse')}
                  required
                  error={errors.kho_id?.message}
                />
              )}
            />
            {needsKhoDich(mucDich) ? (
              <Controller
                name="kho_dich_id"
                control={control}
                render={({ field }) => (
                  <WarehouseSelect
                    warehouses={warehouses.filter((w) => w.id !== watch('kho_id'))}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    label={txt('warehouseSlip.form.destWarehouse')}
                    required
                    error={errors.kho_dich_id?.message}
                  />
                )}
              />
            ) : null}
            <Input
              label={txt('warehouseSlip.form.slipDate')}
              icon={Calendar}
              type="date"
              required
              error={errors.ngay_phieu?.message}
              {...register('ngay_phieu')}
            />
            {showProductionOrderSelector ? (
              <Controller
                name="don_hang_id"
                control={control}
                render={({ field }) => (
                  <ProductionOrderSelect
                    orders={productionOrders}
                    value={field.value ?? ''}
                    onChange={(v) => {
                      field.onChange(v);
                      // Reset nhapByProduct when order changes
                      setNhapByProduct({});
                    }}
                    label={txt('warehouseSlip.form.productionOrder')}
                    placeholder={txt('warehouseSlip.form.productionOrderPlaceholder')}
                  />
                )}
              />
            ) : null}
            {loaiPhieu === 'Nhập' && mucDich === 'Nhập mua hàng' ? (
              <Controller
                name="don_mua_id"
                control={control}
                render={({ field }) => (
                  <PurchaseOrderSelect
                    orders={purchaseOrders}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    label={txt('warehouseSlip.form.purchaseOrder')}
                    placeholder={txt('warehouseSlip.form.purchaseOrderPlaceholder')}
                  />
                )}
              />
            ) : null}
            <div className={FORM_GRID_SPAN_FULL}>
              <Textarea
                label={txt('warehouseSlip.form.note')}
                icon={FileText}
                rows={3}
                error={errors.ghi_chu?.message}
                {...register('ghi_chu')}
              />
            </div>
          </FormGrid>
        </FormSection>

        <div className="space-y-3">
          {isNhapSanXuatByOrder ? (
            isLoadingOrderProducts ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {txt('warehouseSlip.form.orderProductsLoading')}
              </p>
            ) : (
              <ProductionOrderProductsEditor
                products={orderProductsData?.products ?? []}
                receivedByProduct={orderProductsData?.receivedByProduct ?? {}}
                value={nhapByProduct}
                onChange={setNhapByProduct}
              />
            )
          ) : (
            <>
              {(showImportBom || showImportPurchase) && (
                <div className="flex flex-wrap gap-2">
                  {showImportBom ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      isLoading={isImportingBom}
                      onClick={() => void handleImportBom()}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Download size={14} />
                      {txt('warehouseSlip.form.importFromBom')}
                    </Button>
                  ) : null}
                  {showImportPurchase ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      isLoading={isImportingPurchase}
                      onClick={() => void handleImportPurchase()}
                      className="h-8 text-xs gap-1.5"
                    >
                      <Download size={14} />
                      {txt('warehouseSlip.form.importFromPurchase')}
                    </Button>
                  ) : null}
                </div>
              )}

              <WarehouseSlipLinesEditor
                lines={draftLines}
                materials={materials}
                categories={categories}
                onChange={setDraftLines}
              />
            </>
          )}
        </div>
      </form>
    </GenericDrawer>
  );
};

export default PhieuKhoForm;
