'use client';

import WidgetCard from '@/components/cards/widget-card';
import cn from '@/utils/class-names';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export interface KpiBreakdownItem {
  key: string;
  label: string;
  count: number;
  countNode?: React.ReactNode;
}

interface KpiBreakdownWidgetProps {
  title: string;
  description?: string;
  items: KpiBreakdownItem[];
  maxItems?: number;
  className?: string;
}

export default function KpiBreakdownWidget({
  title,
  description,
  items,
  maxItems = 5,
  className,
}: KpiBreakdownWidgetProps) {
  if (!items?.length) return null;

  const sorted = [...items].sort((a, b) => b.count - a.count);
  const visible = sorted.slice(0, maxItems);
  const total = sorted.reduce((sum, item) => sum + item.count, 0);

  return (
    <WidgetCard
      title={title}
      description={description ?? `Total: ${total.toLocaleString()}`}
      className={cn('flex h-full flex-col', className)}
    >
      <div className="mt-2 space-y-4">
        {visible.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;

          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                  {item.countNode ?? item.count.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {percentage.toFixed(1)}% of total
              </p>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
