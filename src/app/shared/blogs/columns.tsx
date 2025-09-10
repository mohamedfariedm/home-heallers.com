'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import TrashIcon from '@/components/icons/trash';
import CreateButton from '../create-button';
import BlogsForm from './address-form';

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
        <Tooltip
          size="sm"
          content={() => 'Edit Invoice'}
          placement="top"
          color="invert"
        >
          <CreateButton
            icon={
              <ActionIcon
                tag="span"
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700 "
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<BlogsForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title={`Delete Report`}
          description={`Are you sure you want to delete this #${row.id} `}
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
    title: <HeaderCell align="center" title={'description'} />,
    dataIndex: 'description',
    key: 'description',
    width: 30,
    hidden: 'description',

    render: (_: string, row: any) => (
      <div className="w-full line-clamp-3  text-center">{row?.description?.ar ?? row?.description?.ar ?? ''}</div>
    ),
  },
  {
    title: <HeaderCell align="center" title={'date'} />,
    dataIndex: 'date',
    key: 'date',
    width: 30,
    hidden: 'date',

    render: (_: string, row: any) => (
      <div className="w-full  text-center"><DateCell date={row.date} /></div>
    ),
  },
  {
    title: <HeaderCell align="center" title={'show in home page'} />,
    dataIndex: 'show_in_home_page',
    key: 'show_in_home_page',
    width: 30,
    hidden: 'show_in_home_page',

    render: (_: string, row: any) => (
      <div className="w-full  text-center">{row.show_in_home_page==1?"show":"Hidden"}</div>
    ),
  },



  {
    title: (
      <HeaderCell
        align="center"
        title={'Updated'}
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'updated_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('updated_at'),
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
  {
    title: (
      <HeaderCell
        align="center"
        title={'Created'}
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('created_at'),
    dataIndex: 'created_at',
    key: 'created_at',
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
];
