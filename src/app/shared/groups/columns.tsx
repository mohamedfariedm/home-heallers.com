'use client';

import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import TrashIcon from '@/components/icons/trash';
import { Tooltip } from '@/components/ui/tooltip';
import GroupsForm from './groups-form';

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
          checked={checkedItems.length === data.length && data.length > 0}
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
        <Tooltip
          size="sm"
          content={() => 'Edit item'}
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
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<GroupsForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title="Delete group"
          description={`Are you sure you want to delete group #${row.id}?`}
          onDelete={() => onDeleteItem([String(row.id)])}
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
  {
    title: <HeaderCell title="Name" />,
    dataIndex: 'name',
    key: 'name',
    width: 280,
    render: (_: string, row: any) => (
      <span className="font-medium text-gray-900">{row?.name ?? '—'}</span>
    ),
  },
  {
    title: <HeaderCell title="Doctors" />,
    dataIndex: 'doctors',
    key: 'doctors',
    width: 120,
    render: (_: string, row: any) => {
      const n = Array.isArray(row?.doctors) ? row.doctors.length : 0;
      return <span className="text-gray-600">{n}</span>;
    },
  },
];
