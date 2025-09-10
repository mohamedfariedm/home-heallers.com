'use client';

import { Title, Text } from '@/components/ui/text';
import WidgetCard from '@/components/cards/widget-card';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import { PiDownloadSimple, PiUploadSimple } from 'react-icons/pi';
import SimpleBar from '@/components/ui/simplebar';
import { useMedia } from '@/hooks/use-media';

const data = [
  {
    month: 'Jan',
    stock: 2000,
    sales: 1000,
  },
  {
    month: 'Feb',
    stock: 4200,
    sales: 3700,
  },
  {
    month: 'Mar',
    stock: 3000,
    sales: 5800,
  },
  {
    month: 'Apr',
    stock: 5780,
    sales: 3908,
  },
  {
    month: 'May',
    stock: 4080,
    sales: 2500,
  },
  {
    month: 'Jun',
    stock: 2300,
    sales: 5200,
  },
  {
    month: 'Jul',
    stock: 4890,
    sales: 6500,
  },
  {
    month: 'Aug',
    stock: 3780,
    sales: 4908,
  },
  {
    month: 'Sep',
    stock: 5800,
    sales: 2800,
  },
  {
    month: 'Oct',
    stock: 6000,
    sales: 1908,
  },
  {
    month: 'Nov',
    stock: 2780,
    sales: 3908,
  },
  {
    month: 'Dec',
    stock: 7500,
    sales: 3000,
  },
];

export default function ActivityReport({ className }: { className?: string }) {
  const isTablet = useMedia('(max-width: 800px)', false);

  return (
    <WidgetCard
      title={'Availability Trend'}
      titleClassName="text-lg xl:text-xl font-semibold"
      className={className}
    >
      <div className="mt-3 flex items-start 2xl:mt-5">
        <div className="me-9 flex items-start">
          <div className="me-3 rounded bg-[#00D1FF] p-2 text-white">
            <PiDownloadSimple className="h-6 w-6" />
          </div>
          <div>
            <Text className="text-gray-500">Stock</Text>
            <Text className="font-lexend text-sm font-semibold text-gray-900 dark:text-gray-700 2xl:text-base">
              15,556
            </Text>
          </div>
        </div>
        <div className="flex items-start">
          <div className="me-3 rounded bg-[#6B46FF] p-2 text-white">
            <PiUploadSimple className="h-6 w-6" />
          </div>
          <div>
            <Text className="text-gray-500">Sales</Text>
            <Text className="font-lexend text-sm font-semibold text-gray-900 dark:text-gray-700 2xl:text-base">
              10,065
            </Text>
          </div>
        </div>
      </div>
      <SimpleBar>
        <div className="h-96 w-full pt-9">
          <ResponsiveContainer
            width="100%"
            height="100%"
            {...(isTablet && { minWidth: '700px' })}
          >
            <AreaChart
              data={data}
              margin={{
                left: -16,
              }}
              className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
            >
              <defs>
                <linearGradient id="downloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B46FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#6B46FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                className=" "
              />
              <YAxis tickLine={false} className=" " />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="stock"
                stroke="#6B46FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#downloads)"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#00D1FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#uploads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SimpleBar>
    </WidgetCard>
  );
}
