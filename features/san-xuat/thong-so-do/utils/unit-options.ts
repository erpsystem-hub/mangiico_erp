import type { Option } from '@/components/ui/Combobox';
import { DEFAULT_MEASUREMENT_UNITS } from '../core/constants';

export function buildMeasurementUnitOptions(
  knownUnits: Iterable<string> = [],
  extra?: string | null,
): Option[] {
  const set = new Set<string>(DEFAULT_MEASUREMENT_UNITS);
  for (const u of knownUnits) {
    const t = u?.trim();
    if (t) set.add(t);
  }
  if (extra?.trim()) set.add(extra.trim());
  return [...set]
    .sort((a, b) => a.localeCompare(b, 'vi'))
    .map((u) => ({ label: u, value: u }));
}
