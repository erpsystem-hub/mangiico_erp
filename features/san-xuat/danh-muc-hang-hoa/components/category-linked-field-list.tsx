import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { txt } from '@/lib/text';
import { cn } from '@/lib/utils';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

export interface LinkedFieldItem {
  id: string;
  bat_buoc: boolean;
  thu_tu: number;
}

interface SortableRowProps {
  item: LinkedFieldItem;
  renderLabel: (item: LinkedFieldItem) => React.ReactNode;
  onToggleRequired: (id: string, value: boolean) => void;
  onRemove: (id: string) => void;
}

function SortableRow({ item, renderLabel, onToggleRequired, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-2 py-2',
        isDragging && 'opacity-60 shadow-md z-10',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={txt('productCategory.form.dragToReorder')}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1 text-sm font-medium text-foreground">{renderLabel(item)}</div>
      <div className="shrink-0 scale-90 origin-right">
        <ToggleSwitch
          checked={item.bat_buoc}
          onChange={(v) => onToggleRequired(item.id, v)}
          label={txt('productCategory.form.requiredLabel')}
          className="!p-1.5 !gap-2 !rounded-lg"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label={txt('productCategory.form.removeLink')}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export interface CategoryLinkedFieldListProps<T extends LinkedFieldItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  onToggleRequired: (id: string, value: boolean) => void;
  onRemove: (id: string) => void;
  renderLabel: (item: T) => React.ReactNode;
  emptyMessage: string;
}

export function CategoryLinkedFieldList<T extends LinkedFieldItem>({
  items,
  onReorder,
  onToggleRequired,
  onRemove,
  renderLabel,
  emptyMessage,
}: CategoryLinkedFieldListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const moved = arrayMove(items, oldIndex, newIndex).map((row, idx) => ({
      ...row,
      thu_tu: idx,
    }));
    onReorder(moved as T[]);
  };

  if (items.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-3 px-1 text-center border border-dashed border-border rounded-lg">
        {emptyMessage}
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              renderLabel={(row) => renderLabel(row as T)}
              onToggleRequired={onToggleRequired}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
