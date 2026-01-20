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

interface CostRatioChartProps {
  data: Array<{
    source_campaign: string;
    customer_support_count: number;
    confirmed_reservations_count: number;
    cost_ratio: number | null;
  }>;
  className?: string;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

export default function CostRatioChart({
  data,
  className,
}: CostRatioChartProps) {
  // Process data and ensure cost_ratio is in percentage format (0-100)
  // If cost_ratio is a decimal (0-1), multiply by 100; if already percentage, use as is
  const chartData = data.map((item, index) => {
    let costRatio = item.cost_ratio || 0;
    // If cost_ratio is less than 1, assume it's a decimal and convert to percentage
    // Otherwise, assume it's already a percentage
    if (costRatio > 0 && costRatio <= 1) {
      costRatio = costRatio * 100;
    }

    return {
      name:
        item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign,
      cost_ratio: costRatio,
      support: item.customer_support_count,
      reservations: item.confirmed_reservations_count,
      fill: COLORS[index % COLORS.length],
    };
  });

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <Title
        as="h6"
        className="mb-1 font-semibold text-gray-900 dark:text-white"
      >
        conversion rate by Campaign
      </Title>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Efficiency analysis based on campaign source
      </p>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.1}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              label={{
                value: 'Percentage (%)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' },
              }}
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
              formatter={(value: number, name: string) => {
                if (name === 'cost_ratio') {
                  return [`${value.toFixed(2)}%`, 'Conversion Rate'];
                }
                if (name === 'support') {
                  return [value, 'Customer Support'];
                }
                if (name === 'reservations') {
                  return [value, 'Confirmed Reservations'];
                }
                return [value, name];
              }}
              labelFormatter={(label) => `Campaign: ${label}`}
            />
            <Bar dataKey="cost_ratio" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
