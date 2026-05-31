import type { PartnerCategory } from '../core/types';

export function getVisiblePartnerCategoryIdsUnderRoots(
  categories: PartnerCategory[],
  rootIds: string[],
): Set<string> {
  const visibleIds = new Set<string>();
  let current = new Set<string>(rootIds);
  while (current.size > 0) {
    current.forEach((id) => visibleIds.add(id));
    const next = new Set<string>();
    categories.forEach((d) => {
      if (d.cha_id && current.has(d.cha_id)) next.add(d.id);
    });
    current = next;
  }
  return visibleIds;
}
