'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '../create-button';
import ReportDetails from '@/app/shared/benchmark/report-modal'


type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
}: Columns) => [
  {
      title: <></>,
      dataIndex: 'action',
      key: 'action',
      width: 20,
      render: (_: string, row: any) => (
        <div className="flex items-center gap-3">
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
            view={<ReportDetails id={row.id}/>}
            label=''
            className='p-0 m-0 bg-transparent text-gray-700'
          />
        </Tooltip>
        </div>
      ),
  },
  {
    title: <HeaderCell title="User Name" />,
    dataIndex: 'user.name',
    key: 'username',
    width: 100,
    hidden: 'username',

    render: (_: string, row: any) => (
      <AvatarCard
        src={""}
        name={row?.user?.name || ''}
        description={`ID-${row?.user?.id}`}
      />
    ),
  },
  {
    title: (
      <HeaderCell
        title="date"
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
  {
    title: <HeaderCell title="Retailer" />,
    dataIndex: 'retailer.name',
    key: 'retailer',
    width: 30,
    hidden: 'retailer',

    render: (_: string, row: any) => row?.retailer?.name ,
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
    title: <HeaderCell title="Brand" />,
    dataIndex: 'brand.name',
    key: 'brand',
    width: 30,
    hidden: 'brand',

    render: (_: string, row: any) => row?.brand?.name ,
  },
  {
    title: <HeaderCell title="BG" />,
    dataIndex: 'category.name',
    key: 'BG',
    width: 30,
    hidden: 'category',

    render: (_: string, row: any) => row?.category?.name ,
  },
  {
    title: <HeaderCell title="VCP" />,
    dataIndex: 'sub_category.name',
    key: 'VCP',
    width: 30,
    hidden: 'subCategory',

    render: (_: string, row: any) => row?.sub_category?.name ,
  },
  {
    title: <HeaderCell title="BU" />,
    dataIndex: 'sub_sub_category.name',
    key: 'BU',
    width: 30,
    hidden: 'subSubCategory',

    render: (_: string, row: any) => row?.sub_sub_category?.name ,
  },
  {
    title: <HeaderCell title="SKU Code" />,
    dataIndex: 'sku_code',
    key: 'SKU Code',
    width: 30,
    hidden: 'product',

    render: (_: string, row: any) => row?.sku_code ,
  },
  {
    title: (
      <HeaderCell
        title="Offer Date From"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'offer_date_from'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('offer_date_from'),
    dataIndex: 'offer_date_from',
    key: 'offer date from',
    width: 50,
    render: (value: Date) => <DateCell date={new Date(value)} />,
  },
  {
    title: (
      <HeaderCell
        title="Offer Date To"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'offer_date_to'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('offer_date_to'),
    dataIndex: 'offer_date_to',
    key: 'offer date to',
    width: 50,
    render: (value: Date) => <DateCell date={new Date(value)} />,
  },
  {
    title: <HeaderCell title="Product Price" />,
    dataIndex: 'price',
    key: 'Product Price',
    width: 30,
    hidden: 'price',
    render: (price: string) => price ,
  },
  {
    title: <HeaderCell title="Promotion Price" />,
    dataIndex: 'promotion_price',
    key: 'promotion price',
    width: 30,
    hidden: 'promotion_price',
    render: (_: string, row: any) => row?.promotion_price ,
  },
];
