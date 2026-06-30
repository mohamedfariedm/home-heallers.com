'use client';

import { useMemo, useState } from 'react';
import {
  PiPlusBold,
  PiTrashBold,
  PiXBold,
  PiTicket,
  PiCalendarBlank,
  PiUsersThree,
  PiFunnel,
  PiCaretLeft,
  PiCaretRight,
} from 'react-icons/pi';
import {
  Controller,
  SubmitHandler,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  couponFormValidationSchema,
  CouponFormInput,
} from '@/utils/validators/coupon-form.schema';
import { Checkbox } from '@/components/ui/checkbox';
import Spinner from '@/components/ui/spinner';
import { useCreateCoupons, useUpdateCoupons } from '@/framework/coupons';
import { useServices } from '@/framework/services';
import { useCities } from '@/framework/cities';
import { useCountries } from '@/framework/countrues';
import { useCategories } from '@/framework/categories';
import { DatePicker } from '@/components/ui/datepicker';
import {
  COUPON_TYPES,
  ELIGIBLE_USER_TYPES,
  FIRST_BOOKING_SCOPES,
  PATIENT_SEGMENT_OPTIONS,
} from '@/utils/coupon-constants';
import {
  buildCouponPayload,
  normalizeTranslatedField,
  parseCouponDate,
} from '@/utils/coupon-payload';
import type { CouponInsuranceFilter } from '@/types/coupon';
import cn from '@/utils/class-names';

type CouponTabId = 'general' | 'schedule' | 'audience' | 'targeting';

const TABS: {
  id: CouponTabId;
  label: string;
  icon: typeof PiTicket;
}[] = [
  { id: 'general', label: 'General', icon: PiTicket },
  { id: 'schedule', label: 'Schedule', icon: PiCalendarBlank },
  { id: 'audience', label: 'Audience', icon: PiUsersThree },
  { id: 'targeting', label: 'Targeting', icon: PiFunnel },
];

const selectMenuPortal = {
  menuPortalTarget:
    typeof document !== 'undefined' ? document.body : undefined,
  styles: { menuPortal: (base: object) => ({ ...base, zIndex: 9999 }) },
};

const nativeSelectClassName =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

function CouponEnumSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(nativeSelectClassName, error && 'border-red-500')}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function CouponPortalSelect({
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
  isLoading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  placeholder?: string;
  isLoading?: boolean;
}) {
  const selected =
    options.find((o) => o.value === value) ?? null;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-900">
        {label}
      </label>
      <Select
        options={options}
        value={selected}
        onChange={(opt) => onChange(opt?.value ?? '')}
        isLoading={isLoading}
        placeholder={placeholder}
        {...selectMenuPortal}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function toSelectOptions(
  items: any[] | undefined,
  lang: 'en' | 'ar' = 'en'
) {
  return (
    items?.map((item) => ({
      value: item.id,
      label:
        item?.name?.[lang] ?? item?.name?.en ?? item?.name?.ar ?? `#${item.id}`,
    })) ?? []
  );
}

function tabHasErrors(
  tabId: CouponTabId,
  errors: FieldErrors<CouponFormInput>
): boolean {
  switch (tabId) {
    case 'general':
      return !!(
        errors.name ||
        errors.code ||
        errors.type ||
        errors.value ||
        errors.max_discount ||
        errors.free_service_ids ||
        errors.description
      );
    case 'schedule':
      return !!(
        errors.starts_at ||
        errors.ends_at ||
        errors.max_redemptions ||
        errors.daily_limit ||
        errors.per_client_limit ||
        errors.min_order_subtotal
      );
    case 'audience':
      return !!(
        errors.eligible_user_type ||
        errors.first_booking_scope ||
        errors.first_booking_category_id
      );
    case 'targeting':
      return false;
    default:
      return false;
  }
}

function TabPanelCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-300 dark:bg-gray-100/40">
      <div className="mb-4 border-b border-gray-200 pb-3 dark:border-gray-300">
        <h5 className="text-sm font-semibold text-gray-900">{title}</h5>
        {description && (
          <Text className="mt-1 text-xs text-gray-500">{description}</Text>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

type FormFieldsProps = {
  register: UseFormRegister<CouponFormInput>;
  control: Control<CouponFormInput>;
  watch: UseFormWatch<CouponFormInput>;
  setValue: UseFormSetValue<CouponFormInput>;
  errors: FieldErrors<CouponFormInput>;
  serviceOptions: { value: number; label: string }[];
  cityOptions: { value: number; label: string }[];
  countryOptions: { value: number; label: string }[];
  categoryOptions: { value: string; name: string; label: string }[];
  isServicesLoading: boolean;
  isCitiesLoading: boolean;
  isCountriesLoading: boolean;
  isCategoriesLoading: boolean;
  insuranceTypes: CouponInsuranceFilter[];
  setInsuranceTypes: React.Dispatch<
    React.SetStateAction<CouponInsuranceFilter[]>
  >;
};

function GeneralTab({
  register,
  control,
  watch,
  setValue,
  errors,
  serviceOptions,
  isServicesLoading,
}: FormFieldsProps) {
  const watchType = watch('type');

  return (
    <div className="space-y-5">
      <TabPanelCard
        title="Coupon identity"
        description="Names and code shown to customers"
      >
        <Input
          label="Coupon Name (English)"
          {...register('name.en')}
          error={errors.name?.en?.message}
        />
        <Input
          label="Coupon Name (Arabic)"
          {...register('name.ar')}
          error={errors.name?.ar?.message}
        />
        <Input
          label="Coupon Code"
          {...register('code')}
          error={errors.code?.message}
          placeholder="SAVE20"
          className="font-mono uppercase"
        />
        <div className="flex items-end sm:col-span-2">
          <Checkbox
            label="Active — coupon can be redeemed"
            checked={watch('is_active')}
            onChange={() => setValue('is_active', !watch('is_active'))}
          />
        </div>
      </TabPanelCard>

      <TabPanelCard
        title="Description"
        description="Optional marketing copy for the coupon"
      >
        <Input
          label="Description (English)"
          {...register('description.en')}
          error={errors.description?.en?.message}
        />
        <Input
          label="Description (Arabic)"
          {...register('description.ar')}
          error={errors.description?.ar?.message}
        />
      </TabPanelCard>

      <TabPanelCard
        title="Discount"
        description="How the coupon reduces the order total"
      >
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <CouponEnumSelect
              label="Discount type"
              value={field.value}
              onChange={field.onChange}
              options={COUPON_TYPES}
              error={errors.type?.message}
            />
          )}
        />
        {(watchType === 'percent' || watchType === 'fixed') && (
          <Input
            label={watchType === 'percent' ? 'Value (%)' : 'Value (SAR)'}
            type="number"
            step="0.01"
            {...register('value')}
            error={errors.value?.message}
          />
        )}
        {watchType === 'percent' && (
          <Input
            label="Max discount cap (SAR)"
            type="number"
            step="0.01"
            {...register('max_discount')}
            error={errors.max_discount?.message}
            placeholder="Optional"
          />
        )}
        {watchType === 'free_delivery' && (
          <Text className="col-span-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Free delivery applies to delivery fees. Full integration is pending
            Phase 2.
          </Text>
        )}
        {watchType === 'free_service' && (
          <div className="col-span-full">
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Free services
            </label>
            <Controller
              control={control}
              name="free_service_ids"
              render={({ field }) => (
                <Select
                  isMulti
                  isLoading={isServicesLoading}
                  options={serviceOptions}
                  value={serviceOptions.filter((o) =>
                    field.value?.includes(o.value)
                  )}
                  onChange={(selected) =>
                    field.onChange(
                      selected ? selected.map((s) => s.value) : []
                    )
                  }
                  {...selectMenuPortal}
                  placeholder="Select services to make free"
                />
              )}
            />
            {errors.free_service_ids && (
              <p className="mt-1 text-sm text-red-500">
                {errors.free_service_ids.message}
              </p>
            )}
          </div>
        )}
      </TabPanelCard>
    </div>
  );
}

function ScheduleTab({ register, control, errors }: FormFieldsProps) {
  return (
    <div className="space-y-5">
      <TabPanelCard
        title="Validity period"
        description="Dates use Asia/Riyadh timezone on the server"
      >
        <Controller
          control={control}
          name="starts_at"
          render={({ field }) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Starts at
              </label>
              <DatePicker
                selected={field.value ?? undefined}
                onChange={(date) => field.onChange(date ?? null)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="No start date"
                inputProps={{ className: 'w-full' }}
              />
            </div>
          )}
        />
        <Controller
          control={control}
          name="ends_at"
          render={({ field }) => (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Ends at
              </label>
              <DatePicker
                selected={field.value ?? undefined}
                onChange={(date) => field.onChange(date ?? null)}
                showTimeSelect
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="No end date"
                inputProps={{ className: 'w-full' }}
              />
              {errors.ends_at && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.ends_at.message}
                </p>
              )}
            </div>
          )}
        />
      </TabPanelCard>

      <TabPanelCard
        title="Redemption limits"
        description="Control how often this coupon can be used"
      >
        <Input
          label="Max redemptions (total)"
          type="number"
          {...register('max_redemptions')}
          error={errors.max_redemptions?.message}
          placeholder="Unlimited"
        />
        <Input
          label="Daily limit"
          type="number"
          {...register('daily_limit')}
          error={errors.daily_limit?.message}
          placeholder="Unlimited"
        />
        <Input
          label="Per-client limit"
          type="number"
          {...register('per_client_limit')}
          error={errors.per_client_limit?.message}
        />
        <Input
          label="Min order subtotal (SAR)"
          type="number"
          step="0.01"
          {...register('min_order_subtotal')}
          error={errors.min_order_subtotal?.message}
        />
      </TabPanelCard>
    </div>
  );
}

function AudienceTab({
  control,
  watch,
  errors,
  categoryOptions,
  isCategoriesLoading,
}: FormFieldsProps) {
  const watchFirstBookingScope = watch('first_booking_scope');

  return (
    <TabPanelCard
      title="Eligibility rules"
      description="Who can use this coupon"
    >
      <Controller
        control={control}
        name="eligible_user_type"
        render={({ field }) => (
          <CouponEnumSelect
            label="Eligible user type"
            value={field.value}
            onChange={field.onChange}
            options={ELIGIBLE_USER_TYPES}
            error={errors.eligible_user_type?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="first_booking_scope"
        render={({ field }) => (
          <CouponEnumSelect
            label="First booking scope"
            value={field.value}
            onChange={field.onChange}
            options={FIRST_BOOKING_SCOPES}
            error={errors.first_booking_scope?.message}
          />
        )}
      />
      {watchFirstBookingScope === 'category' && (
        <Controller
          control={control}
          name="first_booking_category_id"
          render={({ field }) => (
            <CouponPortalSelect
              label="First booking category"
              placeholder="Select category"
              options={categoryOptions.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.first_booking_category_id?.message}
              isLoading={isCategoriesLoading}
            />
          )}
        />
      )}
      <Text className="col-span-full text-xs text-gray-500">
        &quot;New&quot; users have no paid booking or paid market order.
        First-booking rules apply on top of user type.
      </Text>
    </TabPanelCard>
  );
}

function TargetingTab({
  control,
  serviceOptions,
  cityOptions,
  countryOptions,
  isServicesLoading,
  isCitiesLoading,
  isCountriesLoading,
  insuranceTypes,
  setInsuranceTypes,
}: FormFieldsProps) {
  return (
    <div className="space-y-5">
      <TabPanelCard
        title="Location & services"
        description="Empty selections mean no restriction"
      >
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Services
          </label>
          <Text className="mb-2 text-xs text-gray-500">
            Order must include at least one selected service
          </Text>
          <Controller
            control={control}
            name="service_ids"
            render={({ field }) => (
              <Select
                isMulti
                isLoading={isServicesLoading}
                options={serviceOptions}
                value={serviceOptions.filter((o) =>
                  field.value?.includes(o.value)
                )}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                {...selectMenuPortal}
                placeholder="All services"
              />
            )}
          />
        </div>
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Cities
          </label>
          <Controller
            control={control}
            name="city_ids"
            render={({ field }) => (
              <Select
                isMulti
                isLoading={isCitiesLoading}
                options={cityOptions}
                value={cityOptions.filter((o) =>
                  field.value?.includes(o.value)
                )}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                {...selectMenuPortal}
                placeholder="All cities"
              />
            )}
          />
        </div>
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Countries
          </label>
          <Controller
            control={control}
            name="country_ids"
            render={({ field }) => (
              <Select
                isMulti
                isLoading={isCountriesLoading}
                options={countryOptions}
                value={countryOptions.filter((o) =>
                  field.value?.includes(o.value)
                )}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                {...selectMenuPortal}
                placeholder="All countries"
              />
            )}
          />
        </div>
      </TabPanelCard>

      <TabPanelCard
        title="Customer filters"
        description="Restrict by phone, tier, or insurance"
      >
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Phone whitelist
          </label>
          <Controller
            control={control}
            name="phone_numbers"
            render={({ field }) => (
              <CreatableSelect
                isMulti
                value={field.value?.map((phone: string) => ({
                  value: phone,
                  label: phone,
                }))}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                placeholder="Type a number and press Enter"
                {...selectMenuPortal}
              />
            )}
          />
        </div>
        <div className="col-span-full">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Patient segments
          </label>
          <Controller
            control={control}
            name="patient_segments"
            render={({ field }) => (
              <Select
                isMulti
                options={PATIENT_SEGMENT_OPTIONS}
                value={PATIENT_SEGMENT_OPTIONS.filter((o) =>
                  field.value?.includes(o.value)
                )}
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((s) => s.value) : []
                  )
                }
                {...selectMenuPortal}
                placeholder="All segments"
              />
            )}
          />
        </div>
        <div className="col-span-full space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Insurance filters
              </label>
              <Text className="text-xs text-gray-500">
                Match by insurance ID and/or company name
              </Text>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setInsuranceTypes((rows) => [
                  ...rows,
                  { insurance_id: null, insurance_company: '' },
                ])
              }
            >
              <PiPlusBold className="me-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
          {insuranceTypes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center">
              <Text className="text-sm text-gray-500">
                No insurance filters — all insurance types allowed
              </Text>
            </div>
          ) : (
            insuranceTypes.map((row, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <Input
                  label="Insurance ID"
                  type="number"
                  value={row.insurance_id ?? ''}
                  onChange={(e) => {
                    const next = [...insuranceTypes];
                    next[index] = {
                      ...next[index],
                      insurance_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    };
                    setInsuranceTypes(next);
                  }}
                />
                <Input
                  label="Insurance company"
                  value={row.insurance_company ?? ''}
                  onChange={(e) => {
                    const next = [...insuranceTypes];
                    next[index] = {
                      ...next[index],
                      insurance_company: e.target.value,
                    };
                    setInsuranceTypes(next);
                  }}
                  placeholder="Optional"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="self-end"
                  onClick={() =>
                    setInsuranceTypes((rows) =>
                      rows.filter((_, i) => i !== index)
                    )
                  }
                >
                  <PiTrashBold className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </TabPanelCard>
    </div>
  );
}

export default function CreateOrUpdateCoupon({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupons();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupons();
  const { data: servicesData, isLoading: isServicesLoading } = useServices('');
  const { data: citiesData, isLoading: isCitiesLoading } = useCities('');
  const { data: countriesData, isLoading: isCountriesLoading } =
    useCountries('');
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useCategories('');
  const [lang] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState(0);
  const [insuranceTypes, setInsuranceTypes] = useState<CouponInsuranceFilter[]>(
    initValues?.insurance_types?.length
      ? initValues.insurance_types.map((row: CouponInsuranceFilter) => ({
          insurance_id: row.insurance_id ?? null,
          insurance_company: row.insurance_company ?? '',
        }))
      : []
  );

  const serviceOptions = useMemo(
    () => toSelectOptions(servicesData?.data, lang),
    [servicesData?.data, lang]
  );
  const cityOptions = useMemo(
    () => toSelectOptions(citiesData?.data, lang),
    [citiesData?.data, lang]
  );
  const countryOptions = useMemo(
    () => toSelectOptions(countriesData?.data, lang),
    [countriesData?.data, lang]
  );
  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data ?? []).map((c: any) => ({
        value: String(c.id),
        name: c?.name?.[lang] ?? c?.name?.en ?? `Category ${c.id}`,
        label: c?.name?.[lang] ?? c?.name?.en ?? `Category ${c.id}`,
      })),
    [categoriesData?.data, lang]
  );

  const onSubmit: SubmitHandler<CouponFormInput> = (data) => {
    const payload = buildCouponPayload(data, insuranceTypes);

    if (initValues?.id) {
      updateCoupon({ coupon_id: initValues.id, ...payload });
    } else {
      createCoupon(payload);
    }
  };

  const isDropdownLoading =
    isServicesLoading ||
    isCitiesLoading ||
    isCountriesLoading ||
    isCategoriesLoading;

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(TABS.length - 1, index)));
  };

  if (isCreating || isUpdating) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<CouponFormInput>
      onSubmit={onSubmit}
      validationSchema={couponFormValidationSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          description: normalizeTranslatedField(initValues?.description),
          code: initValues?.code || '',
          type: initValues?.type || 'percent',
          value: initValues?.value != null ? String(initValues.value) : '',
          max_discount:
            initValues?.max_discount != null
              ? String(initValues.max_discount)
              : '',
          starts_at: parseCouponDate(initValues?.starts_at),
          ends_at: parseCouponDate(initValues?.ends_at),
          max_redemptions:
            initValues?.max_redemptions != null
              ? String(initValues.max_redemptions)
              : '',
          daily_limit:
            initValues?.daily_limit != null
              ? String(initValues.daily_limit)
              : '',
          per_client_limit:
            initValues?.per_client_limit != null
              ? String(initValues.per_client_limit)
              : '1',
          min_order_subtotal:
            initValues?.min_order_subtotal != null
              ? String(initValues.min_order_subtotal)
              : '0',
          eligible_user_type: initValues?.eligible_user_type || 'any',
          first_booking_scope: initValues?.first_booking_scope || 'none',
          first_booking_category_id: initValues?.first_booking_category_id
            ? String(initValues.first_booking_category_id)
            : '',
          is_active: initValues?.is_active !== false,
          service_ids: initValues?.service_ids ?? [],
          free_service_ids: initValues?.free_service_ids ?? [],
          city_ids: initValues?.city_ids ?? [],
          country_ids: initValues?.country_ids ?? [],
          phone_numbers: initValues?.phone_numbers ?? [],
          insurance_types: initValues?.insurance_types ?? [],
          patient_segments: initValues?.patient_segments ?? [],
        },
      }}
      className="flex h-[85vh] max-h-[85vh] flex-col overflow-hidden"
    >
      {({ register, control, watch, setValue, formState: { errors } }) => {
        const fieldProps: FormFieldsProps = {
          register,
          control,
          watch,
          setValue,
          errors,
          serviceOptions,
          cityOptions,
          countryOptions,
          categoryOptions,
          isServicesLoading,
          isCitiesLoading,
          isCountriesLoading,
          isCategoriesLoading,
          insuranceTypes,
          setInsuranceTypes,
        };

        const isActive = watch('is_active');
        const codePreview = watch('code');

        return (
          <>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <PiTicket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Title as="h4" className="text-lg font-semibold">
                    {initValues ? 'Update Coupon' : 'Create Coupon'}
                  </Title>
                  <div className="mt-0.5 flex items-center gap-2">
                    {codePreview && (
                      <span className="font-mono text-xs text-gray-500">
                        {codePreview.toUpperCase()}
                      </span>
                    )}
                    <Badge color={isActive ? 'success' : 'danger'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="text" onClick={closeModal} className="shrink-0">
                <PiXBold className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs
              selectedIndex={activeTab}
              onChange={setActiveTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="shrink-0 border-b border-gray-200 bg-white px-6">
                <TabList className="inline-flex w-full justify-start gap-1 border-0 p-0">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const hasError = tabHasErrors(tab.id, errors);
                    return (
                      <Tab
                        key={tab.id}
                        className={({ selected }) =>
                          cn(
                            'relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all',
                            selected
                              ? 'border-b-2 border-primary bg-primary/5 text-primary'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        {hasError && (
                          <span className="absolute right-1 top-2 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </Tab>
                    );
                  })}
                </TabList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <TabPanels>
                  <TabPanel className="outline-none">
                    <GeneralTab {...fieldProps} />
                  </TabPanel>
                  <TabPanel className="outline-none">
                    <ScheduleTab {...fieldProps} />
                  </TabPanel>
                  <TabPanel className="outline-none">
                    <AudienceTab {...fieldProps} />
                  </TabPanel>
                  <TabPanel className="outline-none">
                    <TargetingTab {...fieldProps} />
                  </TabPanel>
                </TabPanels>

                {isDropdownLoading && (
                  <Text className="mt-3 text-center text-xs text-gray-500">
                    Loading filter options…
                  </Text>
                )}
              </div>
            </Tabs>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeTab === 0}
                  onClick={() => goToTab(activeTab - 1)}
                >
                  <PiCaretLeft className="me-1 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={activeTab === TABS.length - 1}
                  onClick={() => goToTab(activeTab + 1)}
                >
                  Next
                  <PiCaretRight className="ms-1 h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isCreating || isUpdating}>
                  {initValues ? 'Save changes' : 'Create coupon'}
                </Button>
              </div>
            </div>
          </>
        );
      }}
    </Form>
  );
}
