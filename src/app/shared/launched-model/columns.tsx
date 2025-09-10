'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '../create-button';
import ReportDetails from '@/app/shared/launched-model/report-modal'


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
//   {
//     title: (
//       <HeaderCell
//         title="date"
//         sortable
//         ascending={
//           sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'
//         }
//       />
//     ),
//     onHeaderCell: () => onHeaderCellClick('created_at'),
//     dataIndex: 'created_at',
//     key: 'created_at',
//     width: 50,
//     render: (value: Date) => <DateCell date={value} />,
//   },
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
    title: <HeaderCell title="Region" />,
    dataIndex: 'store.region.name',
    key: 'region',
    width: 30,
    hidden: 'region',
    render: (_: string, row: any) => row?.store?.region?.name ,
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'store.city.name',
    key: 'city',
    width: 30,
    hidden: 'city',
    render: (_: string, row: any) => row?.store?.city?.name ,
  },
  {
    title: <HeaderCell title="Retailer" />,
    dataIndex: 'store.retailer.name',
    key: 'retailer',
    width: 30,
    hidden: 'retailer',
    render: (_: string, row: any) => row?.store?.retailer?.name ,
  },
  {
    title: <HeaderCell title="Store" />,
    dataIndex: 'store.name',
    key: 'store',
    width: 30,
    hidden: 'storeName',
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
    title: <HeaderCell title="Model Name" />,
    dataIndex: 'model_name',
    key: 'Model',
    width: 30,
    hidden: 'model_name',
    render: (_: string, row: any) => row?.model_name ,
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
        title="Availability Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'availability_date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('availability_date'),
    dataIndex: 'availability_date',
    key: 'Availability Date',
    width: 50,
    render: (value: Date) => <DateCell date={new Date(value)} />,
  },
  
  {
    title: <HeaderCell title="Regular Price" />,
    dataIndex: 'price',
    key: 'Regular Price',
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
