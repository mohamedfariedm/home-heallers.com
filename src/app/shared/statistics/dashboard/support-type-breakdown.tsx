'use client';

import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import cn from '@/utils/class-names';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];

interface SupportTypeData {
  type: string;
  label: string;
  count: number;
}

interface SupportTypeBreakdownProps {
  bySupportType: SupportTypeData[];
  className?: string;
}

export default function SupportTypeBreakdown({
  bySupportType,
  className,
}: SupportTypeBreakdownProps) {
  const data = bySupportType.map((item, index) => ({
    name: item.label,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const totalCount = bySupportType.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetCard
      title="Support Tickets"
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
