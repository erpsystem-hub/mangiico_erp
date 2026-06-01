import React from 'react';
import { txt } from '@/lib/text';
import { Package, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import GenericSubTableSection from '@/components/shared/GenericSubTableSection';
import type { MaterialCatalogItem } from '@/features/san-xuat/danh-sach-nguyen-lieu/core/types';
import type { ProductCategory } from '@/features/san-xuat/danh-muc-hang-hoa/core/types';
import type { WarehouseSlipLineDraft } from '../core/types';
import type { LoaiHangPhieu } from '../core/constants';
import MaterialSelect from '@/features/kinh-doanh/mua-nguyen-lieu/components/material-select';
import CategoryLineSelect from '@/features/kinh-doanh/don-hang/components/category-line-select';
import { newSlipLineDraft } from '../utils/warehouse-slip-form-mapper';

interface Props {
  lines: WarehouseSlipLineDraft[];
  materials: MaterialCatalogItem[];
  categories: ProductCategory[];
  onChange: (lines: WarehouseSlipLineDraft[]) => void;
}

const WarehouseSlipLinesEditor: React.FC<Props> = ({
  lines,
  materials,
  categories,
  onChange,
}) => {
  const updateLine = (clientId: string, patch: Partial<WarehouseSlipLineDraft>) => {
    onChange(
      lines.map((ln) => (ln.clientId === clientId ? { ...ln, ...patch } : ln)),
    );
  };

  const handleTypeChange = (clientId: string, loai_hang: LoaiHangPhieu) => {
    updateLine(clientId, {
      loai_hang,
      nguyen_lieu_id: loai_hang === 'nguyen_lieu' ? lnOrEmpty(lines, clientId).nguyen_lieu_id : null,
      danh_muc_id: loai_hang === 'thanh_pham' ? lnOrEmpty(lines, clientId).danh_muc_id : null,
    });
  };

  const lnOrEmpty = (all: WarehouseSlipLineDraft[], clientId: string) =>
    all.find((ln) => ln.clientId === clientId) ?? newSlipLineDraft(1);

  const handleMaterialPick = (clientId: string, material: MaterialCatalogItem) => {
    updateLine(clientId, {
      nguyen_lieu_id: material.id,
      don_vi_tinh: material.don_vi_tinh || 'm',
    });
  };

  const handleCategoryPick = (clientId: string, categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    updateLine(clientId, {
      danh_muc_id: categoryId,
      don_vi_tinh: cat?.ma_danh_muc ? 'cái' : 'm',
    });
  };

  const handleDelete = (clientId: string) => {
    onChange(
      lines
        .filter((ln) => ln.clientId !== clientId)
        .map((ln, i) => ({ ...ln, thu_tu: i + 1 })),
    );
  };

  const handleAdd = () => {
    onChange([...lines, newSlipLineDraft(lines.length + 1)]);
  };

  const tableBody =
    lines.length > 0 ? (
      <>
        <thead className="bg-muted/40 sticky top-0 z-[1]">
          <tr>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-8">#</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-36">
              {txt('warehouseSlip.store.itemTypeCol')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground min-w-[200px]">
              {txt('warehouseSlip.store.itemNameCol')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-28">
              {txt('warehouseSlip.store.qtyCol')}
            </th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground w-24">
              {txt('warehouseSlip.store.unitCol')}
            </th>
            <th className="w-[52px]" />
          </tr>
        </thead>
        <tbody>
          {lines.map((ln, idx) => (
            <tr key={ln.clientId} className="border-t border-border align-top">
              <td className="px-2 py-2 text-muted-foreground tabular-nums">{idx + 1}</td>
              <td className="px-2 py-2">
                <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                  <button
                    type="button"
                    className={`flex-1 px-2 py-1.5 ${
                      ln.loai_hang === 'nguyen_lieu'
                        ? 'bg-primary text-white'
                        : 'bg-background text-muted-foreground'
                    }`}
                    onClick={() => handleTypeChange(ln.clientId, 'nguyen_lieu')}
                  >
                    {txt('warehouseSlip.form.itemTypeMaterial')}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 px-2 py-1.5 ${
                      ln.loai_hang === 'thanh_pham'
                        ? 'bg-primary text-white'
                        : 'bg-background text-muted-foreground'
                    }`}
                    onClick={() => handleTypeChange(ln.clientId, 'thanh_pham')}
                  >
                    {txt('warehouseSlip.form.itemTypeProduct')}
                  </button>
                </div>
              </td>
              <td className="px-2 py-2 min-w-[200px]">
                {ln.loai_hang === 'nguyen_lieu' ? (
                  <MaterialSelect
                    compact
                    materials={materials}
                    value={ln.nguyen_lieu_id ?? ''}
                    onChange={(v) => updateLine(ln.clientId, { nguyen_lieu_id: v || null })}
                    onMaterialPick={(m) => handleMaterialPick(ln.clientId, m)}
                    placeholder={txt('warehouseSlip.form.itemTypeMaterial')}
                  />
                ) : (
                  <CategoryLineSelect
                    compact
                    categories={categories}
                    value={ln.danh_muc_id ?? ''}
                    onChange={(v) => {
                      updateLine(ln.clientId, { danh_muc_id: v || null });
                      if (v) handleCategoryPick(ln.clientId, v);
                    }}
                    placeholder={txt('warehouseSlip.form.itemTypeProduct')}
                  />
                )}
              </td>
              <td className="px-2 py-2">
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={ln.so_luong}
                  onChange={(e) =>
                    updateLine(ln.clientId, { so_luong: Number(e.target.value) || 0 })
                  }
                  className="h-9"
                />
              </td>
              <td className="px-2 py-2">
                <Input
                  value={ln.don_vi_tinh}
                  onChange={(e) => updateLine(ln.clientId, { don_vi_tinh: e.target.value })}
                  className="h-9"
                />
              </td>
              <td className="px-1 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => handleDelete(ln.clientId)}
                  aria-label={txt('common.delete')}
                >
                  <Trash2 size={14} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </>
    ) : null;

  return (
    <GenericSubTableSection
      title={txt('warehouseSlip.form.linesSection')}
      icon={<Package size={14} className="text-primary" />}
      count={lines.length}
      addLabel={txt('warehouseSlip.form.addLine')}
      onAdd={handleAdd}
      emptyTitle={txt('warehouseSlip.detail.noLines')}
      emptyDescription={txt('warehouseSlip.form.addLineHint')}
      emptyIcon={<Package className="h-10 w-10 text-muted-foreground" />}
      maxTableHeight="min(360px, 45vh)"
      tableMinWidth={760}
      className="border-0 shadow-none p-0"
    >
      {tableBody}
    </GenericSubTableSection>
  );
};

export default WarehouseSlipLinesEditor;
