'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';
import CreateButton from '../create-button';
import ReportDetails from '@/app/shared/Sampling_report/report-modal'


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
    title: <HeaderCell title="store" />,
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
    title: <HeaderCell title="Sampling model" />,
    dataIndex: 'sampling_models',
    key: 'Sampling model',
    width: 30,
    hidden: 'sampling_models',
    render: (_: string, row: any) => row?.sampling_models ,
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
    title: <HeaderCell title="campain name" />,
    dataIndex: 'campaingn_name',
    key: 'campain name',
    width: 50,
    hidden: 'campaingn',
    render: (_: string, row: any) => row?.campaingn_name ,
  },
  {
    title: (
      <HeaderCell
        title="Activation Duration from"
      />
    ),
    onHeaderCell: () => onHeaderCellClick('sampling_date_from'),
    dataIndex: 'sampling_date_from',
    key: 'Duration from',
    width: 70,
    render: (value: Date) => <DateCell date={value} />,
  },
  {
    title: (
      <HeaderCell
        title="Activation Duration to"
      />
    ),
    onHeaderCell: () => onHeaderCellClick('sampling_date_to'),
    dataIndex: 'sampling_date_to',
    key: 'Duration to',
    width: 60,
    render: (value: Date) => <DateCell date={value} />,
  },






  

];
