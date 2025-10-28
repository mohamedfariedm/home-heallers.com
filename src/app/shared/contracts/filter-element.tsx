'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ActionIcon } from '@/components/ui/action-icon';
import { PiXBold } from 'react-icons/pi';

interface FilterElementProps {
  isFiltered: boolean;
  filters: any;
  updateFilter: (key: string, value: any) => void;
}

export default function FilterElement({
  isFiltered,
  filters,
  updateFilter,
}: FilterElementProps) {
  const [companyName, setCompanyName] = useState(filters.company_name || '');
  const [companyActivity, setCompanyActivity] = useState(filters.company_activity || '');
  const [serviceManager, setServiceManager] = useState(filters.service_manager_name || '');
  const [managerEmail, setManagerEmail] = useState(filters.manager_email || '');

  const handleFilter = () => {
    updateFilter('company_name', companyName);
    updateFilter('company_activity', companyActivity);
    updateFilter('service_manager_name', serviceManager);
    updateFilter('manager_email', managerEmail);
  };

  const handleReset = () => {
    setCompanyName('');
    setCompanyActivity('');
    setServiceManager('');
    setManagerEmail('');
    updateFilter('company_name', '');
    updateFilter('company_activity', '');
    updateFilter('service_manager_name', '');
    updateFilter('manager_email', '');
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Text className="text-sm font-medium text-gray-900 dark:text-white">
          Filter Contracts
        </Text>
        {isFiltered && (
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="hover:!border-red-600 hover:text-red-600"
          >
            <PiXBold className="h-4 w-4" />
          </ActionIcon>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Name
          </Text>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Filter by company name"
            className="h-9"
          />
        </div>

        <div>
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Company Activity
          </Text>
          <Input
            value={companyActivity}
            onChange={(e) => setCompanyActivity(e.target.value)}
            placeholder="Filter by company activity"
            className="h-9"
          />
        </div>

        <div>
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Service Manager
          </Text>
          <Input
            value={serviceManager}
            onChange={(e) => setServiceManager(e.target.value)}
            placeholder="Filter by service manager"
            className="h-9"
          />
        </div>

        <div>
          <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Manager Email
          </Text>
          <Input
            value={managerEmail}
            onChange={(e) => setManagerEmail(e.target.value)}
            placeholder="Filter by manager email"
            className="h-9"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!isFiltered}
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={handleFilter}
          className="dark:bg-gray-100 dark:text-white dark:hover:bg-gray-200"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

