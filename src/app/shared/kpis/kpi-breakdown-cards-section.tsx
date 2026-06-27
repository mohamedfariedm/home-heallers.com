'use client';

import type { IconType } from 'react-icons';
import KpiStatCard, { type KpiStatCardColor } from '@/app/shared/kpis/kpi-stat-card';

const DEFAULT_COLORS: KpiStatCardColor[] = [
  'purple',
  'blue',
  'green',
  'amber',
  'indigo',
  'emerald',
  'cyan',
  'sky',
  'orange',
];

export interface KpiBreakdownCardItem {
  key: string;
  label: string;
  count: number;
  subtitle?: React.ReactNode;
  href?: string;
  selected?: boolean;
}

interface KpiBreakdownCardsSectionProps {
  title: string;
  description?: string;
  items: KpiBreakdownCardItem[];
  icon: IconType;
  colors?: KpiStatCardColor[];
  maxItems?: number;
}

export default function KpiBreakdownCardsSection({
  title,
  description,
  items,
  icon,
  colors = DEFAULT_COLORS,
  maxItems,
}: KpiBreakdownCardsSectionProps) {
  if (!items.length) return null;

  const visible = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </p>
        {description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      <div className="flex w-full flex-wrap gap-5">
        {visible.map((item, index) => (
          <KpiStatCard
            key={item.key}
            title={item.label}
            value={item.count}
            icon={icon}
            color={colors[index % colors.length]}
            subtitle={item.subtitle}
            href={item.href}
            selected={item.selected}
          />
        ))}
      </div>
    </div>
  );
}
