'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TableLayout from '@/app/[locale]/(hydrogen)/tables/table-layout';
import Spinner from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import KpiViewTabs from '@/app/shared/kpis/kpi-view-tabs';
import DoctorTargetsTable from '@/app/shared/doctor-targets/table';
import CreateDoctorTargetsForm from '@/app/shared/doctor-targets/create-form';
import DoctorTargetsDashboardWidgets from '@/app/shared/doctor-targets/dashboard-widgets';
import DoctorTargetsExportButton from '@/app/shared/doctor-targets/export-button';
import { useDoctorTargets } from '@/framework/doctor-targets';
import { usePermissions } from '@/context/PermissionsContext';
import { resolveDoctorTargetsPermissions } from '@/app/shared/doctor-targets/permissions';

const pageHeader = {
  title: 'Doctor Targets',
  breadcrumb: [
    { href: '/', name: 'Home' },
    { name: 'Doctor Targets' },
  ],
};

type TargetsView = 'overview' | 'targets';

function resolveViewFromParams(
  tab: string | null,
  canDashboard: boolean,
  canViewList: boolean
): TargetsView {
  if (tab === 'targets' && canViewList) return 'targets';
  if (tab === 'overview' && canDashboard) return 'overview';
  if (tab === 'targets' && !canViewList && canDashboard) return 'overview';
  if (canDashboard && !canViewList) return 'overview';
  if (canViewList && !canDashboard) return 'targets';
  if (canDashboard) return 'overview';
  return 'targets';
}

export default function DoctorTargetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { permissions } = usePermissions();
  const targetPermissions = resolveDoctorTargetsPermissions(permissions);

  const canDashboard = targetPermissions.dashboard;
  const canViewList = targetPermissions.view;

  const tabParam = searchParams.get('tab');

  const [activeView, setActiveView] = useState<TargetsView>(() =>
    resolveViewFromParams(tabParam, canDashboard, canViewList)
  );

  // Keep tab in sync with URL (back/forward, KPI card links)
  useEffect(() => {
    setActiveView(
      resolveViewFromParams(tabParam, canDashboard, canViewList)
    );
  }, [tabParam, canDashboard, canViewList]);

  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key === 'tab') return;
    queryParams.set(key, value);
  });
  if (!queryParams.get('page')) queryParams.set('page', '1');
  if (!queryParams.get('per_page') && !queryParams.get('limit')) {
    queryParams.set('per_page', '10');
  }

  const { data, isLoading, isFetching } = useDoctorTargets(
    queryParams.toString(),
    activeView === 'targets' && canViewList
  );

  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);

  const setView = (view: TargetsView) => {
    if (view === 'targets' && !canViewList) return;
    if (view === 'overview' && !canDashboard) return;

    setActiveView(view);

    const next = new URLSearchParams(searchParams.toString());
    next.set('tab', view);
    if (view === 'overview') {
      next.delete('status');
      next.delete('doctor_id');
      next.delete('achievement_min');
      next.delete('achievement_max');
      next.delete('start_date');
      next.delete('end_date');
    } else if (!next.get('page')) {
      next.set('page', '1');
    }
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const tabs = [
    ...(canDashboard ? [{ id: 'overview', label: 'Overview' }] : []),
    ...(canViewList ? [{ id: 'targets', label: 'Targets' }] : []),
  ];

  if (!canViewList && !canDashboard) {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        You do not have permission to view doctor targets.
      </div>
    );
  }

  const rows = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.total ?? data?.data?.meta?.total ?? rows.length;
  const isTargetsTab = activeView === 'targets';

  return (
    <TableLayout
      title={pageHeader.title}
      breadcrumb={pageHeader.breadcrumb}
      data={{
        columns: selectedColumns
          .filter((column) => column !== 'checked' && column !== 'action')
          .map((column: String) =>
            column.replace(/\./g, '_').replace(/\s/g, '_')
          ),
        rows: selectedRowKeys,
      }}
      fileName="doctor-targets"
      header="Doctor,Status,Created At"
      createName={
        isTargetsTab && targetPermissions.create
          ? 'Create target(s)'
          : undefined
      }
      createElementButton={
        isTargetsTab && targetPermissions.create ? (
          <CreateDoctorTargetsForm />
        ) : undefined
      }
      canCreate={isTargetsTab && targetPermissions.create}
      canExport={isTargetsTab && targetPermissions.reports}
      exportElement={<DoctorTargetsExportButton />}
      canImport={false}
    >
      <div className="@container space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {tabs.length > 1 ? (
            <KpiViewTabs
              tabs={tabs}
              activeTab={activeView}
              onChange={(tabId) => setView(tabId as TargetsView)}
            />
          ) : (
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeView === 'overview' ? 'Overview' : 'Targets'}
            </Text>
          )}
        </div>

        {activeView === 'overview' ? (
          canDashboard ? (
            <DoctorTargetsDashboardWidgets />
          ) : (
            <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
              You do not have permission to view the targets overview.
            </div>
          )
        ) : !canViewList ? (
          <div className="rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-600">
            You do not have permission to view the targets list.
          </div>
        ) : isLoading ? (
          <div className="m-auto py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <DoctorTargetsTable
              data={rows}
              getSelectedColumns={setSelectedColumns}
              getSelectedRowKeys={setSelectedRowKeys}
              totalItems={total}
              permissions={targetPermissions}
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
