'use client';

import Link from 'next/link';
import { Tooltip } from '@/components/ui/tooltip';
import { HeaderCell } from '@/components/ui/table';
import { ActionIcon } from '@/components/ui/action-icon';
import PencilIcon from '@/components/icons/pencil';
import AvatarCard from '@/components/ui/avatar-card';
import DeletePopover from '@/app/shared/delete-popover';
import TrashIcon from '@/components/icons/trash';
import { Badge } from '@/components/ui/badge';
import { routes } from '@/config/routes';
import OfferStatusBadge from '@/app/shared/offers/offer-status-badge';
import {
  getAttachmentUrl,
  getDashboardLocale,
  offerDisplayName,
} from '@/app/shared/offers/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { PiCopy } from 'react-icons/pi';

type Columns = {
  data: any[];
  sortConfig?: any;
  checkedItems: string[];
  onDeleteItem: (id: string[]) => void;
  onHeaderCellClick: (value: string) => void;
  onChecked?: (id: string) => void;
  handleSelectAll: any;
  canDelete?: boolean;
};

function FlagPills(row: any) {
  const flags = [
    row.is_featured && 'Featured',
    row.is_best_seller && 'Best seller',
    row.is_most_popular && 'Popular',
    row.is_new && 'New',
  ].filter(Boolean) as string[];

  if (!flags.length) return <span className="text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <Badge key={flag} variant="flat" className="text-[11px]">
          {flag}
        </Badge>
      ))}
    </div>
  );
}

function formatWindow(startsAt?: string | null, endsAt?: string | null) {
  const fmt = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };
  return `${fmt(startsAt)} → ${fmt(endsAt)}`;
}

export const getColumns = ({
  checkedItems,
  onDeleteItem,
  onHeaderCellClick,
  handleSelectAll,
  onChecked,
  data,
  canDelete = true,
}: Columns) => {
  const lang = getDashboardLocale();

  return [
    {
      title: (
        <div className="ps-2">
          <Checkbox
            title="Select All"
            onChange={handleSelectAll}
            checked={data.length > 0 && checkedItems.length === data.length}
            className="cursor-pointer"
          />
        </div>
      ),
      dataIndex: 'checked',
      key: 'checked',
      width: 30,
      render: (_: any, row: any) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            className="cursor-pointer"
            checked={checkedItems.includes(String(row.id))}
            onChange={() => onChecked?.(String(row.id))}
          />
        </div>
      ),
    },
    {
      title: <HeaderCell title="Offer" />,
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_: unknown, row: any) => {
        const name = offerDisplayName(row?.name, lang) || 'Untitled offer';
        return (
          <Tooltip
            size="sm"
            content={() => name}
            placement="top"
            color="invert"
          >
            <Link
              href={routes.offers.edit(row.id)}
              className="block max-w-[260px]"
              onClick={(e) => e.stopPropagation()}
            >
              <AvatarCard
                src={getAttachmentUrl(row.image)}
                name={name}
                description={row.slug ? `/${row.slug}` : '—'}
              />
            </Link>
          </Tooltip>
        );
      },
    },
    {
      title: <HeaderCell title="Price" />,
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (_: unknown, row: any) => {
        const currency = row.currency || 'SAR';
        if (row.old_price == null || row.old_price === '') {
          return (
            <span className="font-medium">
              {row.price} {currency}
            </span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 line-through">
              {row.old_price} {currency}
            </span>
            <span className="font-medium">
              {row.price} {currency}
              {row.discount_percentage != null && (
                <span className="ms-1 text-xs text-green-600">
                  −{row.discount_percentage}%
                </span>
              )}
            </span>
          </div>
        );
      },
    },
    {
      title: <HeaderCell title="Sessions" />,
      dataIndex: 'sessions_count',
      key: 'sessions_count',
      width: 90,
      render: (value: number) => <span className="font-medium">{value ?? '—'}</span>,
    },
    {
      title: <HeaderCell title="Status" />,
      dataIndex: 'offer_status',
      key: 'offer_status',
      width: 130,
      render: (status: string) => <OfferStatusBadge status={status} />,
    },
    {
      title: <HeaderCell title="Flags" />,
      dataIndex: 'flags',
      key: 'flags',
      width: 160,
      render: (_: unknown, row: any) => <FlagPills {...row} />,
    },
    {
      title: (
        <HeaderCell
          title="Sort"
          sortable
          className="hidden xl:block"
        />
      ),
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 70,
      className: 'hidden xl:table-cell',
      render: (value: number) => value ?? 0,
    },
    {
      title: <HeaderCell title="Stock" className="hidden xl:block" />,
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 80,
      className: 'hidden xl:table-cell',
      render: (value: number | null) =>
        value == null ? 'Unlimited' : value,
    },
    {
      title: <HeaderCell title="Booked" className="hidden xl:block" />,
      dataIndex: 'booked_count',
      key: 'booked_count',
      width: 80,
      className: 'hidden xl:table-cell',
      render: (value: number) => value ?? 0,
    },
    {
      title: <HeaderCell title="Window" />,
      dataIndex: 'starts_at',
      key: 'window',
      width: 160,
      render: (_: unknown, row: any) => (
        <span className="text-xs text-gray-600">
          {formatWindow(row.starts_at, row.ends_at)}
        </span>
      ),
    },
    {
      title: <HeaderCell title="Actions" />,
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (_: string, row: any) => {
        const name = offerDisplayName(row?.name, lang) || `offer #${row.id}`;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Tooltip size="sm" content={() => `Edit ${name}`} placement="top" color="invert">
              <Link href={routes.offers.edit(row.id)}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  aria-label={`Edit ${name}`}
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
            <Tooltip size="sm" content={() => `Duplicate ${name}`} placement="top" color="invert">
              <Link href={`${routes.offers.create}?duplicateFrom=${row.id}`}>
                <ActionIcon
                  tag="span"
                  size="sm"
                  variant="outline"
                  aria-label={`Duplicate ${name}`}
                  className="hover:!border-gray-900 hover:text-gray-700"
                >
                  <PiCopy className="h-4 w-4" />
                </ActionIcon>
              </Link>
            </Tooltip>
            {canDelete && (
              <DeletePopover
                title="Delete offer"
                description={`Delete “${name}”? Its FAQs will be deleted with it (database cascade).`}
                onDelete={() => onDeleteItem([String(row.id)])}
              >
                <ActionIcon
                  size="sm"
                  variant="outline"
                  aria-label={`Delete ${name}`}
                  className="cursor-pointer hover:!border-gray-900 hover:text-gray-700"
                >
                  <TrashIcon className="h-4 w-4" />
                </ActionIcon>
              </DeletePopover>
            )}
          </div>
        );
      },
    },
  ];
};
