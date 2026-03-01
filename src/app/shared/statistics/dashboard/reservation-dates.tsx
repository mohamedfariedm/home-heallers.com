'use client';

import { useState, useMemo } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import TopTenModal from './top-ten-modal';
import cn from '@/utils/class-names';

interface DateStatusData {
  status: string;
  label: string;
  count: number;
}

interface ReservationDateData {
  date: string;
  by_status: DateStatusData[];
  total: number;
}

interface ReservationDatesData {
  by_date_and_status: ReservationDateData[];
  total_dates: number;
  total_slots: number;
}

interface ReservationDatesProps {
  data: ReservationDatesData;
  className?: string;
}

export default function ReservationDates({ data, className }: ReservationDatesProps) {
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  
  // Get all unique statuses - must be called before early return
  const statuses = useMemo(() => {
    if (!data?.by_date_and_status) return [];
    const statusSet = new Set<string>();
    data.by_date_and_status.forEach(item => {
      item.by_status.forEach(status => {
        statusSet.add(status.status);
      });
    });
    return Array.from(statusSet);
  }, [data]);

  // Prepare chart data - group by date and sum by status - must be called before early return
  const chartData = useMemo(() => {
    if (!data?.by_date_and_status) return [];
    const dateMap = new Map<string, Record<string, number>>();
    
    data.by_date_and_status.forEach(item => {
      const dateKey = item.date || 'Unknown';
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey });
      }
      
      item.by_status.forEach(status => {
        const current = dateMap.get(dateKey)!;
        current[status.status] = (current[status.status] || 0) + status.count;
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => {
        if (a.date === 'Unknown' || a.date === '') return 1;
        if (b.date === 'Unknown' || b.date === '') return -1;
        return a.date.localeCompare(b.date);
      })
      .slice(-30); // Show last 30 dates
  }, [data]);

  // Early return after all hooks are called
  if (!data || !data.by_date_and_status || data.by_date_and_status.length === 0) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: '#F59E0B',
    completed: '#10B981',
    confirmed: '#3B82F6',
    canceled: '#EF4444',
  };

  // Prepare Top 10 dates by total reservations
  const sortedDates = [...data.by_date_and_status]
    .filter(item => item.date && item.date !== '')
    .sort((a, b) => b.total - a.total);
  
  const topTenItems = sortedDates.slice(0, 10).map((item) => ({
    name: item.date || 'Unknown',
    value: item.total,
    percentage: data.total_slots > 0 ? (item.total / data.total_slots) * 100 : 0,
    additionalInfo: {
      statuses: item.by_status.length,
      completed: item.by_status.find(s => s.status === 'completed')?.count || 0,
      pending: item.by_status.find(s => s.status === 'pending')?.count || 0,
    },
  }));

  return (
    <>
    <WidgetCard
      title="Reservations by Date"
      description={`${data.total_dates} dates • ${data.total_slots.toLocaleString()} total slots`}
      className={cn('min-h-[400px]', className)}
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTopTenOpen(true)}
          className="text-xs"
        >
          Top 10
        </Button>
      }
    >
      <div className="h-[300px] w-full pt-5 @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            {statuses.map((status, index) => {
              const statusData = data.by_date_and_status[0]?.by_status.find(s => s.status === status);
              return (
                <Line
                  key={status}
                  type="monotone"
                  dataKey={status}
                  stroke={statusColors[status] || `hsl(${index * 60}, 70%, 50%)`}
                  strokeWidth={2}
                  name={statusData?.label || status}
                  dot={{ r: 3 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statuses.slice(0, 4).map((status) => {
            const total = data.by_date_and_status.reduce((sum, item) => {
              const statusItem = item.by_status.find(s => s.status === status);
              return sum + (statusItem?.count || 0);
            }, 0);
            const statusData = data.by_date_and_status[0]?.by_status.find(s => s.status === status);
            return (
              <div key={status} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {statusData?.label || status}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {total.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </WidgetCard>

    <TopTenModal
      isOpen={isTopTenOpen}
      onClose={() => setIsTopTenOpen(false)}
      title="Top Dates by Reservations"
      items={topTenItems}
      valueLabel="Total Slots"
      showPercentage={true}
      additionalColumns={[
        {
          key: 'completed',
          label: 'Completed',
          render: (item) => (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {item.additionalInfo?.completed?.toLocaleString() || 0}
            </span>
          ),
        },
        {
          key: 'pending',
          label: 'Pending',
          render: (item) => (
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {item.additionalInfo?.pending?.toLocaleString() || 0}
            </span>
          ),
        },
      ]}
    />
    </>
  );
}
