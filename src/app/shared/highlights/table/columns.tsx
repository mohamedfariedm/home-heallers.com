'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import PencilIcon from '@/components/icons/pencil';
import TrashIcon from '@/components/icons/trash';
import DeletePopover from '@/app/shared/delete-popover';
import DateCell from '@/components/ui/date-cell';
import { routes } from '@/config/routes';
import { Highlight } from '@/types/highlights';
import { PiPushPinFill } from 'react-icons/pi';

type ColumnsParams = {
  data: Highlight[];
  onToggleActive: (id: number) => void;
  onDeleteItem: (id: number) => void;
  canEdit?: boolean;
  canDelete?: boolean;
};

export const getColumns = ({
  onToggleActive,
  onDeleteItem,
  canEdit = true,
  canDelete = true,
}: ColumnsParams) => [
  {
    title: <HeaderCell title="Highlight" />,
    dataIndex: 'title',
    key: 'title',
    width: 250,
    render: (_: any, row: Highlight) => {
      const titleAr = row.title?.ar || '—';
      const titleEn = row.title?.en || '—';
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {row.cover ? (
              <Image
                src={row.cover}
                alt={titleEn}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                No cover
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <span>{titleEn}</span>
              {row.is_pinned && (
                <Tooltip content="Pinned Highlight" placement="top">
                  <span className="inline-flex text-amber-500">
                    <PiPushPinFill className="h-4 w-4" />
                  </span>
                </Tooltip>
              )}
            </div>
            <span className="text-xs text-gray-500" dir="rtl">
              {titleAr}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    title: <HeaderCell align="center" title="Visibility" />,
    dataIndex: 'visibility_type',
    key: 'visibility_type',
    width: 130,
    render: (value: string) => (
      <div className="flex justify-center">
        {value === 'daily' ? (
          <Badge variant="flat" color="warning" className="capitalize">
            Daily (24h)
          </Badge>
        ) : (
          <Badge variant="flat" color="primary" className="capitalize">
            Always
          </Badge>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Elements" />,
    dataIndex: 'elements_count',
    key: 'elements_count',
    width: 120,
    render: (count: number) => (
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={
            count >= 5
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-300 text-gray-700'
          }
        >
          {count ?? 0} / 5
        </Badge>
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Order" />,
    dataIndex: 'order',
    key: 'order',
    width: 90,
    render: (order: number) => (
      <div className="text-center font-medium text-gray-700">{order ?? 0}</div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Expiry Status" />,
    dataIndex: 'is_expired',
    key: 'is_expired',
    width: 130,
    render: (isExpired: boolean) => (
      <div className="flex justify-center">
        {isExpired ? (
          <Badge variant="flat" color="danger">
            Expired
          </Badge>
        ) : (
          <Badge variant="flat" color="success">
            Active
          </Badge>
        )}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Status" />,
    dataIndex: 'is_active',
    key: 'is_active',
    width: 120,
    render: (isActive: boolean, row: Highlight) => (
      <div className="flex justify-center">
        <Switch
          checked={isActive}
          onChange={() => onToggleActive(row.id)}
          aria-label="Toggle active status"
        />
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Created At" />,
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    render: (value: string) => (
      <div className="text-center">
        {value ? <DateCell date={new Date(value)} /> : '—'}
      </div>
    ),
  },
  {
    title: <HeaderCell align="center" title="Actions" />,
    dataIndex: 'action',
    key: 'action',
    width: 120,
    render: (_: string, row: Highlight) => (
      <div className="flex items-center justify-center gap-2">
        {canEdit && (
          <Tooltip size="sm" content="Edit Highlight & Elements" placement="top">
            <Link href={routes.highlights.edit(row.id)}>
              <ActionIcon
                size="sm"
                variant="outline"
                className="hover:!border-gray-900 hover:text-gray-700"
              >
                <PencilIcon className="h-4 w-4" />
              </ActionIcon>
            </Link>
          </Tooltip>
        )}
        {canDelete && (
          <DeletePopover
            title="Delete Highlight"
            description={`Are you sure you want to delete highlight #${row.id}?`}
            onDelete={() => onDeleteItem(row.id)}
          >
            <ActionIcon
              size="sm"
              variant="outline"
              aria-label="Delete Item"
              className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
            >
              <TrashIcon className="h-4 w-4" />
            </ActionIcon>
          </DeletePopover>
        )}
      </div>
    ),
  },
];
