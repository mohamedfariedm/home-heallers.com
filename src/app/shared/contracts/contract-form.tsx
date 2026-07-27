'use client';

import { useMemo, useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import {
  PiFile,
  PiFileImage,
  PiFilePdf,
  PiPlusBold,
  PiTrash,
  PiUploadSimple,
  PiXBold,
} from 'react-icons/pi';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/components/ui/form';
import { Text, Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import {
  useCreateContract,
  useUpdateContract,
  useUploadContractAttachments,
} from '@/framework/contracts';
import { useUsers } from '@/framework/users';
import {
  Contract,
  ContractAttachmentType,
  ContractFormInput,
  ContractOwnerType,
  ContractType,
} from '@/types';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  ATTACHMENT_TYPE_LABELS,
  ATTACHMENT_TYPE_OPTIONS,
  formatContractDate,
  normalizeContractForForm,
  resolveLocalizedName,
  textToSocialLinks,
} from '@/app/shared/contracts/contract-utils';
import cn from '@/utils/class-names';
import toast from 'react-hot-toast';

const ownerTypeOptions = [
  { value: 'company', label: 'Company' },
  { value: 'doctor', label: 'Doctor' },
];

const contractTypeOptions = [
  { value: 'offline', label: 'Offline (On-site)' },
  { value: 'online', label: 'Online' },
];

type PendingFile = {
  id: string;
  file: File;
  type: ContractAttachmentType;
  notes: string;
};

const contractSchema = z.object({
  contract_owner_type: z.enum(['company', 'doctor']).nullable().optional(),
  contract_type: z.enum(['offline', 'online']).nullable().optional(),
  visit_date: z.string().optional(),
  visit_time: z.string().optional(),
  visit_type: z.string().optional(),
  visit_summary: z.string().optional(),
  company_location: z.string().optional(),
  center_interest_level: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.coerce.number().min(1).max(5).nullable().optional()
  ),
  company_name: z.string().optional(),
  company_activity: z.string().optional(),
  company_activity_custom: z.string().optional(),
  manager_name: z.string().optional(),
  manager_mobile: z.string().optional(),
  manager_email: z
    .union([z.string().email('Invalid email address'), z.literal('')])
    .optional(),
  requirements: z.string().optional(),
  sales_rep_notes: z.string().optional(),
  communication_date: z.string().nullable().optional(),
  communication_times_count: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.coerce.number().min(0).nullable().optional()
  ),
  assigned_to: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.coerce.number().nullable().optional()
  ),
  website: z.string().optional(),
  social_media_links: z.string().optional(),
});

function setIfPresent(payload: Record<string, unknown>, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  if (typeof value === 'string' && !value.trim()) return;
  payload[key] = typeof value === 'string' ? value.trim() : value;
}

function buildPayload(data: ContractFormInput) {
  const payload: Record<string, unknown> = {};

  setIfPresent(payload, 'contract_owner_type', data.contract_owner_type);
  setIfPresent(payload, 'contract_type', data.contract_type);
  setIfPresent(payload, 'visit_date', data.visit_date);
  setIfPresent(payload, 'visit_time', data.visit_time);
  setIfPresent(payload, 'visit_type', data.visit_type);
  setIfPresent(payload, 'visit_summary', data.visit_summary);
  setIfPresent(payload, 'company_location', data.company_location);
  setIfPresent(payload, 'company_name', data.company_name);
  setIfPresent(payload, 'company_activity', data.company_activity);
  setIfPresent(payload, 'company_activity_custom', data.company_activity_custom);
  setIfPresent(payload, 'manager_name', data.manager_name);
  setIfPresent(payload, 'manager_mobile', data.manager_mobile);
  setIfPresent(payload, 'manager_email', data.manager_email);
  setIfPresent(payload, 'requirements', data.requirements);
  setIfPresent(payload, 'sales_rep_notes', data.sales_rep_notes);
  setIfPresent(payload, 'communication_date', data.communication_date);
  setIfPresent(payload, 'website', data.website);

  if (data.center_interest_level != null && !Number.isNaN(data.center_interest_level)) {
    payload.center_interest_level = data.center_interest_level;
  }
  if (data.communication_times_count != null && !Number.isNaN(data.communication_times_count)) {
    payload.communication_times_count = data.communication_times_count;
  }
  if (data.assigned_to != null && !Number.isNaN(Number(data.assigned_to))) {
    payload.assigned_to = Number(data.assigned_to);
  }

  const socialLinks = textToSocialLinks(data.social_media_links);
  if (socialLinks) payload.social_media_links = socialLinks;

  return payload;
}

function extractContractId(response: unknown): number | null {
  const r = response as any;
  const id =
    r?.data?.data?.id ??
    r?.data?.id ??
    r?.id ??
    null;
  return typeof id === 'number' ? id : id != null ? Number(id) : null;
}

function buildAttachmentsFormData(pending: PendingFile[]) {
  const formData = new FormData();
  pending.forEach((item, index) => {
    formData.append(`attachments[${index}][file]`, item.file);
    formData.append(`attachments[${index}][type]`, item.type);
    if (item.notes.trim()) {
      formData.append(`attachments[${index}][notes]`, item.notes.trim());
    }
  });
  return formData;
}

function isImageFile(name?: string | null) {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(name || '');
}

function isPdfFile(name?: string | null) {
  return /\.pdf(\?|$)/i.test(name || '');
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ fileName }: { fileName?: string | null }) {
  if (isPdfFile(fileName)) return <PiFilePdf className="h-6 w-6 text-red-500" />;
  if (isImageFile(fileName)) return <PiFileImage className="h-6 w-6 text-sky-600" />;
  return <PiFile className="h-6 w-6 text-gray-500" />;
}

const defaultValues: ContractFormInput = {
  contract_owner_type: 'company',
  contract_type: 'offline',
  visit_date: '',
  visit_time: '',
  visit_type: '',
  visit_summary: '',
  company_location: '',
  center_interest_level: undefined,
  company_name: '',
  company_activity: '',
  company_activity_custom: '',
  manager_name: '',
  manager_mobile: '',
  manager_email: '',
  requirements: '',
  sales_rep_notes: '',
  communication_date: null,
  communication_times_count: null,
  website: '',
  social_media_links: '',
  assigned_to: null,
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 dark:border-gray-300 dark:bg-gray-100/40">
      <div className="mb-4 border-b border-gray-200 pb-3 dark:border-gray-300">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-800">{title}</h5>
        {description && (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-600">{description}</Text>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FullWidthField({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  allowClear,
}: {
  label: string;
  value?: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T | null) => void;
  error?: string;
  allowClear?: boolean;
}) {
  return (
    <div>
      <Text className="mb-2 block text-sm font-medium text-gray-900">{label}</Text>
      <div className="inline-flex w-full flex-wrap rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-300 sm:w-auto">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
              value === option.value
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {option.label}
          </button>
        ))}
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            Clear
          </button>
        )}
      </div>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </div>
  );
}

export default function ContractForm({ initValues }: { initValues?: Contract }) {
  const { closeModal } = useModal();
  const { mutateAsync: create, isPending: isCreating } = useCreateContract();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateContract();
  const { mutateAsync: uploadAttachments, isPending: isUploading } =
    useUploadContractAttachments();
  const { data: usersData } = useUsers('page=1&limit=200');
  const isEditing = !!initValues;
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = isCreating || isUpdating || isUploading || isSubmitting;
  const existingAttachments = initValues?.attachments ?? [];
  const typeOptions = useMemo(() => ATTACHMENT_TYPE_OPTIONS, []);

  const userOptions = useMemo(() => {
    const users = usersData?.data ?? [];
    return users.map(
      (user: {
        id: number;
        name?: string | { en?: string; ar?: string } | null;
        email?: string;
      }) => {
        const displayName = resolveLocalizedName(user.name) || `User #${user.id}`;
        return {
          value: String(user.id),
          label: user.email ? `${displayName} (${user.email})` : displayName,
          name: displayName,
        };
      }
    );
  }, [usersData]);

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

  const onSubmit: SubmitHandler<ContractFormInput> = async (data) => {
    const payload = buildPayload(data);
    setIsSubmitting(true);

    try {
      let contractId = initValues?.id ?? null;

      if (initValues) {
        await update({ ...payload, id: initValues.id });
      } else {
        const response = await create(payload);
        contractId = extractContractId(response);
        if (!contractId && pending.length > 0) {
          toast.error('Contract saved but could not upload documents (missing id)');
          closeModal();
          return;
        }
      }

      if (pending.length > 0 && contractId) {
        await uploadAttachments({
          id: contractId,
          formData: buildAttachmentsFormData(pending),
        });
        setPending([]);
      }

      closeModal();
    } catch {
      // Errors are toasted by the mutation hooks
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form<ContractFormInput>
      onSubmit={onSubmit}
      validationSchema={contractSchema}
      useFormProps={{
        defaultValues: initValues ? normalizeContractForForm(initValues) : defaultValues,
      }}
      className="flex max-h-[min(90vh,820px)] flex-col @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, watch, setValue, formState: { errors } }) => {
        const ownerType = watch('contract_owner_type');
        const contractType = watch('contract_type');
        const assignedTo = watch('assigned_to');
        const isCompany = ownerType === 'company';
        const isDoctor = ownerType === 'doctor';

        return (
          <>
            <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6 dark:border-gray-300">
              <div>
                <Title as="h4" className="text-lg font-semibold">
                  {isEditing ? 'Update Contract' : 'Create Contract'}
                </Title>
                <Text className="mt-1 text-sm text-gray-500">
                  {isEditing
                    ? 'Update contract details and upload documents. All fields are optional.'
                    : 'All wizard fields are optional — add documents below if you have them.'}
                </Text>
              </div>
              <ActionIcon size="sm" variant="text" onClick={closeModal} aria-label="Close">
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <FormSection title="Visit" description="When the visit happened and what was discussed.">
                <Input label="Visit Date" type="date" {...register('visit_date')} />
                <Input label="Visit Time" type="time" {...register('visit_time')} />
                <Input
                  label="Visit Type"
                  placeholder="e.g. Introductory, Follow-up"
                  {...register('visit_type')}
                />
                <FullWidthField>
                  <Textarea
                    label="Visit Summary"
                    placeholder="Describe the visit and key outcomes"
                    rows={3}
                    {...register('visit_summary')}
                  />
                </FullWidthField>
              </FormSection>

              <FormSection title="Location & Type" description="How and where the visit took place.">
                <FullWidthField>
                  <SegmentedControl
                    label="Contract Type"
                    value={contractType}
                    options={contractTypeOptions}
                    allowClear
                    onChange={(value) =>
                      setValue('contract_type', value as ContractType | null, {
                        shouldValidate: true,
                      })
                    }
                    error={errors.contract_type?.message}
                  />
                </FullWidthField>
                <Input
                  label="Priority (1–5)"
                  type="number"
                  min={1}
                  max={5}
                  placeholder="Interest level"
                  {...register('center_interest_level')}
                />
                <FullWidthField>
                  <Input
                    label="Location"
                    placeholder="Company address or clinic location"
                    {...register('company_location')}
                  />
                </FullWidthField>
              </FormSection>

              <FormSection
                title="Owner"
                description="Whether this contract is for a company or an individual doctor."
              >
                <FullWidthField>
                  <SegmentedControl
                    label="Owner Type"
                    value={ownerType}
                    options={ownerTypeOptions}
                    allowClear
                    onChange={(value) =>
                      setValue('contract_owner_type', value as ContractOwnerType | null, {
                        shouldValidate: true,
                      })
                    }
                  />
                </FullWidthField>

                <Input
                  label={isDoctor ? 'Doctor Name' : 'Company Name'}
                  placeholder={isDoctor ? 'Enter doctor name' : 'Enter company name'}
                  {...register('company_name')}
                />
                <Input
                  label={isDoctor ? 'Specialty' : 'Company Activity'}
                  placeholder={isDoctor ? 'e.g. Orthopedics' : 'e.g. Healthcare'}
                  {...register('company_activity')}
                />
                {!isDoctor && (
                  <Input
                    label="Custom Activity"
                    placeholder="Other activity (optional)"
                    {...register('company_activity_custom')}
                  />
                )}
              </FormSection>

              {isCompany !== false && ownerType !== 'doctor' && (
                <FormSection
                  title="Company Contact"
                  description="External manager contact (omit for doctor contracts)."
                >
                  <Input
                    label="Manager Name"
                    placeholder="External contact name"
                    {...register('manager_name')}
                  />
                  <Input
                    label="Manager Mobile"
                    placeholder="e.g. 966501234567"
                    {...register('manager_mobile')}
                  />
                  <FullWidthField>
                    <Input
                      label="Manager Email"
                      type="email"
                      placeholder="manager@company.com"
                      {...register('manager_email')}
                      error={errors.manager_email?.message}
                    />
                  </FullWidthField>
                </FormSection>
              )}

              <FormSection
                title="Online presence"
                description="Website and social links (scheme optional for website)."
              >
                <FullWidthField>
                  <Input
                    label="Website"
                    placeholder="acme.com or https://acme.com"
                    {...register('website')}
                  />
                </FullWidthField>
                <FullWidthField>
                  <Textarea
                    label="Social Media Links"
                    placeholder="One URL per line"
                    rows={3}
                    {...register('social_media_links')}
                  />
                </FullWidthField>
              </FormSection>

              <FormSection
                title="Communication"
                description="Latest communication date and times contacted."
              >
                <Input label="Communication Date" type="date" {...register('communication_date')} />
                <Input
                  label="Times Communicated"
                  type="number"
                  min={0}
                  placeholder="0"
                  {...register('communication_times_count')}
                />
              </FormSection>

              <FormSection title="Assignment" description="Sales rep responsible for this contract.">
                <FullWidthField>
                  <div>
                    <Text className="mb-1.5 block text-sm font-medium text-gray-900">
                      Assigned To
                    </Text>
                    <select
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                      value={
                        assignedTo != null && !Number.isNaN(Number(assignedTo))
                          ? String(assignedTo)
                          : ''
                      }
                      onChange={(e) => {
                        const next = e.target.value;
                        setValue('assigned_to', next ? Number(next) : null, {
                          shouldValidate: true,
                        });
                      }}
                    >
                      <option value="">Select sales rep (defaults to creator)</option>
                      {userOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </FullWidthField>
                {isEditing && initValues?.assigned_user && (
                  <FullWidthField>
                    <Text className="text-sm text-gray-600">
                      Current assignee:{' '}
                      <span className="font-medium text-gray-900">
                        {resolveLocalizedName(
                          initValues.assigned_user.name as
                            | string
                            | { en?: string; ar?: string }
                            | null
                            | undefined
                        ) || '—'}
                      </span>
                      {initValues.assigned_user.email
                        ? ` (${initValues.assigned_user.email})`
                        : ''}
                    </Text>
                  </FullWidthField>
                )}
                {isEditing && initValues?.service_manager_name && (
                  <FullWidthField>
                    <Text className="text-sm text-gray-600">
                      Service manager label:{' '}
                      <span className="font-medium text-gray-900">
                        {initValues.service_manager_name}
                      </span>
                    </Text>
                  </FullWidthField>
                )}
              </FormSection>

              <FormSection title="Notes" description="Requirements and internal sales notes.">
                <FullWidthField>
                  <Textarea
                    label="Requirements"
                    placeholder="Client requirements or requests"
                    rows={2}
                    {...register('requirements')}
                  />
                </FullWidthField>
                <FullWidthField>
                  <Textarea
                    label="Sales Rep Notes"
                    placeholder="Internal follow-up notes"
                    rows={2}
                    {...register('sales_rep_notes')}
                  />
                </FullWidthField>
              </FormSection>

              <FormSection
                title="Documents"
                description="pdf, jpg, jpeg, png — up to 10MB each. Files upload after the contract is saved."
              >
                {isEditing && existingAttachments.length > 0 && (
                  <FullWidthField>
                    <div className="rounded-xl border border-gray-200 bg-white">
                      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
                        <Text className="text-xs font-semibold text-gray-800">
                          Existing attachments
                        </Text>
                        <Badge variant="flat" className="text-xs">
                          {existingAttachments.length}
                        </Badge>
                      </div>
                      <ul className="divide-y divide-gray-100">
                        {existingAttachments.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center gap-3 px-4 py-2.5"
                          >
                            <FileTypeIcon fileName={item.file_name} />
                            <div className="min-w-0 flex-1">
                              <a
                                href={item.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-sm font-medium text-gray-900 hover:underline"
                              >
                                {item.file_name || 'Open file'}
                              </a>
                              <Text className="text-xs text-gray-500">
                                {ATTACHMENT_TYPE_LABELS[
                                  item.type as ContractAttachmentType
                                ] ?? item.type}
                                {item.created_at
                                  ? ` · ${formatContractDate(item.created_at)}`
                                  : ''}
                              </Text>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FullWidthField>
                )}

                <FullWidthField>
                  <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-50">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-200 transition group-hover:scale-105">
                      <PiUploadSimple className="h-5 w-5 text-gray-700" />
                    </div>
                    <Text className="text-sm font-medium text-gray-800">
                      Drop files here or click to browse
                    </Text>
                    <Text className="text-xs text-gray-500">
                      You can select multiple files at once
                    </Text>
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
                </FullWidthField>

                {pending.length > 0 && (
                  <FullWidthField>
                    <ul className="space-y-3">
                      {pending.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-xl border border-gray-200 bg-white p-3"
                        >
                          <div className="mb-3 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
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
                                onChange={(e) =>
                                  updatePending(item.id, { notes: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </FullWidthField>
                )}
              </FormSection>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-300">
              <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading
                  ? isUploading
                    ? 'Uploading...'
                    : 'Saving...'
                  : isEditing
                    ? 'Update Contract'
                    : 'Create Contract'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
