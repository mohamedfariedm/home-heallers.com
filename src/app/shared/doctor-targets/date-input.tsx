'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/datepicker';
import { PiCalendarBlank } from 'react-icons/pi';
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

/**
 * dd/mm/yyyy field with an absolutely positioned calendar dropdown
 * (does not expand the parent modal/layout).
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(isoToDisplayDate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

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
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
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

      {open && (
        <div className="absolute left-0 top-full z-[80] mt-1 rounded-md border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-100">
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
          />
        </div>
      )}
    </div>
  );
}
