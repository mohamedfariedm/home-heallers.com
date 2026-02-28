'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import TopTenModal from './top-ten-modal';
import cn from '@/utils/class-names';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981'];

interface SupportTypeData {
  type: string;
  label: string;
  count: number;
  by_source_campaign?: Array<{ source_campaign: string; count: number }>;
}

interface SupportTypeBreakdownProps {
  bySupportType: SupportTypeData[];
  className?: string;
}

export default function SupportTypeBreakdown({
  bySupportType,
  className,
}: SupportTypeBreakdownProps) {
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  
  const data = bySupportType.map((item, index) => ({
    name: item.label,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const totalCount = bySupportType.reduce((sum, item) => sum + item.count, 0);
  
  // Sort by count descending for Top 10
  const sortedTypes = [...bySupportType].sort((a, b) => b.count - a.count);
  const topTenItems = sortedTypes.map((item) => ({
    name: item.label,
    value: item.count,
    percentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
    additionalInfo: {
      type: item.type,
      campaigns: item.by_source_campaign?.length || 0,
    },
  }));

  return (
    <>
    <WidgetCard
      title="Support Tickets by Type"
      description={`Total: ${totalCount.toLocaleString()} tickets`}
      className={cn('flex flex-col', className)}
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
          {data.map((item, index) => {
            const displayName = item.name.toLowerCase() === 'operation' 
              ? 'inbound' 
              : item.name.toLowerCase() === 'marketing' 
              ? 'outbound' 
              : item.name;
            return (
              <div key={index} className="flex items-center gap-1.5">
                <span 
                  className="h-2.5 w-2.5 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {displayName} <span className="text-gray-400">({item.value.toLocaleString()})</span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Statistics */}
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            {sortedTypes.slice(0, 4).map((type, index) => {
              const percentage = totalCount > 0 ? (type.count / totalCount) * 100 : 0;
              const displayLabel = type.label.toLowerCase() === 'operation' 
                ? 'inbound' 
                : type.label.toLowerCase() === 'marketing' 
                ? 'outbound' 
                : type.label;
              return (
                <div key={type.type} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {displayLabel}
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
                      {type.count.toLocaleString()} tickets
                    </span>
                    {type.by_source_campaign && type.by_source_campaign.length > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {type.by_source_campaign.length} campaigns
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
      title="Support Tickets by Type"
      items={topTenItems}
      valueLabel="Tickets"
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
