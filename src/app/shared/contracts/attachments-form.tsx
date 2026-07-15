'use client';

import { useMemo, useState } from 'react';
import {
  PiArrowSquareOut,
  PiFile,
  PiFileImage,
  PiFilePdf,
  PiPlusBold,
  PiTrash,
  PiUploadSimple,
  PiXBold,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text, Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useDeleteContractAttachment,
  useUploadContractAttachments,
} from '@/framework/contracts';
import { Contract, ContractAttachment, ContractAttachmentType } from '@/types';
import {
  ATTACHMENT_TYPE_LABELS,
  ATTACHMENT_TYPE_OPTIONS,
  formatContractDate,
} from '@/app/shared/contracts/contract-utils';
import cn from '@/utils/class-names';

type PendingFile = {
  id: string;
  file: File;
  type: ContractAttachmentType;
  notes: string;
};

function isImageFile(name?: string | null, url?: string | null) {
  const value = `${name || ''} ${url || ''}`.toLowerCase();
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value);
}

function isPdfFile(name?: string | null, url?: string | null) {
  const value = `${name || ''} ${url || ''}`.toLowerCase();
  return /\.pdf(\?|$)/i.test(value);
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({
  fileName,
  fileUrl,
  className,
}: {
  fileName?: string | null;
  fileUrl?: string | null;
  className?: string;
}) {
  if (isPdfFile(fileName, fileUrl)) {
    return <PiFilePdf className={cn('h-6 w-6 text-red-500', className)} />;
  }
  if (isImageFile(fileName, fileUrl)) {
    return <PiFileImage className={cn('h-6 w-6 text-sky-600', className)} />;
  }
  return <PiFile className={cn('h-6 w-6 text-gray-500', className)} />;
}

export default function AttachmentsForm({ contract }: { contract: Contract }) {
  const { closeModal } = useModal();
  const { mutate: upload, isPending: isUploading } = useUploadContractAttachments();
  const { mutate: remove, isPending: isDeleting } = useDeleteContractAttachment();
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [existing, setExisting] = useState<ContractAttachment[]>(
    contract.attachments ?? []
  );

  const displayName = contract.company_name?.trim() || `Contract #${contract.id}`;
  const canSubmit = pending.length > 0 && pending.every((item) => item.type && item.file);
  const typeOptions = useMemo(() => ATTACHMENT_TYPE_OPTIONS, []);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      type: 'other' as ContractAttachmentType,
      notes: '',
    }));
    setPending((prev) => [...prev, ...next]);
  };

  const updatePending = (id: string, patch: Partial<PendingFile>) => {
    setPending((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removePending = (id: string) => {
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpload = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    pending.forEach((item, index) => {
      formData.append(`attachments[${index}][file]`, item.file);
      formData.append(`attachments[${index}][type]`, item.type);
      if (item.notes.trim()) {
        formData.append(`attachments[${index}][notes]`, item.notes.trim());
      }
    });

    upload(
      { id: contract.id, formData },
      {
        onSuccess: (response: any) => {
          const uploaded = response?.data?.data ?? response?.data ?? [];
          const list = Array.isArray(uploaded) ? uploaded : uploaded ? [uploaded] : [];
          if (list.length) {
            setExisting((prev) => [...list, ...prev]);
          }
          setPending([]);
        },
      }
    );
  };

  const handleDelete = (attachmentId: number) => {
    setDeletingId(attachmentId);
    remove(
      { id: contract.id, attachmentId },
      {
        onSuccess: () => {
          setExisting((prev) => prev.filter((item) => item.id !== attachmentId));
        },
        onSettled: () => setDeletingId(null),
      }
    );
  };

  return (
    <form onSubmit={handleUpload} className="flex max-h-[min(90vh,760px)] flex-col">
      <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6 dark:border-gray-300">
        <div>
          <Title as="h4" className="text-lg font-semibold">
            Contract Documents
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Manage typed documents for{' '}
            <span className="font-medium text-gray-800">{displayName}</span>
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal} aria-label="Close">
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-300">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <div>
              <Text className="text-sm font-semibold text-gray-900">Existing attachments</Text>
              <Text className="text-xs text-gray-500">
                Files already linked to this contract
              </Text>
            </div>
            <Badge variant="flat" className="shrink-0">
              {existing.length} file{existing.length === 1 ? '' : 's'}
            </Badge>
          </div>

          {existing.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <PiFile className="h-6 w-6 text-gray-400" />
              </div>
              <Text className="text-sm font-medium text-gray-800">No documents yet</Text>
              <Text className="max-w-xs text-xs text-gray-500">
                Upload commercial registration, VAT, national ID, or other required files below.
              </Text>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {existing.map((item) => {
                const typeLabel =
                  ATTACHMENT_TYPE_LABELS[item.type as ContractAttachmentType] ?? item.type;
                const showThumb =
                  item.thumbnail || isImageFile(item.file_name, item.file_url);
                const thumbSrc = item.thumbnail || (showThumb ? item.file_url : null);

                return (
                  <li
                    key={item.id}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50/80"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                      {thumbSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbSrc}
                          alt={item.file_name || typeLabel}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FileTypeIcon fileName={item.file_name} fileUrl={item.file_url} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="flat" className="max-w-full truncate">
                          {typeLabel}
                        </Badge>
                        {item.created_at && (
                          <Text className="text-xs text-gray-400">
                            {formatContractDate(item.created_at)}
                          </Text>
                        )}
                      </div>
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-gray-900 transition hover:text-gray-700"
                      >
                        <span className="truncate">{item.file_name || 'Open file'}</span>
                        <PiArrowSquareOut className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                      </a>
                      {item.notes && (
                        <Text className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                          {item.notes}
                        </Text>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <a
                        href={item.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex"
                        aria-label="Open attachment"
                      >
                        <ActionIcon
                          size="sm"
                          variant="outline"
                          tag="span"
                          className="hover:!border-gray-900 hover:text-gray-800"
                        >
                          <PiArrowSquareOut className="h-4 w-4" />
                        </ActionIcon>
                      </a>
                      <ActionIcon
                        size="sm"
                        variant="outline"
                        disabled={isDeleting && deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        aria-label="Delete attachment"
                        className="hover:!border-red-500 hover:text-red-600"
                      >
                        <PiTrash className="h-4 w-4" />
                      </ActionIcon>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-300">
          <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
            <Text className="text-sm font-semibold text-gray-900">Upload files</Text>
            <Text className="text-xs text-gray-500">
              pdf, jpg, jpeg, png — up to 10MB each
            </Text>
          </div>

          <div className="p-4">
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-50">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105">
                <PiUploadSimple className="h-5 w-5 text-gray-700" />
              </div>
              <Text className="text-sm font-medium text-gray-800">
                Drop files here or click to browse
              </Text>
              <Text className="text-xs text-gray-500">You can select multiple files at once</Text>
              <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white">
                <PiPlusBold className="h-3.5 w-3.5" />
                Choose files
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = '';
                }}
              />
            </label>

            {pending.length > 0 && (
              <ul className="mt-4 space-y-3">
                {pending.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-3"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
                        <FileTypeIcon fileName={item.file.name} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Text className="truncate text-sm font-medium text-gray-900">
                          {item.file.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {formatBytes(item.file.size)}
                        </Text>
                      </div>
                      <ActionIcon
                        size="sm"
                        variant="outline"
                        onClick={() => removePending(item.id)}
                        aria-label="Remove pending file"
                        className="hover:!border-red-500 hover:text-red-600"
                      >
                        <PiTrash className="h-4 w-4" />
                      </ActionIcon>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Text className="mb-1.5 block text-xs font-medium text-gray-700">
                          Document type
                        </Text>
                        <select
                          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                          value={item.type}
                          onChange={(e) =>
                            updatePending(item.id, {
                              type: e.target.value as ContractAttachmentType,
                            })
                          }
                        >
                          {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Text className="mb-1.5 block text-xs font-medium text-gray-700">
                          Notes (optional)
                        </Text>
                        <Input
                          placeholder="e.g. CR copy, expires 2027"
                          value={item.notes}
                          onChange={(e) => updatePending(item.id, { notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-300">
        <Text className="text-xs text-gray-500">
          {pending.length > 0
            ? `${pending.length} file${pending.length === 1 ? '' : 's'} ready to upload`
            : 'Select files to upload'}
        </Text>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={closeModal} disabled={isUploading}>
            Close
          </Button>
          <Button type="submit" disabled={!canSubmit || isUploading} className="min-w-[140px]">
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </form>
  );
}
