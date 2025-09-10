'use client';

import Link from 'next/link';
import { type Invoice } from '@/data/invoice-data';
import { routes } from '@/config/routes';
// import { Title, Text } from '@/components/ui/text';
// import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { ActionIcon } from '@/components/ui/action-icon';
// import EyeIcon from '@/components/icons/eye';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import UserForm from './user-form';
import { IPermission, Role } from '@/types';
import TrashIcon from '@/components/icons/trash';

// function getStatusBadge(status: string) {
//   switch (status?.toLowerCase()) {
//     case 'pending':
//       return (
//         <div className="flex items-center">
//           <Badge color="warning" renderAsDot />
//           <Text className="ms-2 font-medium text-orange-dark">{status}</Text>
//         </div>
//       );
//     case 'paid':
//       return (
//         <div className="flex items-center">
//           <Badge color="success" renderAsDot />
//           <Text className="ms-2 font-medium text-green-dark">{status}</Text>
//         </div>
//       );
//     case 'overdue':
//       return (
//         <div className="flex items-center">
//           <Badge color="danger" renderAsDot />
//           <Text className="ms-2 font-medium text-red-dark">{status}</Text>
//         </div>
//       );
//     default:
//       return (
//         <div className="flex items-center">
//           <Badge renderAsDot className="bg-gray-400" />
//           <Text className="ms-2 font-medium text-gray-600">{status}</Text>
//         </div>
//       );
//   }
// }

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  roles?: Role[]
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  roles
}: Columns) => {
  
  const lang="en";
  return[
    
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
              view={<UserForm initValues={row} />}
              label=''
              className='p-0 m-0 bg-transparent text-gray-700'
            />
          </Tooltip>
          <DeletePopover
            title={`Delete user`}
            description={`Are you sure you want to delete this #${row.id} user?`}
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
      dataIndex: 'name',
      key: 'name',
      width: 300,
      hidden: 'name',
      render: (_: string, row: any) => (
        <AvatarCard
          src={row?.image}
          name={row.name?.[lang] ?? row.name?.en ?? "Unnamed"}
          description={`ID-${row.id}`}
        />
      ),
    },
    {
      title: <HeaderCell title="Role" />,
      dataIndex: 'Roles',
      key: 'Roles',
      width: 100,
      render: (roles: any[]) => roles.map(r => r.name ?? r.name).join(", "),
    }
,    
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
}