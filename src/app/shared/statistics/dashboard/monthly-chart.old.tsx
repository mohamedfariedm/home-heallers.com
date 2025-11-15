'use client';

import WidgetCard from '@/components/cards/widget-card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import cn from '@/utils/class-names';

interface MonthlyData {
  period: string;
  month: string;
  year: number;
  total_reservations: number;
  total_revenue: number;
  average_amount: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  className?: string;
}

export default function MonthlyChart({ data, className }: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    name: `${item.month.substring(0, 3)} ${item.year}`,
    reservations: item.total_reservations,
    revenue: item.total_revenue,
  }));

  return (
    <WidgetCard
      title="Monthly Reservations Trend"
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="reservations"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Reservations"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              name="Revenue ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

