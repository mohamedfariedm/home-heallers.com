'use client';

import { useState } from 'react';
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
  | 'sky'
  | 'red'
  | 'pink'
  | 'yellow'
  | 'slate'
  | 'violet'
  | 'teal'
  | 'lime'
  | 'fuchsia';

export type KpiStatCardTone = {
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
  blurColor: string;
  darkBlurColor: string;
};

/** Consistent equal-width card grid used across dashboard pages. */
export const KPI_STAT_GRID_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export const KPI_STAT_GRID_3_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

export const KPI_STAT_GRID_5_CLASS =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';

const colorStyles: Record<KpiStatCardColor, KpiStatCardTone> = {
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
  red: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    darkBgColor: 'dark:bg-red-900/20',
    darkTextColor: 'dark:text-red-400',
    blurColor: 'bg-red-50/50',
    darkBlurColor: 'dark:bg-red-900/10',
  },
  pink: {
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    darkBgColor: 'dark:bg-pink-900/20',
    darkTextColor: 'dark:text-pink-400',
    blurColor: 'bg-pink-50/50',
    darkBlurColor: 'dark:bg-pink-900/10',
  },
  yellow: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    darkBgColor: 'dark:bg-yellow-900/20',
    darkTextColor: 'dark:text-yellow-400',
    blurColor: 'bg-yellow-50/50',
    darkBlurColor: 'dark:bg-yellow-900/10',
  },
  slate: {
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    darkBgColor: 'dark:bg-slate-900/20',
    darkTextColor: 'dark:text-slate-400',
    blurColor: 'bg-slate-50/50',
    darkBlurColor: 'dark:bg-slate-900/10',
  },
  violet: {
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    darkBgColor: 'dark:bg-violet-900/20',
    darkTextColor: 'dark:text-violet-400',
    blurColor: 'bg-violet-50/50',
    darkBlurColor: 'dark:bg-violet-900/10',
  },
  teal: {
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    darkBgColor: 'dark:bg-teal-900/20',
    darkTextColor: 'dark:text-teal-400',
    blurColor: 'bg-teal-50/50',
    darkBlurColor: 'dark:bg-teal-900/10',
  },
  lime: {
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-600',
    darkBgColor: 'dark:bg-lime-900/20',
    darkTextColor: 'dark:text-lime-400',
    blurColor: 'bg-lime-50/50',
    darkBlurColor: 'dark:bg-lime-900/10',
  },
  fuchsia: {
    bgColor: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-600',
    darkBgColor: 'dark:bg-fuchsia-900/20',
    darkTextColor: 'dark:text-fuchsia-400',
    blurColor: 'bg-fuchsia-50/50',
    darkBlurColor: 'dark:bg-fuchsia-900/10',
  },
};

interface KpiStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: IconType;
  color?: KpiStatCardColor;
  /** Override named color with explicit Tailwind tone classes. */
  tone?: KpiStatCardTone;
  subtitle?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  checkbox?: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  };
}

export default function KpiStatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  tone,
  subtitle,
  href,
  onClick,
  selected,
  className,
  badge,
  footer,
  checkbox,
}: KpiStatCardProps) {
  const colors = tone ?? colorStyles[color];
  const [isHoveringCheckbox, setIsHoveringCheckbox] = useState(false);
  const interactive = Boolean(href || onClick);

  const handleClick = (event: React.MouseEvent) => {
    if (
      checkbox &&
      ((event.target as HTMLElement).closest('input[type="checkbox"]') ||
        (event.target as HTMLElement).closest('.checkbox-area'))
    ) {
      return;
    }
    if (isHoveringCheckbox) return;
    onClick?.();
  };

  const card = (
    <div
      role={onClick && !href ? 'button' : undefined}
      tabIndex={onClick && !href ? 0 : undefined}
      onClick={onClick && !href ? handleClick : undefined}
      onKeyDown={
        onClick && !href
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      onMouseLeave={() => setIsHoveringCheckbox(false)}
      className={cn(
        'group relative flex h-full min-h-[158px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 dark:border-gray-700 dark:bg-gray-800',
        'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-600',
        interactive && !isHoveringCheckbox && 'cursor-pointer',
        selected && 'border-blue-500 ring-2 ring-blue-500/20',
        className
      )}
    >
      {checkbox ? (
        <div
          className="checkbox-area absolute end-3 top-3 z-20 cursor-default p-1"
          onMouseEnter={() => setIsHoveringCheckbox(true)}
          onMouseLeave={() => setIsHoveringCheckbox(false)}
        >
          <input
            type="checkbox"
            checked={checkbox.checked}
            onChange={(event) => {
              event.stopPropagation();
              checkbox.onChange(event.target.checked);
            }}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105',
            colors.bgColor,
            colors.textColor,
            colors.darkBgColor,
            colors.darkTextColor
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {badge ? <div className="shrink-0 pe-5">{badge}</div> : null}
      </div>

      <div className="relative z-10 mt-4 flex min-h-0 flex-1 flex-col">
        <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white xl:text-3xl">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-auto line-clamp-2 min-h-[2rem] pt-2 text-xs leading-4 text-gray-500 dark:text-gray-400">
          {subtitle || '\u00A0'}
        </p>
        {footer ? <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">{footer}</div> : null}
      </div>

      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-200 group-hover:opacity-80',
          colors.blurColor,
          colors.darkBlurColor
        )}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full min-h-[158px]">
        {card}
      </Link>
    );
  }

  return card;
}
