'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import CreateButton from '../create-button';
import RegionForm from './packages-form';
import { Region } from '@/types';
import TrashIcon from '@/components/icons/trash';

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
  const lang = "en"; // Or use dynamic lang state as per your requirement

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
          <Tooltip size="sm" content={() => 'Edit Region'} placement="top" color="invert">
            <CreateButton
              icon={
                <ActionIcon tag="span" size="sm" variant="outline" className="hover:!border-gray-900 hover:text-gray-700">
                  <PencilIcon className="h-4 w-4" />
                </ActionIcon>
              }
              view={<RegionForm initValues={row} />}
              label=""
              className="p-0 m-0 bg-transparent text-gray-700"
            />
          </Tooltip>
          <DeletePopover
            title={`Delete region`}
            description={`Are you sure you want to delete this #${row.id} region?`}
            onDelete={() => onDeleteItem([row.id])}
          >
            <ActionIcon size="sm" variant="outline" aria-label={'Delete Item'} className="cursor-pointer hover:!border-gray-900 hover:text-gray-700">
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        </div>
      ),
    },
    {
      title: <HeaderCell title="package Name" />,
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (_: string, row: any) => (
        <AvatarCard
          src={`/uploads/${row.image || 'countrydefault.png'}`} // fallback image
          name={row?.name?.[lang] ?? row?.name?.en ?? 'Unnamed'}
          description={`ID-${row.id}`}
        />
      ),
    },
    {
      title: <HeaderCell title="Discount" />,
      dataIndex: 'discount',
      key: 'discount',
      width: 120,
      render: (discount: string) => (
        <span className="font-medium">{discount}</span>
      ),
    },
    {
      title: <HeaderCell title="price" />,
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: string) => (
        <span className="font-medium">{price}</span>
      ),
    },
    {
      title: <HeaderCell title="Type" />,
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => type,
    },
    {
      title: <HeaderCell title="Doctors" />,
      dataIndex: 'doctors',
      key: 'doctors',
      width: 200,
      render: (_: any, row: any) => (
        <div>
          {row?.doctors ? row?.doctors.map((doctor: any) => (
            <span key={doctor.id}>
              {doctor?.name?.[lang] ?? doctor?.name?.en} <br />
            </span>
          )) : 'No doctors'}
        </div>
      ),
    },
    // {
    //   title: <HeaderCell title="Status" />,
    //   dataIndex: 'status',
    //   key: 'status',
    //   width: 120,
    //   render: (status: string) => <span className="capitalize font-medium">{status}</span>,
    // },
    // {
    //   title: (
    //     <HeaderCell
    //       title="Created"
    //       sortable
    //       ascending={sortConfig?.direction === 'asc' && sortConfig?.key === 'created_at'}
    //     />
    //   ),
    //   onHeaderCell: () => onHeaderCellClick('created_at'),
    //   dataIndex: 'created_at',
    //   key: 'created_at',
    //   width: 50,
    //   render: (value: Date) => <DateCell date={value} />,
    // },
  ];
};
