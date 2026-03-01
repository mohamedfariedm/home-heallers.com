'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import TopTenModal from './top-ten-modal';
import cn from '@/utils/class-names';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface StatusData {
  status: number | string;
  label: string;
  count: number;
  by_source_campaign?: Array<{ source_campaign: string; count: number }>;
}

interface StatusBreakdownProps {
  byStatus: StatusData[];
  className?: string;
}

export default function StatusBreakdown({
  byStatus,
  className,
}: StatusBreakdownProps) {
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  
  const data = byStatus.map((item, index) => ({
    name: item.label,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const totalCount = byStatus.reduce((sum, item) => sum + item.count, 0);
  
  // Sort by count descending for Top 10
  const sortedStatuses = [...byStatus].sort((a, b) => b.count - a.count);
  const topTenItems = sortedStatuses.map((item) => ({
    name: item.label,
    value: item.count,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
    additionalInfo: {
      status: item.status,
      campaigns: item.by_source_campaign?.length || 0,
    },
  }));

  return (
    <>
      <WidgetCard
        title="Reservations by Status"
        description={`Total: ${totalCount.toLocaleString()} reservations`}
        className={cn('flex flex-col', className)}
        headerClassName="flex items-center justify-between"
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsTopTenOpen(true)}
            className="text-xs"
          >
            Top 10
          </Button>
        }
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
                {item.name} <span className="text-gray-400">({item.value.toLocaleString()})</span>
              </span>
            </div>
          ))}
        </div>

        {/* Detailed Statistics */}
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {sortedStatuses.slice(0, 4).map((status, index) => {
              const percentage = totalCount > 0 ? (status.count / totalCount) * 100 : 0;
              return (
                <div key={status.status} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {status.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {status.count.toLocaleString()} reservations
                    </span>
                    {status.by_source_campaign && status.by_source_campaign.length > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {status.by_source_campaign.length} campaigns
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WidgetCard>

    <TopTenModal
      isOpen={isTopTenOpen}
      onClose={() => setIsTopTenOpen(false)}
      title="Reservations by Status"
      items={topTenItems}
      valueLabel="Reservations"
      showPercentage={true}
      additionalColumns={[
        {
          key: 'campaigns',
          label: 'Campaigns',
          render: (item) => (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.additionalInfo?.campaigns || 0}
            </span>
          ),
        },
      ]}
    />
    </>
  );
}
