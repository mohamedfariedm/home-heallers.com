'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import cn from '@/utils/class-names';

type Props = {
  value: string;
  onChange: (dataUrlOrUrl: string) => void;
  label?: string;
  compact?: boolean;
  className?: string;
};

/** Accepts dropped images as data URLs (or paste URL in sibling input). */
export function ImageDropField({
  value,
  onChange,
  label,
  compact,
  className,
}: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0];
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const r = reader.result;
        if (typeof r === 'string') onChange(r);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    noClick: false,
  });

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      ) : null}
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50/80 transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-600 dark:bg-zinc-900/40 dark:hover:border-indigo-500',
          isDragActive && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
          compact ? 'px-3 py-4' : 'px-4 py-8',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-6 w-6 text-zinc-400" />
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {isDragActive
              ? 'Drop image here'
              : 'Drag & drop an image, or click to choose'}
          </p>
          <p className="text-[10px] text-zinc-400">Stored in browser (data URL)</p>
        </div>
      </div>
      {value ? (
        <div className="relative mt-2 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={cn(
              'max-h-40 w-full object-contain',
              compact && 'max-h-24',
            )}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute right-2 top-2 rounded-lg bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
