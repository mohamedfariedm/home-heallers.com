import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip } from '@/components/ui/tooltip';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import AddressForm from './address-form';
import BenchmarkModal from './report-modal';
import EyeIcon from '@/components/icons/eye';

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
        <Tooltip size="sm" content={() => 'Edit Region'} placement="top" color="invert">
                    <CreateButton
                      icon={
                        <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                          <PencilIcon className="h-4 w-4" />
                        </ActionIcon>
                      }
                      view={<AddressForm initValues={row} />}
                      label=""
                      className="p-0 m-0 bg-transparent text-gray-700"
                    />
                  </Tooltip>
        <DeletePopover
          title={`Delete Address`}
          description={`Are you sure you want to delete this Address #${row.id}?`}
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
    title: <HeaderCell title="Full Address" />,
    dataIndex: 'street',
    key: 'street',
    render: (_: string, row: any) =>
      `${row.street}, ${row.building}, ${row.apartment}`
  },
  {
    title: <HeaderCell title="Country" />,
    dataIndex: 'country',
    key: 'country',
    render: (_: string, row: any) => row.country?.name?.en ?? '—'
  },
  {
    title: <HeaderCell title="State" />,
    dataIndex: 'state',
    key: 'state',
    render: (_: string, row: any) => row.state?.name?.en ?? '—'
  },
  {
    title: <HeaderCell title="City" />,
    dataIndex: 'city',
    key: 'city',
    render: (_: string, row: any) => row.city?.name?.en ?? '—'
  },
  {
    title: <HeaderCell title="ZIP Code" />,
    dataIndex: 'zip_code',
    key: 'zip_code',
  },
  {
    title: <HeaderCell title="Default" />,
    dataIndex: 'is_default',
    key: 'is_default',
    render: (val: boolean) => (val ? 'Yes' : 'No')
  },
];
