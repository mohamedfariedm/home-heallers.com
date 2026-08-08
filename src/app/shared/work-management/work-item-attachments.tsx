'use client';

import { useRef, useState } from 'react';
import { PiFile, PiImage, PiTrash, PiUploadSimple, PiVideoCamera } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import toast from 'react-hot-toast';
import type { Attachment } from '@/types/work-management';
import {
  isImageAttachment,
  isVideoAttachment,
  uploadWmAttachments,
} from '@/lib/work-management/upload-attachment';
import {
  useAddAttachment,
  useRemoveAttachment,
} from '@/framework/work-management/work-items';
import { useWmActorId } from '@/framework/work-management/keys';
import cn from '@/utils/class-names';

const ACCEPT =
  'image/*,video/*,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.avi,.mkv,.m4v';

function formatSize(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const url = attachment.original || attachment.dataUrl || attachment.thumbnail || '';
  const video = isVideoAttachment(attachment.mimeType, url);
  const image = isImageAttachment(attachment.mimeType, url);

  if (video && url) {
    return (
      <video
        src={url}
        className="h-full w-full object-cover"
        controls
        preload="metadata"
      />
    );
  }
  if (image && url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={attachment.thumbnail || url}
        alt={attachment.name}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-2 text-gray-400">
      <PiFile className="h-8 w-8" />
      <span className="line-clamp-2 text-center text-[10px]">{attachment.name}</span>
    </div>
  );
}

export default function WorkItemAttachmentsPanel({
  workItemId,
  attachments,
  canAttach = true,
}: {
  workItemId: string;
  attachments: Attachment[];
  canAttach?: boolean;
}) {
  const actorId = useWmActorId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const addAttachment = useAddAttachment();
  const removeAttachment = useRemoveAttachment();

  const persistUploads = async (files: FileList | File[]) => {
    if (!files.length || !canAttach) return;
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await uploadWmAttachments(files, setProgress);
      for (const file of uploaded) {
        if (!file.dataUrl && !file.original) {
          toast.error(`Upload returned no URL for ${file.name}`);
          continue;
        }
        await addAttachment.mutateAsync({
          workItemId,
          uploadedById: actorId,
          file: {
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            dataUrl: file.dataUrl || file.original || '',
            original: file.original,
            thumbnail: file.thumbnail,
            serverId: file.serverId,
          },
        });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {attachments.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((a) => {
            const url = a.original || a.dataUrl || a.thumbnail || '';
            const video = isVideoAttachment(a.mimeType, url);
            return (
              <div
                key={a.id}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
              >
                <div className="aspect-video">
                  <AttachmentPreview attachment={a} />
                </div>
                <div className="flex items-start justify-between gap-2 border-t border-gray-100 bg-white px-2.5 py-2">
                  <div className="min-w-0">
                    <a
                      href={url || undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-xs font-medium text-primary hover:underline"
                    >
                      {a.name}
                    </a>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
                      {video ? (
                        <PiVideoCamera className="h-3 w-3" />
                      ) : (
                        <PiImage className="h-3 w-3" />
                      )}
                      <span>{formatSize(a.size)}</span>
                    </div>
                  </div>
                  {canAttach ? (
                    <button
                      type="button"
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      title="Remove"
                      onClick={() =>
                        removeAttachment.mutate({
                          attachmentId: a.id,
                          actorId,
                          workItemId,
                        })
                      }
                    >
                      <PiTrash className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Text className="text-sm text-gray-500">
          No attachments yet. Add screenshots, logs, or videos.
        </Text>
      )}

      {canAttach ? (
        <div
          className={cn(
            'relative rounded-xl border-2 border-dashed p-5 transition',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400',
            uploading && 'pointer-events-none opacity-60'
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files?.length) {
              void persistUploads(e.dataTransfer.files);
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            disabled={uploading}
            onChange={(e) => {
              if (e.target.files?.length) void persistUploads(e.target.files);
            }}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            {uploading ? (
              <>
                <Spinner size="sm" />
                <Text className="text-sm text-gray-600">
                  Uploading… {progress > 0 ? `${progress}%` : ''}
                </Text>
              </>
            ) : (
              <>
                <PiUploadSimple className="h-8 w-8 text-gray-400" />
                <Text className="text-sm font-medium text-gray-700">
                  Drop images or videos here, or click to upload
                </Text>
                <Text className="text-xs text-gray-500">
                  PNG, JPG, WEBP, GIF · MP4, WEBM, MOV
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  Choose files
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
