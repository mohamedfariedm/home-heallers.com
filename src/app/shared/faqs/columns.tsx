'use client';

import DeletePopover from '@/app/shared/delete-popover';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import { ActionIcon } from '@/components/ui/action-icon';
import { Checkbox } from '@/components/ui/checkbox';
import DateCell from '@/components/ui/date-cell';
import { HeaderCell } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import CreateButton from '../create-button';
import FaqForm from './faq-form';
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
                className="hover:!border-gray-900 hover:text-gray-700 "
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            }
            view={<FaqForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title={`Delete Faq`}
          description={`Are you sure you want to delete this #${row.id} Faq?`}
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
    title: <HeaderCell title="Question" align="center" />,
    dataIndex: 'title_question',
    key: 'title_question',
    width: 300,
    hidden: 'title_question',

    render: (_: string, row: any) => (
      <Tooltip
        showArrow
        className=" "
        content={() => (
          <div className="  max-w-[400px] ">
            {row?.title_question?.en}
          </div>
        )}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
          {row?.title_question?.en}
        </div>
      </Tooltip>
    ),
  },
  {
    title: <HeaderCell title="Answer" align="center" />,
    dataIndex: 'answer',
    key: 'answer',
    width: 300,
    hidden: 'answer',

    render: (_: string, row: any) => (
      <Tooltip
        showArrow
        className=" "
        content={() => (
          <div className="  max-w-[400px] ">
            {' '}
            {parse(DOMPurify.sanitize(row?.answer?.en))}
          </div>
        )}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
          {parse(DOMPurify.sanitize(row?.answer?.en))}
        </div>
      </Tooltip>
    ),
  },

  {
    title: (
      <HeaderCell
        title={'Created At'}
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
