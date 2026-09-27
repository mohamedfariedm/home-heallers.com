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
  PiChartLineUpBold,
  PiListChecksBold,
  PiMapPinBold,
  PiBuildingsBold,
  PiArrowsClockwiseBold,
  PiChatCircleBold,
  PiWarningBold,
  PiClockBold,
  PiUserBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useRouter, usePathname } from 'next/navigation';
import type { CustomerSupportStatistics } from '@/types/customer-support-statistics';
import { KANBAN_FILTERABLE_COLUMNS } from './kanban-filter-columns';
import {
  formatPercent,
  getStatusCountFromStats,
  sumUnknownSourceCount,
  toPercent,
  toneColors,
  toneForFailedRate,
  toneForLeadQuality,
  toneForSuccessRate,
  toneForSupportToReservation,
  toneForUnknownSource,
} from '@/utils/dashboard-metric-helpers';
import { formatStatusReasonLabel } from '@/config/dashboard-enums';

interface KanbanStatistics extends Omit<CustomerSupportStatistics, 'by_status'> {
  by_status: CustomerSupportStatistics['by_status'] | {
    new?: number;
    [key: string]: number | undefined;
  };
}

type StatisticsCard = {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: any;
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
  campaignKey?: string;
};

type StatisticsRow = {
  title: string;
  cards: StatisticsCard[];
  allCards?: StatisticsCard[];
  expanded?: boolean;
  setExpanded?: (value: boolean) => void;
  perRow?: number;
};

interface KanbanStatisticsCardsProps {
  statistics: KanbanStatistics | null | undefined;
  className?: string;
  /** Ensures filter links stay scoped to inbound (operation) or outbound (marketing). */
  supportType?: 'marketing' | 'operation';
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
  unset: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    darkBg: 'dark:bg-slate-900/20',
    darkText: 'dark:text-slate-400',
    blur: 'bg-slate-50/50',
    darkBlur: 'dark:bg-slate-900/10',
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
    const filterableKeys = new Set<string>(KANBAN_FILTERABLE_COLUMNS);
    
    params.forEach((value, key) => {
      const hasOperatorSuffix = /_(equal|not_equal|has|not_has|contain|not_contain|begin_with|not_begin_with|end_with|not_end_with)(_(and|or))?$/.test(
        key
      );

      if (hasOperatorSuffix) {
        // Already in our expected format (e.g., status_equal or status_equal_or)
        frontendParams.set(key, value);
        return;
      }

      // Legacy by_status null row uses bare `status=` which is not a real filter.
      // Prefer Backend's status_equal=null (guide §6).
      if (key === 'status' && (value === '' || value == null || value === 'null')) {
        frontendParams.set('status_equal', 'null');
        return;
      }

      // If key exactly matches a filterable key without operator, assume "equal"
      if (filterableKeys.has(key)) {
        frontendParams.set(`${key}_equal`, value === '' ? 'null' : value);
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
  onCheckboxChange,
  supportType,
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
  supportType?: 'marketing' | 'operation';
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
      const frontendParams = new URLSearchParams(queryParams);
      if (supportType) {
        frontendParams.set('type', supportType);
      }
      frontendParams.set('page', '1');
      const url = `${pathname}?${frontendParams.toString()}`;
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
  className,
  supportType,
}: KanbanStatisticsCardsProps) {
  const [sourceCampaignExpanded, setSourceCampaignExpanded] = useState(false);
  const [leadQualityCampaignExpanded, setLeadQualityCampaignExpanded] = useState(false);
  const [qualificationExpanded, setQualificationExpanded] = useState(false);
  const [communicationChannelExpanded, setCommunicationChannelExpanded] = useState(false);
  const [offersExpanded, setOffersExpanded] = useState(false);
  const [cityExpanded, setCityExpanded] = useState(false);
  const [stateExpanded, setStateExpanded] = useState(false);
  const [reworkExpanded, setReworkExpanded] = useState(false);
  const [communicationTimesExpanded, setCommunicationTimesExpanded] =
    useState(false);
  
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
    if (!status) return 'No Status';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle by_status - can be array or object
  let statusCardsData: Array<{ status?: string | null; count?: number; link?: string }> = [];
  
  const byStatus = statistics.by_status;
  
  if (Array.isArray(byStatus)) {
    // Include null-status row; convertApiLinkToQueryParams remaps legacy status= → status_equal=null
    statusCardsData = [...byStatus].sort(
      (a, b) => (b.count || 0) - (a.count || 0)
    );
  } else {
    // Old format: object with status keys
    const statusObj: { [key: string]: number | undefined } = byStatus as { [key: string]: number | undefined };
    const statusKeys = Object.keys(statusObj).filter(key => key !== '');
    statusCardsData = statusKeys.map((statusKey) => ({
      status: statusKey,
      count: statusObj[statusKey] || 0,
    }));
  }

  // Row: Status Statistics
  const statusCards = statusCardsData.map((item) => {
    const statusKey =
      item.status === null || item.status === '' || item.status === undefined
        ? 'unset'
        : item.status;
    const colors = statusColors[statusKey] || statusColors['unknown'] || defaultColors;
    return {
      title: formatStatusLabel(item.status),
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

  const totalSupports = statistics.total || 0;
  const successCount = getStatusCountFromStats(statistics.by_status as any, 'success');
  const failedCount = getStatusCountFromStats(statistics.by_status as any, 'failed');
  const newCount = getStatusCountFromStats(statistics.by_status as any, 'new');
  const successRate = toPercent(successCount, totalSupports);
  const failedRate = toPercent(failedCount, totalSupports);
  const supportToReservationRate = toPercent(
    statistics.clients_with_mobile_and_reservation || 0,
    totalSupports
  );
  const leadQualityRate = Number(statistics.leads?.lead_quality_rate || 0);
  const { unknownCount, totalCount: sourceTotal } = sumUnknownSourceCount(
    statistics.by_source_campaign || []
  );
  const unknownSourceRate = toPercent(unknownCount, sourceTotal || totalSupports);
  const unknownChannelCount = (statistics.by_communication_channel || [])
    .filter((c) => {
      const label = String(c.communication_channel || '').trim().toLowerCase();
      return !label || label === 'unknown' || label === 'null';
    })
    .reduce((sum, c) => sum + (c.count || 0), 0);
  const unknownChannelRate = toPercent(unknownChannelCount, totalSupports);

  const successTone = toneColors(toneForSuccessRate(successRate));
  const failedTone = toneColors(toneForFailedRate(failedRate));
  const leadTone = toneColors(toneForLeadQuality(leadQualityRate));
  const conversionTone = toneColors(toneForSupportToReservation(supportToReservationRate));
  const unknownTone = toneColors(toneForUnknownSource(unknownSourceRate));

  // Top KPIs — decision cards first (computed from existing statistics)
  const topKpiCards =
    supportType === 'operation'
      ? [
          {
            title: 'Total Inbound',
            value: totalSupports,
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
            title: 'New',
            value: newCount,
            icon: PiCheckCircleBold,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            darkBgColor: 'dark:bg-blue-900/20',
            darkTextColor: 'dark:text-blue-400',
            blurColor: 'bg-blue-50/50',
            darkBlurColor: 'dark:bg-blue-900/10',
            compact: true,
          },
          {
            title: 'Qualified Leads',
            value: statistics.leads?.qualified_leads || 0,
            icon: PiCheckCircleBold,
            bgColor: 'bg-lime-50',
            textColor: 'text-lime-600',
            darkBgColor: 'dark:bg-lime-900/20',
            darkTextColor: 'dark:text-lime-400',
            blurColor: 'bg-lime-50/50',
            darkBlurColor: 'dark:bg-lime-900/10',
            compact: true,
          },
          {
            title: 'Support → Reservation',
            value: formatPercent(supportToReservationRate),
            subtitle: `${statistics.clients_with_mobile_and_reservation || 0} / ${totalSupports}`,
            icon: PiChartLineUpBold,
            ...conversionTone,
            compact: true,
          },
          {
            title: '% Unknown Source',
            value: formatPercent(unknownSourceRate),
            subtitle: `${unknownCount} of ${sourceTotal || totalSupports}`,
            icon: PiTagBold,
            ...unknownTone,
            compact: true,
          },
        ]
      : [
          {
            title: 'Total Supports',
            value: totalSupports,
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
            title: 'Success Rate',
            value: formatPercent(successRate),
            subtitle: `${successCount} success`,
            icon: PiCheckCircleBold,
            ...successTone,
            compact: true,
          },
          {
            title: 'Failed Rate',
            value: formatPercent(failedRate),
            subtitle: `${failedCount} failed`,
            icon: PiCheckCircleBold,
            ...failedTone,
            compact: true,
          },
          {
            title: 'Lead Quality Rate',
            value: formatPercent(leadQualityRate, 2),
            subtitle: `${statistics.leads?.qualified_leads || 0} qualified`,
            icon: PiChartLineUpBold,
            ...leadTone,
            compact: true,
          },
          {
            title: 'Support → Reservation',
            value: formatPercent(supportToReservationRate),
            subtitle: `${statistics.clients_with_mobile_and_reservation || 0} / ${totalSupports}`,
            icon: PiUsersBold,
            ...conversionTone,
            compact: true,
          },
        ];

  // Lead quality detail (kept below Top KPIs)
  const leadCards = statistics.leads
    ? [
        {
          title: 'Total Leads',
          value: statistics.leads.total_leads || 0,
          icon: PiUsersBold,
          bgColor: 'bg-sky-50',
          textColor: 'text-sky-600',
          darkBgColor: 'dark:bg-sky-900/20',
          darkTextColor: 'dark:text-sky-400',
          blurColor: 'bg-sky-50/50',
          darkBlurColor: 'dark:bg-sky-900/10',
          compact: true,
        },
        {
          title: 'Qualified Leads',
          value: statistics.leads.qualified_leads || 0,
          icon: PiCheckCircleBold,
          bgColor: 'bg-lime-50',
          textColor: 'text-lime-600',
          darkBgColor: 'dark:bg-lime-900/20',
          darkTextColor: 'dark:text-lime-400',
          blurColor: 'bg-lime-50/50',
          darkBlurColor: 'dark:bg-lime-900/10',
          compact: true,
        },
        {
          title: 'Lead Quality Rate',
          value: `${Number(statistics.leads.lead_quality_rate || 0).toFixed(2)}%`,
          icon: PiChartLineUpBold,
          ...leadTone,
          compact: true,
        },
      ]
    : [];

  // Clients conversion
  const clientCards = [
    {
      title: 'Total Customer Supports',
      value: totalSupports,
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

  const showUnknownSourceAlert = unknownSourceRate > 20;
  const showUnknownChannelAlert =
    supportType === 'operation' && unknownChannelRate > 10;
  const aging = statistics.follow_up_aging;
  const showSlaBreach = (aging?.sla_breach_count ?? 0) > 0;
  const converted = statistics.converted_via_lead;

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

  // Row 4b: Lead quality by source campaign
  const allLeadQualityCampaignCards = (statistics.lead_quality_by_source_campaign || [])
    .sort((a, b) => (b.total_leads || 0) - (a.total_leads || 0))
    .map((campaign) => ({
      title: campaign.source_campaign || 'Unknown',
      value: `${Number(campaign.lead_quality_rate || 0).toFixed(2)}%`,
      subtitle: `${campaign.qualified_leads || 0} / ${campaign.total_leads || 0} qualified`,
      icon: PiChartLineUpBold,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      blurColor: 'bg-amber-50/50',
      darkBlurColor: 'dark:bg-amber-900/10',
      link: campaign.link,
      compact: true,
    }));

  const LEAD_QUALITY_CAMPAIGNS_PER_ROW = 6;
  const leadQualityCampaignCards = leadQualityCampaignExpanded
    ? allLeadQualityCampaignCards
    : allLeadQualityCampaignCards.slice(0, LEAD_QUALITY_CAMPAIGNS_PER_ROW);

  // Row 5: Leads qualification stats (yes/no per question)
  const allQualificationCards = (statistics.by_leads_qualification || []).flatMap(
    (question) =>
      (question.by_answer || []).map((bucket) => ({
        title: `${question.label} — ${bucket.answer === 'yes' ? 'Yes' : 'No'}`,
        value: bucket.count || 0,
        icon: PiListChecksBold,
        bgColor: bucket.answer === 'yes' ? 'bg-green-50' : 'bg-rose-50',
        textColor: bucket.answer === 'yes' ? 'text-green-600' : 'text-rose-600',
        darkBgColor: bucket.answer === 'yes' ? 'dark:bg-green-900/20' : 'dark:bg-rose-900/20',
        darkTextColor: bucket.answer === 'yes' ? 'dark:text-green-400' : 'dark:text-rose-400',
        blurColor: bucket.answer === 'yes' ? 'bg-green-50/50' : 'bg-rose-50/50',
        darkBlurColor: bucket.answer === 'yes' ? 'dark:bg-green-900/10' : 'dark:bg-rose-900/10',
        link: bucket.link,
        compact: true,
      }))
  );

  const QUALIFICATION_CARDS_PER_ROW = 8;
  const qualificationCards = qualificationExpanded
    ? allQualificationCards
    : allQualificationCards.slice(0, QUALIFICATION_CARDS_PER_ROW);

  // Row 6: Communication Channels
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

  // Row 7: Cities
  const allCityCards = (statistics.by_city || [])
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map((item) => ({
      title: item.city || 'Unknown',
      value: item.count || 0,
      icon: PiMapPinBold,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      darkBgColor: 'dark:bg-violet-900/20',
      darkTextColor: 'dark:text-violet-400',
      blurColor: 'bg-violet-50/50',
      darkBlurColor: 'dark:bg-violet-900/10',
      link: item.link,
      compact: true,
    }));

  const CITIES_PER_ROW = 6;
  const cityCards = cityExpanded
    ? allCityCards
    : allCityCards.slice(0, CITIES_PER_ROW);

  // Row 8: States
  const allStateCards = (statistics.by_state || [])
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map((item) => ({
      title: item.state || 'Unknown',
      value: item.count || 0,
      icon: PiBuildingsBold,
      bgColor: 'bg-fuchsia-50',
      textColor: 'text-fuchsia-600',
      darkBgColor: 'dark:bg-fuchsia-900/20',
      darkTextColor: 'dark:text-fuchsia-400',
      blurColor: 'bg-fuchsia-50/50',
      darkBlurColor: 'dark:bg-fuchsia-900/10',
      link: item.link,
      compact: true,
    }));

  const STATES_PER_ROW = 6;
  const stateCards = stateExpanded
    ? allStateCards
    : allStateCards.slice(0, STATES_PER_ROW);

  // Row 9: Rework buckets
  const allReworkCards = (statistics.by_rework || [])
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map((item) => ({
      title: `Rework ${item.rework ?? 0}`,
      value: item.count || 0,
      icon: PiArrowsClockwiseBold,
      bgColor: Number(item.rework) > 0 ? 'bg-amber-50' : 'bg-slate-50',
      textColor: Number(item.rework) > 0 ? 'text-amber-600' : 'text-slate-600',
      darkBgColor:
        Number(item.rework) > 0
          ? 'dark:bg-amber-900/20'
          : 'dark:bg-slate-900/20',
      darkTextColor:
        Number(item.rework) > 0
          ? 'dark:text-amber-400'
          : 'dark:text-slate-400',
      blurColor: Number(item.rework) > 0 ? 'bg-amber-50/50' : 'bg-slate-50/50',
      darkBlurColor:
        Number(item.rework) > 0
          ? 'dark:bg-amber-900/10'
          : 'dark:bg-slate-900/10',
      link: item.link,
      compact: true,
    }));

  const REWORK_PER_ROW = 6;
  const reworkCards = reworkExpanded
    ? allReworkCards
    : allReworkCards.slice(0, REWORK_PER_ROW);

  // Row 10: Communication times (booked leads only)
  const allCommunicationTimesCards = (
    statistics.by_communication_times || []
  )
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .map((item) => ({
      title: `Contacts ${item.communication_times ?? 0}`,
      value: item.count || 0,
      icon: PiChatCircleBold,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      darkBgColor: 'dark:bg-sky-900/20',
      darkTextColor: 'dark:text-sky-400',
      blurColor: 'bg-sky-50/50',
      darkBlurColor: 'dark:bg-sky-900/10',
      link: item.link,
      compact: true,
    }));

  const COMMUNICATION_TIMES_PER_ROW = 6;
  const communicationTimesCards = communicationTimesExpanded
    ? allCommunicationTimesCards
    : allCommunicationTimesCards.slice(0, COMMUNICATION_TIMES_PER_ROW);

  // Journey order: Top KPIs → Status → Clients → Source → Quality → Qualification → Channels → Offers
  // Inbound: Channels before Source (faster triage of how customers contact us)
  const sourceRow = {
    title: 'Source Campaigns',
    cards: sourceCampaignCards,
    allCards: allSourceCampaignCards,
    expanded: sourceCampaignExpanded,
    setExpanded: setSourceCampaignExpanded,
    perRow: SOURCE_CAMPAIGNS_PER_ROW,
  };
  const channelRow = {
    title: 'Communication Channels',
    cards: communicationChannelCards,
    allCards: allCommunicationChannelCards,
    expanded: communicationChannelExpanded,
    setExpanded: setCommunicationChannelExpanded,
    perRow: COMMUNICATION_CHANNELS_PER_ROW,
  };
  const qualificationRow =
    allQualificationCards.length > 0
      ? {
          title: 'Leads Qualification',
          cards: qualificationCards,
          allCards: allQualificationCards,
          expanded: qualificationExpanded,
          setExpanded: setQualificationExpanded,
          perRow: QUALIFICATION_CARDS_PER_ROW,
        }
      : null;
  const leadQualityCampaignRow =
    allLeadQualityCampaignCards.length > 0
      ? {
          title: 'Lead Quality by Campaign',
          cards: leadQualityCampaignCards,
          allCards: allLeadQualityCampaignCards,
          expanded: leadQualityCampaignExpanded,
          setExpanded: setLeadQualityCampaignExpanded,
          perRow: LEAD_QUALITY_CAMPAIGNS_PER_ROW,
        }
      : null;

  const midRows =
    supportType === 'operation'
      ? [
          ...(qualificationRow ? [qualificationRow] : []),
          channelRow,
          sourceRow,
          ...(leadQualityCampaignRow ? [leadQualityCampaignRow] : []),
        ]
      : [
          sourceRow,
          ...(leadQualityCampaignRow ? [leadQualityCampaignRow] : []),
          ...(qualificationRow ? [qualificationRow] : []),
          channelRow,
        ];

  const rows: StatisticsRow[] = [
    { title: 'Top KPIs', cards: topKpiCards },
    ...(aging
      ? [
          {
            title: 'Follow-up Aging',
            cards: [
              {
                title: 'Open Leads',
                value: aging.open_count ?? 0,
                icon: PiUsersBold,
                bgColor: 'bg-slate-50',
                textColor: 'text-slate-600',
                darkBgColor: 'dark:bg-slate-900/20',
                darkTextColor: 'dark:text-slate-400',
                blurColor: 'bg-slate-50/50',
                darkBlurColor: 'dark:bg-slate-900/10',
                compact: true,
              },
              {
                title: 'Avg Age (hours)',
                value: aging.avg_age_hours ?? 0,
                icon: PiClockBold,
                bgColor: 'bg-amber-50',
                textColor: 'text-amber-600',
                darkBgColor: 'dark:bg-amber-900/20',
                darkTextColor: 'dark:text-amber-400',
                blurColor: 'bg-amber-50/50',
                darkBlurColor: 'dark:bg-amber-900/10',
                compact: true,
              },
              {
                title: 'Never Followed Up',
                value: aging.never_followed_up_count ?? 0,
                icon: PiWarningBold,
                bgColor: 'bg-orange-50',
                textColor: 'text-orange-600',
                darkBgColor: 'dark:bg-orange-900/20',
                darkTextColor: 'dark:text-orange-400',
                blurColor: 'bg-orange-50/50',
                darkBlurColor: 'dark:bg-orange-900/10',
                compact: true,
              },
              {
                title: 'SLA Breach',
                value: aging.sla_breach_count ?? 0,
                icon: PiWarningBold,
                bgColor: 'bg-red-50',
                textColor: 'text-red-600',
                darkBgColor: 'dark:bg-red-900/20',
                darkTextColor: 'dark:text-red-400',
                blurColor: 'bg-red-50/50',
                darkBlurColor: 'dark:bg-red-900/10',
                link: aging.sla_breach_link,
                compact: true,
              },
              ...(aging.buckets || []).map((b) => ({
                title: `Age ${b.bucket}`,
                value: b.count,
                icon: PiClockBold,
                bgColor: 'bg-cyan-50',
                textColor: 'text-cyan-600',
                darkBgColor: 'dark:bg-cyan-900/20',
                darkTextColor: 'dark:text-cyan-400',
                blurColor: 'bg-cyan-50/50',
                darkBlurColor: 'dark:bg-cyan-900/10',
                link: b.link,
                compact: true,
              })),
            ],
          },
        ]
      : []),
    { title: 'Status Statistics', cards: statusCards },
    ...((statistics.by_failure_reason || []).length > 0
      ? [
          {
            title: 'Failure / Closure Reasons',
            cards: (statistics.by_failure_reason || []).map((r) => ({
              title: formatStatusReasonLabel(r.status_reason),
              value: r.count,
              subtitle: `${r.failed_count} failed · ${r.closed_count} closed`,
              icon: PiWarningBold,
              bgColor: 'bg-rose-50',
              textColor: 'text-rose-600',
              darkBgColor: 'dark:bg-rose-900/20',
              darkTextColor: 'dark:text-rose-400',
              blurColor: 'bg-rose-50/50',
              darkBlurColor: 'dark:bg-rose-900/10',
              link: r.link,
              compact: true,
            })),
          },
        ]
      : []),
    ...(converted
      ? [
          {
            title: 'Converted via Lead Link',
            cards: [
              {
                title: 'Converted Leads',
                value: converted.leads_count,
                icon: PiCheckCircleBold,
                bgColor: 'bg-emerald-50',
                textColor: 'text-emerald-600',
                darkBgColor: 'dark:bg-emerald-900/20',
                darkTextColor: 'dark:text-emerald-400',
                blurColor: 'bg-emerald-50/50',
                darkBlurColor: 'dark:bg-emerald-900/10',
                link: converted.link,
                compact: true,
              },
              {
                title: 'Linked Reservations',
                value: converted.reservations_count,
                icon: PiFileTextBold,
                bgColor: 'bg-teal-50',
                textColor: 'text-teal-600',
                darkBgColor: 'dark:bg-teal-900/20',
                darkTextColor: 'dark:text-teal-400',
                blurColor: 'bg-teal-50/50',
                darkBlurColor: 'dark:bg-teal-900/10',
                link: converted.link,
                compact: true,
              },
              {
                title: 'Sessions',
                value: converted.sessions_count,
                icon: PiChartLineUpBold,
                bgColor: 'bg-sky-50',
                textColor: 'text-sky-600',
                darkBgColor: 'dark:bg-sky-900/20',
                darkTextColor: 'dark:text-sky-400',
                blurColor: 'bg-sky-50/50',
                darkBlurColor: 'dark:bg-sky-900/10',
                link: converted.link,
                compact: true,
              },
            ],
          },
        ]
      : []),
    ...(leadCards.length > 0 && supportType !== 'operation'
      ? [{ title: 'Lead Quality', cards: leadCards }]
      : []),
    { title: 'Clients Conversion', cards: clientCards },
    ...midRows,
    {
      title: 'Offers',
      cards: offerCards,
      allCards: allOfferCards,
      expanded: offersExpanded,
      setExpanded: setOffersExpanded,
      perRow: OFFERS_PER_ROW,
    },
    ...((statistics.offer_conversion || []).length > 0
      ? [
          {
            title: 'Offer Conversion',
            cards: (statistics.offer_conversion || []).map((o) => ({
              title: o.offer || 'unknown',
              value: `${Number(o.conversion_rate ?? 0).toFixed(2)}%`,
              subtitle: `${o.converted_leads}/${o.leads_count} leads · ${o.reservations_count} reservations`,
              icon: PiTagBold,
              bgColor: 'bg-fuchsia-50',
              textColor: 'text-fuchsia-600',
              darkBgColor: 'dark:bg-fuchsia-900/20',
              darkTextColor: 'dark:text-fuchsia-400',
              blurColor: 'bg-fuchsia-50/50',
              darkBlurColor: 'dark:bg-fuchsia-900/10',
              link: o.link,
              compact: true,
            })),
          },
        ]
      : []),
    ...((statistics.by_agent || []).length > 0
      ? [
          {
            title: 'Agent Activity (factual — not attribution)',
            cards: (statistics.by_agent || []).slice(0, 12).map((a) => ({
              title: a.name,
              value: a.contact_actions_count,
              subtitle: `${a.supports_count} leads · ${a.success_marked_count} success marked · ${a.reservations_created_count} bookings created`,
              icon: PiUserBold,
              bgColor: 'bg-indigo-50',
              textColor: 'text-indigo-600',
              darkBgColor: 'dark:bg-indigo-900/20',
              darkTextColor: 'dark:text-indigo-400',
              blurColor: 'bg-indigo-50/50',
              darkBlurColor: 'dark:bg-indigo-900/10',
              link: a.link,
              compact: true,
            })),
          },
        ]
      : []),
    ...(allCityCards.length > 0
      ? [{
          title: 'Cities',
          cards: cityCards,
          allCards: allCityCards,
          expanded: cityExpanded,
          setExpanded: setCityExpanded,
          perRow: CITIES_PER_ROW,
        }]
      : []),
    ...(allStateCards.length > 0
      ? [{
          title: 'States',
          cards: stateCards,
          allCards: allStateCards,
          expanded: stateExpanded,
          setExpanded: setStateExpanded,
          perRow: STATES_PER_ROW,
        }]
      : []),
    ...(allReworkCards.length > 0
      ? [{
          title: 'Rework',
          cards: reworkCards,
          allCards: allReworkCards,
          expanded: reworkExpanded,
          setExpanded: setReworkExpanded,
          perRow: REWORK_PER_ROW,
        }]
      : []),
    ...(allCommunicationTimesCards.length > 0
      ? [{
          title: 'Communication Times (Booked Leads)',
          cards: communicationTimesCards,
          allCards: allCommunicationTimesCards,
          expanded: communicationTimesExpanded,
          setExpanded: setCommunicationTimesExpanded,
          perRow: COMMUNICATION_TIMES_PER_ROW,
        }]
      : []),
  ];

  return (
    <div className={cn('w-full space-y-6', className)}>
      {(showUnknownSourceAlert || showUnknownChannelAlert || showSlaBreach) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <p className="font-semibold">Red Flags</p>
          <ul className="mt-1 list-disc space-y-0.5 ps-5">
            {showUnknownSourceAlert && (
              <li>
                Unknown Source is {formatPercent(unknownSourceRate)} ({unknownCount} leads) — above 20% threshold.
              </li>
            )}
            {showUnknownChannelAlert && (
              <li>
                Unknown Channel is {formatPercent(unknownChannelRate)} — above 10% threshold.
              </li>
            )}
            {showSlaBreach && (
              <li>
                SLA breach: {aging?.sla_breach_count} open lead(s) exceeded follow-up SLA.
              </li>
            )}
            {(statistics.unset_status_count ?? 0) > 0 && (
              <li>
                {statistics.unset_status_count} lead(s) have no status (excluded from aging).
              </li>
            )}
          </ul>
        </div>
      )}
      {rows.map((row, rowIndex) => {
        const allCards = row.allCards;
        const hasMore = !!allCards && allCards.length > (row.perRow ?? 0);
        
        return (
          <div key={rowIndex} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {row.title}
              </h4>
              {hasMore && allCards && (
                <button
                  onClick={() => row.setExpanded?.(!row.expanded)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {row.expanded ? (
                    <>
                      <span>Show Less</span>
                      <PiCaretUpBold className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show All ({allCards.length})</span>
                      <PiCaretDownBold className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="flex flex-wrap w-full gap-3">
              {row.title === 'Source Campaigns' && (
                <StatCard key="total-source-campaigns" {...totalSourceCampaignCard} supportType={supportType} />
              )}
              {row.cards.map((card: any, cardIndex: number) => (
                <StatCard 
                  key={cardIndex} 
                  {...card}
                  supportType={supportType}
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
