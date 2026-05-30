import React, { useMemo } from 'react';
import { txt } from '@/lib/text';
import { SlidersHorizontal, Ruler } from 'lucide-react';
import MultiSelect from '@/components/ui/MultiSelect';
import FormSection from '@/components/shared/FormSection';
import FormGrid from '@/components/shared/FormGrid';
import { CategoryLinkedFieldList } from './category-linked-field-list';
import type {
  CategoryAttributeLink,
  CategoryMeasurementLink,
} from '../core/types';
import type { ProductAttribute } from '../../thuoc-tinh-hang-hoa/core/types';
import type { MeasurementSpec } from '../../thong-so-do/core/types';

interface Props {
  attributeLinks: CategoryAttributeLink[];
  measurementLinks: CategoryMeasurementLink[];
  attributes: ProductAttribute[];
  measurementSpecs: MeasurementSpec[];
  onAttributeLinksChange: (links: CategoryAttributeLink[]) => void;
  onMeasurementLinksChange: (links: CategoryMeasurementLink[]) => void;
}

const CategoryLinksSection: React.FC<Props> = ({
  attributeLinks,
  measurementLinks,
  attributes,
  measurementSpecs,
  onAttributeLinksChange,
  onMeasurementLinksChange,
}) => {
  const activeAttributes = useMemo(
    () => attributes.filter((a) => a.trang_thai === 'Đang hoạt động'),
    [attributes],
  );
  const activeSpecs = useMemo(
    () => measurementSpecs.filter((s) => s.trang_thai === 'Đang hoạt động'),
    [measurementSpecs],
  );

  const attributeOptions = useMemo(
    () => activeAttributes.map((a) => ({ label: a.ten_hien_thi, value: a.id })),
    [activeAttributes],
  );

  const specOptions = useMemo(
    () =>
      activeSpecs.map((s) => ({
        label: `${s.ten_hien_thi} (${s.don_vi})`,
        value: s.id,
      })),
    [activeSpecs],
  );

  const selectedAttributeIds = useMemo(
    () => attributeLinks.map((l) => l.thuoc_tinh_id),
    [attributeLinks],
  );

  const selectedSpecIds = useMemo(
    () => measurementLinks.map((l) => l.thong_so_do_id),
    [measurementLinks],
  );

  /** Dropdown: tích = thêm; bỏ tích = xóa khỏi danh sách (giữ thứ tự & bắt buộc của mục còn lại). */
  const handleAttributeSelectionChange = (ids: string[]) => {
    const idSet = new Set(ids);
    const kept = attributeLinks
      .filter((l) => idSet.has(l.thuoc_tinh_id))
      .sort((a, b) => a.thu_tu - b.thu_tu);
    const keptIds = new Set(kept.map((l) => l.thuoc_tinh_id));
    let order = kept.length;
    const added: CategoryAttributeLink[] = [];
    for (const id of ids) {
      if (keptIds.has(id)) continue;
      const master = activeAttributes.find((a) => a.id === id);
      if (!master) continue;
      added.push({
        thuoc_tinh_id: id,
        ten_hien_thi: master.ten_hien_thi,
        bat_buoc: false,
        thu_tu: order++,
      });
    }
    onAttributeLinksChange([...kept, ...added].map((l, i) => ({ ...l, thu_tu: i })));
  };

  const handleSpecSelectionChange = (ids: string[]) => {
    const idSet = new Set(ids);
    const kept = measurementLinks
      .filter((l) => idSet.has(l.thong_so_do_id))
      .sort((a, b) => a.thu_tu - b.thu_tu);
    const keptIds = new Set(kept.map((l) => l.thong_so_do_id));
    let order = kept.length;
    const added: CategoryMeasurementLink[] = [];
    for (const id of ids) {
      if (keptIds.has(id)) continue;
      const master = activeSpecs.find((s) => s.id === id);
      if (!master) continue;
      added.push({
        thong_so_do_id: id,
        ten_hien_thi: master.ten_hien_thi,
        don_vi: master.don_vi,
        bat_buoc: false,
        thu_tu: order++,
      });
    }
    onMeasurementLinksChange([...kept, ...added].map((l, i) => ({ ...l, thu_tu: i })));
  };

  const attrListItems = attributeLinks.map((l) => ({
    ...l,
    id: l.thuoc_tinh_id,
  }));

  const specListItems = measurementLinks.map((l) => ({
    ...l,
    id: l.thong_so_do_id,
  }));

  return (
    <FormSection
      title={txt('productCategory.form.linksSectionTitle')}
      icon={<SlidersHorizontal size={14} />}
      variant="muted"
    >
      <FormGrid cols={2}>
        <div className="col-span-1 sm:col-span-1 space-y-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <SlidersHorizontal size={12} className="text-muted-foreground" />
            {txt('productCategory.form.attributesTitle')}
          </p>
          <MultiSelect
            options={attributeOptions}
            value={selectedAttributeIds}
            onChange={handleAttributeSelectionChange}
            placeholder={txt('productCategory.form.addAttribute')}
            icon={SlidersHorizontal}
          />
          <CategoryLinkedFieldList
            items={attrListItems}
            onReorder={(items) =>
              onAttributeLinksChange(
                items.map((row) => ({
                  thuoc_tinh_id: row.thuoc_tinh_id,
                  ten_hien_thi: row.ten_hien_thi,
                  bat_buoc: row.bat_buoc,
                  thu_tu: row.thu_tu,
                })),
              )
            }
            onToggleRequired={(id, bat_buoc) =>
              onAttributeLinksChange(
                attributeLinks.map((l) =>
                  l.thuoc_tinh_id === id ? { ...l, bat_buoc } : l,
                ),
              )
            }
            onRemove={(id) =>
              onAttributeLinksChange(
                attributeLinks
                  .filter((l) => l.thuoc_tinh_id !== id)
                  .map((l, i) => ({ ...l, thu_tu: i })),
              )
            }
            renderLabel={(item) => item.ten_hien_thi}
            emptyMessage={txt('productCategory.form.emptyAttributes')}
          />
        </div>

        <div className="col-span-1 sm:col-span-1 space-y-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Ruler size={12} className="text-muted-foreground" />
            {txt('productCategory.form.measurementsTitle')}
          </p>
          <MultiSelect
            options={specOptions}
            value={selectedSpecIds}
            onChange={handleSpecSelectionChange}
            placeholder={txt('productCategory.form.addMeasurement')}
            icon={Ruler}
          />
          <CategoryLinkedFieldList
            items={specListItems}
            onReorder={(items) =>
              onMeasurementLinksChange(
                items.map((row) => ({
                  thong_so_do_id: row.thong_so_do_id,
                  ten_hien_thi: row.ten_hien_thi,
                  don_vi: row.don_vi,
                  bat_buoc: row.bat_buoc,
                  thu_tu: row.thu_tu,
                })),
              )
            }
            onToggleRequired={(id, bat_buoc) =>
              onMeasurementLinksChange(
                measurementLinks.map((l) =>
                  l.thong_so_do_id === id ? { ...l, bat_buoc } : l,
                ),
              )
            }
            onRemove={(id) =>
              onMeasurementLinksChange(
                measurementLinks
                  .filter((l) => l.thong_so_do_id !== id)
                  .map((l, i) => ({ ...l, thu_tu: i })),
              )
            }
            renderLabel={(item) => (
              <span>
                {item.ten_hien_thi}
                {item.don_vi ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({item.don_vi})
                  </span>
                ) : null}
              </span>
            )}
            emptyMessage={txt('productCategory.form.emptyMeasurements')}
          />
        </div>
      </FormGrid>
    </FormSection>
  );
};

export default CategoryLinksSection;
