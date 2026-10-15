'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiUsersThreeDuotone,
} from 'react-icons/pi';
import PageHeader from '@/app/shared/page-header';
import Spinner from '@/components/ui/spinner';
import Pagination from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveGeoRegionsPermissions } from '@/app/shared/geo-regions/permissions';
import {
  VisitStatusBadge,
  useSkipReasonText,
} from '@/app/shared/geo-regions/status-badge';
import { useGeoRegion, useGeoRegionVisits } from '@/framework/geo-regions';
import { routes } from '@/config/routes';
import type { GeoLang } from '@/types/geo-regions';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';

const PAGE_SIZE = 20;

const selectCls =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';

function formatDateTime(value: string | null, locale: GeoLang) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function GeoRegionVisitsPage() {
  const params = useParams();
  const { t, i18n } = useTranslation();
  const skipText = useSkipReasonText();
  const id = params?.id as string;
  const lang: GeoLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isRtl = lang === 'ar';

  const { permissions } = usePermissions();
  const access = resolveGeoRegionsPermissions(permissions);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [day, setDay] = useState('');

  const query = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (status) query.set('status', status);
  if (day) query.set('day', day);

  const { data: region } = useGeoRegion(access.view ? id : undefined);
  const { data, isLoading, error, refetch } = useGeoRegionVisits(
    access.view ? id : undefined,
    query.toString()
  );

  const regionName = resolveLocalizedName(region?.name, lang);

  const pageHeader = {
    title: regionName
      ? t('geo_visits_title_named', {
          defaultValue: 'Visits — {{name}}',
          name: regionName,
        })
      : t('geo_visits_title', 'Region Visits'),
    breadcrumb: [
      { href: '/', name: t('geo_home', 'Home') },
      { href: routes.geoRegions.index, name: t('Geo Regions', 'Geo Regions') },
      { name: t('geo_visits', 'Visits') },
    ],
  };

  if (!access.view) {
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
  const BackIcon = isRtl ? PiArrowRightBold : PiArrowLeftBold;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 @lg:mt-0">
          <Link href={routes.geoRegions.index}>
            <Button variant="outline" className="flex items-center gap-2">
              <BackIcon className="h-4 w-4" />
              <span>{t('geo_back', 'Back to regions')}</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">{t('geo_filter_all_status', 'All statuses')}</option>
            <option value="pending">{t('geo_visit_pending', 'Pending')}</option>
            <option value="sent">{t('geo_visit_sent', 'Sent')}</option>
            <option value="skipped">{t('geo_visit_skipped', 'Skipped')}</option>
            <option value="failed">{t('geo_visit_failed', 'Failed')}</option>
          </select>
          <input
            type="date"
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setPage(1);
            }}
            className={selectCls}
            aria-label={t('geo_visit_day', 'Day')}
          />
          {(status || day) && (
            <Button
              variant="text"
              size="sm"
              onClick={() => {
                setStatus('');
                setDay('');
                setPage(1);
              }}
            >
              {t('geo_reset_filters', 'Reset filters')}
            </Button>
          )}
        </div>

        {error ? (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="text-gray-700">
              {t('geo_visits_load_error', 'Could not load visits.')}
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
            <PiUsersThreeDuotone className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">
              {t('geo_visits_empty', 'No visits yet')}
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_visit_client', 'Client')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_visit_day', 'Day')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_visit_entered', 'Entered at')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_col_status', 'Status')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_visit_reason', 'Reason')}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold">
                    {t('geo_visit_notified', 'Notified at')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900" dir="auto">
                        {resolveLocalizedName(visit.client?.name, lang) || '—'}
                      </p>
                      <p className="text-xs text-gray-500" dir="ltr">
                        {typeof visit.client?.mobile === 'string'
                          ? visit.client.mobile
                          : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{visit.day}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(visit.entered_at, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <VisitStatusBadge status={visit.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {skipText(visit.skip_reason) || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(visit.notified_at, lang)}
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
              onChange={(p: number) => setPage(p)}
              showLessItems
            />
          </div>
        )}
      </div>
    </>
  );
}
