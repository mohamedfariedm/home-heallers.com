'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { PiXBold } from 'react-icons/pi';
import Upload from '@/components/ui/upload';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { getAttachmentUrl } from '@/app/shared/offers/utils';

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

function validateFile(file: File, minWidth?: number) {
  if (!ACCEPT.includes(file.type)) {
    return 'Use jpg, png or webp';
  }
  if (file.size > MAX_BYTES) {
    return 'File must be 5MB or smaller';
  }
  return null;
}

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('attachment[]', file);
  const response = await axios.post(
    process.env.NEXT_PUBLIC_ATTACHMENT_URL as string,
    formData,
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Cookies.get('auth_token')}`,
      },
    }
  );
  return response.data.data;
}

function asArray(value: unknown): any[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default function MediaSlot({
  label,
  hint,
  value,
  onChange,
  multiple,
  aspect,
  fallbackLabel,
  disabled,
}: {
  label: string;
  hint?: string;
  value: any;
  onChange: (next: any) => void;
  multiple?: boolean;
  aspect?: string;
  fallbackLabel?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const items = asArray(value);

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    setUploading(true);
    const uploaded: any[] = [];
    for (const file of list) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      try {
        const data = await uploadFile(file);
        uploaded.push(...asArray(data));
        toast.success(`${file.name} uploaded`);
      } catch {
        toast.error(`${file.name} failed — retry this file`);
      }
    }
    if (uploaded.length) {
      onChange(multiple ? [...items, ...uploaded] : uploaded);
    }
    setUploading(false);
  };

  const removeAt = (index: number) => {
    if (multiple) onChange(items.filter((_, i) => i !== index));
    else onChange(null);
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        {aspect && <p className="text-xs text-gray-400">Suggested aspect {aspect}</p>}
      </div>
      <div
        className="relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
            <Spinner size="xl" />
          </div>
        )}
        <Upload
          title={label}
          accept="img"
          disabled={disabled}
          onChange={(e: any) => {
            const files = e.target.files;
            if (files?.length) handleFiles(files);
            e.target.value = '';
          }}
        />
      </div>
      {!items.length && fallbackLabel && (
        <p className="text-xs text-gray-500">{fallbackLabel}</p>
      )}
      <div className={multiple ? 'grid grid-cols-2 gap-3 sm:grid-cols-3' : ''}>
        {items.map((item, index) => {
          const src = getAttachmentUrl(item);
          return (
            <div key={index} className="relative rounded border border-gray-200 p-2">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`${label} ${index + 1}`} className="h-40 w-full rounded object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center text-xs text-gray-400">
                  No preview
                </div>
              )}
              {!disabled && (
                <div className="mt-2 flex items-center justify-between">
                  {multiple && (
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="text" onClick={() => move(index, -1)}>
                        ←
                      </Button>
                      <Button type="button" size="sm" variant="text" onClick={() => move(index, 1)}>
                        →
                      </Button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="rounded-full border bg-white p-1"
                    aria-label={`Remove ${label} ${index + 1}`}
                  >
                    <PiXBold className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <input ref={inputRef} type="file" className="hidden" />
    </div>
  );
}
