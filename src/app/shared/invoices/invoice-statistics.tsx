'use client';

import {
  PiCheckCircleBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';

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

// Color schemes for different statuses
const statusColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string; blur: string; darkBlur: string }> = {
  'قيد الانتظار': {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    darkBg: 'dark:bg-yellow-900/20',
    darkText: 'dark:text-yellow-400',
    blur: 'bg-yellow-50/50',
    darkBlur: 'dark:bg-yellow-900/10',
  },
  'موافق عليه': {
    bg: 'bg-green-50',
    text: 'text-green-600',
    darkBg: 'dark:bg-green-900/20',
    darkText: 'dark:text-green-400',
    blur: 'bg-green-50/50',
    darkBlur: 'dark:bg-green-900/10',
  },
  'ملغاة': {
    bg: 'bg-red-50',
    text: 'text-red-600',
    darkBg: 'dark:bg-red-900/20',
    darkText: 'dark:text-red-400',
    blur: 'bg-red-50/50',
    darkBlur: 'dark:bg-red-900/10',
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

// Tax percentage colors
const taxPercentageColors: Record<string, { bg: string; text: string; darkBg: string; darkText: string; blur: string; darkBlur: string }> = {
  maafah: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    darkBg: 'dark:bg-blue-900/20',
    darkText: 'dark:text-blue-400',
    blur: 'bg-blue-50/50',
    darkBlur: 'dark:bg-blue-900/10',
  },
  zero: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    darkBg: 'dark:bg-gray-900/20',
    darkText: 'dark:text-gray-400',
    blur: 'bg-gray-50/50',
    darkBlur: 'dark:bg-gray-900/10',
  },
  fifteen_percent: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    darkBg: 'dark:bg-purple-900/20',
    darkText: 'dark:text-purple-400',
    blur: 'bg-purple-50/50',
    darkBlur: 'dark:bg-purple-900/10',
  },
};

// Helper function to convert API link to frontend query params
const convertApiLinkToQueryParams = (apiLink: string | undefined): string => {
  if (!apiLink) return '';
  
  try {
    const url = new URL(apiLink);
    const params = new URLSearchParams(url.search);
    
    // Convert API query params to frontend format
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

// Status Card with Tax Breakdown component
const StatusCardWithBreakdown = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor, 
  textColor, 
  darkBgColor, 
  darkTextColor, 
  blurColor, 
  darkBlurColor,
  link,
  taxBreakdown
}: {
  title: string;
  value: number | string;
  icon: any;
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
  blurColor: string;
  darkBlurColor: string;
  link?: string;
  taxBreakdown?: TaxPercentageBreakdown;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleClick = () => {
    if (link) {
      const queryParams = convertApiLinkToQueryParams(link);
      const url = queryParams ? `${pathname}?${queryParams}` : pathname;
      router.push(url);
    }
  };

  const handleTaxClick = (e: React.MouseEvent, taxLink?: string) => {
    e.stopPropagation(); // Prevent card click
    if (taxLink) {
      const queryParams = convertApiLinkToQueryParams(taxLink);
      const url = queryParams ? `${pathname}?${queryParams}` : pathname;
      router.push(url);
    }
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800",
        "min-w-[200px] flex-1 p-5",
        link && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      {/* Header with icon and title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center justify-center rounded-lg h-10 w-10',
              bgColor,
              textColor,
              darkBgColor,
              darkTextColor
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </p>
        </div>
      </div>

      {/* Total count */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total</p>
      </div>

      {/* Tax Breakdown */}
      {taxBreakdown && (
        <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Tax Breakdown:</p>
          
          {taxBreakdown.maafah && taxBreakdown.maafah.count !== undefined && (
            <div 
              className={cn(
                "flex items-center justify-between p-2 rounded-lg text-xs",
                taxBreakdown.maafah.link && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50",
                taxPercentageColors.maafah.bg,
                taxPercentageColors.maafah.darkBg
              )}
              onClick={(e) => handleTaxClick(e, taxBreakdown.maafah?.link)}
            >
              <span className={cn("font-medium", taxPercentageColors.maafah.text, taxPercentageColors.maafah.darkText)}>
                معافاة
              </span>
              <span className={cn("font-bold", taxPercentageColors.maafah.text, taxPercentageColors.maafah.darkText)}>
                {taxBreakdown.maafah.count.toLocaleString()}
              </span>
            </div>
          )}
          
          {taxBreakdown.zero && taxBreakdown.zero.count !== undefined && (
            <div 
              className={cn(
                "flex items-center justify-between p-2 rounded-lg text-xs",
                taxBreakdown.zero.link && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50",
                taxPercentageColors.zero.bg,
                taxPercentageColors.zero.darkBg
              )}
              onClick={(e) => handleTaxClick(e, taxBreakdown.zero?.link)}
            >
              <span className={cn("font-medium", taxPercentageColors.zero.text, taxPercentageColors.zero.darkText)}>
                0%
              </span>
              <span className={cn("font-bold", taxPercentageColors.zero.text, taxPercentageColors.zero.darkText)}>
                {taxBreakdown.zero.count.toLocaleString()}
              </span>
            </div>
          )}
          
          {taxBreakdown.fifteen_percent && taxBreakdown.fifteen_percent.count !== undefined && (
            <div 
              className={cn(
                "flex items-center justify-between p-2 rounded-lg text-xs",
                taxBreakdown.fifteen_percent.link && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50",
                taxPercentageColors.fifteen_percent.bg,
                taxPercentageColors.fifteen_percent.darkBg
              )}
              onClick={(e) => handleTaxClick(e, taxBreakdown.fifteen_percent?.link)}
            >
              <span className={cn("font-medium", taxPercentageColors.fifteen_percent.text, taxPercentageColors.fifteen_percent.darkText)}>
                15%
              </span>
              <span className={cn("font-bold", taxPercentageColors.fifteen_percent.text, taxPercentageColors.fifteen_percent.darkText)}>
                {taxBreakdown.fifteen_percent.count.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Blur effect */}
      <div
        className={cn(
          'absolute -right-4 -top-4 -z-10 rounded-full blur-2xl h-24 w-24',
          blurColor,
          darkBlurColor
        )}
      />
    </div>
  );
};

export default function InvoiceStatistics({ 
  statistics, 
  className 
}: InvoiceStatisticsProps) {
  if (!statistics || !statistics.by_status || statistics.by_status.length === 0) return null;

  // Status Statistics with Tax Breakdown
  const statusCards = statistics.by_status
    .sort((a, b) => (b.total_count || 0) - (a.total_count || 0)) // Sort by total_count descending
    .map((item) => {
      const statusKey = item.status || 'unknown';
      const colors = statusColors[statusKey] || defaultColors;
      return {
        title: statusKey,
        value: item.total_count || 0,
        icon: PiCheckCircleBold,
        bgColor: colors.bg,
        textColor: colors.text,
        darkBgColor: colors.darkBg,
        darkTextColor: colors.darkText,
        blurColor: colors.blur,
        darkBlurColor: colors.darkBlur,
        link: item.link,
        taxBreakdown: item.tax_percentage_breakdown,
      };
    });

  return (
    <div className={cn('w-full', className)}>
      {/* Invoice Status Statistics */}
      <div className="space-y-3">
        <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Invoice Status Statistics
        </h4>
        <div className="flex flex-wrap w-full gap-3">
          {statusCards.map((card: any, cardIndex: number) => (
            <StatusCardWithBreakdown key={cardIndex} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
}
