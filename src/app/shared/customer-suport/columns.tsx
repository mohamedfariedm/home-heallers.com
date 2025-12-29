'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import EyeIcon from '@/components/icons/eye';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import BenchmarkModal from './report-modal';
import CreateOrUpdateCustomerSupport from './suport-form';
import ColumnFilterPopover from './column-filter-popover';

type Columns = {
  data: any[];
  type: string;
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  onFilterChange?: (key: string, value: any) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  type,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  onFilterChange,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title={'Select All'}
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
      <div className="inline-flex">
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(row.id)}
          {...(onChecked && { onChange: () => onChecked(row.id) })}
        />
      </div>
    ),
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 20,
    render: (_: string, row: any) => (
      <div className="flex items-center gap-3">
        <Tooltip size="sm" content={() => 'Edit Lead'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<CreateOrUpdateCustomerSupport type={type} initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>

        <Tooltip size="sm" content={() => 'View Report'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon size="sm" variant="outline" aria-label={'View Report'}>
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<BenchmarkModal row={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>

        <DeletePopover
          title={`Delete Lead`}
          description={`Are you sure you want to delete this lead #${row.id}?`}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label={'Delete Item'}
            className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          >
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },

  // Columns with Filters
  ...[
    'name',
    'offer',
    'agent_name',
    'status',
    'reason',
    'age',
    'gender',
    'lead_source',
    'source_campaign',
    'mobile_phone',
    'booking_phone_number',
    'home_phone',
    'address_1',
    'description',
    'first_call_time',
    'last_call_result',
    'last_call_total_duration',
    'last_phone',
    'notes',
    'ads_name',
    'created_at',
    'modified_on',
  ].map((key) => ({
    title: (
      <div className="flex items-center gap-1">
        <HeaderCell title={key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} />
        <ColumnFilterPopover columnKey={key} onFilterChange={onFilterChange!} />
      </div>
    ),
    dataIndex: key,
    key,
    render: (value: any, row: any) =>
      typeof value === 'string'
        ? value
        : key === 'first_call_time' || key === 'created_at' || key === 'modified_on'
        ? new Date(value).toLocaleString()
        : key === 'name'
        ? `${row.first_name} ${row.middle_name} ${row.last_name}`
        : value ?? '—',
  })),
];
