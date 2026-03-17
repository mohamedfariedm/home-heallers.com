'use client';

import { useState, useEffect } from 'react';
import {
  PiCalendarCheckBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiCheckCircleBold,
  PiXCircleBold,
  PiClockBold,
  PiHourglassBold,
  PiCheckBold,
  PiWarningBold,
  PiCurrencyDollarBold,
  PiMoneyBold,
  PiCreditCardBold,
  PiUsersBold,
  PiChartBarBold,
  PiTagBold,
  PiArrowRightBold,
  PiCaretDownBold,
  PiCaretUpBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';

interface StatusCount {
  count?: number;
  sessions_count?: number;
  link?: string;
}

interface ReservationStatistics {
  by_status?: {
    reviewing?: StatusCount | number;
    waitconfirm?: StatusCount | number;
    confirmed?: StatusCount | number;
    canceled?: StatusCount | number;
    completed?: StatusCount | number;
    failed?: StatusCount | number;
  };
  seen_count?: number;
  unseen_count?: number;
  total_count?: number;
  paid_statistics?: {
    count?: number;
    total_amount?: number;
    link?: string;
  };
  unpaid_statistics?: {
    count?: number;
    total_amount?: number;
    link?: string;
  };
  remaining_payment_statistics?: {
    count?: number;
    total_remaining?: number;
    link?: string;
  };
  by_source_campaign?: Array<{
    source_campaign?: string;
    reservations_count?: number;
    sessions_count?: number;
    link?: string;
  }>;
  by_service?: Array<{
    service_id?: number;
    service_name_ar?: string;
    reservations_count?: number;
    sessions_count?: number;
    link?: string;
  }>;
  customers?: {
    total_unique_customers?: {
      count?: number;
      link?: string;
    };
    multiple_bookings?: {
      customers_count?: number;
      total_reservations?: number;
      total_sessions?: number;
      reservations_link?: string;
      clients_link?: string;
    };
  };
}

interface ReservationStatisticsProps {
  statistics?: ReservationStatistics | null;
  className?: string;
}

// Helper function to get count from status (handles both old and new format)
const getStatusCount = (status: StatusCount | number | undefined): number => {
  if (!status) return 0;
  if (typeof status === 'number') return status;
  return status.count || 0;
};

// Helper function to get sessions count from status
const getStatusSessionsCount = (status: StatusCount | number | undefined): number => {
  if (!status) return 0;
  if (typeof status === 'number') return 0;
  return status.sessions_count || 0;
};

// Helper function to get link from status
const getStatusLink = (status: StatusCount | number | undefined): string | undefined => {
  if (!status) return undefined;
  if (typeof status === 'number') return undefined;
  return status.link;
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
      // Convert API format to frontend format
      // e.g., status_equal=1 -> status=1
      // e.g., paid_equal=1 -> paid=1
      // e.g., source_campaign_equal=google -> source_campaign=google
      
      
        frontendParams.set(key, value);
      
    });
    
    return frontendParams.toString();
  } catch (error) {
    console.error('Error converting API link:', error);
    return '';
  }
};

// Card component
const StatCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon, 
  bgColor, 
  textColor, 
  darkBgColor, 
  darkTextColor, 
  blurColor, 
  darkBlurColor,
  link,
  onClick,
  compact = false,
  showCheckbox = false,
  checked = false,
  onCheckboxChange
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: any;
  bgColor: string;
  textColor: string;
  darkBgColor: string;
  darkTextColor: string;
  blurColor: string;
  darkBlurColor: string;
  link?: string;
  onClick?: () => void;
  compact?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isHoveringCheckbox, setIsHoveringCheckbox] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or checkbox area
    if (showCheckbox && (
      (e.target as HTMLElement).closest('input[type="checkbox"]') ||
      (e.target as HTMLElement).closest('.checkbox-area')
    )) {
      return;
    }
    if (link) {
      const queryParams = convertApiLinkToQueryParams(link);
      const url = queryParams ? `${pathname}?${queryParams}` : pathname;
      router.push(url);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (onCheckboxChange) {
      onCheckboxChange(e.target.checked);
    }
  };

  const handleCheckboxAreaMouseEnter = () => {
    setIsHoveringCheckbox(true);
  };

  const handleCheckboxAreaMouseLeave = () => {
    setIsHoveringCheckbox(false);
  };

  const handleCardMouseLeave = () => {
    setIsHoveringCheckbox(false);
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800",
        compact ? "min-w-[120px] flex-1 p-4" : "min-w-[200px] flex-1 p-6",
        (link || onClick) && !isHoveringCheckbox && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
      )}
      onClick={handleClick}
      onMouseLeave={handleCardMouseLeave}
    >
      {showCheckbox && (
        <div 
          className="checkbox-area absolute top-2 right-2 z-10 p-1 -m-1 cursor-default"
          onMouseEnter={handleCheckboxAreaMouseEnter}
          onMouseLeave={handleCheckboxAreaMouseLeave}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
          />
        </div>
      )}
      <div className="flex items-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-lg',
            compact ? 'h-8 w-8' : 'h-12 w-12',
            bgColor,
            textColor,
            darkBgColor,
            darkTextColor
          )}
        >
          <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} />
        </div>
      </div>

      <div className={compact ? "mt-2" : "mt-4"}>
        <p className={compact ? "text-xs font-medium text-gray-500 dark:text-gray-400" : "text-sm font-medium text-gray-500 dark:text-gray-400"}>
          {title}
        </p>
        <p className={cn(
          "mt-1 font-bold text-gray-900 dark:text-white",
          compact ? "text-xl" : "text-3xl"
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className={compact ? "mt-0.5 text-xs text-gray-500 dark:text-gray-400" : "mt-1 text-sm text-gray-500 dark:text-gray-400"}>
            {subtitle}
          </p>
        )}
      </div>

      <div
        className={cn(
          'absolute -right-4 -top-4 -z-10 rounded-full blur-2xl',
          compact ? 'h-16 w-16' : 'h-24 w-24',
          blurColor,
          darkBlurColor
        )}
      />
    </div>
  );
};

export default function ReservationStatistics({ 
  statistics, 
  className 
}: ReservationStatisticsProps) {
  const [servicesExpanded, setServicesExpanded] = useState(false);
  // State to track checked source campaigns
  const [checkedSourceCampaigns, setCheckedSourceCampaigns] = useState<Set<string>>(new Set());
  const stats = statistics || {};

  // Calculate total sessions from all statuses
  const totalSessions = 
    getStatusSessionsCount(stats.by_status?.reviewing) +
    getStatusSessionsCount(stats.by_status?.waitconfirm) +
    getStatusSessionsCount(stats.by_status?.confirmed) +
    getStatusSessionsCount(stats.by_status?.completed) +
    getStatusSessionsCount(stats.by_status?.canceled) +
    getStatusSessionsCount(stats.by_status?.failed);

  // Row 1: Reservation by Status (with Reviewing and Total Sessions)
  const reservationByStatusCards = [
    {
      title: 'Total Reservations',
      value: stats.total_count || 0,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      compact: true,
    },
    {
      title: 'Total Sessions',
      value: totalSessions,
      subtitle: 'Across all statuses',
      icon: PiCalendarCheckBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      compact: true,
    },
    {
      title: 'Reviewing',
      value: getStatusCount(stats.by_status?.reviewing),
      subtitle: `${getStatusSessionsCount(stats.by_status?.reviewing)} sessions`,
      icon: PiHourglassBold,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      blurColor: 'bg-amber-50/50',
      darkBlurColor: 'dark:bg-amber-900/10',
      link: getStatusLink(stats.by_status?.reviewing),
      compact: true,
    },
    {
      title: 'Wait Confirm',
      value: getStatusCount(stats.by_status?.waitconfirm),
      subtitle: `${getStatusSessionsCount(stats.by_status?.waitconfirm)} sessions`,
      icon: PiClockBold,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      darkBgColor: 'dark:bg-yellow-900/20',
      darkTextColor: 'dark:text-yellow-400',
      blurColor: 'bg-yellow-50/50',
      darkBlurColor: 'dark:bg-yellow-900/10',
      link: getStatusLink(stats.by_status?.waitconfirm),
      compact: true,
    },
    {
      title: 'Confirmed',
      value: getStatusCount(stats.by_status?.confirmed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.confirmed)} sessions`,
      icon: PiCheckCircleBold,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      blurColor: 'bg-green-50/50',
      darkBlurColor: 'dark:bg-green-900/10',
      link: getStatusLink(stats.by_status?.confirmed),
      compact: true,
    },
    {
      title: 'Completed',
      value: getStatusCount(stats.by_status?.completed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.completed)} sessions`,
      icon: PiCheckBold,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      darkBgColor: 'dark:bg-emerald-900/20',
      darkTextColor: 'dark:text-emerald-400',
      blurColor: 'bg-emerald-50/50',
      darkBlurColor: 'dark:bg-emerald-900/10',
      link: getStatusLink(stats.by_status?.completed),
      compact: true,
    },
    {
      title: 'Canceled',
      value: getStatusCount(stats.by_status?.canceled),
      subtitle: `${getStatusSessionsCount(stats.by_status?.canceled)} sessions`,
      icon: PiXCircleBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
      link: getStatusLink(stats.by_status?.canceled),
      compact: true,
    },
    {
      title: 'Failed',
      value: getStatusCount(stats.by_status?.failed),
      subtitle: `${getStatusSessionsCount(stats.by_status?.failed)} sessions`,
      icon: PiWarningBold,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      darkBgColor: 'dark:bg-orange-900/20',
      darkTextColor: 'dark:text-orange-400',
      blurColor: 'bg-orange-50/50',
      darkBlurColor: 'dark:bg-orange-900/10',
      link: getStatusLink(stats.by_status?.failed),
      compact: true,
    },
    
  ];

  // Row 2: Review (Paid, Unpaid, Seen, Unseen, Remaining Payment)
  const reviewCards = [
    {
      title: 'Paid',
      value: stats.paid_statistics?.count || 0,
      subtitle: `${(stats.paid_statistics?.total_amount || 0).toLocaleString()} SAR`,
      icon: PiCheckCircleBold,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      blurColor: 'bg-green-50/50',
      darkBlurColor: 'dark:bg-green-900/10',
      link: stats.paid_statistics?.link,
      compact: true,
    },
    {
      title: 'Unpaid',
      value: stats.unpaid_statistics?.count || 0,
      subtitle: `${(stats.unpaid_statistics?.total_amount || 0).toLocaleString()} SAR`,
      icon: PiXCircleBold,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      darkBgColor: 'dark:bg-red-900/20',
      darkTextColor: 'dark:text-red-400',
      blurColor: 'bg-red-50/50',
      darkBlurColor: 'dark:bg-red-900/10',
      link: stats.unpaid_statistics?.link,
      compact: true,
    },
    {
      title: 'Remaining Payment',
      value: stats.remaining_payment_statistics?.count || 0,
      subtitle: `${(stats.remaining_payment_statistics?.total_remaining || 0).toLocaleString()} SAR`,
      icon: PiCreditCardBold,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      darkBgColor: 'dark:bg-yellow-900/20',
      darkTextColor: 'dark:text-yellow-400',
      blurColor: 'bg-yellow-50/50',
      darkBlurColor: 'dark:bg-yellow-900/10',
      link: stats.remaining_payment_statistics?.link,
      compact: true,
    },
    {
      title: 'Seen',
      value: stats.seen_count || 0,
      icon: PiEyeBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
      compact: true,
    },
    {
      title: 'Unseen',
      value: stats.unseen_count || 0,
      icon: PiEyeSlashBold,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      darkBgColor: 'dark:bg-gray-900/20',
      darkTextColor: 'dark:text-gray-400',
      blurColor: 'bg-gray-50/50',
      darkBlurColor: 'dark:bg-gray-900/10',
      compact: true,
    },
    
  ];

  // Row 3: Source Campaigns
  const allSourceCampaigns = stats.by_source_campaign || [];
  
  // Initialize checked state for all campaigns on first render
  useEffect(() => {
    if (checkedSourceCampaigns.size === 0 && allSourceCampaigns.length > 0) {
      const initialChecked = new Set(allSourceCampaigns.map(c => c.source_campaign || ''));
      setCheckedSourceCampaigns(initialChecked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSourceCampaigns.length]);

  const sourceCampaignCards = allSourceCampaigns.map((campaign) => {
    const campaignKey = campaign.source_campaign || 'Unknown';
    const isChecked = checkedSourceCampaigns.has(campaignKey);
    
    return {
      title: campaignKey,
      value: campaign.reservations_count || 0,
      subtitle: `${campaign.sessions_count || 0} sessions`,
      icon: PiTagBold,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      darkBgColor: 'dark:bg-purple-900/20',
      darkTextColor: 'dark:text-purple-400',
      blurColor: 'bg-purple-50/50',
      darkBlurColor: 'dark:bg-purple-900/10',
      link: campaign.link,
      compact: true,
      showCheckbox: true,
      checked: isChecked,
      campaignKey: campaignKey,
    };
  });

  // Calculate total of checked source campaigns (reservations count)
  const totalSourceCampaigns = sourceCampaignCards
    .filter(card => card.checked)
    .reduce((sum, card) => sum + (typeof card.value === 'number' ? card.value : 0), 0);

  // Total Source Campaigns card
  const totalSourceCampaignCard = {
    title: 'Total Source Campaigns',
    value: totalSourceCampaigns,
    icon: PiTagBold,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    darkBgColor: 'dark:bg-purple-900/30',
    darkTextColor: 'dark:text-purple-300',
    blurColor: 'bg-purple-100/50',
    darkBlurColor: 'dark:bg-purple-900/15',
    compact: true,
  };

  const handleSourceCampaignCheckboxChange = (campaignKey: string, checked: boolean) => {
    setCheckedSourceCampaigns(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignKey);
      } else {
        newSet.delete(campaignKey);
      }
      return newSet;
    });
  };

  // Row 3: Services
  // Sort services by sessions_count in descending order (greater to smaller)
  const sortedServices = [...(stats.by_service || [])].sort((a, b) => {
    const aSessions = a.sessions_count || 0;
    const bSessions = b.sessions_count || 0;
    return bSessions - aSessions; // Descending order
  });
  
  const allServiceCards = sortedServices.map((service) => ({
    title: service.service_name_ar || `Service ${service.service_id}`,
    value: `${service.reservations_count || 0}`,
    subtitle: `${service.sessions_count || 0} sessions`,
    icon: PiChartBarBold,
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    darkBgColor: 'dark:bg-cyan-900/20',
    darkTextColor: 'dark:text-cyan-400',
    blurColor: 'bg-cyan-50/50',
    darkBlurColor: 'dark:bg-cyan-900/10',
    link: service.link,
    compact: true,
  }));
  
  // Show only first 6 services when collapsed
  const SERVICES_PER_ROW = 6;
  const serviceCards = servicesExpanded 
    ? allServiceCards 
    : allServiceCards.slice(0, SERVICES_PER_ROW);

  // Row 4: Clients
  const totalUniqueCustomersValue: number = Number(stats.customers?.total_unique_customers?.count ?? 0);
    
  const clientCards = [
    {
      title: 'Total Unique Customers',
      value: totalUniqueCustomersValue,
      icon: PiUsersBold,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      blurColor: 'bg-blue-50/50',
      darkBlurColor: 'dark:bg-blue-900/10',
      link: stats.customers?.total_unique_customers?.link,
      compact: true,
    },
    {
      title: 'Multiple Bookings',
      value: stats.customers?.multiple_bookings?.customers_count || 0,
      subtitle: `${stats.customers?.multiple_bookings?.total_reservations || 0} reservations, ${stats.customers?.multiple_bookings?.total_sessions || 0} sessions`,
      icon: PiCalendarCheckBold,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      darkBgColor: 'dark:bg-indigo-900/20',
      darkTextColor: 'dark:text-indigo-400',
      blurColor: 'bg-indigo-50/50',
      darkBlurColor: 'dark:bg-indigo-900/10',
      link: stats.customers?.multiple_bookings?.reservations_link,
      compact: true,
    },
  ];

  const rows = [
    { title: 'Reservation by Status', cards: reservationByStatusCards },
    { title: 'Revenue', cards: reviewCards },
    { title: 'Source Campaigns', cards: sourceCampaignCards },
    { title: 'Services', cards: serviceCards },
    { title: 'Clients', cards: clientCards },
  ];

  const router = useRouter();
  const pathname = usePathname();

  const handleViewAll = () => {
    // Navigate to reservations page without filters
    router.push(pathname);
    // Scroll to table after a short delay
    setTimeout(() => {
      const tableElement = document.querySelector('[data-table="reservations"]');
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {rows.map((row, rowIndex) => {
        const isServicesRow = row.title === 'Services';
        const hasMoreServices = isServicesRow && allServiceCards.length > SERVICES_PER_ROW;
        
        return (
          <div key={rowIndex} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {row.title}
              </h4>
              {isServicesRow && hasMoreServices && (
                <button
                  onClick={() => setServicesExpanded(!servicesExpanded)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {servicesExpanded ? (
                    <>
                      <span>Show Less</span>
                      <PiCaretUpBold className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show All ({allServiceCards.length})</span>
                      <PiCaretDownBold className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex flex-wrap w-full gap-3">
              {row.title === 'Source Campaigns' && (
                <StatCard key="total-source-campaigns" {...totalSourceCampaignCard} />
              )}
              {row.cards.map((card: any, cardIndex: number) => (
                <StatCard 
                  key={cardIndex} 
                  {...card}
                  onCheckboxChange={card.campaignKey ? (checked: boolean) => handleSourceCampaignCheckboxChange(card.campaignKey, checked) : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
