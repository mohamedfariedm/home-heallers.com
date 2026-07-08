'use client';

import { SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/components/ui/form';
import { Text, Title } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { useCreateContract, useUpdateContract } from '@/framework/contracts';
import { Contract, ContractFormInput, ContractOwnerType, ContractType } from '@/types';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { normalizeContractForForm } from '@/app/shared/contracts/contract-utils';
import cn from '@/utils/class-names';

const ownerTypeOptions = [
  { value: 'company', label: 'Company' },
  { value: 'doctor', label: 'Doctor' },
];

const contractTypeOptions = [
  { value: 'offline', label: 'Offline (On-site)' },
  { value: 'online', label: 'Online' },
];

const contractSchema = z
  .object({
    contract_owner_type: z.enum(['company', 'doctor']).nullable().optional(),
    contract_type: z.enum(['offline', 'online'], {
      required_error: 'Contract type is required',
    }),
    visit_date: z.string().min(1, 'Visit date is required'),
    visit_time: z.string().min(1, 'Visit time is required'),
    visit_type: z.string().optional(),
    visit_summary: z.string().min(1, 'Visit summary is required'),
    company_location: z.string().min(1, 'Location is required'),
    center_interest_level: z.coerce.number().min(1).max(5).nullable().optional(),
    company_name: z.string().min(1, 'Name is required'),
    company_activity: z.string().min(1, 'Activity / specialty is required'),
    company_activity_custom: z.string().optional(),
    manager_name: z.string().optional(),
    manager_mobile: z.string().optional(),
    manager_email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
    requirements: z.string().optional(),
    sales_rep_notes: z.string().optional(),
    communication_date: z.string().nullable().optional(),
    communication_times_count: z.coerce.number().min(0).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.contract_owner_type === 'company') {
      if (!data.manager_mobile?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Manager mobile is required for company contracts',
          path: ['manager_mobile'],
        });
      }
      if (!data.manager_email?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Manager email is required for company contracts',
          path: ['manager_email'],
        });
      }
    }
  });

function buildPayload(data: ContractFormInput) {
  const payload: Record<string, unknown> = {
    contract_type: data.contract_type,
    visit_date: data.visit_date,
    visit_time: data.visit_time,
    visit_summary: data.visit_summary,
    company_location: data.company_location,
    company_name: data.company_name,
    company_activity: data.company_activity,
  };

  if (data.contract_owner_type) payload.contract_owner_type = data.contract_owner_type;
  if (data.visit_type) payload.visit_type = data.visit_type;
  if (data.center_interest_level) payload.center_interest_level = data.center_interest_level;
  if (data.company_activity_custom) payload.company_activity_custom = data.company_activity_custom;
  if (data.requirements) payload.requirements = data.requirements;
  if (data.sales_rep_notes) payload.sales_rep_notes = data.sales_rep_notes;

  if (data.contract_owner_type === 'company') {
    if (data.manager_name) payload.manager_name = data.manager_name;
    payload.manager_mobile = data.manager_mobile;
    payload.manager_email = data.manager_email;
  } else if (data.contract_owner_type === 'doctor') {
    if (data.communication_date) payload.communication_date = data.communication_date;
    if (data.communication_times_count != null) {
      payload.communication_times_count = data.communication_times_count;
    }
  }

  return payload;
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
}: {
  label: string;
  value?: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <div>
      <Text className="mb-2 block text-sm font-medium text-gray-900">{label}</Text>
      <div className="inline-flex w-full rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-300 sm:w-auto">
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
      </div>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </div>
  );
}

export default function ContractForm({ initValues }: { initValues?: Contract }) {
  const { closeModal } = useModal();
  const { mutate: create, isPending: isCreating } = useCreateContract();
  const { mutate: update, isPending: isUpdating } = useUpdateContract();
  const isEditing = !!initValues;
  const loading = isCreating || isUpdating;

  const onSubmit: SubmitHandler<ContractFormInput> = (data) => {
    const payload = buildPayload(data);

    if (initValues) {
      update({ ...payload, id: initValues.id });
    } else {
      create(payload);
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
                    ? 'Update contract visit and contact details.'
                    : 'Fill in visit, location, and owner information.'}
                </Text>
              </div>
              <ActionIcon size="sm" variant="text" onClick={closeModal} aria-label="Close">
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <FormSection title="Visit" description="When the visit happened and what was discussed.">
                <Input
                  label="Visit Date"
                  type="date"
                  {...register('visit_date')}
                  error={errors.visit_date?.message}
                />
                <Input
                  label="Visit Time"
                  type="time"
                  {...register('visit_time')}
                  error={errors.visit_time?.message}
                />
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
                    error={errors.visit_summary?.message}
                  />
                </FullWidthField>
              </FormSection>

              <FormSection title="Location & Type" description="How and where the visit took place.">
                <FullWidthField>
                  <SegmentedControl
                    label="Contract Type"
                    value={contractType}
                    options={contractTypeOptions}
                    onChange={(value) =>
                      setValue('contract_type', value as ContractType, { shouldValidate: true })
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
                    error={errors.company_location?.message}
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
                    onChange={(value) =>
                      setValue('contract_owner_type', value as ContractOwnerType, {
                        shouldValidate: true,
                      })
                    }
                  />
                </FullWidthField>

                <Input
                  label={isDoctor ? 'Doctor Name' : 'Company Name'}
                  placeholder={isDoctor ? 'Enter doctor name' : 'Enter company name'}
                  {...register('company_name')}
                  error={errors.company_name?.message}
                />
                <Input
                  label={isDoctor ? 'Specialty' : 'Company Activity'}
                  placeholder={isDoctor ? 'e.g. Orthopedics' : 'e.g. Healthcare'}
                  {...register('company_activity')}
                  error={errors.company_activity?.message}
                />
                {!isDoctor && (
                  <Input
                    label="Custom Activity"
                    placeholder="Other activity (optional)"
                    {...register('company_activity_custom')}
                  />
                )}
              </FormSection>

              {isCompany && (
                <FormSection title="Company Contact" description="External manager contact details.">
                  <Input
                    label="Manager Name"
                    placeholder="External contact name"
                    {...register('manager_name')}
                  />
                  <Input
                    label="Manager Mobile"
                    placeholder="e.g. 966501234567"
                    {...register('manager_mobile')}
                    error={errors.manager_mobile?.message}
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

              {isDoctor && (
                <FormSection title="Communication" description="Doctor communication tracking.">
                  <Input label="Communication Date" type="date" {...register('communication_date')} />
                  <Input
                    label="Times Communicated"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register('communication_times_count')}
                  />
                </FormSection>
              )}

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

              {isEditing && initValues?.service_manager_name && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 dark:border-gray-400">
                  <Text className="text-sm text-gray-600 dark:text-gray-700">
                    <span className="font-medium text-gray-900">Service Manager:</span>{' '}
                    {initValues.service_manager_name}
                  </Text>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-300">
              <Button type="button" variant="outline" onClick={closeModal} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? 'Saving...' : isEditing ? 'Update Contract' : 'Create Contract'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
