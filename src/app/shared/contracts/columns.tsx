'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import ContractForm from '@/app/shared/contracts/contract-form';
import CommunicationForm from '@/app/shared/contracts/communication-form';
import { Contract } from '@/types';
import { PiChatCircle } from 'react-icons/pi';
import {
  CONTRACT_TYPE_LABELS,
  OWNER_TYPE_LABELS,
} from '@/app/shared/contracts/contract-utils';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

function EnumBadge({
  value,
  labels,
}: {
  value?: string | null;
  labels: Record<string, string>;
}) {
  if (!value) return <Text className="text-gray-400">—</Text>;
  return (
    <Badge variant="flat" className="capitalize">
      {labels[value] ?? value}
    </Badge>
  );
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
          checked={checkedItems.length === data.length && data.length > 0}
          className="cursor-pointer"
        />
      </div>
    ),
    dataIndex: 'checked',
    key: 'checked',
    width: 20,
    render: (_: any, row: Contract) => (
      <div className="inline-flex">
        <Checkbox
          className="cursor-pointer"
          checked={checkedItems.includes(String(row.id))}
          {...(onChecked && { onChange: () => onChecked(String(row.id)) })}
        />
      </div>
    ),
  },
  {
    title: <></>,
    dataIndex: 'action',
    key: 'action',
    width: 20,
    render: (_: string, row: Contract) => (
      <div className="flex items-center gap-3">
        <Tooltip size="sm" content={() => 'Edit contract'} placement="top" color="invert">
          <CreateButton
            icon={
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<ContractForm initValues={row} />}
            label=""
            customSize="960px"
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <Tooltip
          size="sm"
          content={() => 'Add communication date'}
          placement="top"
          color="invert"
        >
          <CreateButton
            icon={
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <PiChatCircle className="h-4 w-4" />
              </ActionIcon>
            }
            view={<CommunicationForm contract={row} />}
            label=""
            customSize="520px"
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title="Delete contract"
          description={`Are you sure you want to delete contract #${row.id}?`}
          onDelete={() => onDeleteItem([String(row.id)])}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label="Delete contract"
            className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          >
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: <HeaderCell title="Name" />,
    dataIndex: 'company_name',
    key: 'company_name',
    width: 220,
    render: (company_name: string) => (
      <span className="font-medium text-gray-900">{company_name || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Owner Type" />,
    dataIndex: 'contract_owner_type',
    key: 'contract_owner_type',
    width: 120,
    render: (value: Contract['contract_owner_type']) => (
      <EnumBadge value={value} labels={OWNER_TYPE_LABELS} />
    ),
  },
  {
    title: <HeaderCell title="Contract Type" />,
    dataIndex: 'contract_type',
    key: 'contract_type',
    width: 120,
    render: (value: Contract['contract_type']) => (
      <EnumBadge value={value} labels={CONTRACT_TYPE_LABELS} />
    ),
  },
  {
    title: <HeaderCell title="Activity" />,
    dataIndex: 'company_activity',
    key: 'company_activity',
    width: 160,
    render: (company_activity: string) => (
      <span className="text-gray-600">{company_activity || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Location" />,
    dataIndex: 'company_location',
    key: 'company_location',
    width: 180,
    render: (company_location: string) => (
      <span className="text-gray-600">{company_location || '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Service Manager" />,
    dataIndex: 'service_manager_name',
    key: 'service_manager_name',
    width: 160,
    render: (service_manager_name?: string | null) => (
      <span className="font-medium capitalize text-gray-700">
        {service_manager_name || '—'}
      </span>
    ),
  },
  {
    title: <HeaderCell title="Visit Date" />,
    dataIndex: 'visit_date',
    key: 'visit_date',
    width: 140,
    render: (visit_date: string) =>
      visit_date ? <DateCell date={new Date(visit_date)} dateFormat="MMM D, YYYY" /> : '—',
  },
  {
    title: (
      <HeaderCell
        title="Created"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('created_at'),
    dataIndex: 'created_at',
    key: 'created_at',
    width: 140,
    render: (value: string) => (value ? <DateCell date={new Date(value)} /> : '—'),
  },
];
