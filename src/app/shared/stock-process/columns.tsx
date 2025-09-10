'use client';

import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { Text } from 'rizzui';


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
  // {
  //     title: <></>,
  //     dataIndex: 'action',
  //     key: 'action',
  //     width: 20,
  //     render: (_: string, row: any) => (
  //       <div className="flex items-center gap-3">
  //         <Tooltip
  //         size="sm"
  //         content={() => 'View Report'}
  //         placement="top"
  //         color="invert"
  //       >
  //         <CreateButton
  //           icon={
  //           <ActionIcon size="sm" variant="outline" aria-label={'View Product'}>
  //             <EyeIcon className="h-4 w-4" />
  //           </ActionIcon>
  //           }
  //           view={<ReportDetails id={row.id}/>}
  //           label=''
  //           className='p-0 m-0 bg-transparent text-gray-700'
  //         />
  //       </Tooltip>
  //       </div>
  //     ),
  // },
  {
    title: (
      <HeaderCell
        title="date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('date'),
    dataIndex: 'created_at',
    key: 'date',
    width: 50,
    render: (value: Date) => <DateCell date={value} />,
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
    title: <HeaderCell title="Store Name" />,
    dataIndex: 'store.name',
    key: 'store',
    width: 100,
    hidden: 'store',

    render: (_: string, row: any) => {
      return <figcaption className="grid gap-0.5">
      <Text className="font-lexend text-sm font-medium text-gray-900 dark:text-gray-700">
        {row?.store?.name}
      </Text>
        <Text className="text-[13px] text-gray-500">{row?.store?.store_code}</Text>

    </figcaption>

    }
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'store.city.name',
    key: 'city',
    width: 30,
    hidden: 'city',

    render: (_: string, row: any) => row?.store?.city.name ,
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
    title: <HeaderCell title="Promoter" />,
    dataIndex: 'user.name',
    key: 'name',
    width: 100,
    hidden: 'name',

    render: (_: string, row: any) => (
      <AvatarCard
        src={row?.user?.avatar}
        name={row?.user?.name || ''}
        description={`ID-${row?.user?.id}`}
      />
    ),
  },
  {
    title: <HeaderCell title="BG" />,
    dataIndex: 'product.category.name',
    key: 'BG',
    width: 30,
    hidden: 'category',

    render: (_: string, row: any) => row?.product?.category?.name ,
  },
  {
    title: <HeaderCell title="VCP" />,
    dataIndex: 'product.sub_category.name',
    key: 'VCP',
    width: 30,
    hidden: 'subCategory',

    render: (_: string, row: any) => row?.product?.sub_category?.name ,
  },
  {
    title: <HeaderCell title="BU" />,
    dataIndex: 'product.sub_sub_category.name',
    key: 'BU',
    width: 30,
    hidden: 'subSubCategory',

    render: (_: string, row: any) => row?.product?.sub_sub_category?.name ,
  },
  {
    title: <HeaderCell title="SKU Code" />,
    dataIndex: 'product.sku_code',
    key: 'SKU Code',
    width: 30,
    hidden: 'product',

    render: (_: string, row: any) => row?.product?.sku_code ,
  },
  {
    title: <HeaderCell title="RSP" />,
    dataIndex: 'price',
    key: 'price',
    width: 30,
    hidden: 'price',

    render: (price: string) => price ,
  },
  {
    title: <HeaderCell title="Stock" />,
    dataIndex: 'sales',
    key: 'Stock',
    width: 30,
    hidden: 'sales',

    render: (_: string, row: any) => row?.updated_quentity ,
  },
];
