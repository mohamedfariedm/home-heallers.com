'use client';

import WidgetCard from '@/components/cards/widget-card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import cn from '@/utils/class-names';
import type { AppAnalyticsOverview } from '@/types/app-analytics';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

interface AppAnalyticsChartsProps {
  data: AppAnalyticsOverview;
  className?: string;
}

function RankedBarChart({
  title,
  description,
  data,
  labelKey,
  valueKey,
}: {
  title: string;
  description?: string;
  data: Array<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}) {
  if (!data.length) return null;

  const chartData = data.slice(0, 10).map((item) => ({
    name: String(item[labelKey]),
    count: Number(item[valueKey]),
  }));

  return (
    <WidgetCard title={title} description={description} className="min-h-[360px]">
      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-35}
              textAnchor="end"
              height={70}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
            />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

export default function AppAnalyticsCharts({ data, className }: AppAnalyticsChartsProps) {
  const { installations, devices } = data;

  const platformData = [
    { name: 'Android', value: installations.by_platform.android },
    { name: 'iOS', value: installations.by_platform.ios },
  ].filter((item) => item.value > 0);

  const versionData = installations.by_app_version.slice(0, 12).map((item) => ({
    name: item.app_version,
    count: item.count,
  }));

  const totalPlatform = platformData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={cn('grid grid-cols-1 gap-6 xl:grid-cols-2', className)}>
      {platformData.length > 0 && (
        <WidgetCard
          title="Platform Distribution"
          description={`${totalPlatform.toLocaleString()} total installs`}
          className="min-h-[360px]"
        >
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {platformData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      )}

      {versionData.length > 0 && (
        <WidgetCard
          title="App Versions"
          description="Installations by app version"
          className="min-h-[360px]"
        >
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={versionData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Installs']} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </WidgetCard>
      )}

      <RankedBarChart
        title="Top Device Models"
        description="Most common devices across platforms"
        data={devices.top_device_models}
        labelKey="device_model"
        valueKey="count"
      />

      <RankedBarChart
        title="Top Android OS Versions"
        data={devices.top_android_versions}
        labelKey="os_version"
        valueKey="count"
      />

      <RankedBarChart
        title="Top iPhone Models"
        data={devices.top_iphone_models}
        labelKey="device_model"
        valueKey="count"
      />

      <RankedBarChart
        title="Old App Versions"
        description="Installations on outdated app versions"
        data={devices.old_app_versions.map((item) => ({
          device_model: `${item.app_version} (${item.platform})`,
          count: item.count,
        }))}
        labelKey="device_model"
        valueKey="count"
      />
    </div>
  );
}
