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

interface MonthlyData {
  month: string;
  year: number;
  month_number: number;
  total: number;
  revenue?: number;
  by_status: Array<{
    status: number | string;
    label: string;
    count: number;
  }>;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  className?: string;
}

const getMonthName = (monthNumber: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1] || monthNumber;
};

export default function MonthlyChart({ data, className }: MonthlyChartProps) {
  const chartData = data.map((item) => ({
    name: `${getMonthName(item.month_number)}`,
    fullDate: `${getMonthName(item.month_number)} ${item.year}`,
    reservations: item.total,
    revenue: item.revenue || 0,
  }));

  const totalReservations = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <WidgetCard
      title="MonthlyTrend"
      description={`Total: ${totalReservations} reservations over ${data.length} month(s)`}
      className={cn('min-h-[400px]', className)}
    >
      <div className="h-[300px] w-full pt-5 @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorReservations)"
              name="Reservations"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Summary */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 @lg:grid-cols-6">
            {data.slice(-6).map((month, index) => (
              <div key={index} className="text-center">
                 <p className="text-xs text-gray-500">
                  {getMonthName(month.month_number)}
                </p>
                <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">{month.total}</p>
                 <p className="text-xs text-emerald-600 font-medium">
                  {month.revenue?.toLocaleString() || 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
