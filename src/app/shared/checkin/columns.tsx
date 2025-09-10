'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import EyeIcon from '@/components/icons/eye';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  showDetails: (id: string) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  showDetails
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
          {/* <CreateButton
            icon={
            <ActionIcon size="sm" variant="outline" aria-label={'View Product'}>
              <EyeIcon className="h-4 w-4" />
            </ActionIcon>
            }
            view={<ReportDetails id={row.id}/>}
            label=''
            className='p-0 m-0 bg-transparent text-gray-700'
          /> */}
          <ActionIcon size="sm" variant="outline" aria-label={'View Journey'} onClick={() => showDetails(row?.id)}>
            <EyeIcon className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>
        </div>
      ),
    },

  {
    title: <HeaderCell title="User Name" />,
    dataIndex: 'user.name',
    key: 'name',
    width: 100,
    hidden: 'name',

    render: (_: string, row: any) => (
      <AvatarCard
        src={row?.user?.avatar}
        name={row?.user?.name || ''}
        description={`ID-${row?.user.id}`}
      />
    ),
  },
  {
    title: <HeaderCell title="Store Name" />,
    dataIndex: 'store.name',
    key: 'store',
    width: 30,
    hidden: 'store',

    render: (_: string, row: any) => row?.store?.name ,
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

    render: (_: string, row: any) => row?.store?.city.name ,
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
    title: (
      <HeaderCell
        title="Check In"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'check_in_date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('check_in_date'),
    dataIndex: 'check_in_date',
    key: 'Check In',
    width: 50,
    render: (value: Date, row: any) => <DateCell date={new Date(`${value}T${row.check_in_time}`)} />,
  },
  {
    title: (
      <HeaderCell
        title="Check Out"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'check_out_date'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('check_out_date'),
    dataIndex: 'check_out_date',
    key: 'Check Out',
    width: 50,
    render: (value: Date, row: any) => <DateCell date={new Date(`${value}T${row?.check_out_time}`)} />,
  },
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
    dataIndex: 'date',
    key: 'date',
    width: 50,
    render: (value: Date) => <DateCell date={value} />,
  },
  
];
