'use client';

import React, { useMemo, useState } from 'react';
import { PiTrashDuotone } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusField from '@/components/controlled-table/status-field';
import { Text } from '@/components/ui/text';
import { useSearchParams } from 'next/navigation';
import { useDoctors } from '@/framework/doctors';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { doctorDisplayName } from './status-badge';
import DateInput from './date-input';

const statusOptions = [
  { value: 'draft', name: 'draft', label: <Text className="ms-2 font-medium">DRAFT</Text> },
  { value: 'active', name: 'active', label: <Text className="ms-2 font-medium">ACTIVE</Text> },
  { value: 'approved', name: 'approved', label: <Text className="ms-2 font-medium">APPROVED</Text> },
  { value: 'paid', name: 'paid', label: <Text className="ms-2 font-medium">EXTERNALLY PAID</Text> },
];

type FilterElementProps = {
  isFiltered: boolean;
  filters: { [key: string]: any };
  updateFilter: (columnId: string, filterValue: string | any[]) => void;
  handleReset: () => void;
};

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState(searchParams.get('start_date') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end_date') || '');
  const { data: doctorsRes } = useDoctors('page=1&limit=500');

  const doctorOptions: SelectOption[] = useMemo(() => {
    const list = doctorsRes?.data;
    if (!Array.isArray(list)) return [];
    return list.map((d: any) => ({
      value: String(d.id),
      name: doctorDisplayName(d, d.id),
      label: doctorDisplayName(d, d.id),
    }));
  }, [doctorsRes?.data]);

  const selectedDoctor = doctorOptions.find(
    (o) => String(o.value) === String(filters.doctor_id)
  );

  return (
    <div className="flex w-full flex-col gap-3 @lg:flex-row @lg:items-end">
      <StatusField
        options={statusOptions}
        value={filters.status}
        onChange={(value: string) => updateFilter('status', value)}
        getOptionValue={(option: { value: any }) => option.value}
        displayValue={(selected: string) =>
          statusOptions.find((o) => o.value === selected)?.name?.toUpperCase() ||
          selected
        }
        placeholder="Status"
        className="w-full @lg:w-40"
      />

      <SelectBox
        options={doctorOptions}
        value={selectedDoctor}
        onChange={(opt: SelectOption) =>
          updateFilter('doctor_id', opt ? String(opt.value) : '')
        }
        placeholder="Doctor"
        className="w-full @lg:w-56"
        displayValue={(val: any) => val?.label ?? val?.name ?? ''}
      />

      <div className="w-full @lg:w-44">
        <DateInput
          label="Start"
          value={startDate}
          onChange={(next) => {
            setStartDate(next);
            updateFilter('start_date', next);
          }}
        />
      </div>
      <div className="w-full @lg:w-44">
        <DateInput
          label="End"
          value={endDate}
          onChange={(next) => {
            setEndDate(next);
            updateFilter('end_date', next);
          }}
        />
      </div>

      <Input
        type="number"
        label="Ach. min %"
        value={filters.achievement_min}
        onChange={(e) => updateFilter('achievement_min', e.target.value)}
        className="w-full @lg:w-28"
      />
      <Input
        type="number"
        label="Ach. max %"
        value={filters.achievement_max}
        onChange={(e) => updateFilter('achievement_max', e.target.value)}
        className="w-full @lg:w-28"
      />

      {isFiltered && (
        <Button
          size="sm"
          onClick={handleReset}
          className="h-9 bg-gray-200/70"
          variant="flat"
        >
          <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
        </Button>
      )}
    </div>
  );
}
