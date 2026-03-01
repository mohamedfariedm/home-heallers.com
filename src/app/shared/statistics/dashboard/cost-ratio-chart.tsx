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
      original: item,
    };
  });

  // Sort by cost_ratio descending for Top 10 (excluding null values)
  const sortedData = [...data]
    .filter(item => item.cost_ratio !== null)
    .sort((a, b) => {
      const ratioA = (a.cost_ratio || 0) > 1 ? (a.cost_ratio || 0) : (a.cost_ratio || 0) * 100;
      const ratioB = (b.cost_ratio || 0) > 1 ? (b.cost_ratio || 0) : (b.cost_ratio || 0) * 100;
      return ratioB - ratioA;
    });
  
  const topTenItems = sortedData.slice(0, 10).map((item) => {
    let costRatio = item.cost_ratio || 0;
    if (costRatio > 0 && costRatio <= 1) {
      costRatio = costRatio * 100;
    }
    return {
      name: item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign,
      value: costRatio,
      percentage: 0, // Will be calculated based on max
      additionalInfo: {
        support: item.customer_support_count,
        reservations: item.confirmed_reservations_count,
      },
    };
  });

  const maxRatio = Math.max(...topTenItems.map(item => item.value));

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
            Conversion Rate by Campaign
          </Title>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Efficiency analysis based on campaign source
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

      {/* Detailed Statistics */}
      <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {sortedData.slice(0, 4).map((item, index) => {
            let costRatio = item.cost_ratio || 0;
            if (costRatio > 0 && costRatio <= 1) {
              costRatio = costRatio * 100;
            }
            const efficiency = costRatio < 1 ? 'Excellent' : costRatio < 2 ? 'Good' : costRatio < 5 ? 'Fair' : 'Poor';
            return (
              <div key={item.source_campaign} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {item.source_campaign === 'unknown' ? 'Unknown' : item.source_campaign}
                  </span>
                  <span className={cn(
                    'text-xs font-semibold px-2 py-1 rounded',
                    efficiency === 'Excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    efficiency === 'Good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    efficiency === 'Fair' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {efficiency}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {costRatio.toFixed(2)}%
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
      title="Top Campaigns by Conversion Rate"
      items={topTenItems.map(item => ({
        ...item,
        percentage: maxRatio > 0 ? (item.value / maxRatio) * 100 : 0,
      }))}
      valueLabel="Conversion Rate (%)"
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
