'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  PiEyeBold,
  PiMegaphoneDuotone,
  PiPencilBold,
  PiPlusBold,
  PiTrashBold,
} from 'react-icons/pi';
import DeletePopover from '@/app/shared/delete-popover';
import { formatCampaignBudget, formatCampaignDate } from '@/app/shared/campaigns/format';
import { resolveCampaignsPermissions } from '@/app/shared/campaigns/permissions';
import { CampaignStatusBadge } from '@/app/shared/campaigns/status-badge';
import AdminPageShell, {
  adminPrimaryButtonClass,
} from '@/components/ui/admin-page-shell';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { routes } from '@/config/routes';
import { usePermissions } from '@/context/PermissionsContext';
import { useCampaigns, useDeleteCampaign } from '@/framework/campaigns';
import { CAMPAIGN_PLATFORMS, CAMPAIGN_STATUSES } from '@/types/campaigns';
import cn from '@/utils/class-names';

const PAGE_SIZE = 10;

const selectCls =
  'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-[#143087]/20 focus:ring-2';

const SORTS = [
  'updated_at',
  'created_at',
  'name',
  'source_campaign',
  'platform',
  'start_date',
  'end_date',
  'budget',
  'status',
] as const;

export default function CampaignsPage() {
  const { t, i18n } = useTranslation('campaigns');
  const { permissions } = usePermissions();
  const access = resolveCampaignsPermissions(permissions);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [platform, setPlatform] = useState('');
  const [sort, setSort] = useState('updated_at');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const query = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
    sort,
    direction,
  });
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  if (platform) query.set('platform', platform);

  const { data, isLoading, isFetching, error, refetch } = useCampaigns(
    query.toString(),
    access.view
  );
  const deleteCampaign = useDeleteCampaign();
  const httpStatus = (error as any)?.response?.status;

  if (!access.view || httpStatus === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t('campaigns_no_permission_view')}
      </div>
    );
  }

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? rows.length;
  const hasFilters = Boolean(search || status || platform);

  return (
    <AdminPageShell
      title={t('campaigns_page_title')}
      description={t('campaigns_page_description')}
      icon={<PiMegaphoneDuotone />}
      breadcrumb={[
        { href: '/', name: t('campaigns_home') },
        { name: t('campaigns_page_title') },
      ]}
      actions={
        access.create ? (
          <Link href={routes.campaigns.create}>
            <Button className={cn(adminPrimaryButtonClass, 'flex items-center gap-2')}>
              <PiPlusBold className="h-4 w-4" />
              <span>{t('campaigns_new')}</span>
            </Button>
          </Link>
        ) : null
      }
    >
      <div className="space-y-4">
        <Text className="text-xs text-gray-500">{t('campaigns_budget_hint')}</Text>
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('campaigns_search')}
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">{t('campaigns_filter_all_status')}</option>
            {CAMPAIGN_STATUSES.map((item) => (
              <option key={item} value={item}>
                {t(`campaigns_status_${item}`)}
              </option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(e) => {
              setPlatform(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">{t('campaigns_filter_all_platforms')}</option>
            {CAMPAIGN_PLATFORMS.map((item) => (
              <option key={item} value={item}>
                {t(`campaigns_platform_${item}`)}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className={selectCls}
            aria-label={t('campaigns_sort')}
          >
            {SORTS.map((item) => (
              <option key={item} value={item}>
                {t(`campaigns_sort_${item}`)}
              </option>
            ))}
          </select>
          <select
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value as 'asc' | 'desc');
              setPage(1);
            }}
            className={selectCls}
            aria-label={t('campaigns_direction')}
          >
            <option value="desc">{t('campaigns_direction_desc')}</option>
            <option value="asc">{t('campaigns_direction_asc')}</option>
          </select>
          {hasFilters && (
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setStatus('');
                setPlatform('');
                setPage(1);
              }}
            >
              {t('campaigns_reset_filters')}
            </Button>
          )}
          {isFetching && !isLoading && <Spinner size="sm" />}
        </div>

        {error ? (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="text-gray-700">{t('campaigns_load_error')}</Text>
            <Button className="mt-4" onClick={() => refetch()}>
              {t('campaigns_retry')}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-14 text-center">
            <PiMegaphoneDuotone className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">
              {hasFilters ? t('campaigns_no_match') : t('campaigns_empty')}
            </Text>
            {!hasFilters && (
              <Text className="mt-1 text-xs text-gray-500">
                {t('campaigns_empty_hint')}
              </Text>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_name')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_source')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_platform')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_start')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_end')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_budget')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_status')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('campaigns_col_updated')}
                  </th>
                  <th className="px-4 py-3 text-end font-semibold">
                    {t('campaigns_col_actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 font-semibold text-gray-900" dir="auto">
                      {campaign.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {campaign.source_campaign}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {campaign.platform
                        ? t(`campaigns_platform_${campaign.platform}`)
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCampaignDate(campaign.start_date, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCampaignDate(campaign.end_date, i18n.language)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCampaignBudget(campaign.budget, campaign.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={campaign.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatCampaignDate(campaign.updated_at, i18n.language, true)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={routes.campaigns.view(campaign.id)}>
                          <ActionIcon
                            size="sm"
                            variant="outline"
                            aria-label={t('campaigns_view')}
                          >
                            <PiEyeBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                        {access.update && (
                          <Link href={routes.campaigns.edit(campaign.id)}>
                            <ActionIcon
                              size="sm"
                              variant="outline"
                              aria-label={t('campaigns_edit')}
                            >
                              <PiPencilBold className="h-4 w-4" />
                            </ActionIcon>
                          </Link>
                        )}
                        {access.delete && (
                          <DeletePopover
                            title={t('campaigns_delete_title')}
                            description={t('campaigns_delete_confirm')}
                            onDelete={() => deleteCampaign.mutate(campaign.id)}
                          >
                            <ActionIcon
                              size="sm"
                              variant="outline"
                              aria-label={t('campaigns_delete')}
                              className="hover:text-red-600"
                            >
                              <PiTrashBold className="h-4 w-4" />
                            </ActionIcon>
                          </DeletePopover>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex justify-end">
            <Pagination
              total={total}
              pageSize={PAGE_SIZE}
              current={page}
              onChange={(next: number) => setPage(next)}
              showLessItems
            />
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
