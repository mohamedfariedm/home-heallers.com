'use client';

import { PiTrashDuotone } from 'react-icons/pi';
import StatusField from '@/components/controlled-table/status-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useMedia } from '@/hooks/use-media';

type FilterElementProps = {
  isFiltered: boolean;
  filters: Record<string, string>;
  updateFilter: (columnId: string, filterValue: string) => void;
  handleReset: () => void;
};

const ownerTypeOptions = [
  { value: 'company', name: 'company', label: 'Company' },
  { value: 'doctor', name: 'doctor', label: 'Doctor' },
];

const contractTypeOptions = [
  { value: 'offline', name: 'offline', label: 'Offline' },
  { value: 'online', name: 'online', label: 'Online' },
];

export default function FilterElement({
  filters,
  updateFilter,
  handleReset,
}: FilterElementProps) {
  const isMediumScreen = useMedia('(max-width: 1860px)', false);

  const clearFilters = () => {
    Object.keys(filters).forEach((key) => updateFilter(key, ''));
    handleReset();
  };

  return (
    <>
      <StatusField
        options={ownerTypeOptions}
        placeholder="Owner type"
        value={filters.contract_owner_type}
        onChange={(value) => updateFilter('contract_owner_type', String(value))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          ownerTypeOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          label: 'Owner type',
          labelClassName: 'font-medium text-gray-700',
        })}
      />

      <StatusField
        options={contractTypeOptions}
        placeholder="Contract type"
        value={filters.contract_type}
        onChange={(value) => updateFilter('contract_type', String(value))}
        getOptionValue={(option) => option.value}
        displayValue={(selected: string) =>
          contractTypeOptions.find((option) => option.value === selected)?.label ?? selected
        }
        {...(isMediumScreen && {
          label: 'Contract type',
          labelClassName: 'font-medium text-gray-700',
        })}
      />

      <Input
        placeholder="Company / doctor name"
        value={filters.company_name ?? ''}
        onChange={(e) => updateFilter('company_name', e.target.value)}
        inputClassName="h-9"
        {...(isMediumScreen && {
          label: 'Name',
          labelClassName: 'font-medium text-gray-700 mb-1.5 block',
        })}
      />

      <Input
        placeholder="Location"
        value={filters.company_location ?? ''}
        onChange={(e) => updateFilter('company_location', e.target.value)}
        inputClassName="h-9"
        {...(isMediumScreen && {
          label: 'Location',
          labelClassName: 'font-medium text-gray-700 mb-1.5 block',
        })}
      />

      <Input
        placeholder="Service manager"
        value={filters.service_manager_name ?? ''}
        onChange={(e) => updateFilter('service_manager_name', e.target.value)}
        inputClassName="h-9"
        {...(isMediumScreen && {
          label: 'Service manager',
          labelClassName: 'font-medium text-gray-700 mb-1.5 block',
        })}
      />

      <Button size="sm" onClick={clearFilters} className="h-8 bg-gray-200/70" variant="flat">
        <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" />
        Clear
      </Button>
    </>
  );
}
