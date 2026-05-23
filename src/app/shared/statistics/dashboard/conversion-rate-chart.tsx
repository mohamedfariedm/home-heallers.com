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
import {
  formatRatePercent,
  getPerformanceColors,
  getRatePerformance,
} from './metric-thresholds';

export interface ConversionRateItem {
  source_campaign: string;
  customer_support_count: number;
  reservations_count: number;
  conversion_rate: number;
}

interface ConversionRateChartProps {
  data: ConversionRateItem[];
  className?: string;
}

export default function ConversionRateChart({
  data,
  className,
}: ConversionRateChartProps) {
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);

  const chartData = data
    .map((item) => {
      const status = getRatePerformance(item.conversion_rate, 'conversion_rate');
      const colors = getPerformanceColors(status);
      return {
        name:
          item.source_campaign === 'unknown'
            ? 'Unknown'
            : item.source_campaign,
        ratePercent: item.conversion_rate * 100,
        support: item.customer_support_count,
        reservations: item.reservations_count,
        fill: colors.barColor,
        original: item,
      };
    })
    .sort((a, b) => b.ratePercent - a.ratePercent);

  const topTenItems = chartData.slice(0, 10).map((item) => ({
    name: item.name,
    value: item.ratePercent,
    percentage: item.ratePercent,
    additionalInfo: {
      support: item.support,
      reservations: item.reservations,
    },
  }));

  const maxRate =
    topTenItems.length > 0
      ? Math.max(...topTenItems.map((item) => item.value))
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
              Conversion Rate by Campaign
            </Title>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Reservations per customer support ticket, by source
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

        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Excellent: 18%+
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            Average: 10–17%
          </span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            Risk: &lt;10%
          </span>
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
                domain={[0, 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
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
                  if (name === 'ratePercent') {
                    return [`${value.toFixed(1)}%`, 'Conversion Rate'];
                  }
                  return [value.toLocaleString(), name];
                }}
                labelFormatter={(label) => `Campaign: ${label}`}
              />
              <Bar
                dataKey="ratePercent"
                radius={[0, 4, 4, 0]}
                name="Conversion Rate"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {chartData.slice(0, 4).map((item) => {
              const status = getRatePerformance(
                item.original.conversion_rate,
                'conversion_rate'
              );
              const colors = getPerformanceColors(status);
              return (
                <div
                  key={item.name}
                  className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                        colors.badgeClass
                      )}
                    >
                      {formatRatePercent(item.original.conversion_rate)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Support:{' '}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.support.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Reservations:{' '}
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.reservations.toLocaleString()}
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
        items={topTenItems.map((item) => ({
          ...item,
          percentage: maxRate > 0 ? (item.value / maxRate) * 100 : 0,
        }))}
        valueLabel="Conversion Rate"
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
