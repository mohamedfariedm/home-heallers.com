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
import TargetForm from '@/app/shared/targets/targets-form';
import { Region } from '@/types';
import TrashIcon from '@/components/icons/trash';

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
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </ActionIcon>
              }
              view={<TargetForm initValues={row} />}
              label=''
              className='p-0 m-0 bg-transparent text-gray-700'
            />
          </Tooltip>
          <DeletePopover
            title={`Delete target`}
            description={`Are you sure you want to delete this #${row.id} sales target?`}
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
    title: <HeaderCell title="User Name" />,
    dataIndex: 'user.name',
    key: 'user name',
    width: 300,
    hidden: 'user name',

    render: (_: string, row: any) => (
      <AvatarCard
        src={row?.user?.avatar}
        name={row?.user?.name || ''}
        description={`ID-${row?.user?.id}`}
      />
    ),
  },
  {
    title: <HeaderCell title="Store Name" />,
    dataIndex: 'store.name',
    key: 'store name',
    width: 30,
    hidden: 'store name',

    render: (_: string, row: any) => row?.store?.name ,
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'store.city.name',
    key: 'store city name',
    width: 30,
    hidden: 'store city name',

    render: (_: string, row: any) => row?.store?.city?.name ,
  },
  {
    title: <HeaderCell title="SKU_Code" />,
    dataIndex: 'product.sku_code',
    key: 'SKU Code',
    width: 30,
    hidden: 'SKU Code',

    render: (_: string, row: any) => row?.product?.sku_code ,
  },
  {
    title: <HeaderCell title="Target Quantity" />,
    dataIndex: 'tgt_quentity',
    key: 'Target Quantity',
    width: 30,
    hidden: 'Target Quantity',

    render: (_: string, row: any) => row?.tgt_quentity ,
  },
  {
    title: <HeaderCell title="Target Value" />,
    dataIndex: 'tgt_value',
    key: 'Target Value',
    width: 30,
    hidden: 'Target Value',

    render: (_: string, row: any) => row?.tgt_value ,
  },
  {
    title: <HeaderCell title="Achived Quantity" />,
    dataIndex: 'achived_quentity',
    key: 'Achived Quantity',
    width: 30,
    hidden: 'Achived Quantity',

    render: (_: string, row: any) => row?.achived_quentity ,
  },
  {
    title: <HeaderCell title="Achived Value" />,
    dataIndex: 'achived_value',
    key: 'Achived Value',
    width: 30,
    hidden: 'Achived Value',

    render: (_: string, row: any) => row?.achived_value ,
  },
  {
    title: (
      <HeaderCell
        title="Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('date'),
    dataIndex: 'date',
    key: 'date',
    width: 50,
    render: (value: Date) => <DateCell date={value} />,
  },
  {
    title: <HeaderCell title="Week" />,
    dataIndex: 'week',
    key: 'week',
    width: 30,
    hidden: 'week',

    render: (_: string, row: any) => row?.week ,
  },
  {
    title: <HeaderCell title="Month" />,
    dataIndex: 'month',
    key: 'month',
    width: 30,
    hidden: 'month',

    render: (_: string, row: any) => row?.month ,
  },
  {
    title: <HeaderCell title="Quarter" />,
    dataIndex: 'quarter',
    key: 'quarter',
    width: 30,
    hidden: 'quarter',

    render: (_: string, row: any) => row?.quarter ,
  },
  {
    title: <HeaderCell title="Year" />,
    dataIndex: 'year',
    key: 'year',
    width: 30,
    hidden: 'year',

    render: (_: string, row: any) => row?.year ,
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
    width: 50,
    render: (value: Date) => <DateCell date={value} />,
  },
  
];
