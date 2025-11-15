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
  year_week: string;
  year: number;
  week_number: number;
  week_start: string;
  total: number;
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
    name: `W${item.week_number} ${item.year}`,
    reservations: item.total,
    week: item.week_number,
    year: item.year,
  }));

  const totalReservations = data.reduce((sum, item) => sum + item.total, 0);
  const averagePerWeek = data.length > 0 ? (totalReservations / data.length).toFixed(1) : 0;

  return (
    <WidgetCard
      title="Weekly Reservations Trend"
      description={`Total: ${totalReservations} reservations | Average: ${averagePerWeek} per week`}
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="reservations"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorReservations)"
              name="Reservations"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary */}
      {data.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Weekly Summary</h4>
          <div className="grid grid-cols-2 gap-4 @lg:grid-cols-3">
            {data.map((week, index) => (
              <div key={index} className="rounded-lg bg-white p-2 shadow-sm">
                <p className="text-xs text-gray-500">
                  Week {week.week_number}, {week.year}
                </p>
                <p className="text-lg font-bold text-gray-900">{week.total}</p>
                <p className="text-xs text-gray-500">
                  Starting {new Date(week.week_start).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

