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
import BlogsForm from './address-form';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import { getBlogSlug, parseApiDate } from '@/utils/slugs';
import { stripHtml } from '@/utils/seo-fields';

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
          title={t('blogs_select_all')}
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
          content={() => t('blogs_edit')}
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
            view={<BlogsForm initValues={row} />}
            label=""
            className="m-0 bg-transparent p-0 text-gray-700"
            customSize="800px"
          />
        </Tooltip>
        <DeletePopover
          title={t('blogs_delete_title')}
          description={t('blogs_delete_confirm', { id: row.id })}
          onDelete={() => onDeleteItem([row.id])}
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label={t('blogs_delete_item')}
            className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
          >
            <TrashIcon className="h-4 w-4" />
          </ActionIcon>
        </DeletePopover>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title={t('blogs_col_name')} />,
    dataIndex: 'name',
    key: 'name',
    width: 100,
    hidden: 'name',

    render: (_: string, row: any) => {
      const slug = getBlogSlug(row, lang);
      return (
        <div className="flex w-full justify-center  text-center">
          {
            <AvatarCard
              //@ts-ignore
              src={row?.image?.original || ''}
              name={resolveLocalizedName(row?.name, lang) || resolveLocalizedName(row?.name, lang === 'ar' ? 'en' : 'ar')}
              description={slug || '—'}
            />
          }
        </div>
      );
    },
  },
  {
    title: <HeaderCell align="center" title={t('blogs_col_slug')} />,
    dataIndex: 'slug',
    key: 'slug',
    width: 160,
    render: (_: string, row: any) => (
      <div className="flex w-full flex-col gap-0.5 text-center text-sm">
        <span className="font-medium text-gray-700">{getBlogSlug(row, 'en') || '—'}</span>
        <span className="text-gray-500">{getBlogSlug(row, 'ar') || '—'}</span>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title={t('blogs_col_description')} />,
    dataIndex: 'description',
    key: 'description',
    width: 30,
    hidden: 'description',

    render: (_: string, row: any) => {
      const description =
        resolveLocalizedName(row?.description, lang) ||
        resolveLocalizedName(row?.description, lang === 'ar' ? 'en' : 'ar') ||
        '';
      const plain = stripHtml(description).replace(/\s+/g, ' ').trim();
      return (
        <div className="w-full line-clamp-3 text-center">
          {plain || '—'}
        </div>
      );
    },
  },
  {
    title: <HeaderCell align="center" title={t('blogs_col_date')} />,
    dataIndex: 'date',
    key: 'date',
    width: 30,
    hidden: 'date',

    render: (_: string, row: any) => {
      const parsed = parseApiDate(row.date);
      return (
        <div className="w-full  text-center">
          {parsed ? <DateCell date={parsed} /> : (row.date || '—')}
        </div>
      );
    },
  },
  {
    title: <HeaderCell align="center" title={t('blogs_col_home')} />,
    dataIndex: 'show_in_home_page',
    key: 'show_in_home_page',
    width: 30,
    hidden: 'show_in_home_page',

    render: (_: string, row: any) => (
      <div className="w-full  text-center">{row.show_in_home_page==1?t('blogs_show'):t('blogs_hidden')}</div>
    ),
  },



  {
    title: (
      <HeaderCell
        align="center"
        title={t('blogs_col_updated')}
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
    render: (value: Date | string) => {
      const parsed = parseApiDate(value);
      return parsed ? <DateCell date={parsed} /> : (value ? String(value) : '—');
    },
  },
  {
    title: (
      <HeaderCell
        align="center"
        title={t('blogs_col_created')}
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
    render: (value: Date | string) => {
      const parsed = parseApiDate(value);
      return parsed ? <DateCell date={parsed} /> : (value ? String(value) : '—');
    },
  },
];
