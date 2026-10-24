'use client';

import { useTranslation } from 'react-i18next';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Title } from '@/components/ui/text';
import cn from '@/utils/class-names';
import { formatSourceCampaign } from '@/app/shared/source-campaign-options';

interface ReservationCampaignsChartProps {
  data: Array<{
    status: number | string;
    label: string;
    count: number;
    by_source_campaign?: Array<{ source_campaign: string | null; count: number }>;
  }>;
  className?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function ReservationCampaignsChart({ data, className }: ReservationCampaignsChartProps) {
  const { t } = useTranslation('statistics');
  // Aggregate data by source_campaign across all statuses
  const aggregatedData = data.reduce((acc, curr) => {
    if (curr.by_source_campaign) {
      curr.by_source_campaign.forEach((campaign) => {
        const name = formatSourceCampaign(campaign.source_campaign);
        const existing = acc.find((item) => item.name === name);
        if (existing) {
          existing.value += campaign.count;
        } else {
          acc.push({ name, value: campaign.count });
        }
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  // Sort by value descending and take top 5 + Others? Or just show all if small number
  // Let's sort descending
  aggregatedData.sort((a, b) => b.value - a.value);

  const chartData = aggregatedData;

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800',
        className
      )}
    >
      <Title as="h6" className="mb-1 font-semibold text-gray-900 dark:text-white">
        {t('stats_reservations_by_campaign', 'Reservations by Campaign')}
      </Title>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {t('stats_reservations_by_campaign_desc', 'Source breakdown for all reservations')}
      </p>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '12px',
              }}
            />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
