'use client';

import axios from 'axios';
import Cookies from 'js-cookie';

export type UploadedAttachmentFile = {
  name: string;
  mimeType: string;
  size: number;
  /** Public URL from attachment endpoint (or data URL fallback) */
  dataUrl: string;
  original?: string;
  thumbnail?: string;
  serverId?: string | number;
};

function pickUrl(file: any): string {
  if (!file) return '';
  if (typeof file === 'string') return file;
  return (
    file.original ||
    file.url ||
    file.path ||
    file.thumbnail ||
    file.dataUrl ||
    ''
  );
}

function guessName(file: File | any, url: string): string {
  if (file instanceof File && file.name) return file.name;
  if (file?.name) return file.name;
  if (url) {
    const part = url.split('?')[0].split('/').pop();
    if (part) return decodeURIComponent(part);
  }
  return 'attachment';
}

function guessMime(file: File | any, url: string): string {
  if (file instanceof File && file.type) return file.type;
  if (file?.mimeType || file?.mime_type || file?.type) {
    return file.mimeType || file.mime_type || file.type;
  }
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
    return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  }
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v'].includes(ext)) {
    return `video/${ext === 'mov' ? 'quicktime' : ext}`;
  }
  return 'application/octet-stream';
}

/**
 * Upload one or more files to NEXT_PUBLIC_ATTACHMENT_URL (same as doctors/settings).
 * Returns normalized metadata for Work Management storage.
 */
export async function uploadWmAttachments(
  files: FileList | File[],
  onProgress?: (pct: number) => void
): Promise<UploadedAttachmentFile[]> {
  const list = Array.from(files);
  if (!list.length) return [];

  const uploadUrl = process.env.NEXT_PUBLIC_ATTACHMENT_URL;
  if (!uploadUrl) {
    throw new Error('Attachment endpoint is not configured (NEXT_PUBLIC_ATTACHMENT_URL)');
  }

  const formData = new FormData();
  list.forEach((file) => formData.append('attachment[]', file));

  const { data } = await axios.post(uploadUrl, formData, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${Cookies.get('auth_token')}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (evt) => {
      if (evt.total && onProgress) {
        onProgress(Math.round((evt.loaded * 100) / evt.total));
      }
    },
  });

  const uploaded = (data?.data ?? data) as any;
  const rows = Array.isArray(uploaded) ? uploaded : [uploaded];

  return rows.map((row: any, index: number) => {
    const sourceFile = list[index] ?? list[0];
    const original = pickUrl(row);
    const thumbnail =
      (typeof row === 'object' && (row.thumbnail || row.thumb)) || undefined;
    return {
      name: guessName(sourceFile, original),
      mimeType: guessMime(sourceFile, original),
      size: sourceFile?.size ?? row?.size ?? 0,
      dataUrl: original || thumbnail || '',
      original: original || undefined,
      thumbnail: thumbnail || undefined,
      serverId: row?.id ?? row?.attachment_id,
    };
  });
}

export function isVideoAttachment(mimeType?: string, url?: string): boolean {
  if (mimeType?.startsWith('video/')) return true;
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v', 'flv'].includes(ext);
}

export function isImageAttachment(mimeType?: string, url?: string): boolean {
  if (mimeType?.startsWith('image/')) return true;
  const ext = url?.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext);
}
