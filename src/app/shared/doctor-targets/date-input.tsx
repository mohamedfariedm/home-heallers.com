'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import { PiCalendarBlank } from 'react-icons/pi';
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from '@floating-ui/react';
import {
  formatIsoDate,
  isoToDisplayDate,
  parseDisplayDate,
  parseIsoDate,
  DATE_DISPLAY_FORMAT,
} from './dates';

type DateInputProps = {
  label?: string;
  value?: string;
  onChange: (isoDate: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
};

function maskDigits(raw: string) {
  const digits = raw.replace(/[^\d]/g, '').slice(0, 8);
  if (digits.length > 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  }
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

const compactCalendarClassName = [
  '!shadow-none !border-0',
  '[&.react-datepicker>div]:!pt-1.5 [&.react-datepicker>div]:!pb-0.5',
  '[&.react-datepicker>button]:!top-1.5 [&.react-datepicker>button]:!h-5 [&.react-datepicker>button]:!w-5',
].join(' ');

const compactPopoverClassName = [
  'rounded-md border border-gray-200 bg-white p-1 shadow-xl dark:border-gray-600 dark:bg-gray-100',
  '[&_.react-datepicker]:border-0 [&_.react-datepicker]:bg-transparent',
  '[&_.react-datepicker__header]:!p-1 [&_.react-datepicker__header]:!pb-0',
  '[&_.react-datepicker__current-month]:!mb-0.5 [&_.react-datepicker__current-month]:!text-xs',
  '[&_.react-datepicker__month-container]:!px-0.5',
  '[&_.react-datepicker__month]:!m-0.5',
  '[&_.react-datepicker__day-name]:!m-0 [&_.react-datepicker__day-name]:!h-6 [&_.react-datepicker__day-name]:!w-6 [&_.react-datepicker__day-name]:!text-[10px] [&_.react-datepicker__day-name]:!leading-6',
  '[&_.react-datepicker__day]:!m-0 [&_.react-datepicker__day]:!h-6 [&_.react-datepicker__day]:!w-6 [&_.react-datepicker__day]:!text-[11px] [&_.react-datepicker__day]:!leading-6',
  '[&_.react-datepicker__day--today]:!leading-[22px]',
  '[&_.react-datepicker__day--selected]:!leading-6',
  '[&_.react-datepicker__navigation]:!top-1',
  '[&_.react-datepicker__navigation--previous]:!ml-1 [&_.react-datepicker__navigation--previous]:rtl:!mr-1',
  '[&_.react-datepicker__navigation--next]:!mr-1 [&_.react-datepicker__navigation--next]:rtl:!ml-1',
].join(' ');

/**
 * dd/mm/yyyy field with a portaled calendar so it is not clipped by
 * modal overflow and stacks above the dialog (same pattern as Select).
 */
export default function DateInput({
  label,
  value = '',
  onChange,
  error,
  className,
  placeholder = 'dd/mm/yyyy',
}: DateInputProps) {
  const [text, setText] = useState(() => isoToDisplayDate(value));
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles } = useFloating({
    open,
    placement: 'bottom-start',
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    setText(isoToDisplayDate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (refs.domReference.current?.contains(target)) return;
      if (refs.floating.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, refs.domReference, refs.floating]);

  const commitDisplay = (next: string) => {
    if (!next.trim()) {
      onChange('');
      setText('');
      return;
    }
    const iso = parseDisplayDate(next);
    if (iso) {
      onChange(iso);
      setText(isoToDisplayDate(iso));
    } else {
      setText(isoToDisplayDate(value));
    }
  };

  return (
    <div ref={refs.setReference} className={`relative ${className ?? ''}`}>
      <Input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        label={label}
        value={text}
        placeholder={placeholder}
        error={error}
        suffix={
          <button
            type="button"
            className="flex items-center text-gray-500"
            aria-label="Open calendar"
            onClick={() => setOpen((prev) => !prev)}
          >
            <PiCalendarBlank className="h-5 w-5" />
          </button>
        }
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const masked = maskDigits(e.target.value);
          setText(masked);
          if (!masked) {
            onChange('');
            return;
          }
          if (masked.length === 10) {
            const iso = parseDisplayDate(masked);
            if (iso) onChange(iso);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => commitDisplay(text), 150);
        }}
      />

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }}
            className={compactPopoverClassName}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <DatePicker
              inline
              selected={parseIsoDate(value)}
              onChange={(date: Date | null) => {
                const iso = formatIsoDate(date);
                onChange(iso);
                setText(isoToDisplayDate(iso));
                setOpen(false);
              }}
              dateFormat={DATE_DISPLAY_FORMAT}
              calendarClassName={compactCalendarClassName}
            />
          </div>
        </FloatingPortal>
      ) : null}
    </div>
  );
}
