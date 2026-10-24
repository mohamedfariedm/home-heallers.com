'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DateCell from '@/components/ui/date-cell';
import DeletePopover from '@/app/shared/delete-popover';
import BrandForm from './review-form';
import TrashIcon from '@/components/icons/trash';
import CreateButton from '../create-button';

type Columns = {
  data: any[];
  sortConfig?: any;
  handleSelectAll: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  t: (key: string, options?: any) => string;
  lang: 'en' | 'ar';
};

function localizedText(value: any, lang: 'en' | 'ar') {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.en || value.ar || '';
}

export const getColumns = ({
  data,
  sortConfig,
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  t,
  lang,
}: Columns) => [
  {
    title: (
      <div className="ps-2">
        <Checkbox
          title={t('client_review_select_all')}
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
          content={() => t('client_review_edit')}
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
            view={<BrandForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
          />
        </Tooltip>
        <DeletePopover
          title={t('client_review_delete_title')}
          description={t('client_review_delete_confirm', { id: row.id })}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label={t('client_review_delete_item')}
            className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          >
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title={t('client_review_col_name')} />,
    dataIndex: 'name',
    key: 'name',
    width: 100,
    hidden: 'name',

    render: (_: string, row: any) => (
      <div className="flex w-full justify-center  text-center">
        {
          <AvatarCard
            //@ts-ignore
            src={row?.image?.original || ''}
            name={localizedText(row?.name, lang)}
            description={`ID-${row.id}`}
          />
        }
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title={t('client_review_col_position')} />,
    dataIndex: 'position',
    key: 'position',
    width: 30,
    hidden: 'position',

    render: (_: string, row: any) => (
      <div className="w-full  text-center">{localizedText(row?.position, lang)}</div>
    ),
  },
  {
    title: <HeaderCell title={t('client_review_col_text')} align="center" />,
    dataIndex: 'text',
    key: 'text',
    width: 200,
    hidden: 'text',
    render: (_: string, row: any) => {
      const text = localizedText(row?.text, lang);
      return (
      <Tooltip
        showArrow
        className=" "
        content={() => <div className="  max-w-[400px] ">{text}</div>}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
        {text}
        </div>
      </Tooltip>
      );
    },
  },
  {
    title: <HeaderCell title={t('client_review_col_rate')} align="center" />,
    dataIndex: 'rate',
    key: 'rate',
    width: 200,
    hidden: 'rate',
    render: (_: string, row: any) => (
      <Tooltip
        showArrow
        className=" "
        content={() => <div className="  max-w-[400px] ">{row?.rate ?? ''}</div>}
      >
        <div className="mx-auto line-clamp-2 max-w-[400px] text-center">
        {row?.rate ?? ''}
        </div>
      </Tooltip>
    ),
  },

  {
    title: (
      <HeaderCell
        align="center"
        title={t('client_review_col_updated')}
        sortable
        ascending={
          sortConfig?.direction === 'asc' && sortConfig?.key === 'updated_at'
        }
      />
    ),
    onHeaderCell: () => onHeaderCellClick('updated_at'),
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 100,
    render: (value: Date) => <DateCell date={value} />,
  },
  {
    title: (
      <HeaderCell
        align="center"
        title={t('client_review_col_created')}
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
