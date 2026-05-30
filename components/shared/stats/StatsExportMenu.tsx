import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { txt } from '@/lib/text';
import { FileDown, ChevronDown, Loader2, FileSpreadsheet, FileText, FileType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Z_INDEX_CONTEXT_MENU_CLASS } from '@/lib/dialog-sizes';
import type { StatsExportFormat } from '@/lib/export/stats-report';

export interface StatsExportMenuProps {
  formats?: StatsExportFormat[];
  onExport: (format: StatsExportFormat) => Promise<void>;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}

const MENU_WIDTH_PX = 208;

const FORMAT_META: Record<
  StatsExportFormat,
  { icon: typeof FileSpreadsheet; iconClass: string; bgClass: string; label: string }
> = {
  xlsx: {
    icon: FileSpreadsheet,
    iconClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    get label() {
      return txt('employee.export.excel');
    },
  },
  pdf: {
    icon: FileText,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    get label() {
      return txt('employee.export.pdf');
    },
  },
  docx: {
    icon: FileType,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    get label() {
      return txt('employee.export.docx');
    },
  },
};

const StatsExportMenu: React.FC<StatsExportMenuProps> = ({
  formats = ['xlsx', 'pdf', 'docx'],
  onExport,
  disabled = false,
  compact = false,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(
      8,
      Math.min(rect.right - MENU_WIDTH_PX, window.innerWidth - MENU_WIDTH_PX - 8),
    );
    setMenuPos({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updateMenuPosition();
    const onResize = () => updateMenuPosition();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSelect = async (format: StatsExportFormat) => {
    setIsExporting(true);
    setOpen(false);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  const renderFormatButton = (format: StatsExportFormat, full: boolean) => {
    const meta = FORMAT_META[format];
    const Icon = meta.icon;
    if (full) {
      return (
        <button
          key={format}
          type="button"
          onClick={() => handleSelect(format)}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-muted/60"
        >
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              meta.bgClass,
            )}
          >
            <Icon size={16} className={meta.iconClass} />
          </div>
          <span className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
            {meta.label}
          </span>
        </button>
      );
    }
    return (
      <button
        key={format}
        type="button"
        onClick={() => handleSelect(format)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted/60"
      >
        <Icon size={16} className={meta.iconClass} /> {meta.label}
      </button>
    );
  };

  const menuPortal =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuRef}
        className={cn(
          'fixed w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl',
          Z_INDEX_CONTEXT_MENU_CLASS,
        )}
        style={{ top: menuPos.top, left: menuPos.left }}
        role="menu"
      >
        {compact ? (
          <div className="p-1.5">{formats.map((f) => renderFormatButton(f, false))}</div>
        ) : (
          <>
            <div className="border-b border-border px-3 py-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {txt('employee.stats.selectFormat')}
              </p>
            </div>
            <div className="p-1.5">{formats.map((f) => renderFormatButton(f, true))}</div>
          </>
        )}
      </div>,
      document.body,
    );

  const buttonLabel =
    label ?? (isExporting ? txt('employee.stats.exporting') : txt('employee.stats.exportReport'));

  if (compact) {
    return (
      <div className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          disabled={disabled || isExporting}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm active:scale-95"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {isExporting ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
        </button>
        {menuPortal}
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled || isExporting}
        className={cn(
          'flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium shadow-sm active:scale-95',
          'border-primary bg-primary text-white hover:bg-primary/90',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {isExporting ? (
          <Loader2 size={14} className="shrink-0 animate-spin" />
        ) : (
          <FileDown size={14} className="shrink-0" />
        )}
        <span>{buttonLabel}</span>
        {!isExporting && (
          <ChevronDown size={12} className={cn('transition-transform', open && 'rotate-180')} />
        )}
      </button>
      {menuPortal}
    </div>
  );
};

export default StatsExportMenu;
