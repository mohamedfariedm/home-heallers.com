'use client';

import { useEffect, useMemo, useState } from 'react';
import { PiArrowDownBold, PiArrowUpBold, PiTrashDuotone } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import ControlledTable from '@/components/controlled-table';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { usePermissions } from '@/context/PermissionsContext';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';
import {
  useWalletSummary,
  useWalletTransactions,
  type WalletOwner,
} from '@/framework/wallet';
import { resolveWalletPermissions } from './permissions';
import { SOURCE_OPTIONS, STATUS_LABELS, getWalletColumns } from './columns';
import WalletAdjustModal from './adjust-modal';
import TransactionDetailModal from './transaction-detail-modal';

const selectClass =
  'h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-gray-900 focus:outline-none';

const EMPTY_FILTERS = {
  type: '',
  status: '',
  source: '',
  date_from: '',
  date_to: '',
};

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <Text className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <Text className="mt-1 text-xl font-semibold text-gray-900">{value}</Text>
      {hint ? <Text className="mt-0.5 text-xs text-gray-500">{hint}</Text> : null}
    </div>
  );
}

export default function WalletTab({
  owner,
  ownerId,
  ownerName,
}: {
  owner: WalletOwner;
  ownerId: number | string;
  ownerName?: string;
}) {
  const { permissions } = usePermissions();
  const can = useMemo(() => resolveWalletPermissions(permissions), [permissions]);
  const { openModal } = useModal();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce the free-text search so we don't query on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const summaryQuery = useWalletSummary(owner, ownerId, can.view);
  const txQuery = useWalletTransactions(
    owner,
    ownerId,
    { ...filters, search, page, per_page: pageSize },
    can.view
  );

  const summary = summaryQuery.data?.data;
  const rows: any[] = txQuery.data?.data ?? [];
  const total: number = txQuery.data?.meta?.total ?? rows.length;
  const balance = Number(summary?.balance ?? 0);
  const columns = useMemo(() => getWalletColumns(), []);
  const isFiltered = Object.values(filters).some(Boolean) || !!search;

  const updateFilter = (key: keyof typeof EMPTY_FILTERS, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const openAdjust = (kind: 'deposit' | 'withdraw') =>
    openModal({
      view: (
        <WalletAdjustModal
          owner={owner}
          ownerId={ownerId}
          ownerName={ownerName}
          kind={kind}
          balance={balance}
        />
      ),
      customSize: '520px',
    });

  if (!can.view) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        You do not have permission to view wallet transactions.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Current balance"
          value={
            summaryQuery.isLoading ? '…' : `${formatMoney(balance)} SAR`
          }
        />
        <SummaryCard
          label="Total credits"
          value={`${formatMoney(summary?.total_credits ?? 0)} SAR`}
          hint={`${summary?.credits_count ?? 0} completed transactions`}
        />
        <SummaryCard
          label="Total debits"
          value={`${formatMoney(summary?.total_debits ?? 0)} SAR`}
          hint={`${summary?.debits_count ?? 0} completed transactions`}
        />
        <div className="flex flex-col justify-center gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {can.deposit && (
            <Button
              size="sm"
              disabled={summaryQuery.isLoading}
              onClick={() => openAdjust('deposit')}
            >
              <PiArrowDownBold className="me-1.5 h-4 w-4" /> Deposit
            </Button>
          )}
          {can.withdraw && (
            <Button
              size="sm"
              color="danger"
              variant="outline"
              disabled={summaryQuery.isLoading || balance <= 0}
              onClick={() => openAdjust('withdraw')}
            >
              <PiArrowUpBold className="me-1.5 h-4 w-4" /> Withdraw
            </Button>
          )}
          {!can.deposit && !can.withdraw && (
            <Text className="text-center text-xs text-gray-500">
              Read-only access
            </Text>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Input
            label="Search"
            placeholder="Reference or reason"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="lg:col-span-2"
          />
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Type</span>
            <select
              className={selectClass}
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              <option value="">All</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Status</span>
            <select
              className={selectClass}
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block font-medium">Source</span>
            <select
              className={selectClass}
              value={filters.source}
              onChange={(e) => updateFilter('source', e.target.value)}
            >
              <option value="">All</option>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            {isFiltered && (
              <Button
                size="sm"
                variant="flat"
                className="h-10 bg-gray-200/70"
                onClick={clearFilters}
              >
                <PiTrashDuotone className="me-1.5 h-[17px] w-[17px]" /> Clear
              </Button>
            )}
          </div>
          <Input
            type="date"
            label="From"
            value={filters.date_from}
            onChange={(e) => updateFilter('date_from', e.target.value)}
          />
          <Input
            type="date"
            label="To"
            value={filters.date_to}
            onChange={(e) => updateFilter('date_to', e.target.value)}
          />
        </div>

        {txQuery.isError ? (
          <Text className="py-6 text-center text-sm text-red-600">
            {txQuery.error?.message || 'Failed to load wallet transactions'}
          </Text>
        ) : (
          <ControlledTable
            variant="modern"
            data={rows}
            isLoading={txQuery.isLoading}
            showLoadingText={true}
            // @ts-ignore
            columns={columns}
            onRow={(record: any) => ({
              onClick: () =>
                openModal({
                  view: <TransactionDetailModal transaction={record} />,
                  customSize: '560px',
                }),
              style: { cursor: 'pointer' },
            })}
            paginatorOptions={{
              pageSize,
              setPageSize: ((value: number) => {
                setPageSize(value);
                setPage(1);
              }) as React.Dispatch<React.SetStateAction<number>>,
              total,
              current: page,
              onChange: (next: number) => setPage(next),
            }}
            className="rounded-md border border-muted text-sm shadow-sm"
          />
        )}
        {!txQuery.isLoading && !txQuery.isError && rows.length === 0 && (
          <Text className="py-6 text-center text-sm text-gray-500">
            {isFiltered
              ? 'No transactions match the selected filters.'
              : 'No wallet transactions yet.'}
          </Text>
        )}
      </section>
    </div>
  );
}
