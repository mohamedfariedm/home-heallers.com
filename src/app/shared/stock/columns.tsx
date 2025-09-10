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
// import RegionForm from './region-form';
import { Region } from '@/types';
import TrashIcon from '@/components/icons/trash';
import UpdateCreateStock from './stock-form';

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
              view={<UpdateCreateStock initValues={row} />}
              label=''
              className='p-0 m-0 bg-transparent text-gray-700'
            />
          </Tooltip>
        </div>
      ),
    },

//   {
//     title: <HeaderCell title="Region Name" />,
//     dataIndex: 'name',
//     key: 'name',
//     width: 300,
//     hidden: 'name',

//     render: (_: string, row: Region) => (
//       <AvatarCard
//         src={'row.avatar'}
//         name={row?.name || ''}
//         description={`ID-${row.id}`}
//       />
//     ),
//   },
  {
    title: <HeaderCell title="Discount" />,
    dataIndex: 'discount',
    key: 'discount',
    width: 30,
    hidden: 'discount',

  },
  {
    title: <HeaderCell title="RSP" />,
    dataIndex: 'price',
    key: 'price',
    width: 30,
    hidden: 'price',

    render: (price: number) => price ,
  },
  {
    title: <HeaderCell title="Quentity" />,
    dataIndex: 'quentity',
    key: 'quentity',
    width: 30,
    hidden: 'quentity',
    render: (quentity: number) => quentity ,
  },
  {
    title: <HeaderCell title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 30,
    hidden: 'status',
    render: (status: string) => status ,
  },
  {
    title: <HeaderCell title="Barcode" />,
    dataIndex: 'product.barcode',
    key: 'barcode',
    width: 30,
    hidden: 'barcode',
    render: (_: string, row: any) => row?.product?.barcode ,
  },
  {
    title: <HeaderCell title="sku_code" />,
    dataIndex: 'product.sku_code',
    key: 'sku_code',
    width: 30,
    hidden: 'sku_code',
    render: (_: string, row: any) => row?.product?.sku_code ,
  },
  {
    title: <HeaderCell title="Brand" />,
    dataIndex: 'product.brand.name',
    key: 'brand',
    width: 30,
    hidden: 'brand',
    render: (_: string, row: any) => row?.product?.brand?.name ,
  },
  {
    title: <HeaderCell title="Store" />,
    dataIndex: 'store.name',
    key: 'store',
    width: 30,
    hidden: 'store',
    render: (_: string, row: any) => row?.store?.name ,
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'store.city.name',
    key: 'city',
    width: 30,
    hidden: 'city',
    render: (_: string, row: any) => row?.store.city?.name ,
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
