'use client';

import WidgetCard from '@/components/cards/widget-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import cn from '@/utils/class-names';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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
    count: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const totalCount = bySupportType.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetCard
      title="Customer Support by Type"
      description={`Total: ${totalCount} support tickets`}
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar 
              dataKey="count" 
              name="Tickets"
              radius={[8, 8, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Type Summary */}
      <div className="mt-4 grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {bySupportType.map((type, index) => (
          <div
            key={type.type}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div>
              <p className="text-xs text-gray-500">{type.label}</p>
              <p className="text-sm font-semibold text-gray-900">{type.count}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

