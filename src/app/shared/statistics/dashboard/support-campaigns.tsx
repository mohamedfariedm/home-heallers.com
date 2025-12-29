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

interface SupportCampaignsChartProps {
  data: Array<{
    type: string;
    label: string;
    count: number;
    by_source_campaign?: Array<{ source_campaign: string; count: number }>;
  }>;
  className?: string;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function SupportCampaignsChart({ data, className }: SupportCampaignsChartProps) {
  // Aggregate data by source_campaign across all support types
  const aggregatedData = data.reduce((acc, curr) => {
    if (curr.by_source_campaign) {
      curr.by_source_campaign.forEach((campaign) => {
        const existing = acc.find((item) => item.name === campaign.source_campaign);
        if (existing) {
          existing.value += campaign.count;
        } else {
          acc.push({ name: campaign.source_campaign, value: campaign.count });
        }
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  aggregatedData.sort((a, b) => b.value - a.value);

  const chartData = aggregatedData.map((item, index) => ({
    ...item,
    name: item.name === 'unknown' ? 'Unknown' : item.name,
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
        Support Tickets by Campaign
      </Title>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Campaign sources driving support requests
      </p>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
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
