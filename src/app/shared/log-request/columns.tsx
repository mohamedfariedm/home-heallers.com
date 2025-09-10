'use client';

import { HeaderCell } from '@/components/ui/table';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import { Tooltip } from '@/components/ui/tooltip';
import CreateButton from '../create-button';
import EyeIcon from '@/components/icons/eye';
import { ActionIcon } from '@/components/ui/action-icon';
import ReportDetails from '@/app/shared/log-request/report-modal'
import { Title, Text } from '@/components/ui/text';


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
      render: (value: Date, row: any) => <DateCell date={new Date(`${value}T${row?.time}`)} />,
    },

    {
      title: <HeaderCell title="User Name" />,
      dataIndex: 'user.name',
      key: 'useName',
      width: 100,
      hidden: 'user name',
  
      render: (_: string, row: any) => (
        <AvatarCard
          src={row?.user?.avatar}
          name={row?.user?.name || ''}
          description={`ID-${row?.user.id}`}
        />
      ),
    },
    {
    title: <HeaderCell title="type" />,
    dataIndex: 'type',
    key: 'type',
    width: 30,
    hidden: 'type',

    render: (_: string, row: any) => row?.type ,
  },
  {
    title: <HeaderCell title="store name" />,
    dataIndex: 'store.name',
    key: 'storeName',
    width: 30,
    hidden: 'storeName',

    render: (_: string, row: any) => row?.store?.name||"Empty" ,
  },
  {
    title: <HeaderCell title="store location" />,
    dataIndex: 'store.lat',
    key: 'store location',
    width: 30,
    hidden: 'store location',

    render: (_: string, row: any) => {

      return row?.store?.lat&&row?.store?.lng?  <div>
        <a
        href={`https://www.google.com/maps/search/?api=1&query=${row?.store?.lat},${row?.store?.lng}`}
        target="_blank"
        >
            {/* <Button variant="text" size="lg">
                <PiMapPinLineDuotone />
            </Button> */}
            <AvatarCard
                src={'/Simply-Styled-Google-Maps.png'}
                name={''}
                // description={`ID-${row?.user.id}`}
            />
        </a>
        </div>:"Empty"

    }
  },
  {
    title: <HeaderCell title="user location" />,
    dataIndex: 'lng',
    key: 'User location',
    width: 30,
    hidden: 'User location',

    render: (_: string, row: any) => {

      return row?.lat&&row?.lng?  <div>
        <a
        href={`https://www.google.com/maps/search/?api=1&query=${row?.lat},${row?.lng}`}
        target="_blank"
        >
            {/* <Button variant="text" size="lg">
                <PiMapPinLineDuotone />
            </Button> */}
            <AvatarCard
                src={'/Simply-Styled-Google-Maps.png'}
                name={''}
                // description={`ID-${row?.user.id}`}
            />
        </a>
        </div>:"Empty"

    }  },
    
  {
    title: <HeaderCell title="retailer" />,
    dataIndex: 'store.retailer.name',
    key: 'retailer',
    width: 30,
    hidden: 'retailer',

    render: (_: string, row: any) => row?.store?.retailer?.name||"Empty" ,
  },  
];
