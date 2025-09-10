'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '../create-button';
import ReportDetails from '@/app/shared/new-installed-POSM/report-modal'


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
    title: <HeaderCell title="Store Name" />,
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
    title: <HeaderCell title="Height" />,
    dataIndex: 'H_value',
    key: 'Height',
    width: 30,
    hidden: 'Height',
    render: (_: string, row: any) => row?.H_value ,
  },
  {
    title: <HeaderCell title="Width" />,
    dataIndex: 'W_value',
    key: 'Width',
    width: 30,
    hidden: 'Width',
    render: (_: string, row: any) => row?.W_value ,
  },
  {
    title: <HeaderCell title="Length" />,
    dataIndex: 'L_value',
    key: 'Length',
    width: 30,
    hidden: 'Length',
    render: (_: string, row: any) => row?.L_value ,
  },
  {
    title: <HeaderCell title="Depth" />,
    dataIndex: 'D_value',
    key: 'Depth',
    width: 30,
    hidden: 'Depth',
    render: (_: string, row: any) => row?.D_value ,
  },
  
  
  {
    title: (
      <HeaderCell
        title="Installation Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'installation_date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('installation_date'),
    dataIndex: 'installation_date',
    key: 'Installation Date',
    width: 50,
    render: (value: Date) => <DateCell date={new Date(value)} />,
  },
  {
    title: (
      <HeaderCell
        title="Remove Date"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'remove_date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('remove_date'),
    dataIndex: 'remove_date',
    key: 'Remove Date',
    width: 50,
    render: (value: Date) => value ?  <DateCell date={new Date(value)} /> : null,
  },
];
