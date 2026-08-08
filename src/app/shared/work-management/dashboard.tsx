'use client';

import Link from 'next/link';
import Cookies from 'js-cookie';
import { routes } from '@/config/routes';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useWmDashboard } from '@/framework/work-management/work-items';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { WORK_ITEM_STATUS_LABELS } from '@/types/work-management';

function localePath(path: string) {
  const locale = Cookies.get('NEXT_LOCALE') || 'en';
  return `/${locale}${path}`;
}

function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <div className="mt-2 text-3xl font-semibold text-gray-900">{value}</div>
    </Link>
  );
}

export default function WorkDashboard() {
  const { data, isLoading } = useWmDashboard();

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const itemsBase = localePath(routes.work.items);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Open work"
          value={data.openWork}
          href={`${itemsBase}?status=`}
        />
        <KpiCard
          label="In progress"
          value={data.inProgress}
          href={`${itemsBase}?status=in_progress`}
        />
        <KpiCard
          label="Ready to test"
          value={data.readyToTest}
          href={`${itemsBase}?status=ready_to_test`}
        />
        <KpiCard
          label="Overdue"
          value={data.overdue}
          href={`${itemsBase}?overdue=1`}
        />
        <KpiCard
          label="Critical bugs"
          value={data.criticalBugs}
          href={`${itemsBase}?type=bug&priority=critical`}
        />
        <KpiCard
          label="Completed this week"
          value={data.completedThisWeek}
          href={`${itemsBase}?status=done`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Title as="h4" className="mb-4 text-sm font-semibold">
            Work by status
          </Title>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.byStatus.map((r) => ({
                  ...r,
                  label: WORK_ITEM_STATUS_LABELS[r.status] ?? r.status,
                }))}
              >
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Title as="h4" className="mb-4 text-sm font-semibold">
            Completed trend (7d)
          </Title>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.completedTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0369a1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Title as="h4" className="mb-4 text-sm font-semibold">
            Work by department
          </Title>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDepartment}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <Title as="h4" className="mb-4 text-sm font-semibold">
            Work by assignee
          </Title>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byAssignee}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.bySeverity.length ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4 lg:col-span-2">
            <Title as="h4" className="mb-4 text-sm font-semibold">
              Bugs by severity
            </Title>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bySeverity}>
                  <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
