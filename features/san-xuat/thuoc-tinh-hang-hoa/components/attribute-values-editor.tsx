import React, { useState } from 'react';
import { txt } from '@/lib/text';
import { List, Plus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { normalizeCacGiaTri } from '../utils/normalize-cac-gia-tri';

interface Props {
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  disabled?: boolean;
}

const AttributeValuesEditor: React.FC<Props> = ({ value, onChange, error, disabled = false }) => {
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const next = normalizeCacGiaTri([...value, trimmed]);
    onChange(next);
    setDraft('');
  };

  const removeValue = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <List size={12} className="shrink-0 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {txt('productAttribute.form.valuesLabel')}
        </span>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground"
            >
              <span className="truncate">{item}</span>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => removeValue(index)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label={txt('productAttribute.form.removeValue', { value: item })}
                >
                  <X size={12} />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{txt('productAttribute.form.valuesEmpty')}</p>
      )}

      {!disabled ? (
        <div className="flex items-start gap-2">
          <Input
            icon={List}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={txt('productAttribute.form.valuesPlaceholder')}
            className="flex-1 min-w-0"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addValue}
            disabled={!draft.trim()}
            className="h-8 shrink-0 px-2.5"
          >
            <Plus className="h-3.5 w-3.5 mr-1 shrink-0" />
            {txt('productAttribute.form.addValue')}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};

export default AttributeValuesEditor;
