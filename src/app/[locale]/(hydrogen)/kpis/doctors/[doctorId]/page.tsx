'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import DoctorActivitySummaryPanel from '@/app/shared/doctor-activity-reports/summary-panel';
import DoctorReservationsList from '@/app/shared/doctor-activity-reports/reservations-list';
import { useDoctorActivityReportDetail } from '@/framework/doctor-activity-reports';
import { resolveKpisPermissions } from '@/app/shared/kpis/permissions';
import { usePermissions } from '@/context/PermissionsContext';
import { toDoctorActivityQuery } from '@/utils/doctor-activity-query';
import { routes } from '@/config/routes';
import type { DoctorActivityDetailResponse } from '@/types/doctor-activity-report';

export default function DoctorKpiDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { permissions } = usePermissions();
  const { data: session } = useSession();

  const doctorId = Number(params.doctorId);
  const locale = String(params.locale ?? 'en');

  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const kpisPermissions = resolveKpisPermissions(effectivePermissions);

  const queryString = toDoctorActivityQuery(
    new URLSearchParams(searchParams.toString()),
    { forDetail: true }
  );

  const { data, isLoading, isError, error, isFetching } =
    useDoctorActivityReportDetail(
      doctorId,
      queryString,
      kpisPermissions.viewDoctors
    );

  const detail = (data as DoctorActivityDetailResponse | undefined)?.data;
  const reservations = detail?.reservations ?? [];
  const totalItems =
    (data as DoctorActivityDetailResponse | undefined)?.meta?.total ?? 0;

  const pageHeader = {
    title: detail?.doctor?.name ?? 'Doctor Activity',
    breadcrumb: [
      { href: '/', name: 'Home' },
      {
        href: `/${locale}${routes.kpis.index}?tab=doctors`,
        name: 'KPIs',
      },
      { name: detail?.doctor?.name ?? 'Doctor Detail' },
    ],
  };

  if (!kpisPermissions.viewDoctors) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view doctor KPI reports.
      </div>
    );
  }

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{ columns: [], rows: [] }}
      fileName="doctor-activity-reservations"
      header="Reservation,Actions,Activities"
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      <div className="@container space-y-6">
        <Link
          href={`/${locale}${routes.kpis.index}?tab=doctors`}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back to Doctor KPIs
        </Link>

        {isLoading ? (
          <div className="m-auto py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error?.message ?? 'Failed to load doctor activity detail.'}
          </div>
        ) : !detail ? (
          <Text className="text-gray-500">Doctor activity not found.</Text>
        ) : (
          <>
            <DoctorActivitySummaryPanel
              doctor={detail.doctor}
              summary={detail.summary}
            />

            <DoctorReservationsList
              reservations={reservations}
              totalItems={totalItems}
            />

            {isFetching && !isLoading && (
              <Text className="text-xs text-gray-500">Refreshing…</Text>
            )}
          </>
        )}
      </div>
    </TableLayout>
  );
}
