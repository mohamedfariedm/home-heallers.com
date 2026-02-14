'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import CenterForm from '@/app/shared/centers/center-form';
import TrashIcon from '@/components/icons/trash';
import { Badge } from '@/components/ui/badge';

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
}: Columns) => {
  const lang = 'en';
  return [
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
          content={() => 'Edit Center'}
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
            view={<CenterForm initValues={row} />}
            label=""
            className="p-0 m-0 bg-transparent text-gray-700"
          />
        </Tooltip>
          <DeletePopover
            title={`Delete Center`}
            description={`Are you sure you want to delete this center?`}
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
      title: <HeaderCell title="ID" />,
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <span className="font-medium">{id}</span>,
    },
    {
      title: <HeaderCell title="Name (EN)" />,
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: any) => (
        <span className="font-medium">{name?.en || '-'}</span>
      ),
    },
    {
      title: <HeaderCell title="Name (AR)" />,
      dataIndex: 'name',
      key: 'name_ar',
      width: 200,
      render: (name: any) => (
        <span className="font-medium" dir="rtl">{name?.ar || '-'}</span>
      ),
    },
    {
      title: <HeaderCell title="Phone" />,
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone: string) => <span>{phone || '-'}</span>,
    },
    {
      title: <HeaderCell title="Email" />,
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => <span>{email || '-'}</span>,
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Badge
          color={status === 'active' ? 'success' : 'danger'}
          renderAsDot
        >
          <span className="ms-2 font-medium capitalize">{status}</span>
        </Badge>
      ),
    },
    {
      title: <HeaderCell title="Created At" />,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string | null) => date ? <DateCell date={new Date(date)} /> : <span>-</span>,
    },
    {
      title: <HeaderCell title="Updated At" />,
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (date: string | null) => date ? <DateCell date={new Date(date)} /> : <span>-</span>,
    },
  ];
};
