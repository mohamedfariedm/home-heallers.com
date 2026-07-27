'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import KpiViewTabs from '@/app/shared/kpis/kpi-view-tabs';
import UserActivityReportsTable from '@/app/shared/user-activity-reports/table';
import UserActivityStatisticsCards from '@/app/shared/user-activity-reports/statistics-cards';
import UserActivityExportButton from '@/app/shared/user-activity-reports/export-button';
import DoctorActivityReportsTable from '@/app/shared/doctor-activity-reports/table';
import DoctorActivityStatisticsCards from '@/app/shared/doctor-activity-reports/statistics-cards';
import DoctorActivityExportButton from '@/app/shared/doctor-activity-reports/export-button';
import { useUserActivityReports } from '@/framework/user-activity-reports';
import { useDoctorActivityReports } from '@/framework/doctor-activity-reports';
import { usePermissions } from '@/context/PermissionsContext';
import {
  canAccessKpis,
  resolveKpisPermissions,
} from '@/app/shared/kpis/permissions';
import {
  hasActiveUserActivityFilters,
  toUserActivityQuery,
} from '@/utils/user-activity-query';
import {
  hasActiveDoctorActivityFilters,
  toDoctorActivityQuery,
} from '@/utils/doctor-activity-query';
import type {
  UserActivityListResponse,
  UserActivityRow,
} from '@/types/user-activity-report';
import type {
  DoctorActivityListResponse,
  DoctorActivityRow,
} from '@/types/doctor-activity-report';

const pageHeader = {
  title: 'KPIs',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'KPIs' },
  ],
};

type KpiView = 'users' | 'doctors';

function resolveKpiView(
  tab: string | null,
  viewUsers: boolean,
  viewDoctors: boolean
): KpiView {
  if (tab === 'doctors' && viewDoctors) return 'doctors';
  if (tab === 'users' && viewUsers) return 'users';
  if (viewUsers) return 'users';
  if (viewDoctors) return 'doctors';
  return 'users';
}

/** Keep only shared pagination params when switching KPI tabs. */
function cleanParamsForTab(view: KpiView) {
  const next = new URLSearchParams();
  next.set('tab', view);
  next.set('page', '1');
  next.set('per_page', '25');
  return next;
}

export default function KpisPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { permissions } = usePermissions();
  const { data: session } = useSession();

  const effectivePermissions =
    (session?.user as { permissions?: string[] })?.permissions ?? permissions;
  const kpisPermissions = resolveKpisPermissions(effectivePermissions);

  const tabParam = searchParams.get('tab');
  const [activeView, setActiveView] = useState<KpiView>(() =>
    resolveKpiView(
      tabParam,
      kpisPermissions.viewUsers,
      kpisPermissions.viewDoctors
    )
  );

  useEffect(() => {
    setActiveView(
      resolveKpiView(
        tabParam,
        kpisPermissions.viewUsers,
        kpisPermissions.viewDoctors
      )
    );
  }, [tabParam, kpisPermissions.viewUsers, kpisPermissions.viewDoctors]);

  const userActivityQuery = toUserActivityQuery(
    new URLSearchParams(searchParams.toString())
  );
  const doctorActivityQuery = toDoctorActivityQuery(
    new URLSearchParams(searchParams.toString())
  );

  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: userErr,
    isFetching: userFetching,
  } = useUserActivityReports(
    userActivityQuery,
    kpisPermissions.viewUsers && activeView === 'users'
  );

  const {
    data: doctorData,
    isLoading: doctorLoading,
    isError: doctorError,
    error: doctorErr,
    isFetching: doctorFetching,
  } = useDoctorActivityReports(
    doctorActivityQuery,
    kpisPermissions.viewDoctors && activeView === 'doctors'
  );

  const [selectedColumns, setSelectedColumns] = useState<unknown[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<unknown[]>([]);

  const userListData = userData as UserActivityListResponse | undefined;
  const userRows: UserActivityRow[] = Array.isArray(userListData?.data)
    ? (userListData?.data ?? [])
    : [];

  const doctorListData = doctorData as DoctorActivityListResponse | undefined;
  const doctorRows: DoctorActivityRow[] = Array.isArray(doctorListData?.data)
    ? (doctorListData?.data ?? [])
    : [];

  const setView = (view: KpiView) => {
    if (view === 'users' && !kpisPermissions.viewUsers) return;
    if (view === 'doctors' && !kpisPermissions.viewDoctors) return;

    setActiveView(view);
    router.push(`${pathname}?${cleanParamsForTab(view).toString()}`, {
      scroll: false,
    });
  };

  const showTabs = kpisPermissions.viewUsers && kpisPermissions.viewDoctors;

  if (!canAccessKpis(effectivePermissions)) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view KPI reports.
      </div>
    );
  }

  if (activeView === 'users' && !kpisPermissions.viewUsers) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view user KPI reports.
      </div>
    );
  }

  if (activeView === 'doctors' && !kpisPermissions.viewDoctors) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view doctor KPI reports.
      </div>
    );
  }

  const isLoading = activeView === 'doctors' ? doctorLoading : userLoading;
  const isError = activeView === 'doctors' ? doctorError : userError;
  const error = activeView === 'doctors' ? doctorErr : userErr;
  const isFetching = activeView === 'doctors' ? doctorFetching : userFetching;

  const totalItems =
    activeView === 'doctors'
      ? (doctorListData?.meta?.total ?? 0)
      : (userListData?.meta?.total ?? 0);

  const exportDisabled =
    activeView === 'doctors'
      ? (doctorListData?.statistics?.total_doctors ?? 0) === 0
      : (userListData?.statistics?.total_users ?? 0) === 0;

  const hasFilters =
    activeView === 'doctors'
      ? hasActiveDoctorActivityFilters(
          new URLSearchParams(searchParams.toString())
        )
      : hasActiveUserActivityFilters(
          new URLSearchParams(searchParams.toString())
        );

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column) =>
            String(column).replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName={
        activeView === 'doctors'
          ? 'doctor-activity-report'
          : 'user-activity-report'
      }
      header={
        activeView === 'doctors'
          ? 'Doctor,Reservations,By Status,By Source Campaign'
          : 'User,Total Actions,Last Activity,Active Days'
      }
      canExport={false}
      canCreate={false}
      canImport={false}
    >
      <div className="@container space-y-6">
        {(showTabs ||
          kpisPermissions.viewUsers ||
          kpisPermissions.viewDoctors) && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            {showTabs ? (
              <KpiViewTabs
                tabs={[
                  { id: 'users', label: 'Users' },
                  { id: 'doctors', label: 'Doctors' },
                ]}
                activeTab={activeView}
                onChange={(tabId) => setView(tabId as KpiView)}
              />
            ) : (
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {activeView === 'doctors' ? 'Doctor KPIs' : 'User KPIs'}
              </Text>
            )}

            {activeView === 'users' && kpisPermissions.exportUsers && (
              <UserActivityExportButton disabled={exportDisabled} />
            )}
            {activeView === 'doctors' && kpisPermissions.exportDoctors && (
              <DoctorActivityExportButton disabled={exportDisabled} />
            )}
          </div>
        )}

        {isLoading ? (
          <div className="m-auto py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            {error?.message ?? 'Something went wrong loading KPI data.'}
          </div>
        ) : activeView === 'doctors' ? (
          <>
            <DoctorActivityStatisticsCards
              statistics={doctorListData?.statistics}
            />

            {totalItems === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {hasFilters || searchParams.get('search')
                    ? 'No doctors match your filters.'
                    : 'No doctors with reservations found.'}
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {hasFilters || searchParams.get('search')
                    ? 'Use the Filters button to adjust or clear your filters.'
                    : 'Doctors with reservations in the selected date range will appear here with reservation KPIs.'}
                </Text>
              </div>
            )}

            <DoctorActivityReportsTable
              data={doctorRows}
              totalItems={totalItems}
              getSelectedColumns={setSelectedColumns}
              getSelectedRowKeys={setSelectedRowKeys}
            />

            {isFetching && !isLoading && (
              <Text className="mt-3 text-xs text-gray-500">Refreshing…</Text>
            )}
          </>
        ) : (
          <>
            <UserActivityStatisticsCards
              statistics={userListData?.statistics}
            />

            {totalItems === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {hasFilters || searchParams.get('search')
                    ? 'No staff users match your filters.'
                    : 'No staff user activity has been recorded yet.'}
                </Text>
                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {hasFilters || searchParams.get('search')
                    ? 'Use the Filters button to adjust or clear your filters.'
                    : 'Staff actions across the platform will appear here as KPI summaries.'}
                </Text>
              </div>
            )}

            <UserActivityReportsTable
              data={userRows}
              totalItems={totalItems}
              getSelectedColumns={setSelectedColumns}
              getSelectedRowKeys={setSelectedRowKeys}
            />

            {isFetching && !isLoading && (
              <Text className="mt-3 text-xs text-gray-500">Refreshing…</Text>
            )}
          </>
        )}
      </div>
    </TableLayout>
  );
}
