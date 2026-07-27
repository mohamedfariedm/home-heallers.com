'use client';

import { useEffect, useMemo, useState } from 'react';
import StatusField from '@/components/controlled-table/status-field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Text, Title } from '@/components/ui/text';
import DateCell from '@/components/ui/date-cell';
import Spinner from '@/components/ui/spinner';
import ControlledTable from '@/components/controlled-table';
import { HeaderCell } from '@/components/ui/table';
import { useColumn } from '@/hooks/use-column';
import { useSentNotificationRecipients } from '@/framework/notifications';
import {
  PUSH_STATUS_LABELS,
  READ_FILTER_OPTIONS,
  RECIPIENT_KIND_OPTIONS,
} from '@/app/shared/notifications/constants';
import type { SentNotificationRecipient } from '@/types/admin-notifications';

function buildRecipientsQuery(filters: {
  search: string;
  read: string;
  type: string;
  page: number;
  per_page: number;
}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.read !== '') params.set('read', filters.read);
  if (filters.type) params.set('type', filters.type);
  params.set('page', String(filters.page));
  params.set('per_page', String(filters.per_page));
  return params.toString();
}

function PushBadge({ status }: { status: string }) {
  const color =
    status === 'sent' ? 'success' : status === 'failed' ? 'danger' : 'warning';

  return (
    <Badge variant="flat" color={color} className="capitalize">
      {PUSH_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export default function SentNotificationRecipientsTable({
  notificationId,
}: {
  notificationId: number;
}) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [read, setRead] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = buildRecipientsQuery({
    search,
    read,
    type,
    page,
    per_page: pageSize,
  });

  const { data, isLoading, isError, error } = useSentNotificationRecipients(
    notificationId,
    query
  );

  const rows = data?.data?.recipients ?? [];
  const total = data?.data?.pagination?.total ?? 0;

  const columns = useMemo(
    () => [
      {
        title: <HeaderCell title="Name" />,
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (value: string) => (
          <Text className="font-medium text-gray-900">{value}</Text>
        ),
      },
      {
        title: <HeaderCell title="Type" />,
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (value: string) => (
          <Badge variant="flat" className="capitalize">
            {RECIPIENT_KIND_OPTIONS.find((option) => option.value === value)
              ?.label ?? value}
          </Badge>
        ),
      },
      {
        title: <HeaderCell title="Push" />,
        dataIndex: 'push_status',
        key: 'push_status',
        width: 160,
        render: (value: string) => <PushBadge status={value} />,
      },
      {
        title: <HeaderCell title="Delivered at" />,
        dataIndex: 'delivered_at',
        key: 'delivered_at',
        width: 160,
        render: (value: string | null) =>
          value ? <DateCell date={new Date(value)} /> : (
            <Text className="text-gray-400">—</Text>
          ),
      },
      {
        title: <HeaderCell title="Read at" />,
        dataIndex: 'read_at',
        key: 'read_at',
        width: 160,
        render: (value: string | null) =>
          value ? (
            <DateCell date={new Date(value)} />
          ) : (
            <Badge variant="flat" color="warning">
              Unread
            </Badge>
          ),
      },
    ],
    []
  );

  const { visibleColumns, checkedColumns, setCheckedColumns } = useColumn(columns);

  const typeOptions = [
    { value: '', name: 'all', label: 'All types' },
    ...RECIPIENT_KIND_OPTIONS.map((option) => ({
      value: option.value,
      name: option.value,
      label: option.label,
    })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Title as="h4" className="text-lg font-semibold text-gray-900">
            Recipients
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Delivery and read status for everyone targeted by this send.
          </Text>
        </div>
        <Text className="text-sm text-gray-500">
          {total} recipient{total === 1 ? '' : 's'}
        </Text>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by name..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          inputClassName="bg-gray-50"
        />
        <StatusField
          placeholder="Read status"
          options={[...READ_FILTER_OPTIONS]}
          value={read}
          onChange={(value: string) => {
            setRead(value);
            setPage(1);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            READ_FILTER_OPTIONS.find((option) => option.value === selected)?.label ??
            'All'
          }
        />
        <StatusField
          placeholder="Recipient type"
          options={typeOptions}
          value={type}
          onChange={(value: string) => {
            setType(value);
            setPage(1);
          }}
          getOptionValue={(option) => option.value}
          displayValue={(selected: string) =>
            typeOptions.find((option) => option.value === selected)?.label ??
            'All types'
          }
        />
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error?.message ?? 'Failed to load recipients.'}
        </div>
      ) : isLoading && rows.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <ControlledTable
          variant="modern"
          data={rows}
          isLoading={isLoading}
          showLoadingText
          // @ts-ignore
          columns={visibleColumns}
          paginatorOptions={{
            pageSize,
            setPageSize: ((size: number) => {
              setPageSize(size);
              setPage(1);
            }) as React.Dispatch<React.SetStateAction<number>>,
            total,
            current: page,
            onChange: (nextPage: number) => setPage(nextPage),
          }}
          filterOptions={{
            searchTerm: '',
            onSearchClear: () => undefined,
            onSearchChange: () => undefined,
            hasSearched: false,
            columns,
            checkedColumns,
            setCheckedColumns,
            enableDrawerFilter: false,
          }}
          className="overflow-hidden rounded-xl border border-gray-200 text-sm shadow-sm [&_thead.rc-table-thead]:sticky [&_thead.rc-table-thead]:top-0 [&_thead.rc-table-thead]:z-10 [&_thead.rc-table-thead]:bg-white"
          scroll={{ x: 900 }}
        />
      )}
    </div>
  );
}
