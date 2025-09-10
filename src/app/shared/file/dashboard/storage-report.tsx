'use client';

import WidgetCard from '@/components/cards/widget-card';
import { Title, Text } from '@/components/ui/text';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useMedia } from '@/hooks/use-media';
import cn from '@/utils/class-names';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import TrendingUpIcon from '@/components/icons/trending-up';
import SimpleBar from '@/components/ui/simplebar';

const data = [
  {
    month: 'Jan',
    KA: 5000,
    GC: 1500,
    FC: 1500,
    CO: 1500,
  },
  {
    month: 'Feb',
    KA: 8500,
    GC: 1600,
    FC: 5798,
    CO: 2000,
  },
  {
    month: 'Mar',
    KA: 7000,
    GC: 8300,
    FC: 3000,
    CO: 1375,
  },
  {
    month: 'Apr',
    KA: 3908,
    GC: 1780,
    FC: 6798,
    CO: 5780,
  },
  {
    month: 'May',
    KA: 4890,
    GC: 2500,
    FC: 1500,
    CO: 5000,
  },
  {
    month: 'Jun',
    KA: 8000,
    GC: 3200,
    FC: 7800,
    CO: 4890,
  },
  {
    month: 'Jul',
    KA: 8500,
    GC: 2500,
    FC: 2500,
    CO: 4890,
  },
  {
    month: 'Aug',
    KA: 3780,
    GC: 3908,
    FC: 9908,
    CO: 2800,
  },
  {
    month: 'Sep',
    KA: 7800,
    GC: 2800,
    FC: 8500,
    CO: 1908,
  },
  {
    month: 'Oct',
    KA: 5780,
    GC: 1908,
    FC: 7208,
    CO: 2780,
  },
  {
    month: 'Nov',
    KA: 4780,
    GC: 1920,
    FC: 2930,
    CO: 1500,
  },
  {
    month: 'Dec',
    KA: 7500,
    GC: 3000,
    FC: 9000,
    CO: 1700,
  },
];

function CustomYAxisTick({ x, y, payload }: any) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" className="fill-gray-500">
        ${`${payload.value.toLocaleString()}`}
      </text>
    </g>
  );
}

export default function StorageReport({ className }: { className?: string }) {
  const isMobile = useMedia('(max-width: 768px)', false);
  const isDesktop = useMedia('(max-width: 1440px)', false);
  const is2xl = useMedia('(max-width: 1780px)', false);
  const isTablet = useMedia('(max-width: 800px)', false);

  return (
    <WidgetCard
      title={'Sales Target'}
      titleClassName="font-normal text-gray-700 sm:text-base font-inter"
      description={
        <div className="flex items-center justify-start">
          <Title as="h2" className="me-2">
            $105,000
          </Title>
          <Text className="flex items-center leading-none text-gray-500">
            <Text
              as="span"
              className={cn(
                'me-2 inline-flex items-center font-medium text-green'
              )}
            >
              <TrendingUpIcon className="me-1 h-4 w-4" />
              32.40%
            </Text>
            last year
          </Text>
        </div>
      }
      descriptionClassName="text-gray-500 mt-1.5"
      action={
        <div className="hidden @2xl:block">
          <Badge renderAsDot className="me-0.5 bg-[#282ECA]" /> KA
          <Badge renderAsDot className="me-0.5 ms-4 bg-[#4052F6]" /> GC
          <Badge renderAsDot className="me-0.5 ms-4 bg-[#96C0FF]" /> FC
          <Badge
            renderAsDot
            className="me-0.5 ms-4 bg-[#DEEAFC] dark:bg-[#7c88b2]"
          />{' '}
          CO
        </div>
      }
      className={className}
    >
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <BarChart
              data={data}
              barSize={isMobile ? 16 : isDesktop ? 28 : is2xl ? 32 : 46}
              margin={{
                left: 16,
              }}
              className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="KA" fill="#282ECA" stackId="a" />
              <Bar dataKey="GC" stackId="a" fill="#4052F6" />
              <Bar dataKey="FC" stackId="a" fill="#96C0FF" />
              <Bar dataKey="CO" stackId="a" fill="#DEEAFC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
