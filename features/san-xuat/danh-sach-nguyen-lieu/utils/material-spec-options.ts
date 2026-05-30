import type { Option } from '@/components/ui/Combobox';
import type { MaterialCatalogItem } from '../core/types';
import {
  DEFAULT_MATERIAL_COLORS,
  DEFAULT_MATERIAL_COMPOSITIONS,
  DEFAULT_MATERIAL_GSM,
  DEFAULT_MATERIAL_ORIGINS,
  DEFAULT_MATERIAL_UNITS,
  DEFAULT_MATERIAL_WIDTHS,
} from '../core/material-spec-constants';

function buildOptions(
  defaults: readonly string[],
  known: Iterable<string>,
  extra?: string | null,
): Option[] {
  const set = new Set<string>(defaults);
  for (const v of known) {
    const t = v?.trim();
    if (t) set.add(t);
  }
  if (extra?.trim()) set.add(extra.trim());
  return [...set]
    .sort((a, b) => a.localeCompare(b, 'vi'))
    .map((u) => ({ label: u, value: u }));
}

export interface MaterialSpecComboboxOptions {
  unitOptions: Option[];
  colorOptions: Option[];
  compositionOptions: Option[];
  widthOptions: Option[];
  gsmOptions: Option[];
  originOptions: Option[];
}

export function buildMaterialSpecComboboxOptions(
  items: MaterialCatalogItem[] = [],
  extras?: Partial<{
    don_vi_tinh: string;
    mau_sac: string;
    thanh_phan: string;
    kho_vai: string;
    dinh_luong_gsm: number | null;
    xuat_xu: string;
  }>,
): MaterialSpecComboboxOptions {
  const units: string[] = [];
  const colors: string[] = [];
  const compositions: string[] = [];
  const widths: string[] = [];
  const gsmList: string[] = [];
  const origins: string[] = [];

  for (const item of items) {
    if (item.don_vi_tinh?.trim()) units.push(item.don_vi_tinh.trim());
    if (item.mau_sac?.trim()) colors.push(item.mau_sac.trim());
    if (item.thanh_phan?.trim()) compositions.push(item.thanh_phan.trim());
    if (item.kho_vai?.trim()) widths.push(item.kho_vai.trim());
    if (item.dinh_luong_gsm != null && !Number.isNaN(item.dinh_luong_gsm)) {
      gsmList.push(String(item.dinh_luong_gsm));
    }
    if (item.xuat_xu?.trim()) origins.push(item.xuat_xu.trim());
  }

  const gsmExtra =
    extras?.dinh_luong_gsm != null && !Number.isNaN(extras.dinh_luong_gsm)
      ? String(extras.dinh_luong_gsm)
      : null;

  return {
    unitOptions: buildOptions(DEFAULT_MATERIAL_UNITS, units, extras?.don_vi_tinh),
    colorOptions: buildOptions(DEFAULT_MATERIAL_COLORS, colors, extras?.mau_sac),
    compositionOptions: buildOptions(
      DEFAULT_MATERIAL_COMPOSITIONS,
      compositions,
      extras?.thanh_phan,
    ),
    widthOptions: buildOptions(DEFAULT_MATERIAL_WIDTHS, widths, extras?.kho_vai),
    gsmOptions: buildOptions(DEFAULT_MATERIAL_GSM, gsmList, gsmExtra),
    originOptions: buildOptions(DEFAULT_MATERIAL_ORIGINS, origins, extras?.xuat_xu),
  };
}
