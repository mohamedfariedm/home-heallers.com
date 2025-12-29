'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Title } from '@/components/ui/text';
import cn from '@/utils/class-names';

interface InvoiceBreakdownProps {
  byStatus: Array<{ status: string; count: number }>;
  className?: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function InvoiceBreakdown({ byStatus, className }: InvoiceBreakdownProps) {
  // Calculate total for percentage
  const total = byStatus.reduce((acc, curr) => acc + curr.count, 0);

  const data = byStatus.map((item, index) => ({
    name: item.status,
    value: item.count,
    percentage: ((item.count / total) * 100).toFixed(1),
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <Title as="h6" className="mb-1 font-semibold text-gray-900 dark:text-white">
        Invoice Status
      </Title>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Breakdown of invoice statuses
      </p>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              width={100}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px',
              }}
              formatter={(value: number) => [`${value} Invoices`, 'Count']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: '#f3f4f6', radius: [0, 4, 4, 0] }}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-gray-500">
              {item.name}: <span className="font-medium text-gray-900 dark:text-gray-200">{item.value}</span> ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
