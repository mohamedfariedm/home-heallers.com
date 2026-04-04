'use client';

import { useState, useEffect } from 'react';
import {
  PiFileTextBold,
  PiUsersBold,
  PiCheckCircleBold,
  PiTagBold,
  PiPhoneBold,
  PiCaretDownBold,
  PiCaretUpBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';

interface KanbanStatistics {
  total: number;
  by_status: Array<{
    status?: string | null;
    count?: number;
    link?: string;
  }> | {
    new?: number;
    [key: string]: number | undefined;
  };
  clients_with_mobile_and_reservation: number;
  clients_with_mobile_and_multiple_reservations?: number;
  by_source_campaign?: Array<{
    source_campaign?: string;
    count?: number;
    link?: string;
  }>;
  by_communication_channel?: Array<{
    communication_channel?: string;
    count?: number;
    link?: string;
  }>;
  by_offer?: Array<{
    offer?: string;
    count?: number;
    link?: string;
  }>;
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

// Helper function to convert API link to frontend query params
const convertApiLinkToQueryParams = (apiLink: string | undefined): string => {
  if (!apiLink) return '';
  
  try {
    const url = new URL(apiLink);
    const params = new URLSearchParams(url.search);
    
    // Convert API query params to frontend format
    const frontendParams = new URLSearchParams();

    // Keys our filters system recognizes
    const filterableKeys = new Set([
      'name',
      'offer',
      'agent_name',
      'status',
      'reason',
      'age',
      'gender',
      'lead_source',
      'source_campaign',
      'mobile_phone',
      'booking_phone_number',
      'home_phone',
      'address_1',
      'description',
      'first_call_time',
      'last_call_result',
      'last_call_total_duration',
      'last_phone',
      'notes',
      'ads_name',
      'communication_channel',
      'specialtie_1',
      'specialtie_2',
      'specialtie_3',
    ]);
    
    params.forEach((value, key) => {
      const hasOperatorSuffix = /_(equal|not_equal|has|not_has|contain|not_contain|begin_with|not_begin_with|end_with|not_end_with)(_(and|or))?$/.test(
        key
      );

      if (hasOperatorSuffix) {
        // Already in our expected format (e.g., status_equal or status_equal_or)
        frontendParams.set(key, value);
        return;
      }

      // If key exactly matches a filterable key without operator, assume "equal"
      if (filterableKeys.has(key)) {
        frontendParams.set(`${key}_equal`, value);
        return;
      }

      // Fallback: pass through unmodified
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
        link && !isHoveringCheckbox && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
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

export default function KanbanStatisticsCards({ 
  statistics, 
  className 
}: KanbanStatisticsCardsProps) {
  const [sourceCampaignExpanded, setSourceCampaignExpanded] = useState(false);
  const [communicationChannelExpanded, setCommunicationChannelExpanded] = useState(false);
  const [offersExpanded, setOffersExpanded] = useState(false);
  
  // State to track checked source campaigns
  const [checkedSourceCampaigns, setCheckedSourceCampaigns] = useState<Set<string>>(new Set());
  
  // Get source campaigns data (before early return)
  const allSourceCampaigns = statistics?.by_source_campaign || [];
  
  // Initialize checked state for all campaigns on first render
  useEffect(() => {
    if (checkedSourceCampaigns.size === 0 && allSourceCampaigns.length > 0) {
      const initialChecked = new Set(allSourceCampaigns.map(c => c.source_campaign || ''));
      setCheckedSourceCampaigns(initialChecked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSourceCampaigns.length]);
  
  if (!statistics) return null;

  // Format status label (convert snake_case to Title Case)
  const formatStatusLabel = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle by_status - can be array or object
  let statusCardsData: Array<{ status?: string | null; count?: number; link?: string }> = [];
  
  const byStatus = statistics.by_status;
  
  if (Array.isArray(byStatus)) {
    // New format: array of objects
    statusCardsData = byStatus
      .filter((item): item is { status: string; count?: number; link?: string } => 
        item.status !== null && item.status !== ''
      )
      .sort((a, b) => (b.count || 0) - (a.count || 0)); // Sort by count descending
  } else {
    // Old format: object with status keys
    const statusObj: { [key: string]: number | undefined } = byStatus as { [key: string]: number | undefined };
    const statusKeys = Object.keys(statusObj).filter(key => key !== '');
    statusCardsData = statusKeys.map((statusKey) => ({
      status: statusKey,
      count: statusObj[statusKey] || 0,
    }));
  }

  // Row 1: Status Statistics
  const statusCards = statusCardsData.map((item) => {
    const statusKey = item.status || 'unknown';
    const colors = statusColors[statusKey] || defaultColors;
    return {
      title: formatStatusLabel(statusKey),
      value: item.count || 0,
      icon: PiCheckCircleBold,
      bgColor: colors.bg,
      textColor: colors.text,
      darkBgColor: colors.darkBg,
      darkTextColor: colors.darkText,
      blurColor: colors.blur,
      darkBlurColor: colors.darkBlur,
      link: item.link,
      compact: true,
    };
  });

  // Row 3: Clients
  const clientCards = [
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
      compact: true,
    },
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
      compact: true,
    },
    {
      title: 'Clients with Mobile & Multiple Reservations',
      value: statistics.clients_with_mobile_and_multiple_reservations || 0,
      icon: PiUsersBold,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      darkBgColor: 'dark:bg-teal-900/20',
      darkTextColor: 'dark:text-teal-400',
      blurColor: 'bg-teal-50/50',
      darkBlurColor: 'dark:bg-teal-900/10',
      compact: true,
    },
  ];

  // Row 4: Source Campaigns

  const allSourceCampaignCards = allSourceCampaigns
    .sort((a, b) => (b.count || 0) - (a.count || 0)) // Sort by count descending
    .map((campaign) => {
      const campaignKey = campaign.source_campaign || 'Unknown';
      const isChecked = checkedSourceCampaigns.has(campaignKey);
      
      return {
        title: campaignKey,
        value: campaign.count || 0,
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

  // Calculate total of checked source campaigns
  const totalSourceCampaigns = allSourceCampaignCards
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

  const SOURCE_CAMPAIGNS_PER_ROW = 6;
  const sourceCampaignCards = sourceCampaignExpanded 
    ? allSourceCampaignCards 
    : allSourceCampaignCards.slice(0, SOURCE_CAMPAIGNS_PER_ROW);

  // Row 5: Communication Channels
  const allCommunicationChannelCards = (statistics.by_communication_channel || [])
    .sort((a, b) => (b.count || 0) - (a.count || 0)) // Sort by count descending
    .map((channel) => ({
      title: channel.communication_channel || 'Unknown',
      value: channel.count || 0,
      icon: PiPhoneBold,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      darkBgColor: 'dark:bg-cyan-900/20',
      darkTextColor: 'dark:text-cyan-400',
      blurColor: 'bg-cyan-50/50',
      darkBlurColor: 'dark:bg-cyan-900/10',
      link: channel.link,
      compact: true,
    }));

  const COMMUNICATION_CHANNELS_PER_ROW = 6;
  const communicationChannelCards = communicationChannelExpanded 
    ? allCommunicationChannelCards 
    : allCommunicationChannelCards.slice(0, COMMUNICATION_CHANNELS_PER_ROW);

  // Row 6: Offers
  const allOfferCards = (statistics.by_offer || [])
    .sort((a, b) => (b.count || 0) - (a.count || 0)) // Sort by count descending
    .map((offer) => ({
      title: offer.offer || 'Unknown',
      value: offer.count || 0,
      icon: PiTagBold,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      darkBgColor: 'dark:bg-pink-900/20',
      darkTextColor: 'dark:text-pink-400',
      blurColor: 'bg-pink-50/50',
      darkBlurColor: 'dark:bg-pink-900/10',
      link: offer.link,
      compact: true,
    }));

  const OFFERS_PER_ROW = 6;
  const offerCards = offersExpanded 
    ? allOfferCards 
    : allOfferCards.slice(0, OFFERS_PER_ROW);

  const rows = [
    { title: 'Status Statistics', cards: statusCards },
    { title: 'Clients', cards: clientCards },
    { title: 'Source Campaigns', cards: sourceCampaignCards, allCards: allSourceCampaignCards, expanded: sourceCampaignExpanded, setExpanded: setSourceCampaignExpanded, perRow: SOURCE_CAMPAIGNS_PER_ROW },
    { title: 'Communication Channels', cards: communicationChannelCards, allCards: allCommunicationChannelCards, expanded: communicationChannelExpanded, setExpanded: setCommunicationChannelExpanded, perRow: COMMUNICATION_CHANNELS_PER_ROW },
    { title: 'Offers', cards: offerCards, allCards: allOfferCards, expanded: offersExpanded, setExpanded: setOffersExpanded, perRow: OFFERS_PER_ROW },
  ];

  return (
    <div className={cn('w-full space-y-6', className)}>
      {rows.map((row, rowIndex) => {
        const hasMore = row.allCards && row.allCards.length > row.perRow;
        
        return (
          <div key={rowIndex} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {row.title}
              </h4>
              {hasMore && (
                <button
                  onClick={() => row.setExpanded && row.setExpanded(!row.expanded)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {row.expanded ? (
                    <>
                      <span>Show Less</span>
                      <PiCaretUpBold className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show All ({row.allCards.length})</span>
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
