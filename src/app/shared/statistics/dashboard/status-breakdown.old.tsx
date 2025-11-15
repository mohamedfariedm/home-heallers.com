'use client';

import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import cn from '@/utils/class-names';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const STATUS_NAMES: Record<number, string> = {
  1: 'Pending',
  2: 'Confirmed',
  3: 'Completed',
  4: 'Cancelled',
  5: 'In Progress',
};

interface StatusBreakdownProps {
  byStatus: Record<number, number>;
  className?: string;
}

export default function StatusBreakdown({
  byStatus,
  className,
}: StatusBreakdownProps) {
  const data = Object.entries(byStatus).map(([status, count], index) => ({
    name: STATUS_NAMES[parseInt(status)] || `Status ${status}`,
    value: count,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <WidgetCard
      title="Reservations by Status"
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

