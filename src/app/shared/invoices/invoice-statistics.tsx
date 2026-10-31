'use client';

import { PiCheckCircleBold } from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import KpiStatCard, {
  KPI_STAT_GRID_CLASS,
  type KpiStatCardTone,
} from '@/app/shared/kpis/kpi-stat-card';

interface TaxPercentageBreakdown {
  maafah?: {
    count?: number;
    link?: string;
  };
  zero?: {
    count?: number;
    link?: string;
  };
  fifteen_percent?: {
    count?: number;
    link?: string;
  };
}

interface InvoiceStatus {
  status?: string;
  total_count?: number;
  tax_percentage_breakdown?: TaxPercentageBreakdown;
  link?: string;
}

interface InvoiceStatistics {
  by_status?: InvoiceStatus[];
}

interface InvoiceStatisticsProps {
  statistics?: InvoiceStatistics | null;
  className?: string;
}

const statusColors: Record<string, KpiStatCardTone> = {
  'قيد الانتظار': {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkTextColor: 'dark:text-yellow-400',
    blurColor: 'bg-yellow-50/50',
    darkBlurColor: 'dark:bg-yellow-900/10',
  },
  'موافق عليه': {
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    blurColor: 'bg-green-50/50',
    darkBlurColor: 'dark:bg-green-900/10',
  },
  ملغاة: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    blurColor: 'bg-red-50/50',
    darkBlurColor: 'dark:bg-red-900/10',
  },
};

const defaultColors: KpiStatCardTone = {
  bgColor: 'bg-slate-50',
  textColor: 'text-slate-600',
  darkBgColor: 'dark:bg-slate-900/20',
  darkTextColor: 'dark:text-slate-400',
  blurColor: 'bg-slate-50/50',
  darkBlurColor: 'dark:bg-slate-900/10',
};

const taxPercentageColors: Record<string, KpiStatCardTone> = {
  maafah: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    darkBgColor: 'dark:bg-blue-900/20',
    darkTextColor: 'dark:text-blue-400',
    blurColor: 'bg-blue-50/50',
    darkBlurColor: 'dark:bg-blue-900/10',
  },
  zero: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    darkBgColor: 'dark:bg-gray-900/20',
    darkTextColor: 'dark:text-gray-400',
    blurColor: 'bg-gray-50/50',
    darkBlurColor: 'dark:bg-gray-900/10',
  },
  fifteen_percent: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    darkBgColor: 'dark:bg-purple-900/20',
    darkTextColor: 'dark:text-purple-400',
    blurColor: 'bg-purple-50/50',
    darkBlurColor: 'dark:bg-purple-900/10',
  },
};

const convertApiLinkToQueryParams = (apiLink: string | undefined): string => {
  if (!apiLink) return '';

  try {
    const url = new URL(apiLink);
    const params = new URLSearchParams(url.search);
    const frontendParams = new URLSearchParams();
    params.forEach((value, key) => {
      frontendParams.set(key, value);
    });
    return frontendParams.toString();
  } catch (error) {
    console.error('Error converting API link:', error);
    return '';
  }
};

function TaxRow({
  label,
  count,
  colors,
  onClick,
}: {
  label: string;
  count: number;
  colors: KpiStatCardTone;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition',
        colors.bgColor,
        colors.darkBgColor,
        onClick && 'hover:opacity-90'
      )}
    >
      <span className={cn('font-medium', colors.textColor, colors.darkTextColor)}>
        {label}
      </span>
      <span className={cn('font-bold', colors.textColor, colors.darkTextColor)}>
        {count.toLocaleString()}
      </span>
    </button>
  );
}

export default function InvoiceStatistics({
  statistics,
  className,
}: InvoiceStatisticsProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!statistics || !statistics.by_status || statistics.by_status.length === 0) {
    return null;
  }

  const navigate = (link?: string) => {
    if (!link) return;
    const queryParams = convertApiLinkToQueryParams(link);
    router.push(queryParams ? `${pathname}?${queryParams}` : pathname);
  };

  const statusCards = statistics.by_status
    .sort((a, b) => (b.total_count || 0) - (a.total_count || 0))
    .map((item) => {
      const statusKey = item.status || 'unknown';
      const colors = statusColors[statusKey] || defaultColors;
      const tax = item.tax_percentage_breakdown;

      return {
        title: statusKey,
        value: item.total_count || 0,
        tone: colors,
        link: item.link,
        footer: tax ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tax Breakdown
            </p>
            {tax.maafah?.count !== undefined && (
              <TaxRow
                label="معافاة"
                count={tax.maafah.count}
                colors={taxPercentageColors.maafah}
                onClick={tax.maafah.link ? () => navigate(tax.maafah?.link) : undefined}
              />
            )}
            {tax.zero?.count !== undefined && (
              <TaxRow
                label="0%"
                count={tax.zero.count}
                colors={taxPercentageColors.zero}
                onClick={tax.zero.link ? () => navigate(tax.zero?.link) : undefined}
              />
            )}
            {tax.fifteen_percent?.count !== undefined && (
              <TaxRow
                label="15%"
                count={tax.fifteen_percent.count}
                colors={taxPercentageColors.fifteen_percent}
                onClick={
                  tax.fifteen_percent.link
                    ? () => navigate(tax.fifteen_percent?.link)
                    : undefined
                }
              />
            )}
          </div>
        ) : undefined,
      };
    });

  return (
    <div className={cn('w-full space-y-4', className)}>
      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
        Invoice Status Statistics
      </h4>
      <div className={KPI_STAT_GRID_CLASS}>
        {statusCards.map((card) => (
          <KpiStatCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle="Total"
            icon={PiCheckCircleBold}
            tone={card.tone}
            footer={card.footer}
            onClick={card.link ? () => navigate(card.link) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
