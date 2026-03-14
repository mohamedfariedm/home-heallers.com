'use client';

import WidgetCard from '@/components/cards/widget-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import cn from '@/utils/class-names';

interface ChartDataPoint {
  date: string;
  count?: number;
  amount?: number;
}

interface ChartData {
  group_by: 'monthly' | 'weekly' | 'daily';
  date_from: string;
  date_to: string;
  reservations?: ChartDataPoint[];
  sessions?: ChartDataPoint[];
  revenue?: ChartDataPoint[];
  clients?: ChartDataPoint[];
}

interface TimeSeriesChartProps {
  data: ChartData;
  className?: string;
}

// Format date based on group_by type
const formatDate = (date: string, groupBy: string): string => {
  if (groupBy === 'daily') {
    // Format: "2026-02-12" -> "Feb 12"
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    return `${month} ${day}`;
  } else if (groupBy === 'weekly') {
    // Format: "202601" -> "Week 1, 2026"
    const year = date.substring(0, 4);
    const week = date.substring(4);
    return `W${week} ${year}`;
  } else {
    // Format: "2024-01" -> "Jan 2024"
    const [year, month] = date.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = dateObj.toLocaleString('default', { month: 'short' });
    return `${monthName} ${year}`;
  }
};

export default function TimeSeriesChart({ data, className }: TimeSeriesChartProps) {
  if (!data || (!data.reservations && !data.sessions && !data.revenue && !data.clients)) {
    return null;
  }

  // Get all unique dates from all series
  const allDates = new Set<string>();
  data.reservations?.forEach(item => allDates.add(item.date));
  data.sessions?.forEach(item => allDates.add(item.date));
  data.revenue?.forEach(item => allDates.add(item.date));
  data.clients?.forEach(item => allDates.add(item.date));

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Create a map for each series for quick lookup
  const reservationsMap = new Map(data.reservations?.map(item => [item.date, item.count || 0]) || []);
  const sessionsMap = new Map(data.sessions?.map(item => [item.date, item.count || 0]) || []);
  const revenueMap = new Map(data.revenue?.map(item => [item.date, item.amount || 0]) || []);
  const clientsMap = new Map(data.clients?.map(item => [item.date, item.count || 0]) || []);

  // Combine all data into chart format
  const chartData = sortedDates.map(date => ({
    date,
    formattedDate: formatDate(date, data.group_by),
    reservations: reservationsMap.get(date) || 0,
    sessions: sessionsMap.get(date) || 0,
    revenue: revenueMap.get(date) || 0,
    clients: clientsMap.get(date) || 0,
  }));

  // Calculate totals
  const totalReservations = chartData.reduce((sum, item) => sum + item.reservations, 0);
  const totalSessions = chartData.reduce((sum, item) => sum + item.sessions, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalClients = chartData.reduce((sum, item) => sum + item.clients, 0);

  // Determine title based on group_by
  const titleMap = {
    monthly: 'Monthly Trends',
    weekly: 'Weekly Trends',
    daily: 'Daily Trends',
  };

  const title = titleMap[data.group_by] || 'Time Series Trends';

  return (
    <WidgetCard
      title={title}
      description={`From ${data.date_from} to ${data.date_to}`}
      className={cn('min-h-[400px]', className)}
    >
      <div className="h-[400px] w-full pt-5 @lg:h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="formattedDate" 
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'Revenue (SAR)', angle: 90, position: 'insideRight', style: { fill: '#6B7280' } }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [`${value.toLocaleString()} SAR`, 'Revenue'];
                }
                return [value.toLocaleString(), name.charAt(0).toUpperCase() + name.slice(1)];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  reservations: 'Reservations',
                  sessions: 'Sessions',
                  revenue: 'Revenue',
                  clients: 'Clients',
                };
                return labels[value] || value;
              }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="reservations" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="reservations"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="sessions" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="sessions"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="clients" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="clients"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="revenue" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 @lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-3 dark:border-gray-700 dark:bg-blue-900/20">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Reservations</p>
          <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-300">
            {totalReservations.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-green-50 p-3 dark:border-gray-700 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">Total Sessions</p>
          <p className="mt-1 text-lg font-bold text-green-900 dark:text-green-300">
            {totalSessions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-orange-50 p-3 dark:border-gray-700 dark:bg-orange-900/20">
          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Total Clients</p>
          <p className="mt-1 text-lg font-bold text-orange-900 dark:text-orange-300">
            {totalClients.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-red-50 p-3 dark:border-gray-700 dark:bg-red-900/20">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">Total Revenue</p>
          <p className="mt-1 text-lg font-bold text-red-900 dark:text-red-300">
            {totalRevenue.toLocaleString()} SAR
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
