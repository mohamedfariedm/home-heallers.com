'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import { Region, City } from '@/types';
import TrashIcon from '@/components/icons/trash';
import CreateOrUpdateServices from './services-form';
import AvatarCard from '@/components/ui/avatar-card';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  regions: Region[]
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  regions
}: Columns) => {
const lang="en"
 return [
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
        <Tooltip
          size="sm"
          content={() => 'Edit Region'}
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
            view={<CreateOrUpdateServices initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
            customSize="1200px"
          />
        </Tooltip>
        <DeletePopover
          title={`Delete Service`}
          description={`Are you sure you want to delete this #${row.id} Service?`}
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
  {
    title: <HeaderCell align="center" title="Name" />,
    dataIndex: 'name',
    key: 'name',
    width: 100,
    hidden: 'name',

    render: (_: string, row: any) => (
      <div className="flex w-full justify-center  text-center">
        {
          <AvatarCard
            //@ts-ignore
            src={row?.image?.original || ''}
            name={row?.name?.ar ?? row?.name?.ar ?? ''}
            description={`ID-${row.id}`}
          />
        }
      </div>
    ),
  },
  {
    title: <HeaderCell title="category" />,
    dataIndex: 'category',
    key: 'category',
    width: 120,
    render: (_: string,row: any) => (
      <span className="capitalize font-medium">{row?.category?.name?.[lang] ?? row.category?.name?.ar ?? 'Unnamed'}</span>
    ),
  },
  {
    title: <HeaderCell title="description" />,
    dataIndex: 'description',
    key: 'description',
    width: 120,
    render: (_: string,row: any) => (
<span
  className="capitalize font-medium"
  dangerouslySetInnerHTML={{
    __html: row.description?.[lang] ?? row.description?.ar ?? 'Unnamed',
  }}
/>    ),
  },

  
  ]

}
  
