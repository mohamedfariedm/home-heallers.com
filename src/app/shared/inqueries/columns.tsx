'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import CreateButton from '../create-button';
import InqueriesForm from './inqueries-form';
import EyeIcon from '@/components/icons/eye';
import InqueriesDetails from '@/app/shared/inqueries/inquerie-modal'

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
              view={<InqueriesForm initValues={row} />}
              label=''
              className='p-0 m-0 bg-transparent text-gray-700'
            />
            
          </Tooltip>
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
            view={<InqueriesDetails id={row.id}/>}
            label=''
            className='p-0 m-0 bg-transparent text-gray-700'
          />
        </Tooltip>
        </div>
      ),
    },
    {
      title: <HeaderCell title="State" />,
      dataIndex: 'seen',
      key: 'seen',
      width: 30,
      hidden: 'seen',
      render: (_: string,row: any) => {
       if(row?.seen==0){
          return"Unread"
       }else{
        return"Read"
       }
      },
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
        description={`ID-${row.user_id}`}
      />
    ),
  },
  {
    title: <HeaderCell title="subject" />,
    dataIndex: 'subject',
    key: 'subject',
    width: 30,
    hidden: 'subject',

    render:  (_: string,row: any) => row?.subject ,
  },
  {
    title: <HeaderCell title="title" />,
    dataIndex: 'title',
    key: 'title',
    width: 100,
    hidden: 'title',
    render: (_: string,row: any) => row?.title,
  },
  {
    title: <HeaderCell title="message" />,
    dataIndex: 'message',
    key: 'message',
    width: 30,
    hidden: 'message',

    render: (_: string,row: any) => row?.message ,
  },
  {
    title: <HeaderCell title="Feed Back" />,
    dataIndex: 'response',
    key: 'response',
    width: 200,
    hidden: 'response',
    render: (_: string,row: any) => row?.response,
  },
  {
    title: (
      <HeaderCell
        title="last update"
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'updated_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('updated_at'),
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 50,
    render: (value: Date) => <DateCell date={value} />,
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
