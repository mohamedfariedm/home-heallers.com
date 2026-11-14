'use client';

import { useMemo, useState } from 'react';
import {
  PiArrowSquareOut,
  PiFile,
  PiFileImage,
  PiFilePdf,
  PiInfo,
  PiNotePencil,
  PiPlusBold,
  PiTrash,
  PiUploadSimple,
  PiXBold,
} from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Text, Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
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

const FORM_TABS: ModalFormTabItem[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

export default function AttachmentsForm({ contract }: { contract: Contract }) {
  const { closeModal } = useModal();
  const { mutate: upload, isPending: isUploading } = useUploadContractAttachments();
  const { mutate: remove, isPending: isDeleting } = useDeleteContractAttachment();
  const [activeTab, setActiveTab] = useState(0);
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

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  return (
    <form onSubmit={handleUpload} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiFile className="h-5 w-5 text-white" />
          </div>
          <div>
            <Title as="h4" className="text-lg font-bold text-gray-900">
              Contract Documents
            </Title>
            <Text className="mt-0.5 text-xs text-gray-400">
              Manage typed documents for{' '}
              <span className="font-medium text-gray-600">{displayName}</span>
            </Text>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={closeModal}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
          aria-label="Close"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <ModalFormTabs
        tabs={FORM_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Existing attachments"
              description="Files already linked to this contract"
              contentClassName="sm:grid-cols-1"
            >
              <div className="flex items-center justify-between gap-3">
                <Text className="text-xs text-gray-500">
                  {pending.length > 0
                    ? `${pending.length} file${pending.length === 1 ? '' : 's'} ready to upload`
                    : 'Select files on the Details tab to upload'}
                </Text>
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
                    Upload commercial registration, VAT, national ID, or other required files.
                  </Text>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
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
                            className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-gray-900 transition hover:text-[#143087]"
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
                              className="hover:!border-[#143087] hover:text-[#143087]"
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
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Upload files"
              description="pdf, jpg, jpeg, png — up to 10MB each"
              contentClassName="sm:grid-cols-1"
            >
              <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/40 px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-50">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105">
                  <PiUploadSimple className="h-5 w-5 text-gray-700" />
                </div>
                <Text className="text-sm font-medium text-gray-800">
                  Drop files here or click to browse
                </Text>
                <Text className="text-xs text-gray-500">You can select multiple files at once</Text>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#143087] px-3 py-1.5 text-xs font-medium text-white">
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
                <ul className="space-y-3">
                  {pending.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-gray-200 bg-white p-3"
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
                            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-[#143087] focus:ring-2 focus:ring-[#143087]/20"
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
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={FORM_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isUploading}
        disabled={!canSubmit || isUploading}
        cancelLabel="Close"
        submitLabel={isUploading ? 'Uploading...' : 'Upload'}
      />
    </form>
  );
}
