'use client';

import { useState } from 'react';
import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import request from '@/framework/utils/request';

type ExportButtonProps = {
  data: { columns: unknown[]; rows: unknown[] };
  header: string;
  fileName: string;
  className?: string;
  role?: string;
  type?: string;
};

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** List route names that do not match the `{Model}/index` file label. */
const EXPORT_RESOURCE_ALIASES: Record<string, string> = {
  patients: 'clients',
};

/**
 * `index` is the backend action name, not a URL segment.
 * `Doctors/index` → `doctors`, `packages/index` → `packages`.
 */
function resolveExportResource(fileName: string): string {
  if (!/\/index$/i.test(fileName)) return fileName;
  const resource = fileName.replace(/\/index$/i, '').toLowerCase();
  return EXPORT_RESOURCE_ALIASES[resource] ?? resource;
}

function fallbackFileName(resourcePath: string): string {
  const segment = resourcePath.split('/').filter(Boolean).pop() || 'export';
  return segment.toLowerCase().endsWith('.xlsx') ? segment : `${segment}.xlsx`;
}

function headerValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

function fileNameFromDisposition(
  header: string | undefined,
  fallback: string
): string {
  if (!header?.trim()) return fallback;

  const encoded = /filename\*=(?:UTF-8''|utf-8'')([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    const raw = encoded[1].trim().replace(/^"(.*)"$/, '$1');
    try {
      return decodeURIComponent(raw) || fallback;
    } catch {
      return raw || fallback;
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header);
  const name = plain?.[1]?.trim();
  return name || fallback;
}

async function readJsonBody(
  data: unknown
): Promise<{ message?: string; download_url?: string } | undefined> {
  try {
    let text = '';
    if (data instanceof Blob) text = await data.text();
    else if (typeof data === 'string') text = data;
    else if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message?: unknown }).message;
      return typeof message === 'string' ? { message } : undefined;
    } else {
      return undefined;
    }

    if (!text.trim()) return undefined;
    const json = JSON.parse(text) as { message?: unknown; download_url?: unknown };
    return {
      message: typeof json.message === 'string' ? json.message : undefined,
      download_url:
        typeof json.download_url === 'string' ? json.download_url : undefined,
    };
  } catch {
    return undefined;
  }
}

function downloadBlob(blob: Blob, fileName: string) {
  const file =
    blob.type === XLSX_MIME ? blob : new Blob([blob], { type: XLSX_MIME });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ExportButton({
  header,
  fileName,
  className,
  role,
}: ExportButtonProps) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (
        key !== 'page' &&
        key !== 'limit' &&
        key !== 'per_page' &&
        key !== 'tab'
      ) {
        params.set(key, value);
      }
    }

    if (role) params.set('role', role);
    params.set('export', '1');

    let resource = '';
    if (fileName === 'customer-supports-marketing') {
      resource = 'customer-supports';
      params.set('type', 'marketing');
    } else if (fileName === 'customer-supports-operation') {
      resource = 'customer-supports';
      params.set('type', 'operation');
    } else if (fileName === 'customer-supports-seo') {
      resource = 'customer-supports';
      params.set('type', 'seo');
    } else {
      resource = resolveExportResource(fileName);
    }

    const url = `/${resource}?${params.toString()}`;

    setLoading(true);
    try {
      const res = await request.get(url, {
        responseType: 'blob',
        headers: {
          Accept: `${XLSX_MIME}, application/json;q=0.1`,
        },
      });

      const contentType = headerValue(res.headers['content-type']) ?? '';
      const blob = res.data as Blob;

      // Errors are JSON. A file response is saved as-is and is not parsed.
      if (contentType.includes('application/json')) {
        const json = await readJsonBody(blob);
        if (json?.download_url) {
          window.open(json.download_url, '_blank');
          return;
        }
        toast.error(json?.message || 'Export failed');
        return;
      }

      const name = fileNameFromDisposition(
        headerValue(res.headers['content-disposition']),
        fallbackFileName(resource)
      );
      downloadBlob(blob, name);
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const json = axios.isAxiosError(error)
        ? await readJsonBody(error.response?.data)
        : undefined;
      toast.error(
        json?.message || (status ? `Export failed (${status})` : 'Export failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      isLoading={loading}
      disabled={loading}
      className={cn('w-full @lg:w-auto', className)}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Export {header.toUpperCase()}
    </Button>
  );
}
