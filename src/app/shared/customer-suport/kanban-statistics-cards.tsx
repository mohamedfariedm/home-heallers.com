'use client';

import {
  PiFileTextBold,
  PiUsersBold,
  PiCheckCircleBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';

interface KanbanStatistics {
  total: number;
  by_status: {
    new?: number;
    [key: string]: number | undefined;
  };
  clients_with_mobile_and_reservation: number;
}

interface KanbanStatisticsCardsProps {
  statistics: KanbanStatistics | null | undefined;
  className?: string;
}

// Color schemes for different statuses
const statusColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string; blur: string; darkBlur: string }> = {
  new: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-400',
    blur: 'bg-blue-50/50',
    darkBlur: 'dark:bg-blue-900/10',
  },
  negotiation: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    darkBg: 'dark:bg-yellow-900/20',
    darkText: 'dark:text-yellow-400',
    blur: 'bg-yellow-50/50',
    darkBlur: 'dark:bg-yellow-900/10',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    darkBg: 'dark:bg-green-900/20',
    darkText: 'dark:text-green-400',
    blur: 'bg-green-50/50',
    darkBlur: 'dark:bg-green-900/10',
  },
  possible: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    darkBg: 'dark:bg-purple-900/20',
    darkText: 'dark:text-purple-400',
    blur: 'bg-purple-50/50',
    darkBlur: 'dark:bg-purple-900/10',
  },
  failed: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    darkBg: 'dark:bg-red-900/20',
    darkText: 'dark:text-red-400',
    blur: 'bg-red-50/50',
    darkBlur: 'dark:bg-red-900/10',
  },
  closed: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    darkBg: 'dark:bg-gray-900/20',
    darkText: 'dark:text-gray-400',
    blur: 'bg-gray-50/50',
    darkBlur: 'dark:bg-gray-900/10',
  },
  follow_up: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    darkBg: 'dark:bg-cyan-900/20',
    darkText: 'dark:text-cyan-400',
    blur: 'bg-cyan-50/50',
    darkBlur: 'dark:bg-cyan-900/10',
  },
};

// Default color scheme for unknown statuses
const defaultColors = {
  bg: 'bg-slate-50',
  text: 'text-slate-600',
  darkBg: 'dark:bg-slate-900/20',
  darkText: 'dark:text-slate-400',
  blur: 'bg-slate-50/50',
  darkBlur: 'dark:bg-slate-900/10',
};

export default function KanbanStatisticsCards({ 
  statistics, 
  className 
}: KanbanStatisticsCardsProps) {
  if (!statistics) return null;

  // Format status label (convert snake_case to Title Case)
  const formatStatusLabel = (status: string): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get all status keys except empty string
  const statusKeys = Object.keys(statistics.by_status).filter(key => key !== '');

  // Create cards for each status
  const statusCards = statusKeys.map((statusKey) => {
    const colors = statusColors[statusKey] || defaultColors;
    return {
      title: formatStatusLabel(statusKey),
      value: statistics.by_status[statusKey] || 0,
      icon: PiCheckCircleBold,
      bgColor: colors.bg,
      textColor: colors.text,
      darkBgColor: colors.darkBg,
      darkTextColor: colors.darkText,
      blurColor: colors.blur,
      darkBlurColor: colors.darkBlur,
    };
  });

  const cards = [
    {
      title: 'Total Customer Supports',
      value: statistics.total || 0,
      icon: PiFileTextBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
    },
    ...statusCards,
    {
      title: 'Clients with Mobile & Reservation',
      value: statistics.clients_with_mobile_and_reservation || 0,
      icon: PiUsersBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
    },
  ];

  return (
    <div className={cn('flex w-full overflow-x-auto pb-4 gap-5 mb-6', className)}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="min-w-[280px] flex-1 relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-lg',
                card.bgColor,
                card.textColor,
                card.darkBgColor,
                card.darkTextColor
              )}
            >
              <card.icon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {card.title}
            </p>
            <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
              {card.value}
            </p>
          </div>

          <div
            className={cn(
              'absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full blur-2xl',
              card.blurColor,
              card.darkBlurColor
            )}
          />
        </div>
      ))}
    </div>
  );
}
