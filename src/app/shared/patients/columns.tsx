'use client';

import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Tooltip } from '@/components/ui/tooltip';
import TrashIcon from '@/components/icons/trash';
import PencilIcon from '@/components/icons/pencil';
import CreateButton from '../create-button';
import DeletePopover from '@/app/shared/delete-popover';
import CreateOrUpdateCustomerSupport from './pationts-form';

// Type definitions
interface Columns {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
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
    title: <HeaderCell title="Name" />,
    dataIndex: 'name',
    key: 'name',
    render: (_: any, row: any) => row?.name?.en ?? '—',
  },
  {
    title: <HeaderCell title="Email" />,
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => email ?? '—',
  },
  {
    title: <HeaderCell title="Mobile" />,
    dataIndex: 'mobile',
    key: 'mobile',
    render: (mobile: string) => mobile ?? '—',
  },
  {
    title: <HeaderCell title="Date of Birth" />,
    dataIndex: 'date_of_birth',
    key: 'date_of_birth',
    render: (dob: string) => new Date(dob).toLocaleDateString(),
  },
  {
    title: <HeaderCell title="Blood Group" />,
    dataIndex: 'blood_group',
    key: 'blood_group',
    render: (blood_group: string) => blood_group ?? '—',
  },
  {
    title: <HeaderCell title="National ID" />,
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
    title: <HeaderCell title="Gender" />,
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
    title: <HeaderCell title="Nationality" />,
    dataIndex: 'nationality',
    key: 'nationality',
    render: (_: any, row: any) => row?.nationality?.name?.en ?? '—',
  },
  {
    title: <HeaderCell title="Country" />,
    dataIndex: 'country',
    key: 'country',
    render: (_: any, row: any) => row?.country?.name?.en ?? '—',
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'city',
    key: 'city',
    render: (_: any, row: any) => row?.city?.name?.en ?? '—',
  },
  {
    title: <HeaderCell title="Created At" />,
    dataIndex: 'created_at',
    key: 'created_at',
    render: (created_at: string) => new Date(created_at).toLocaleString(),
  },
  {
    title: <HeaderCell title="Updated At" />,
    dataIndex: 'updated_at',
    key: 'updated_at',
    render: (updated_at: string) => new Date(updated_at).toLocaleString(),
  },
];
