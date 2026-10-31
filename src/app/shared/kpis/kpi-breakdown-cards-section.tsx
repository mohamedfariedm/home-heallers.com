'use client';

import type { IconType } from 'react-icons';
import KpiStatCard, {
  KPI_STAT_GRID_CLASS,
  type KpiStatCardColor,
} from '@/app/shared/kpis/kpi-stat-card';

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
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        ) : null}
      </div>
      <div className={KPI_STAT_GRID_CLASS}>
        {visible.map((item, index) => (
          <KpiStatCard
            key={item.key}
            title={item.label}
            value={item.count.toLocaleString()}
            icon={icon}
            color={colors[index % colors.length]}
            subtitle={item.subtitle}
            href={item.href}
            selected={item.selected}
          />
        ))}
      </div>
    </section>
  );
}
