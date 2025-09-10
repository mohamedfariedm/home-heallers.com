'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import TrashIcon from '@/components/icons/trash';
import CreateButton from '../create-button';
import InvoiceForm from './invoices-form';
import InvoiceView from '@/components/ui/invoiceView';
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
            view={<InvoiceForm initValues={row} />}
            label=""
            customSize='750px'
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <Tooltip
          size="sm"
          content={() => 'Show Invoice'}
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
                <EyeIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<InvoiceView invoiceData={row} />}
            customSize='750px'
            label=''
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title={`Delete Invoice`}
          description={`Are you sure you want to delete invoice #${row.invoice_number}?`}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label={'Delete Invoice'}
            className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          >
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Invoice Number" />,
    dataIndex: 'invoice_number',
    key: 'invoice_number',
    width: 100,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.invoice_number}</div>
    ),
  },
  // {
  //   title: <HeaderCell align="center" title="Customer Name" />,
  //   dataIndex: 'customer_name',
  //   key: 'customer_name',
  //   width: 100,
  //   render: (_: string, row: any) => (
  //     <div className="w-full text-center">
  //       <AvatarCard
  //         src={row?.image?.original || ''}
  //         name={row.customer_name}
  //       />
  //     </div>
  //   ),
  // },
  // {
  //   title: <HeaderCell align="center" title="Service Name" />,
  //   dataIndex: 'service_name',
  //   key: 'service_name',
  //   width: 100,
  //   render: (_: string, row: any) => (
  //     <div className="w-full text-center">{row.service_name}</div>
  //   ),
  // },
  // {
  //   title: <HeaderCell align="center" title="Service Code" />,
  //   dataIndex: 'service_code',
  //   key: 'service_code',
  //   width: 80,
  //   render: (_: string, row: any) => (
  //     <div className="w-full text-center">{row.service_code}</div>
  //   ),
  // },
  // {
  //   title: <HeaderCell align="center" title="Session Price" />,
  //   dataIndex: 'session_price',
  //   key: 'session_price',
  //   width: 80,
  //   render: (_: string, row: any) => (
  //     <div className="w-full text-center">{row.session_price} ر.س</div>
  //   ),
  // },
  // {
  //   title: <HeaderCell align="center" title="Session Count" />,
  //   dataIndex: 'session_count',
  //   key: 'session_count',
  //   width: 80,
  //   render: (_: string, row: any) => (
  //     <div className="w-full text-center">{row.session_count}</div>
  //   ),
  // },
  {
    title: <HeaderCell align="center" title="Discount" />,
    dataIndex: 'discount',
    key: 'discount',
    width: 80,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.discount} ر.س</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Total Before Tax" />,
    dataIndex: 'total_before_tax',
    key: 'total_before_tax',
    width: 100,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.total_before_tax} ر.س</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Tax Total" />,
    dataIndex: 'tax_total',
    key: 'tax_total',
    width: 80,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.tax_total} ر.س</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Grand Total" />,
    dataIndex: 'grand_total',
    key: 'grand_total',
    width: 100,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.grand_total} ر.س</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Balance Due" />,
    dataIndex: 'balance_due',
    key: 'balance_due',
    width: 100,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.balance_due} ر.س</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Status" />,
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (_: string, row: any) => (
      <div className="w-full text-center">{row.status}</div>
    ),
  },
  {
    title: (
      <HeaderCell
        align="center"
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
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
];