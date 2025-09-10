'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import { Region } from '@/types';
import TrashIcon from '@/components/icons/trash';
import EyeIcon from '@/components/icons/eye';
import BenchmarkModal from './report-modal';
import CreateOrUpdateCustomerSupport from './suport-form';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

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
        <Tooltip size="sm" content={() => 'Edit Region'} placement="top" color="invert">
                    <CreateButton
                      icon={
                        <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                          <PencilIcon className="h-4 w-4" />
                        </ActionIcon>
                      }
                      view={<CreateOrUpdateCustomerSupport initValues={row} />}
                      label=""
                      className="p-0 m-0 bg-transparent text-gray-700"
                    />
                  </Tooltip>
                  <Tooltip
                  size="sm"
                  content={() => 'View Report'}
                  placement="top"
                  color="invert"
                >
                  <CreateButton
                    icon={
                    <ActionIcon size="sm" variant="outline" aria-label={'View Benchmark'}>
                      <EyeIcon className="h-4 w-4" />
                    </ActionIcon>
                    }
                    view={<BenchmarkModal row={row}/>}
                    label=''
                    className='p-0 m-0 bg-transparent text-gray-700'
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
  // Full Name
  {
    title: <HeaderCell title="Full Name" />,
    dataIndex: 'name',
    key: 'name',
    width: 250,
    render: (_: string, row: any) => `${row.first_name} ${row.middle_name} ${row.last_name}`,
  },
  // Offer
  {
    title: <HeaderCell title="Offer" />,
    dataIndex: 'offer',
    key: 'offer',
    width: 200,
    render: (offer: string) => offer ?? '—',
  },
  // Agent Name
  {
    title: <HeaderCell title="Agent Name" />,
    dataIndex: 'agent_name',
    key: 'agent_name',
    width: 150,
    render: (agent_name: string) => agent_name ?? '—',
  },
  // Status
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => status ?? '—',
  },
  // Reason
  {
    title: <HeaderCell title="Reason" />,
    dataIndex: 'reason',
    key: 'reason',
    width: 200,
    render: (reason: string) => reason ?? '—',
  },
  // Age
  {
    title: <HeaderCell title="Age" />,
    dataIndex: 'age',
    key: 'age',
    width: 50,
    render: (age: number) => age ?? '—',
  },
  // Gender
  {
    title: <HeaderCell title="Gender" />,
    dataIndex: 'gender',
    key: 'gender',
    width: 100,
    render: (gender: string) => gender ?? '—',
  },
  // Lead Source
  {
    title: <HeaderCell title="Lead Source" />,
    dataIndex: 'lead_source',
    key: 'lead_source',
    width: 150,
    render: (lead_source: string) => lead_source ?? '—',
  },
  // Phone Numbers
  {
    title: <HeaderCell title="Phone Numbers" />,
    dataIndex: 'mobile_phone',
    key: 'mobile_phone',
    width: 200,
    render: (_: string, row: any) => `${row.mobile_phone}`,
  },
  {
    title: <HeaderCell title="Booking Phone Numbers" />,
    dataIndex: 'booking_phone_number',
    key: 'booking_phone_number',
    width: 200,
    render: (_: string, row: any) => `${row.booking_phone_number}`,
  },
  {
    title: <HeaderCell title="Home Phone Numbers" />,
    dataIndex: 'home_phone',
    key: 'home_phone',
    width: 200,
    render: (_: string, row: any) => `${row.home_phone}`,
  },
  // Address
  {
    title: <HeaderCell title="Address" />,
    dataIndex: 'address_1',
    key: 'address_1',
    width: 200,
    render: (address: string) => address ?? '—',
  },
  // Description
  {
    title: <HeaderCell title="Description" />,
    dataIndex: 'description',
    key: 'description',
    width: 250,
    render: (description: string) => description ?? '—',
  },
  // First Call Time
  {
    title: <HeaderCell title="First Call Time" />,
    dataIndex: 'first_call_time',
    key: 'first_call_time',
    width: 150,
    render: (first_call_time: string) => new Date(first_call_time).toLocaleString(),
  },
  // Last Call Result
  {
    title: <HeaderCell title="Last Call Result" />,
    dataIndex: 'last_call_result',
    key: 'last_call_result',
    width: 150,
    render: (last_call_result: string) => last_call_result ?? '—',
  },
  // Last Call Total Duration
  {
    title: <HeaderCell title="Last Call Duration" />,
    dataIndex: 'last_call_total_duration',
    key: 'last_call_total_duration',
    width: 100,
    render: (duration: string) => `${duration} minutes` ,
  },
  // Last Phone
  {
    title: <HeaderCell title="Last Phone" />,
    dataIndex: 'last_phone',
    key: 'last_phone',
    width: 100,
    render: (last_phone: string) => last_phone ?? '—',
  },
  // Notes
  {
    title: <HeaderCell title="Notes" />,
    dataIndex: 'notes',
    key: 'notes',
    width: 150,
    render: (notes: string) => notes ?? '—',
  },
  // Ads Name
  {
    title: <HeaderCell title="Ads Name" />,
    dataIndex: 'ads_name',
    key: 'ads_name',
    width: 150,
    render: (ads_name: string) => ads_name ?? '—',
  },
  // Created At
  {
    title: <HeaderCell title="Created At" />,
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    render: (created_at: string) => new Date(created_at).toLocaleString(),
  },
  // Modified On
  {
    title: <HeaderCell title="Modified On" />,
    dataIndex: 'modified_on',
    key: 'modified_on',
    width: 150,
    render: (modified_on: string) => new Date(modified_on).toLocaleString(),
  },
];
