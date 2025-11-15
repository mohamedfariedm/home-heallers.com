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
  Legend,
} from 'recharts';
import cn from '@/utils/class-names';

interface WeeklyData {
  period: string;
  week: number;
  year: number;
  week_start_date: string;
  total_reservations: number;
  total_revenue: number;
  average_amount: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
  className?: string;
}

export default function WeeklyChart({ data, className }: WeeklyChartProps) {
  const chartData = data.map((item) => ({
    name: `W${item.week} ${item.year}`,
    reservations: item.total_reservations,
    revenue: item.total_revenue,
  }));

  return (
    <WidgetCard
      title="Weekly Reservations Trend"
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="reservations"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
              name="Reservations"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.6}
              name="Revenue ($)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

