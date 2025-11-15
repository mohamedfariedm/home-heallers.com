'use client';

import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import cn from '@/utils/class-names';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface StatusData {
  status: number | string;
  label: string;
  count: number;
}

interface StatusBreakdownProps {
  byStatus: StatusData[];
  className?: string;
}

export default function StatusBreakdown({
  byStatus,
  className,
}: StatusBreakdownProps) {
  const data = byStatus.map((item, index) => ({
    name: item.label,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const totalCount = byStatus.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetCard
      title="Reservations by Status"
      description={`Total: ${totalCount} reservations`}
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
                percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
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

      {/* Status List */}
      <div className="mt-4 grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {byStatus.map((status, index) => (
          <div
            key={status.status}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div>
              <p className="text-xs text-gray-500">{status.label}</p>
              <p className="text-sm font-semibold text-gray-900">{status.count}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

