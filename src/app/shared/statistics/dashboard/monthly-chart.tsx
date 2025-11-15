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
  month: string;
  year: number;
  month_number: number;
  total: number;
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
    name: `${getMonthName(item.month_number)} ${item.year}`,
    reservations: item.total,
    month: item.month,
  }));

  const totalReservations = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <WidgetCard
      title="Monthly Reservations Trend"
      description={`Total: ${totalReservations} reservations over ${data.length} month(s)`}
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
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
            <Line
              type="monotone"
              dataKey="reservations"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Reservations"
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Summary */}
      {data.length > 0 && (
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Monthly Summary</h4>
          <div className="grid grid-cols-2 gap-4 @lg:grid-cols-4">
            {data.map((month, index) => (
              <div key={index} className="rounded-lg bg-white p-2 shadow-sm">
                <p className="text-xs text-gray-500">
                  {getMonthName(month.month_number)} {month.year}
                </p>
                <p className="text-lg font-bold text-gray-900">{month.total}</p>
                <p className="text-xs text-gray-500">reservations</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

