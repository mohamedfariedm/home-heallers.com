'use client';

import type { IconType } from 'react-icons';
import Link from 'next/link';
import cn from '@/utils/class-names';

export type KpiStatCardColor =
  | 'purple'
  | 'blue'
  | 'green'
  | 'amber'
  | 'indigo'
  | 'orange'
  | 'emerald'
  | 'cyan'
  | 'sky';

const colorStyles: Record<
  KpiStatCardColor,
  {
    bgColor: string;
    textColor: string;
    darkBgColor: string;
    darkTextColor: string;
    blurColor: string;
    darkBlurColor: string;
  }
> = {
  purple: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    darkBgColor: 'dark:bg-purple-900/20',
    darkTextColor: 'dark:text-purple-400',
    blurColor: 'bg-purple-50/50',
    darkBlurColor: 'dark:bg-purple-900/10',
  },
  blue: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    darkBgColor: 'dark:bg-blue-900/20',
    darkTextColor: 'dark:text-blue-400',
    blurColor: 'bg-blue-50/50',
    darkBlurColor: 'dark:bg-blue-900/10',
  },
  green: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    darkBgColor: 'dark:bg-green-900/20',
    darkTextColor: 'dark:text-green-400',
    blurColor: 'bg-green-50/50',
    darkBlurColor: 'dark:bg-green-900/10',
  },
  amber: {
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    darkBgColor: 'dark:bg-amber-900/20',
    darkTextColor: 'dark:text-amber-400',
    blurColor: 'bg-amber-50/50',
    darkBlurColor: 'dark:bg-amber-900/10',
  },
  indigo: {
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    darkBgColor: 'dark:bg-indigo-900/20',
    darkTextColor: 'dark:text-indigo-400',
    blurColor: 'bg-indigo-50/50',
    darkBlurColor: 'dark:bg-indigo-900/10',
  },
  orange: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    darkBgColor: 'dark:bg-orange-900/20',
    darkTextColor: 'dark:text-orange-400',
    blurColor: 'bg-orange-50/50',
    darkBlurColor: 'dark:bg-orange-900/10',
  },
  emerald: {
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    darkBgColor: 'dark:bg-emerald-900/20',
    darkTextColor: 'dark:text-emerald-400',
    blurColor: 'bg-emerald-50/50',
    darkBlurColor: 'dark:bg-emerald-900/10',
  },
  cyan: {
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    darkBgColor: 'dark:bg-cyan-900/20',
    darkTextColor: 'dark:text-cyan-400',
    blurColor: 'bg-cyan-50/50',
    darkBlurColor: 'dark:bg-cyan-900/10',
  },
  sky: {
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-600',
    darkBgColor: 'dark:bg-sky-900/20',
    darkTextColor: 'dark:text-sky-400',
    blurColor: 'bg-sky-50/50',
    darkBlurColor: 'dark:bg-sky-900/10',
  },
};

interface KpiStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: IconType;
  color?: KpiStatCardColor;
  subtitle?: React.ReactNode;
  href?: string;
  className?: string;
}

export default function KpiStatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
  href,
  className,
}: KpiStatCardProps) {
  const colors = colorStyles[color];

  const card = (
    <div
      className={cn(
        'relative min-w-[180px] flex-1 basis-[calc(20%-16px)] overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow dark:border-gray-700 dark:bg-gray-800',
        href && 'hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            colors.bgColor,
            colors.textColor,
            colors.darkBgColor,
            colors.darkTextColor
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={cn(
          'absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full blur-2xl',
          colors.blurColor,
          colors.darkBlurColor
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block min-w-[180px] flex-1 basis-[calc(20%-16px)]">
        {card}
      </Link>
    );
  }

  return card;
}
