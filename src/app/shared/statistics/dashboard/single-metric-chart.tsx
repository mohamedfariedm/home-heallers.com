'use client';

import { useTranslation } from 'react-i18next';
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
  /** When set on daily data, show only this many calendar days ending at date_to. */
  lastDays?: number;
}

function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function formatIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildLastDaysWindow(
  points: ChartDataPoint[],
  dateFrom: string,
  dateTo: string,
  lastDays: number
): { points: ChartDataPoint[]; dateFrom: string; dateTo: string } {
  const end = parseLocalDate(dateTo) ?? parseLocalDate(points[points.length - 1]?.date ?? '') ?? new Date();
  const rangeStart = parseLocalDate(dateFrom);
  const start = new Date(end);
  start.setDate(end.getDate() - (lastDays - 1));
  if (rangeStart && start < rangeStart) {
    start.setTime(rangeStart.getTime());
  }

  const byDate = new Map(
    points.map((point) => [point.date.slice(0, 10), point])
  );
  const windowPoints: ChartDataPoint[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const date = formatIsoDate(cursor);
    windowPoints.push(byDate.get(date) ?? { date, count: 0, amount: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    points: windowPoints,
    dateFrom: formatIsoDate(start),
    dateTo: formatIsoDate(end),
  };
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
    titleKey: 'stats_reservations_trend',
    title: 'Reservations Trend',
    color: '#3B82F6',
    dataKey: 'reservations',
    labelKey: 'stats_reservations_label',
    label: 'Reservations',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  sessions: {
    titleKey: 'stats_sessions_trend',
    title: 'Sessions Trend',
    color: '#10B981',
    dataKey: 'sessions',
    labelKey: 'stats_sessions',
    label: 'Sessions',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  clients: {
    titleKey: 'stats_clients_trend',
    title: 'Clients Trend',
    color: '#F59E0B',
    dataKey: 'clients',
    labelKey: 'stats_clients',
    label: 'Clients',
    getValue: (item: ChartDataPoint) => item.count || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
  revenue: {
    titleKey: 'stats_revenue_trend',
    title: 'Revenue Trend',
    color: '#EF4444',
    dataKey: 'revenue',
    labelKey: 'stats_revenue',
    label: 'Revenue',
    getValue: (item: ChartDataPoint) => item.amount || 0,
    formatValue: (value: number) => value.toLocaleString(),
  },
};

export default function SingleMetricChart({ data, metric, className, lastDays }: SingleMetricChartProps) {
  const { t } = useTranslation('statistics');
  const config = metricConfig[metric];
  const metricData = data[metric];

  if (!metricData || metricData.length === 0) {
    return null;
  }

  // Sort dates
  const sortedData = [...metricData].sort((a, b) => a.date.localeCompare(b.date));
  const windowed =
    lastDays && data.group_by === 'daily'
      ? buildLastDaysWindow(sortedData, data.date_from, data.date_to, lastDays)
      : null;
  const series = windowed?.points ?? sortedData;
  const rangeFrom = windowed?.dateFrom ?? data.date_from;
  const rangeTo = windowed?.dateTo ?? data.date_to;

  // Prepare chart data
  const chartData = series.map(item => ({
    date: item.date,
    formattedDate: formatDate(item.date, data.group_by),
    value: config.getValue(item),
  }));

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <WidgetCard
      title={t(config.titleKey, config.title)}
      description={t('stats_from_to', {
        from: rangeFrom,
        to: rangeTo,
        defaultValue: 'From {{from}} to {{to}}',
      })}
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
              interval={lastDays ? 0 : 'preserveStartEnd'}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ 
                value: metric === 'revenue' ? t('stats_revenue_sar', 'Revenue (SAR)') : t('shared_count', 'Count'), 
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
              formatter={(value: number) => [
                metric === 'revenue'
                  ? `${config.formatValue(value)} ${t('currency', 'SAR')}`
                  : config.formatValue(value),
                t(config.labelKey, config.label),
              ]}
              labelFormatter={(label) => t('stats_date_label', { label, defaultValue: 'Date: {{label}}' })}
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
