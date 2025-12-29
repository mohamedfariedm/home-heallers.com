'use client';

import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
      description={`Total: ${totalCount}`}
      className={cn('flex flex-col', className)}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} className="stroke-white dark:stroke-gray-800" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="mt-4 flex w-full flex-wrap justify-center gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <span 
                className="h-2.5 w-2.5 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {item.name} <span className="text-gray-400">({item.value})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </WidgetCard>
  );
}
