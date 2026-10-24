'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Select, { type InputActionMeta, type StylesConfig } from 'react-select';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { PiCopy, PiTicket, PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/datepicker';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Text, Title } from '@/components/ui/text';
import { useCreateBulkPersonalCoupons } from '@/framework/coupons';
import { usePatients } from '@/framework/patients';
import { getLocale } from '@/framework/utils/get-token';
import type {
  BulkPersonalChannelStatus,
  BulkPersonalCouponData,
  BulkPersonalCouponRequest,
  BulkPersonalDiscountType,
  BulkPersonalNotificationChannel,
} from '@/types/bulk-personal-coupon';
import { setAuthCredentials } from '@/utils/auth-utils';
import cn from '@/utils/class-names';
import {
  getReservationPatientName,
  resolveLocalizedName,
} from '@/utils/resolve-localized-name';

const MAX_CUSTOMERS = 200;
const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

const CHANNELS: { value: BulkPersonalNotificationChannel; label: string }[] = [
  { value: 'push_notification', label: 'Push notification' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

type Customer = {
  id: number;
  name: string;
  mobile: string;
  email: string;
};

type CustomerOption = Customer & {
  value: number;
  label: string;
};

type Person = {
  id: number;
  name?: { en?: string; ar?: string } | string | null;
  mobile?: string | null;
  phone?: string | null;
  email?: string | null;
};

type FieldErrors = Partial<
  Record<'customer_ids' | 'discount' | 'discount_type' | 'discount_value' | 'expires_at' | 'channels', string>
>;

type SubmitResult = {
  data: BulkPersonalCouponData;
  names: Record<number, string>;
};

const selectStyles: StylesConfig<CustomerOption, true> = {
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderRadius: 8,
    borderColor: state.isFocused ? '#111827' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #111827' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#111827' : '#d1d5db' },
  }),
  valueContainer: (base) => ({
    ...base,
    gap: 4,
    padding: '4px 8px',
  }),
  multiValue: (base) => ({
    ...base,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: 13,
    color: '#111827',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

function dashboardLocale(): 'en' | 'ar' {
  return getLocale() === 'ar' ? 'ar' : 'en';
}

function personToCustomer(item: Person, locale: 'en' | 'ar'): Customer {
  const name =
    resolveLocalizedName(item.name, locale) || `Customer #${item.id}`;
  return {
    id: Number(item.id),
    name,
    mobile: String(item.mobile || item.phone || '').trim(),
    email: String(item.email || '').trim(),
  };
}

function toOption(customer: Customer): CustomerOption {
  return {
    ...customer,
    value: customer.id,
    label: customer.name,
  };
}

function customersFromClientRows(rows: any[], locale: 'en' | 'ar') {
  const byId = new Map<number, Customer>();

  for (const row of rows) {
    const id = Number(row?.id);
    if (!Number.isFinite(id) || id <= 0 || byId.has(id)) continue;
    byId.set(id, personToCustomer({ ...row, id }, locale));
  }

  return { customers: Array.from(byId.values()), guestsWithoutAccount: 0 };
}

function customersFromReservations(rows: any[], locale: 'en' | 'ar') {
  const byId = new Map<number, Customer>();
  let guestsWithoutAccount = 0;

  for (const row of rows) {
    const rawId = row?.patient?.id ?? row?.client?.id ?? row?.client_id;
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) {
      guestsWithoutAccount += 1;
      continue;
    }
    if (byId.has(id)) continue;

    const name =
      resolveLocalizedName(row?.patient?.name ?? row?.client?.name, locale) ||
      getReservationPatientName(row);
    const mobile = String(
      row?.patient?.mobile ?? row?.client?.mobile ?? row?.patient?.phone ?? ''
    ).trim();
    const email = String(row?.patient?.email ?? row?.client?.email ?? '').trim();

    byId.set(id, {
      id,
      name: name && name !== '—' ? name : `Customer #${id}`,
      mobile,
      email,
    });
  }

  return { customers: Array.from(byId.values()), guestsWithoutAccount };
}

function pickerWallClockToRiyadhIso(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}+03:00`;
}

function riyadhInstantMs(date: Date) {
  return (
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ) - RIYADH_OFFSET_MS
  );
}

function useDebouncedValue(value: string, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function channelTone(status: BulkPersonalChannelStatus | undefined) {
  if (status === 'sent' || status === 'queued') return 'success' as const;
  if (status === 'failed') return 'danger' as const;
  if (status === 'skipped') return 'warning' as const;
  return 'secondary' as const;
}

function collectChannelCounts(data: BulkPersonalCouponData) {
  let failed = 0;
  let skipped = 0;
  for (const customer of data.customers) {
    for (const status of Object.values(customer.notifications ?? {})) {
      if (status === 'failed') failed += 1;
      if (status === 'skipped') skipped += 1;
    }
  }
  return { failed, skipped };
}

function validationMessages(error: unknown): Record<string, string[]> {
  const errors = (error as { response?: { data?: { errors?: unknown } } })?.response
    ?.data?.errors;
  if (!errors || typeof errors !== 'object') return {};
  return errors as Record<string, string[]>;
}

function firstMatchingError(
  errors: Record<string, string[]>,
  prefixes: string[]
) {
  for (const prefix of prefixes) {
    if (errors[prefix]?.[0]) return errors[prefix][0];
  }
  for (const [key, messages] of Object.entries(errors)) {
    if (
      prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}.`)) &&
      messages?.[0]
    ) {
      return messages[0];
    }
  }
  return undefined;
}

async function redirectToLogin() {
  setAuthCredentials('');
  localStorage.removeItem('permissions');
  await signOut({ redirect: false });
  window.location.assign('/auth/login');
}

function seedCustomers(reservations: any[], clients: any[], locale: 'en' | 'ar') {
  if (clients.length > 0) return customersFromClientRows(clients, locale);
  return customersFromReservations(reservations, locale);
}

export default function BulkPersonalCouponsForm({
  reservations = [],
  clients = [],
}: {
  reservations?: any[];
  clients?: any[];
}) {
  const locale = dashboardLocale();
  const { closeModal } = useModal();
  const { mutateAsync } = useCreateBulkPersonalCoupons();
  const submittingRef = useRef(false);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);
  const [page, setPage] = useState(1);
  const [listed, setListed] = useState<CustomerOption[]>([]);
  const [selected, setSelected] = useState<Customer[]>(() =>
    seedCustomers(reservations, clients, dashboardLocale()).customers.slice(0, MAX_CUSTOMERS)
  );
  const [createCoupon, setCreateCoupon] = useState(true);
  const [discountType, setDiscountType] =
    useState<BulkPersonalDiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [channels, setChannels] = useState<BulkPersonalNotificationChannel[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const clientQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '20');
    params.set('page', String(page));
    if (debouncedSearch) params.set('name', debouncedSearch);
    return params.toString();
  }, [debouncedSearch, page]);

  const {
    data: clientsData,
    isFetching: clientsLoading,
    isError: clientsError,
  } = usePatients(clientQuery);

  useEffect(() => {
    const rows = ((clientsData?.data ?? []) as Person[]).map((item) =>
      toOption(personToCustomer(item, locale))
    );
    setListed((prev) => {
      if (page === 1) return rows;
      const seen = new Set(prev.map((item) => item.value));
      return [...prev, ...rows.filter((item) => !seen.has(item.value))];
    });
  }, [clientsData, page, locale]);

  const lastPage = Number(clientsData?.meta?.last_page ?? 1);
  const totalClients = Number(clientsData?.meta?.total ?? listed.length);
  const selectedOptions = selected.map(toOption);
  const missingMobile = selected.filter((customer) => !customer.mobile);
  const wantsPhoneChannel =
    channels.includes('sms') || channels.includes('whatsapp');

  useEffect(() => {
    const { customers, guestsWithoutAccount } = seedCustomers(
      reservations,
      clients,
      locale
    );
    if (guestsWithoutAccount > 0) {
      toast(
        `Skipped ${guestsWithoutAccount} reservation${guestsWithoutAccount === 1 ? '' : 's'} without a customer account.`
      );
    }
    if (customers.length > MAX_CUSTOMERS) {
      toast.error('Only the first 200 customers were added.');
    }
  }, [clients, locale, reservations]);

  const onSearchChange = (input: string, meta: InputActionMeta) => {
    if (meta.action !== 'input-change') return input;
    setPage(1);
    setSearchInput(input);
    return input;
  };

  const updateSelected = (next: readonly CustomerOption[] | null) => {
    const items = [...(next ?? [])];
    if (items.length > MAX_CUSTOMERS) {
      setSelected(items.slice(0, MAX_CUSTOMERS));
      setFieldErrors((prev) => ({
        ...prev,
        customer_ids: 'You can select at most 200 customers.',
      }));
      return;
    }
    setSelected(
      items.map((item) => ({
        id: item.id,
        name: item.name,
        mobile: item.mobile,
        email: item.email,
      }))
    );
    setFieldErrors((prev) => ({ ...prev, customer_ids: undefined }));
  };

  const toggleChannel = (channel: BulkPersonalNotificationChannel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((item) => item !== channel)
        : [...prev, channel]
    );
    setFieldErrors((prev) => ({ ...prev, channels: undefined }));
  };

  const validate = (): BulkPersonalCouponRequest | null => {
    const errors: FieldErrors = {};
    const uniqueIds = Array.from(new Set(selected.map((customer) => customer.id)));

    if (uniqueIds.length < 1) {
      errors.customer_ids = 'At least one customer is required.';
    } else if (uniqueIds.length > MAX_CUSTOMERS) {
      errors.customer_ids = 'You can select at most 200 customers.';
    }

    let discountValueNumber = Number(discountValue);
    if (createCoupon) {
      if (!Number.isFinite(discountValueNumber)) {
        errors.discount_value = 'Discount value is required.';
      } else if (discountType === 'percentage' || discountType === 'percent') {
        if (discountValueNumber < 1 || discountValueNumber > 100) {
          errors.discount_value = 'Percentage discount must be between 1 and 100.';
        }
      } else if (discountValueNumber < 0.01) {
        errors.discount_value = 'Fixed discount must be at least 0.01.';
      }
    }

    if (hasExpiration) {
      if (!expiresAt) {
        errors.expires_at = 'Expiration date is required when expiration is enabled.';
      } else if (riyadhInstantMs(expiresAt) <= Date.now()) {
        errors.expires_at = 'Expiration date must be in the future.';
      }
    }

    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return null;

    const payload: BulkPersonalCouponRequest = {
      customer_ids: uniqueIds,
      create_coupon: createCoupon,
      has_expiration: hasExpiration,
      notification_channels: channels,
    };

    if (createCoupon) {
      payload.discount = {
        type: discountType,
        value: discountValueNumber,
      };
    }
    if (hasExpiration && expiresAt) {
      payload.expires_at = pickerWallClockToRiyadhIso(expiresAt);
    }

    return payload;
  };

  const onSubmit = async () => {
    if (submittingRef.current) return;
    setFormError('');
    const payload = validate();
    if (!payload) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const response = await mutateAsync(payload);
      const data = response.data;
      const names = Object.fromEntries(selected.map((customer) => [customer.id, customer.name]));
      setResult({ data, names });

      const issues = collectChannelCounts(data);
      if (!data.success) {
        toast.error('Some coupons failed to create.');
      } else if (!createCoupon) {
        toast.success('Request completed. No coupons were created.');
      } else if (issues.failed > 0 || issues.skipped > 0) {
        toast('Coupons created. Some delivery channels were skipped or failed.');
      } else {
        toast.success('Personal coupons created and queued.');
      }
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        toast.error('Your session expired. Sign in again.');
        await redirectToLogin();
        return;
      }
      if (status === 403) {
        const message = 'You do not have permission to manage coupons.';
        setFormError(message);
        toast.error(message);
        return;
      }
      if (status === 422) {
        const apiErrors = validationMessages(error);
        setFieldErrors({
          customer_ids: firstMatchingError(apiErrors, ['customer_ids']),
          discount: firstMatchingError(apiErrors, ['discount']),
          discount_type: firstMatchingError(apiErrors, ['discount.type']),
          discount_value: firstMatchingError(apiErrors, ['discount.value']),
          expires_at: firstMatchingError(apiErrors, ['expires_at', 'has_expiration']),
          channels: firstMatchingError(apiErrors, ['notification_channels']),
        });
        setFormError(
          (error as Error)?.message || 'The given data was invalid.'
        );
        return;
      }
      const message = (error as Error)?.message || 'Request failed.';
      setFormError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resultChannels = CHANNELS.filter((channel) =>
    result?.data.customers.some(
      (customer) => customer.notifications?.[channel.value] != null
    )
  );
  const resultIssues = result ? collectChannelCounts(result.data) : null;

  return (
    <section className="flex max-h-[85vh] flex-col overflow-hidden bg-white">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <PiTicket className="h-5 w-5 text-gray-700" />
            <Title as="h3" className="text-base font-semibold text-gray-900">
              Personal coupons
            </Title>
          </div>
          <Text className="mt-1 max-w-3xl text-sm text-gray-500">
            Each code belongs to one customer and cannot be used by anyone else.
            The customers you opened this from are already added below.
          </Text>
        </div>
        <div className="flex items-center gap-3">
          <Text className="whitespace-nowrap text-sm text-gray-500">
            Selected: {selected.length} / {MAX_CUSTOMERS}
          </Text>
          <Button variant="text" onClick={closeModal} className="shrink-0" disabled={isSubmitting}>
            <PiXBold className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-5 overflow-y-auto px-6 py-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Customers
          </label>
          <Select
            isMulti
            isLoading={clientsLoading}
            options={listed}
            value={selectedOptions}
            onChange={updateSelected}
            onInputChange={onSearchChange}
            filterOption={() => true}
            placeholder="Search name, mobile, or email"
            noOptionsMessage={() =>
              clientsError
                ? 'Could not load customers'
                : searchInput.trim()
                  ? 'No customers found'
                  : 'Type to search'
            }
            formatOptionLabel={(option, { context }) =>
              context === 'value' ? (
                option.name
              ) : (
                <span className="flex flex-col">
                  <span className="text-sm text-gray-900">{option.name}</span>
                  <span className="text-xs text-gray-500">
                    {option.mobile || 'No mobile'}
                    {option.email ? ` · ${option.email}` : ''}
                  </span>
                </span>
              )
            }
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={selectStyles}
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            {clientsError ? (
              <Text className="text-sm text-red-500">
                Could not load customers. The Clients permission is required to search.
              </Text>
            ) : (
              <Text className="text-xs text-gray-500">
                {totalClients > listed.length
                  ? `Showing ${listed.length} of ${totalClients}`
                  : 'Search matches name, mobile, and email.'}
              </Text>
            )}
            {page < lastPage ? (
              <Button
                type="button"
                size="sm"
                variant="text"
                disabled={clientsLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Load more
              </Button>
            ) : null}
          </div>
          {fieldErrors.customer_ids ? (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.customer_ids}</p>
          ) : null}
          {wantsPhoneChannel && missingMobile.length > 0 ? (
            <p className="mt-2 text-sm text-amber-700">
              {missingMobile.length} selected customer
              {missingMobile.length === 1 ? '' : 's'} have no mobile. SMS and WhatsApp
              will be skipped for them. The coupon is still created.
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={createCoupon}
            onChange={(event) => setCreateCoupon(event.target.checked)}
            disabled={isSubmitting}
          />
          <div>
            <Text className="text-sm font-medium text-gray-900">Create coupon</Text>
            <Text className="text-xs text-gray-500">
              Off submits the request without creating or sending coupons.
            </Text>
          </div>
        </div>

        {createCoupon ? (
          <div className="grid gap-4 @md:grid-cols-2">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-gray-900">
                Discount type
              </legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="bulk-discount-type"
                    checked={discountType === 'percentage'}
                    onChange={() => setDiscountType('percentage')}
                    disabled={isSubmitting}
                  />
                  Percentage
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="bulk-discount-type"
                    checked={discountType === 'fixed'}
                    onChange={() => setDiscountType('fixed')}
                    disabled={isSubmitting}
                  />
                  Fixed (SAR)
                </label>
              </div>
              {fieldErrors.discount_type ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.discount_type}</p>
              ) : null}
              {fieldErrors.discount ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.discount}</p>
              ) : null}
            </fieldset>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Discount value
              </label>
              <Input
                type="number"
                min={discountType === 'fixed' ? 0.01 : 1}
                max={discountType === 'percentage' ? 100 : undefined}
                step={discountType === 'fixed' ? 0.01 : 1}
                value={discountValue}
                disabled={isSubmitting}
                onChange={(event) => {
                  setDiscountValue(event.target.value);
                  setFieldErrors((prev) => ({
                    ...prev,
                    discount_value: undefined,
                    discount: undefined,
                  }));
                }}
              />
              {fieldErrors.discount_value ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.discount_value}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 @md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Switch
              checked={hasExpiration}
              onChange={(event) => {
                setHasExpiration(event.target.checked);
                setFieldErrors((prev) => ({ ...prev, expires_at: undefined }));
              }}
              disabled={isSubmitting}
            />
            <div>
              <Text className="text-sm font-medium text-gray-900">Expiration</Text>
              <Text className="text-xs text-gray-500">
                Off leaves the coupon without an end date.
              </Text>
            </div>
          </div>
          {hasExpiration ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-900">
                Expires at
              </label>
              <DatePicker
                selected={expiresAt ?? undefined}
                onChange={(date) => {
                  const next = Array.isArray(date) ? date[0] : date;
                  setExpiresAt(next ?? null);
                  setFieldErrors((prev) => ({ ...prev, expires_at: undefined }));
                }}
                showTimeSelect
                timeIntervals={1}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="2026-10-15 23:59"
                minDate={new Date()}
                disabled={isSubmitting}
                inputProps={{ className: 'w-full' }}
              />
              <Text className="mt-1 text-xs text-gray-500">
                Saved as Asia/Riyadh (UTC+3).
              </Text>
              {fieldErrors.expires_at ? (
                <p className="mt-1 text-sm text-red-500">{fieldErrors.expires_at}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-gray-900">
            Delivery channels
          </legend>
          <Text className="mb-2 text-xs text-gray-500">
            Optional. Coupons are still created when no channel is selected.
          </Text>
          <div className="flex flex-wrap gap-4">
            {CHANNELS.map((channel) => (
              <Checkbox
                key={channel.value}
                label={channel.label}
                checked={channels.includes(channel.value)}
                disabled={isSubmitting}
                onChange={() => toggleChannel(channel.value)}
              />
            ))}
          </div>
          {fieldErrors.channels ? (
            <p className="mt-1 text-sm text-red-500">{fieldErrors.channels}</p>
          ) : null}
        </fieldset>

        {formError ? (
          <p className="text-sm text-red-500">{formError}</p>
        ) : null}

        <div>
          <Button type="button" isLoading={isSubmitting} onClick={onSubmit}>
            Generate & send coupons
          </Button>
        </div>

      {result ? (
        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-700">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <Title as="h4" className="text-sm font-semibold text-gray-900">
              Results
            </Title>
            <Button type="button" size="sm" variant="text" onClick={() => setResult(null)}>
              Hide results
            </Button>
          </div>

          <div
            className={cn(
              'mb-4 rounded-md border px-3 py-2 text-sm',
              !result.data.success
                ? 'border-red-200 bg-red-50 text-red-800'
                : resultIssues && (resultIssues.failed > 0 || resultIssues.skipped > 0)
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-green-200 bg-green-50 text-green-800'
            )}
          >
            {!result.data.success
              ? 'Some coupons failed to create. Codes that were created are still valid.'
              : resultIssues && (resultIssues.failed > 0 || resultIssues.skipped > 0)
                ? 'Coupons were created. Review channel statuses below before following up.'
                : 'Every selected customer was processed.'}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge color="secondary">
              Requested {result.data.summary.requested_customers}
            </Badge>
            <Badge color="success">Created {result.data.summary.coupons_created}</Badge>
            <Badge color={result.data.summary.failed > 0 ? 'danger' : 'secondary'}>
              Failed creates {result.data.summary.failed}
            </Badge>
            <Badge color={result.data.success ? 'success' : 'warning'}>
              {result.data.success ? 'Success' : 'Partial create failure'}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Coupon code</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                  {resultChannels.map((channel) => (
                    <th key={channel.value} className="px-2 py-2 font-medium">
                      {channel.label}
                    </th>
                  ))}
                  <th className="px-2 py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {result.data.customers.map((customer) => (
                  <tr key={customer.customer_id} className="border-b border-gray-100">
                    <td className="px-2 py-2">
                      <div className="font-medium text-gray-900">
                        {result.names[customer.customer_id] || `Customer #${customer.customer_id}`}
                      </div>
                      <div className="text-xs text-gray-500">#{customer.customer_id}</div>
                    </td>
                    <td className="px-2 py-2">
                      {customer.coupon_code ? (
                        <span className="inline-flex items-center gap-1 font-mono">
                          {customer.coupon_code}
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-900"
                            aria-label={`Copy ${customer.coupon_code}`}
                            onClick={() => {
                              navigator.clipboard
                                .writeText(customer.coupon_code || '')
                                .then(() => toast.success('Coupon code copied'))
                                .catch(() => toast.error('Could not copy the code'));
                            }}
                          >
                            <PiCopy className="h-4 w-4" />
                          </button>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <Badge color={customer.coupon_created ? 'success' : 'danger'}>
                        {customer.coupon_created ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    {resultChannels.map((channel) => {
                      const status = customer.notifications?.[channel.value];
                      return (
                        <td key={channel.value} className="px-2 py-2">
                          {status ? (
                            <Badge color={channelTone(status)} className="capitalize">
                              {status}
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-red-600">{customer.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      </div>
    </section>
  );
}
