'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PiPlusBold, PiTrashBold, PiArrowUp, PiArrowDown } from 'react-icons/pi';
import type { LocaleListMap } from '@/types/offer';
import type { OfferLocale } from '@/types/offer';

export default function LocaleListEditor({
  label,
  hint,
  value,
  locale,
  onChange,
  numbered,
  chips,
  disabled,
}: {
  label: string;
  hint?: string;
  value: LocaleListMap;
  locale: OfferLocale;
  onChange: (next: LocaleListMap) => void;
  numbered?: boolean;
  chips?: boolean;
  disabled?: boolean;
}) {
  const rows = value?.[locale] ?? [];

  const setRows = (nextRows: string[]) => {
    onChange({
      ...value,
      [locale]: nextRows,
    });
  };

  const addRow = (text = '') => setRows([...rows, text]);
  const removeRow = (index: number) => setRows(rows.filter((_, i) => i !== index));
  const updateRow = (index: number, text: string) =>
    setRows(rows.map((row, i) => (i === index ? text : row)));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...rows];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
  };

  if (chips) {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">{label}</label>
        {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}
        <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 p-2">
          {rows.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs"
            >
              {tag}
              {!disabled && (
                <button type="button" onClick={() => removeRow(index)} aria-label={`Remove ${tag}`}>
                  ×
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <input
              className="min-w-[120px] flex-1 bg-transparent text-sm outline-none"
              placeholder="Type and press Enter"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const next = e.currentTarget.value.trim();
                if (!next) return;
                addRow(next);
                e.currentTarget.value = '';
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {!disabled && (
          <Button type="button" size="sm" variant="outline" onClick={() => addRow('')}>
            <PiPlusBold className="me-1 h-3.5 w-3.5" />
            Add
          </Button>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {rows.length === 0 && (
        <p className="text-sm text-gray-400">No items yet.</p>
      )}
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          {numbered && (
            <span className="w-6 text-sm font-semibold text-gray-500">{index + 1}.</span>
          )}
          <Input
            value={row}
            onChange={(e) => updateRow(index, e.target.value)}
            disabled={disabled}
          />
          {!disabled && (
            <>
              <Button type="button" size="sm" variant="text" onClick={() => move(index, -1)} aria-label="Move up">
                <PiArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="text" onClick={() => move(index, 1)} aria-label="Move down">
                <PiArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="sm" variant="text" onClick={() => removeRow(index)} aria-label="Remove">
                <PiTrashBold className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
