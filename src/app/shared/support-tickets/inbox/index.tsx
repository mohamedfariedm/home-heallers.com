'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PiMagnifyingGlassBold, PiXBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import Pagination from '@/components/ui/pagination';
import SelectBox from '@/components/ui/select';
import {
  supportTicketsKeys,
  useSupportChannel,
  useSupportTickets,
  useSupportTicketsStats,
} from '@/framework/support-tickets';
import { SUPPORT_INBOX_CHANNEL } from '@/lib/support-tickets/realtime';
import type { SupportTicketsStats } from '@/types/support-tickets';
import TicketRow from './ticket-row';

type TabKey =
  | 'open'
  | 'new'
  | 'in_progress'
  | 'resolved'
  | 'close_requested'
  | 'mine'
  | 'unassigned'
  | 'closed'
  | 'all';

const TABS: { key: TabKey; params: Record<string, string>; stat?: keyof SupportTicketsStats }[] = [
  { key: 'open', params: { status: 'open' }, stat: 'open' },
  { key: 'new', params: { status: 'open', stage: 'new' }, stat: 'new' },
  { key: 'in_progress', params: { status: 'open', stage: 'in_progress' }, stat: 'in_progress' },
  { key: 'resolved', params: { status: 'open', stage: 'resolved' }, stat: 'resolved' },
  { key: 'close_requested', params: { status: 'open', close_requested: '1' }, stat: 'close_requested' },
  { key: 'mine', params: { status: 'open', assigned: 'me' }, stat: 'mine' },
  { key: 'unassigned', params: { status: 'open', assigned: 'unassigned' }, stat: 'unassigned' },
  { key: 'closed', params: { status: 'closed' } },
  { key: 'all', params: { status: 'all' } },
];

const FILTER_KEYS = ['search', 'unread', 'has_client_messages', 'from', 'to', 'sort', 'client_id'];
const DEFAULT_PER_PAGE = 20;

export default function SupportTicketsInbox() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tabKey = (searchParams.get('tab') as TabKey) || 'open';
  const tab = TABS.find((x) => x.key === tabKey) ?? TABS[0];
  const page = Number(searchParams.get('page') || 1);
  const perPage = Number(searchParams.get('per_page') || DEFAULT_PER_PAGE);

  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      if (resetPage) next.delete('page');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const apiQuery = useMemo(() => {
    const params = new URLSearchParams(tab.params);
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    });
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    return params.toString();
  }, [tab, searchParams, page, perPage]);

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { connected } = useSupportChannel(SUPPORT_INBOX_CHANNEL, (event) => {
    if (event !== 'support.inbox.updated') return;
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: supportTicketsKeys.unread() });
    }, 400);
  });
  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    []
  );

  const { data, isLoading, isFetching, error, refetch } = useSupportTickets(apiQuery, {
    poll: !connected,
  });
  const { data: stats } = useSupportTicketsStats({ poll: !connected });

  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '');
  }, [searchParams]);
  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (searchInput.trim() === current) return;
    const timer = setTimeout(() => setParams({ search: searchInput.trim() || null }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce on input only
  }, [searchInput]);

  const sortOptions = [
    { value: '-updated_at', name: t('st_sort_updated_desc') },
    { value: 'updated_at', name: t('st_sort_updated_asc') },
    { value: '-created_at', name: t('st_sort_created_desc') },
    { value: 'created_at', name: t('st_sort_created_asc') },
    { value: '-number', name: t('st_sort_number_desc') },
    { value: 'number', name: t('st_sort_number_asc') },
  ];
  const clientMessagesOptions = [
    { value: '', name: t('st_filter_all') },
    { value: '1', name: t('st_filter_with_client_messages') },
    { value: '0', name: t('st_filter_without_client_messages') },
  ];
  const currentSort = searchParams.get('sort') || '-updated_at';
  const currentHasClient = searchParams.get('has_client_messages') ?? '';
  const clientId = searchParams.get('client_id');
  const unreadOnly = searchParams.get('unread') === '1';
  const hasFilters = FILTER_KEYS.some((key) => key !== 'sort' && searchParams.get(key));

  const tickets = data?.tickets ?? [];
  const meta = data?.meta;
  const status = (error as any)?.response?.status;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
        {TABS.map((item) => {
          const count = item.stat ? stats?.[item.stat] : undefined;
          const active = item.key === tab.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setParams({ tab: item.key === 'open' ? null : item.key })}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {t(`st_tab_${item.key}`)}
              {count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs',
                    active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700',
                    item.key === 'close_requested' && count > 0 && !active && 'bg-red-100 text-red-700'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-3">
        <Input
          className="w-full sm:w-72"
          placeholder={t('st_search_placeholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          clearable
          onClear={() => setSearchInput('')}
        />
        <SelectBox
          className="w-48"
          options={clientMessagesOptions}
          value={clientMessagesOptions.find((o) => o.value === currentHasClient)?.name}
          onChange={(opt: any) => setParams({ has_client_messages: opt?.value ?? null })}
        />
        <SelectBox
          className="w-52"
          options={sortOptions}
          value={sortOptions.find((o) => o.value === currentSort)?.name}
          onChange={(opt: any) =>
            setParams({ sort: opt?.value === '-updated_at' ? null : opt?.value ?? null }, false)
          }
        />
        <label className="flex items-center gap-1 text-xs text-gray-600">
          {t('st_filter_from')}
          <Input
            type="date"
            value={searchParams.get('from') ?? ''}
            onChange={(e) => setParams({ from: e.target.value || null })}
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600">
          {t('st_filter_to')}
          <Input
            type="date"
            value={searchParams.get('to') ?? ''}
            onChange={(e) => setParams({ to: e.target.value || null })}
          />
        </label>
        <label className="flex h-10 cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={unreadOnly}
            onChange={(e) => setParams({ unread: e.target.checked ? '1' : null })}
          />
          {t('st_filter_unread')}
        </label>
        {clientId && (
          <span className="flex h-10 items-center gap-2 rounded-md bg-primary-lighter/40 px-3 text-sm text-gray-800">
            {t('st_filter_client', { id: clientId })}
            <button type="button" onClick={() => setParams({ client_id: null })} aria-label="clear">
              <PiXBold className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
        {hasFilters && (
          <Button
            variant="text"
            size="sm"
            onClick={() =>
              setParams(Object.fromEntries(FILTER_KEYS.map((key) => [key, null])))
            }
          >
            {t('st_clear_filters')}
          </Button>
        )}
        <span
          className={cn(
            'ms-auto flex items-center gap-1.5 text-xs',
            connected ? 'text-green-700' : 'text-gray-400'
          )}
          title={connected ? t('st_realtime_live') : t('st_realtime_polling')}
        >
          <span className={cn('h-2 w-2 rounded-full', connected ? 'bg-green-500' : 'bg-gray-300')} />
          {connected ? t('st_realtime_live') : t('st_realtime_polling')}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isFetching && !isLoading && (
          <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-primary" />
        )}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <Text className="text-gray-700">
              {status === 403 ? t('st_no_permission') : t('st_load_error')}
            </Text>
            {status !== 403 && (
              <Button className="mt-4" onClick={() => refetch()}>
                {t('st_retry')}
              </Button>
            )}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">{t('st_empty')}</div>
        ) : (
          tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </div>

      {meta && meta.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text className="text-xs text-gray-500">{t('st_total', { total: meta.total })}</Text>
          <Pagination
            current={meta.current_page}
            pageSize={meta.per_page}
            total={meta.total}
            showSizeChanger={false}
            onChange={(p) => setParams({ page: p === 1 ? null : String(p) }, false)}
            variant="solid"
            color="primary"
          />
        </div>
      )}
    </div>
  );
}
