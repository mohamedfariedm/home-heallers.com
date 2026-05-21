'use client';

import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import CreateOrUpdateCustomerSupport from './pationts-form';
import Link from 'next/link';
import ColumnFilterPopover from '@/app/shared/customer-suport/column-filter-popover';
import LookupColumnFilterPopover from '@/app/shared/lookup-column-filter-popover';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';

interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  onFilterChange?: (key: string, value: any) => void;
}

export const getColumns = ({
  data,
  checkedItems,
  onDeleteItem,
  handleSelectAll,
  onChecked,
  onFilterChange,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title="Select All"
          onChange={handleSelectAll}
          checked={checkedItems.length === data.length}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 20,
    render: (_: any, row: any) => (
      <Checkbox
        className="cursor-pointer"
        checked={checkedItems.includes(row.id)}
        {...(onChecked && { onChange: () => onChecked(row.id) })}
      />
    ),
  },
  {
    title: <></>,
    dataIndex: 'actions',
    key: 'actions',
    width: 20,
    render: (_: any, row: any) => (
      <div className="flex items-center gap-3">
        <Tooltip size="sm" content={() => 'View'} placement="top" color="invert">
          <Link
            href={`clients/${row.id}`}
            className="p-0 m-0 bg-transparent text-gray-700"
          >
            <ActionIcon tag="span" size="sm" variant="outline">
              <EyeIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Tooltip size="sm" content={() => 'Edit'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon tag="span" size="sm" variant="outline">
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<CreateOrUpdateCustomerSupport initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>

        <DeletePopover
          title={`Delete User`}
          description={`Are you sure you want to delete user #${row.id}?`}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon size="sm" variant="outline" className="hover:text-gray-700">
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="ID" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="id" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'id',
    key: 'id',
    width: 70,
    render: (id: number) => <span className="font-semibold text-gray-800">#{id}</span>,
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Name" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="name" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'name',
    key: 'name',
    render: (_: any, row: any) => resolveLocalizedNameOrFallback(row?.name),
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Email" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="email" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => email ?? '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Mobile" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="mobile" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'mobile',
    key: 'mobile',
    render: (mobile: string) => mobile ?? '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Date of Birth" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="date_of_birth" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'date_of_birth',
    key: 'date_of_birth',
    render: (dob: string) => (dob ? new Date(dob).toLocaleDateString() : '—'),
  },
  {
    title: <HeaderCell title="Blood Group" />,
    dataIndex: 'blood_group',
    key: 'blood_group',
    render: (blood_group: string) => blood_group ?? '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="National ID" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="national_id" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'national_id',
    key: 'national_id',
    render: (national_id: string) => national_id ?? '—',
  },
  {
    title: <HeaderCell title="Nickname" />,
    dataIndex: 'nickname',
    key: 'nickname',
    render: (nickname: string) => nickname ?? '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Gender" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="gender" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'gender',
    key: 'gender',
    render: (gender: string) => gender ?? '—',
  },
  {
    title: <HeaderCell title="Insurance ID" />,
    dataIndex: 'insurance_id',
    key: 'insurance_id',
    render: (insurance_id: string) => insurance_id ?? '—',
  },
  {
    title: <HeaderCell title="Insurance Company" />,
    dataIndex: 'insurance_company',
    key: 'insurance_company',
    render: (insurance_company: string) => insurance_company ?? '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Nationality" />
        {onFilterChange && (
          <LookupColumnFilterPopover
            columnKey="nationality_name"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'nationality',
    key: 'nationality',
    render: (_: any, row: any) =>
      row?.nationality ? resolveLocalizedNameOrFallback(row.nationality.name) : '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Country" />
        {onFilterChange && (
          <LookupColumnFilterPopover
            columnKey="country_name"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'country',
    key: 'country',
    render: (_: any, row: any) =>
      row?.country ? resolveLocalizedNameOrFallback(row.country.name) : '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="City" />
        {onFilterChange && (
          <LookupColumnFilterPopover
            columnKey="city_name"
            onFilterChange={onFilterChange}
          />
        )}
      </div>
    ),
    dataIndex: 'city',
    key: 'city',
    render: (_: any, row: any) =>
      row?.city ? resolveLocalizedNameOrFallback(row.city.name) : '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Status" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="status" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'status',
    key: 'status',
    render: (status: string | boolean) => {
      if (status === true || status === 'active' || status === '1') return 'Active';
      if (status === false || status === 'inactive' || status === '0') return 'Inactive';
      return status != null ? String(status) : '—';
    },
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Created At" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="created_at" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'created_at',
    key: 'created_at',
    render: (created_at: string) =>
      created_at ? new Date(created_at).toLocaleString() : '—',
  },
  {
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title="Updated At" />
        {onFilterChange && (
          <ColumnFilterPopover columnKey="updated_at" onFilterChange={onFilterChange} />
        )}
      </div>
    ),
    dataIndex: 'updated_at',
    key: 'updated_at',
    render: (updated_at: string) =>
      updated_at ? new Date(updated_at).toLocaleString() : '—',
  },
];
