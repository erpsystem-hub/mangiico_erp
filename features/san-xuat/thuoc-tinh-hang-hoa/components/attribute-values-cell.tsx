import React from 'react';
import { txt } from '@/lib/text';

const MAX_VISIBLE = 4;

interface Props {
  values: string[];
}

const AttributeValuesCell: React.FC<Props> = ({ values }) => {
  if (!values?.length) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const visible = values.slice(0, MAX_VISIBLE);
  const hiddenCount = values.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1 min-w-0">
      {visible.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex max-w-[140px] truncate rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] text-foreground"
          title={item}
        >
          {item}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span
          className="text-[11px] text-muted-foreground tabular-nums"
          title={values.slice(MAX_VISIBLE).join(', ')}
        >
          {txt('productAttribute.table.moreValues', { count: hiddenCount })}
        </span>
      ) : null}
    </div>
  );
};

export default AttributeValuesCell;
