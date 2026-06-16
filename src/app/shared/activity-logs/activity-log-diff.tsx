'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { PiArrowRight } from 'react-icons/pi';
import cn from '@/utils/class-names';

function isDateString(value: unknown): boolean {
  if (!value || typeof value !== 'string') return false;
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{3,6})?)?(Z|[+-]\d{2}:\d{2})?)?$/;
  return isoDateRegex.test(value) && !Number.isNaN(Date.parse(value));
}

function isHtmlString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /<[a-z][\s\S]*>/i.test(value);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (isDateString(value)) {
    return dayjs(String(value)).format('MMM DD, YYYY [at] HH:mm:ss');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return '(empty)';
    return value.map((item) => formatPrimitive(item) || 'null').join(', ');
  }
  return String(value);
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  if (typeof a === 'object' && typeof b === 'object' && a && b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return false;
}

/** Flatten nested objects into dotted paths for per-field diff */
export function flattenChangeValues(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(
        result,
        flattenChangeValues(value as Record<string, unknown>, path)
      );
    } else {
      result[path] = value;
    }
  }

  return result;
}

export function getChangedFieldEntries(
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>
): Array<{ key: string; oldValue: unknown; newValue: unknown }> {
  const flatOld = flattenChangeValues(oldValues);
  const flatNew = flattenChangeValues(newValues);
  const keys = Array.from(
    new Set([...Object.keys(flatOld), ...Object.keys(flatNew)])
  ).sort();

  return keys
    .filter((key) => !valuesEqual(flatOld[key], flatNew[key]))
    .map((key) => ({
      key,
      oldValue: flatOld[key],
      newValue: flatNew[key],
    }));
}

function formatLabel(key: string): string {
  return key
    .replace(/\./g, ' › ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function ValueDisplay({
  value,
  variant,
}: {
  value: unknown;
  variant: 'old' | 'new';
}) {
  const [expanded, setExpanded] = useState(false);

  if (value === null || value === undefined || value === '') {
    return <span className="italic text-gray-400">(none)</span>;
  }

  if (isHtmlString(value)) {
    const html = String(value);
    const plain = stripHtml(html);
    const isLong = plain.length > 200 || html.length > 500;

    return (
      <div className="space-y-2">
        {!expanded && plain && (
          <p className="line-clamp-4 text-sm text-gray-700 dark:text-gray-300">
            {plain}
          </p>
        )}
        {expanded && (
          <div
            className={cn(
              'max-h-48 overflow-auto rounded border bg-white p-3 text-sm dark:bg-gray-900',
              variant === 'old'
                ? 'border-red-200 dark:border-red-900'
                : 'border-green-200 dark:border-green-900'
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            {expanded ? 'Show preview' : 'Show full HTML'}
          </button>
        )}
        {!isLong && (
          <div
            className="max-h-32 overflow-auto rounded border bg-white p-2 text-sm dark:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    return (
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs text-gray-700 dark:text-gray-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-200">
      {formatPrimitive(value)}
    </div>
  );
}

function DiffRow({
  fieldKey,
  oldValue,
  newValue,
}: {
  fieldKey: string;
  oldValue: unknown;
  newValue: unknown;
}) {
  const isLongField =
    isHtmlString(oldValue) ||
    isHtmlString(newValue) ||
    (typeof oldValue === 'object' && oldValue !== null) ||
    (typeof newValue === 'object' && newValue !== null);

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {formatLabel(fieldKey)}
      </div>

      {isLongField ? (
        <div className="space-y-3">
          <div className="rounded-md bg-red-50 px-3 py-2 dark:bg-red-900/20">
            <div className="mb-1 text-xs font-medium text-red-600 dark:text-red-400">
              Before
            </div>
            <ValueDisplay value={oldValue} variant="old" />
          </div>
          <div className="flex justify-center">
            <PiArrowRight className="h-4 w-4 rotate-90 text-gray-400" />
          </div>
          <div className="rounded-md bg-green-50 px-3 py-2 dark:bg-green-900/20">
            <div className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
              After
            </div>
            <ValueDisplay value={newValue} variant="new" />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="flex-1 rounded-md bg-red-50 px-2 py-1.5 dark:bg-red-900/20">
            <div className="text-xs text-red-600 dark:text-red-400">Before</div>
            <div className="font-medium text-red-700 dark:text-red-300">
              <ValueDisplay value={oldValue} variant="old" />
            </div>
          </div>
          <PiArrowRight className="mt-6 h-4 w-4 shrink-0 text-gray-400" />
          <div className="flex-1 rounded-md bg-green-50 px-2 py-1.5 dark:bg-green-900/20">
            <div className="text-xs text-green-600 dark:text-green-400">After</div>
            <div className="font-medium text-green-700 dark:text-green-300">
              <ValueDisplay value={newValue} variant="new" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityLogChangeDiff({
  oldValues,
  newValues,
}: {
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
}) {
  const changes = getChangedFieldEntries(oldValues, newValues);

  if (changes.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No field-level changes detected.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {changes.length} field{changes.length === 1 ? '' : 's'} changed
      </p>
      {changes.map(({ key, oldValue, newValue }) => (
        <DiffRow key={key} fieldKey={key} oldValue={oldValue} newValue={newValue} />
      ))}
    </div>
  );
}
