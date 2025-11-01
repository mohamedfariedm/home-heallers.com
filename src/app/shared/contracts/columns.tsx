import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import { HeaderCell } from '@/components/ui/table';
import { Text } from '@/components/ui/text';
import { Tooltip } from '@/components/ui/tooltip';
import { PiPencilSimple, PiTrash } from 'react-icons/pi';
import { Contract } from '@/types';
import dayjs from 'dayjs';

type Columns = {
  data: any[];
  sortConfig?: any;
  checkedItems: string[];
  onHeaderCellClick: (value: string) => void;
  onDeleteItem: (id: string[]) => void;
  onChecked?: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  handleSelectAll?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onHeaderCellClick,
  onDeleteItem,
  onChecked,
  handleSelectAll,
}: Columns) => {

  return [
    {
      title: (
        <div className="ps-2">
          <Checkbox
            title={'Select All'}
            onChange={handleSelectAll}
            checked={checkedItems.length === data.length}
            {...(checkedItems.length === data.length && { indeterminate: true })}
            className="cursor-pointer"
          />
        </div>
      ),
      dataIndex: 'checked',
      key: 'checked',
      width: 50,
      render: (_: any, row: Contract) => (
        <div className="inline-flex ps-2">
          <Checkbox
            value={row.id}
            checked={checkedItems.includes(String(row.id))}
            {...(onChecked && { onChange: (e) => onChecked(e, String(row.id)) })}
            className="cursor-pointer"
          />
        </div>
      ),
    },
    {
      title: <HeaderCell title="ID" />,
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <Text className="font-medium text-gray-700 dark:text-gray-600">
          #{id}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Company Name" />,
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
      render: (company_name: string) => (
        <Text className="font-medium text-gray-900 dark:text-white">
          {company_name}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Company Activity" />,
      dataIndex: 'company_activity',
      key: 'company_activity',
      width: 200,
      render: (company_activity: string) => (
        <Text className="text-gray-600 dark:text-gray-400">
          {company_activity}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Service Manager" />,
      dataIndex: 'service_manager_name',
      key: 'service_manager_name',
      width: 150,
      render: (service_manager_name: string) => (
        <Text className="font-medium text-gray-900 dark:text-white">
          {service_manager_name}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Manager Mobile" />,
      dataIndex: 'manager_mobile',
      key: 'manager_mobile',
      width: 120,
      render: (manager_mobile: string) => (
        <Text className="text-gray-600 dark:text-gray-400">
          {manager_mobile}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Manager Email" />,
      dataIndex: 'manager_email',
      key: 'manager_email',
      width: 200,
      render: (manager_email: string) => (
        <Text className="text-gray-600 dark:text-gray-400">
          {manager_email}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Visit Date" />,
      dataIndex: 'visit_date',
      key: 'visit_date',
      width: 120,
      render: (visit_date: string) => (
        <Text className="text-gray-600 dark:text-gray-400">
          {dayjs(visit_date).format('MMM DD, YYYY')}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Visit Summary" />,
      dataIndex: 'visit_summary',
      key: 'visit_summary',
      width: 200,
      render: (visit_summary: string) => (
        <Text className="text-gray-600 dark:text-gray-400 truncate">
          {visit_summary}
        </Text>
      ),
    },
    {
      title: <HeaderCell title="Created At" />,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (created_at: string) => (
        <Text className="text-gray-600 dark:text-gray-400">
          {dayjs(created_at).format('MMM DD, YYYY')}
        </Text>
      ),
    },
    {
      title: <HeaderCell align="center" title="Actions" />,
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (_: string, row: Contract) => (
        <div className="flex items-center justify-center gap-3">
          <Tooltip
            size="sm"
            content={() => 'Edit Contract'}
            placement="top"
            color="invert"
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label={'Edit Contract'}
              className="hover:!border-gray-900 hover:text-gray-700"
            >
              <PiPencilSimple className="h-4 w-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            size="sm"
            content={() => 'Delete Contract'}
            placement="top"
            color="invert"
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label={'Delete Contract'}
              className="hover:!border-red-600 hover:text-red-600"
              onClick={() => onDeleteItem([String(row.id)])}
            >
              <PiTrash className="h-4 w-4" />
            </ActionIcon>
          </Tooltip>
        </div>
      ),
    },
  ];
};

