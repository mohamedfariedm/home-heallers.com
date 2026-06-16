import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { RateColorRange, RateMetricKey } from '../types/settings';

export const RATE_METRIC_OPTIONS: { key: RateMetricKey; label: string }[] = [
  { key: 'reservation_rate', label: 'Reservation Rate' },
  { key: 'conversion_rate', label: 'Conversion Rate' },
  { key: 'package_conversion', label: 'Package Conversion' },
  { key: 'lead_quality', label: 'Lead Quality Rate' },
];

export const createEmptyRange = (): RateColorRange => ({
  from: 0,
  to: 0,
  color: '#22c55e',
  label: '',
});

export const normalizeRate = (value: number) => {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

function RatePercentInput({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        if (next === '' || /^\d{0,3}$/.test(next)) {
          setDraft(next);
        }
      }}
      onBlur={() => {
        const normalized = normalizeRate(Number(draft || 0));
        setDraft(String(normalized));
        onCommit(normalized);
      }}
      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

interface RateMetricRangesEditorProps {
  metric: RateMetricKey;
  ranges: RateColorRange[];
  onChange: (ranges: RateColorRange[]) => void;
  showMetricHeader?: boolean;
}

const RateMetricRangesEditor: React.FC<RateMetricRangesEditorProps> = ({
  metric,
  ranges,
  onChange,
  showMetricHeader = false,
}) => {
  const metricLabel = RATE_METRIC_OPTIONS.find((item) => item.key === metric)?.label ?? metric;
  const displayRanges = ranges.length > 0 ? ranges : [createEmptyRange()];

  const updateRange = (index: number, patch: Partial<RateColorRange>) => {
    const next = displayRanges.map((range, currentIndex) =>
      currentIndex === index ? { ...range, ...patch } : range
    );
    onChange(next);
  };

  const addRange = () => {
    onChange([...displayRanges, createEmptyRange()]);
  };

  const removeRange = (index: number) => {
    onChange(displayRanges.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-4">
      {showMetricHeader && (
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-lg font-semibold text-gray-900">{metricLabel}</h3>
          <p className="text-xs text-gray-500">{metric}</p>
        </div>
      )}

      {displayRanges.map((range, index) => (
        <div
          key={`${metric}-range-${index}`}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Range #{index + 1}</h4>
            {displayRanges.length > 1 && (
              <button
                type="button"
                onClick={() => removeRange(index)}
                className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">From %</label>
              <RatePercentInput
                value={range.from}
                onCommit={(from) => updateRange(index, { from })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">To %</label>
              <RatePercentInput
                value={range.to}
                onCommit={(to) => updateRange(index, { to })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={range.color || '#22c55e'}
                onChange={(event) => updateRange(index, { color: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Label (optional)
              </label>
              <input
                type="text"
                value={range.label || ''}
                onChange={(event) => updateRange(index, { label: event.target.value })}
                placeholder="Excellent"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRange}
        className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />
        <span>Add Range</span>
      </button>
    </div>
  );
};

export default RateMetricRangesEditor;
