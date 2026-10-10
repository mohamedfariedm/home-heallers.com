'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  PiEyeBold,
  PiMapTrifoldDuotone,
  PiPencilBold,
  PiPlusBold,
  PiTrashBold,
} from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import Pagination from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ActionIcon } from '@/components/ui/action-icon';
import { Text } from '@/components/ui/text';
import DeletePopover from '@/app/shared/delete-popover';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveGeoRegionsPermissions } from '@/app/shared/geo-regions/permissions';
import { RegionStatusBadge } from '@/app/shared/geo-regions/status-badge';
import CouponStatusAlert from '@/app/shared/geo-regions/coupon-status-alert';
import {
  useDeleteGeoRegion,
  useGeoRegions,
  useToggleGeoRegionActive,
} from '@/framework/geo-regions';
import { useCountries } from '@/framework/countrues';
import { routes } from '@/config/routes';
import type { GeoLang } from '@/types/geo-regions';

const PAGE_SIZE = 10;

const selectCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

function pickName(
  name: { ar?: string; en?: string } | string | null | undefined,
  lang: GeoLang
) {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name[lang] || name.en || name.ar || '';
}

function formatDateTime(value: string | null, locale: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function GeoRegionsPage() {
  const { t, i18n } = useTranslation();
  const lang: GeoLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';

  const pageHeader = {
    title: t('Geo Regions', 'Geo Regions'),
    breadcrumb: [
      { href: '/', name: t('geo_home', 'Home') },
      { name: t('Geo Regions', 'Geo Regions') },
    ],
  };

  const { permissions } = usePermissions();
  const access = resolveGeoRegionsPermissions(permissions);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [countryId, setCountryId] = useState('');

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
  });
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  if (countryId) query.set('country_id', countryId);

  const { data, isLoading, isFetching, error, refetch } = useGeoRegions(
    query.toString(),
    access.view
  );
  const { data: countriesData } = useCountries('');
  const countries: any[] = Array.isArray(countriesData?.data)
    ? countriesData.data
    : [];

  const toggleActive = useToggleGeoRegionActive();
  const deleteRegion = useDeleteGeoRegion();
  const httpStatus = (error as any)?.response?.status;

  if (!access.view || httpStatus === 403) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
        {t(
          'geo_no_permission_view',
          "You don't have permission to view geo regions."
        )}
      </div>
    );
  }

  const rows = data?.data ?? [];
  const total = data?.meta?.total ?? rows.length;
  const hasFilters = Boolean(search || status || countryId);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        {access.create && (
          <div className="mt-4 @lg:mt-0">
            <Link href={routes.geoRegions.create}>
              <Button className="flex items-center gap-2">
                <PiPlusBold className="h-4 w-4" />
                <span>{t('geo_new', 'New Region')}</span>
              </Button>
            </Link>
          </div>
        )}
      </PageHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('geo_search', 'Search by name')}
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
            <option value="">{t('geo_filter_all_status', 'All statuses')}</option>
            <option value="active">{t('geo_status_active', 'Active')}</option>
            <option value="inactive">
              {t('geo_status_inactive', 'Inactive')}
            </option>
            <option value="expired">{t('geo_status_expired', 'Expired')}</option>
          </select>
          <select
            value={countryId}
            onChange={(e) => {
              setCountryId(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">
              {t('geo_filter_all_countries', 'All countries')}
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {pickName(c.name, lang) || `#${c.id}`}
              </option>
            ))}
          </select>
          {hasFilters && (
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setStatus('');
                setCountryId('');
                setPage(1);
              }}
            >
              {t('geo_reset_filters', 'Reset filters')}
            </Button>
          )}
          {isFetching && !isLoading && <Spinner size="sm" />}
        </div>

        {error ? (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="text-gray-700">
              {t('geo_load_error', 'Could not load geo regions.')}
            </Text>
            <Button className="mt-4" onClick={() => refetch()}>
              {t('geo_retry', 'Retry')}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-14 text-center">
            <PiMapTrifoldDuotone className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">
              {hasFilters
                ? t('geo_no_match', 'No regions match these filters')
                : t('geo_empty', 'No geo regions yet')}
            </Text>
            {!hasFilters && (
              <Text className="mt-1 text-xs text-gray-500">
                {t(
                  'geo_empty_hint',
                  'Draw a region on the map to notify users who enter it.'
                )}
              </Text>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-start text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_region', 'Region')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_country', 'Country')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_priority', 'Priority')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_coupon', 'Coupon')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_visits', 'Visits / Sent')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_expires', 'Expires')}
                  </th>
                  <th className="px-4 py-3 text-end font-semibold">
                    {t('geo_col_actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((region) => {
                  const expires = formatDateTime(region.expires_at, lang);
                  return (
                    <tr key={region.id} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900" dir="auto">
                          {pickName(region.name, lang)}
                        </p>
                        <p
                          className="line-clamp-1 text-xs text-gray-500"
                          dir="auto"
                        >
                          {pickName(region.push_title, lang)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {pickName(region.country?.name, lang) || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {region.priority}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <RegionStatusBadge status={region.status} />
                          {access.update && region.status !== 'expired' && (
                            <Switch
                              size="sm"
                              checked={region.is_active}
                              disabled={toggleActive.isPending}
                              onChange={() => toggleActive.mutate(region.id)}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {region.coupon ? (
                          <div className="space-y-1">
                            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800">
                              {region.coupon.code}
                            </span>
                            <CouponStatusAlert
                              status={region.coupon_status}
                              compact
                            />
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {region.visits_count} / {region.sent_count}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {expires ?? (
                          <span className="text-gray-400">
                            {t('geo_no_expiry', 'No expiry')}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={routes.geoRegions.visits(region.id)}>
                            <ActionIcon
                              size="sm"
                              variant="outline"
                              aria-label={t('geo_visits', 'Visits')}
                            >
                              <PiEyeBold className="h-4 w-4" />
                            </ActionIcon>
                          </Link>
                          {access.update && (
                            <Link href={routes.geoRegions.edit(region.id)}>
                              <ActionIcon
                                size="sm"
                                variant="outline"
                                aria-label={t('geo_edit', 'Edit')}
                              >
                                <PiPencilBold className="h-4 w-4" />
                              </ActionIcon>
                            </Link>
                          )}
                          {access.delete && (
                            <DeletePopover
                              title={t('geo_delete_title', 'Delete region')}
                              description={t(
                                'geo_delete_confirm',
                                'Are you sure you want to delete this region?'
                              )}
                              onDelete={() => deleteRegion.mutate(region.id)}
                            >
                              <ActionIcon
                                size="sm"
                                variant="outline"
                                aria-label={t('geo_delete', 'Delete')}
                                className="hover:text-red-600"
                              >
                                <PiTrashBold className="h-4 w-4" />
                              </ActionIcon>
                            </DeletePopover>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              onChange={(p: number) => setPage(p)}
              showLessItems
            />
          </div>
        )}
      </div>
    </>
  );
}
