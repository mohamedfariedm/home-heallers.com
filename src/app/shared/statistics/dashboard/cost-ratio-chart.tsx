'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Title } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import TopTenModal from './top-ten-modal';
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
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  
  // Process data - only use support and reservations from API
  const chartData = data.map((item, index) => {
    return {
      name:
        item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign,
      support: item.customer_support_count,
      reservations: item.confirmed_reservations_count,
      fill: COLORS[index % COLORS.length],
      original: item,
    };
  });

  // Sort by total (support + reservations) descending for Top 10
  const sortedData = [...data]
    .sort((a, b) => {
      const totalA = a.customer_support_count + a.confirmed_reservations_count;
      const totalB = b.customer_support_count + b.confirmed_reservations_count;
      return totalB - totalA;
    });
  
  const topTenItems = sortedData.slice(0, 10).map((item) => {
    return {
      name: item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign,
      value: item.customer_support_count + item.confirmed_reservations_count,
      percentage: 0, // Will be calculated based on max
      additionalInfo: {
        support: item.customer_support_count,
        reservations: item.confirmed_reservations_count,
      },
    };
  });

  const maxValue = topTenItems.length > 0 
    ? Math.max(...topTenItems.map(item => item.value))
    : 0;

  return (
    <>
    <div
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Title
            as="h6"
            className="mb-1 font-semibold text-gray-900 dark:text-white"
          >
            Campaign Statistics
          </Title>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Support tickets and reservations by campaign source
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTopTenOpen(true)}
          className="text-xs"
        >
          Top 10
        </Button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              strokeOpacity={0.1}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              width={90}
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
                if (name === 'support') {
                  return [value.toLocaleString(), 'Customer Support'];
                }
                if (name === 'reservations') {
                  return [value.toLocaleString(), 'Confirmed Reservations'];
                }
                return [value.toLocaleString(), name];
              }}
              labelFormatter={(label) => `Campaign: ${label}`}
            />
            <Legend />
            <Bar dataKey="support" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Support Tickets" />
            <Bar dataKey="reservations" fill="#10b981" radius={[0, 4, 4, 0]} name="Reservations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Statistics */}
      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sortedData.slice(0, 4).map((item) => {
            const total = item.customer_support_count + item.confirmed_reservations_count;
            return (
              <div key={item.source_campaign} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total.toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Support: </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.customer_support_count.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reservations: </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.confirmed_reservations_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    <TopTenModal
      isOpen={isTopTenOpen}
      onClose={() => setIsTopTenOpen(false)}
      title="Top Campaigns by Total Count"
      items={topTenItems.map(item => ({
        ...item,
        percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
      }))}
      valueLabel="Total Count"
      showPercentage={false}
      additionalColumns={[
        {
          key: 'support',
          label: 'Support Tickets',
          render: (item) => (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.additionalInfo?.support?.toLocaleString() || 0}
            </span>
          ),
        },
        {
          key: 'reservations',
          label: 'Reservations',
          render: (item) => (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {item.additionalInfo?.reservations?.toLocaleString() || 0}
            </span>
          ),
        },
      ]}
    />
    </>
  );
}
