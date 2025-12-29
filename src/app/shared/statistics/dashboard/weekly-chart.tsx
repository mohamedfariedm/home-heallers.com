'use client';

import WidgetCard from '@/components/cards/widget-card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import cn from '@/utils/class-names';

interface WeeklyData {
  year_week: string;
  year: number;
  week_number: number;
  week_start: string;
  total: number;
  revenue?: number;
  by_status: Array<{
    status: number | string;
    label: string;
    count: number;
  }>;
}

interface WeeklyChartProps {
  data: WeeklyData[];
  className?: string;
}

export default function WeeklyChart({ data, className }: WeeklyChartProps) {
  const chartData = data.map((item) => ({
    name: `W${item.week_number}`,
    fullDate: `Week ${item.week_number}, ${item.year}`,
    reservations: item.total,
    revenue: item.revenue || 0,
  }));

  const totalReservations = data.reduce((sum, item) => sum + item.total, 0);
  const averagePerWeek = data.length > 0 ? (totalReservations / data.length).toFixed(1) : 0;

  return (
    <WidgetCard
      title="WeeklyTrend"
      description={`Avg: ${averagePerWeek} per week`}
      className={cn('min-h-[400px]', className)}
    >
      <div className="h-[300px] w-full pt-5 @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenueWeekly" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              dy={10}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
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
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="reservations"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWeekly)"
              name="Reservations"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenueWeekly)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
