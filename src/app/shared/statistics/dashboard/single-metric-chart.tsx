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

interface SingleMetricChartProps {
  data: ChartData;
  metric: 'reservations' | 'sessions' | 'clients' | 'revenue';
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

const metricConfig = {
  reservations: {
    title: 'Reservations Trend',
    color: '#3B82F6',
    dataKey: 'reservations',
    label: 'Reservations',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  sessions: {
    title: 'Sessions Trend',
    color: '#10B981',
    dataKey: 'sessions',
    label: 'Sessions',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  clients: {
    title: 'Clients Trend',
    color: '#F59E0B',
    dataKey: 'clients',
    label: 'Clients',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  revenue: {
    title: 'Revenue Trend',
    color: '#EF4444',
    dataKey: 'revenue',
    label: 'Revenue',
    getValue: (item: ChartDataPoint) => item.amount || 0,
    formatValue: (value: number) => `${value.toLocaleString()} SAR`,
  },
};

export default function SingleMetricChart({ data, metric, className }: SingleMetricChartProps) {
  const config = metricConfig[metric];
  const metricData = data[metric];

  if (!metricData || metricData.length === 0) {
    return null;
  }

  // Sort dates
  const sortedData = [...metricData].sort((a, b) => a.date.localeCompare(b.date));

  // Prepare chart data
  const chartData = sortedData.map(item => ({
    date: item.date,
    formattedDate: formatDate(item.date, data.group_by),
    value: config.getValue(item),
  }));

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <WidgetCard
      title={config.title}
      description={`From ${data.date_from} to ${data.date_to}`}
      className={cn('min-h-[350px]', className)}
    >
      <div className="h-[300px] w-full pt-5 @lg:h-[350px]">
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ 
                value: metric === 'revenue' ? 'Revenue (SAR)' : 'Count', 
                angle: -90, 
                position: 'insideLeft', 
                style: { fill: '#6B7280' } 
              }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [config.formatValue(value), config.label]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={config.color} 
              strokeWidth={3}
              dot={{ r: 5, fill: config.color }}
              activeDot={{ r: 7, fill: config.color }}
              name={config.label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stat */}
      <div className="mt-4">
        <div className={`rounded-lg border p-3 ${
          metric === 'reservations' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' :
          metric === 'sessions' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
          metric === 'clients' ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20' :
          'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
        }`}>
          <p className={`text-xs font-medium ${
            metric === 'reservations' ? 'text-blue-600 dark:text-blue-400' :
            metric === 'sessions' ? 'text-green-600 dark:text-green-400' :
            metric === 'clients' ? 'text-orange-600 dark:text-orange-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            Total {config.label}
          </p>
          <p className={`mt-1 text-lg font-bold ${
            metric === 'reservations' ? 'text-blue-900 dark:text-blue-300' :
            metric === 'sessions' ? 'text-green-900 dark:text-green-300' :
            metric === 'clients' ? 'text-orange-900 dark:text-orange-300' :
            'text-red-900 dark:text-red-300'
          }`}>
            {config.formatValue(total)}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
