'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Select, { type InputActionMeta, type StylesConfig } from 'react-select';
import { Text } from '@/components/ui/text';
import { usePatients } from '@/framework/patients';
import { useDoctors } from '@/framework/doctors';
import type { NotificationRecipientRef } from '@/types/admin-notifications';

type Option = {
  value: number;
  label: string;
  name: string;
  mobile: string;
  email: string;
};

type Person = {
  id: number;
  name?: { en?: string; ar?: string } | string;
  mobile?: string | null;
  phone?: string | null;
  email?: string | null;
};

const selectStyles: StylesConfig<Option, true> = {
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
    padding: '2px 6px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    borderRadius: 6,
    ':hover': { backgroundColor: '#e5e7eb', color: '#111827' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    color: '#111827',
    backgroundColor: state.isSelected
      ? '#e5e7eb'
      : state.isFocused
        ? '#f9fafb'
        : 'white',
    ':active': { backgroundColor: '#e5e7eb' },
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: 13,
    color: '#9ca3af',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

function personName(item: Person) {
  if (typeof item.name === 'string') return item.name;
  return item.name?.en || item.name?.ar || `#${item.id}`;
}

function toOption(item: Person): Option {
  const name = personName(item);
  return {
    value: item.id,
    name,
    mobile: String(item.mobile || item.phone || ''),
    email: String(item.email || ''),
    label: name,
  };
}

function matchesSearch(option: Option, rawInput: string) {
  const q = rawInput.trim().toLowerCase();
  if (!q) return true;
  return (
    option.name.toLowerCase().includes(q) ||
    option.mobile.toLowerCase().includes(q) ||
    option.email.toLowerCase().includes(q) ||
    String(option.value).includes(q)
  );
}

function buildPersonSearchQuery(term: string) {
  const params = new URLSearchParams();
  params.set('limit', '50');
  params.set('page', '1');

  const q = term.trim();
  if (!q) return params.toString();

  if (q.includes('@')) {
    params.set('email_contain', q);
  } else if (/^\+?[\d\s-]{3,}$/.test(q)) {
    params.set('mobile_contain', q.replace(/[\s-]/g, ''));
  } else {
    params.set('name', q);
    params.set('name_contain', q);
  }

  return params.toString();
}

function useDebouncedSearch(delayMs = 300) {
  const [debounced, setDebounced] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearch = useCallback(
    (next: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setDebounced(next), delayMs);
    },
    [delayMs]
  );

  return [debounced, setSearch] as const;
}

type SpecificRecipientsPickerProps = {
  value: NotificationRecipientRef[];
  onChange: (next: NotificationRecipientRef[]) => void;
  error?: string;
};

export default function SpecificRecipientsPicker({
  value,
  onChange,
  error,
}: SpecificRecipientsPickerProps) {
  const [clientSearch, setClientSearch] = useDebouncedSearch();
  const [doctorSearch, setDoctorSearch] = useDebouncedSearch();
  const selectedOptionCache = useRef<Map<string, Option>>(new Map());

  const clientQuery = useMemo(
    () => buildPersonSearchQuery(clientSearch),
    [clientSearch]
  );
  const doctorQuery = useMemo(
    () => buildPersonSearchQuery(doctorSearch),
    [doctorSearch]
  );

  const { data: clientsData, isFetching: clientsLoading } = usePatients(clientQuery);
  const { data: doctorsData, isFetching: doctorsLoading } = useDoctors(doctorQuery);

  const clientOptions = useMemo(() => {
    const options = ((clientsData?.data ?? []) as Person[]).map(toOption);
    options.forEach((option) => {
      selectedOptionCache.current.set(`client:${option.value}`, option);
    });
    return options;
  }, [clientsData?.data]);

  const doctorOptions = useMemo(() => {
    const options = ((doctorsData?.data ?? []) as Person[]).map(toOption);
    options.forEach((option) => {
      selectedOptionCache.current.set(`doctor:${option.value}`, option);
    });
    return options;
  }, [doctorsData?.data]);

  const resolveSelected = (type: 'client' | 'doctor', options: Option[]) =>
    value
      .filter((item) => item.type === type)
      .map((item) => {
        const cached = selectedOptionCache.current.get(`${type}:${item.id}`);
        const match = options.find((option) => option.value === item.id);
        if (match) {
          selectedOptionCache.current.set(`${type}:${item.id}`, match);
          return match;
        }
        if (cached) return cached;
        return {
          value: item.id,
          name: `${type === 'doctor' ? 'Doctor' : 'Client'} #${item.id}`,
          mobile: '',
          email: '',
          label: `${type === 'doctor' ? 'Doctor' : 'Client'} #${item.id}`,
        } satisfies Option;
      });

  const selectedClients = resolveSelected('client', clientOptions);
  const selectedDoctors = resolveSelected('doctor', doctorOptions);

  const updateKind = (type: 'client' | 'doctor', selected: readonly Option[] | null) => {
    (selected ?? []).forEach((option) => {
      selectedOptionCache.current.set(`${type}:${option.value}`, option);
    });
    const other = value.filter((item) => item.type !== type);
    const next = (selected ?? []).map((option) => ({ type, id: option.value }));
    onChange([...other, ...next]);
  };

  const onClientInputChange = (input: string, meta: InputActionMeta) => {
    if (meta.action === 'input-change') setClientSearch(input);
    return input;
  };

  const onDoctorInputChange = (input: string, meta: InputActionMeta) => {
    if (meta.action === 'input-change') setDoctorSearch(input);
    return input;
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-4 @xl:grid-cols-2">
        <div className="min-w-0 space-y-1.5">
          <Text className="text-sm font-medium text-gray-900">Clients</Text>
          <Select
            isMulti
            isLoading={clientsLoading}
            options={clientOptions}
            value={selectedClients}
            onChange={(selected) => updateKind('client', selected)}
            onInputChange={onClientInputChange}
            filterOption={(option, rawInput) => matchesSearch(option.data, rawInput)}
            placeholder="Search name, phone, email..."
            noOptionsMessage={() =>
              clientSearch.trim() ? 'No clients found' : 'Type to search'
            }
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={selectStyles}
          />
        </div>

        <div className="min-w-0 space-y-1.5">
          <Text className="text-sm font-medium text-gray-900">Doctors</Text>
          <Select
            isMulti
            isLoading={doctorsLoading}
            options={doctorOptions}
            value={selectedDoctors}
            onChange={(selected) => updateKind('doctor', selected)}
            onInputChange={onDoctorInputChange}
            filterOption={(option, rawInput) => matchesSearch(option.data, rawInput)}
            placeholder="Search name, phone, email..."
            noOptionsMessage={() =>
              doctorSearch.trim() ? 'No doctors found' : 'Type to search'
            }
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            styles={selectStyles}
          />
        </div>
      </div>

      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
    </div>
  );
}

export function recipientsFromLegacy(init?: {
  recipients?: NotificationRecipientRef[] | null;
  recipient_id?: number | null;
}): NotificationRecipientRef[] {
  if (init?.recipients && init.recipients.length > 0) {
    return init.recipients.map((item) => ({ type: item.type, id: item.id }));
  }
  if (init?.recipient_id) {
    return [{ type: 'client', id: init.recipient_id }];
  }
  return [];
}
