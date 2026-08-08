'use client';

import { useState, useEffect } from 'react';
import {
  PiCalendarBlankBold,
  PiChartLineUpBold,
  PiCurrencyDollarBold,
  PiGearBold,
} from 'react-icons/pi';
import StatisticsFiltersComponent, { StatisticsFilters } from './filters';
import StatCards, { type StatisticsSection } from './stat-cards';
import StatusBreakdown from './status-breakdown';
import SupportTypeBreakdown from './support-type-breakdown';
import InvoiceBreakdown from './invoice-breakdown';
import CostRatioChart from './cost-ratio-chart';
import ConversionRateChart from './conversion-rate-chart';
import ReservationCampaignsChart from './reservation-campaigns';
import SupportCampaignsChart from './support-campaigns';
import ReservationsByCity from './reservations-by-city';
import ReservationsByState from './reservations-by-state';
import ReservationDates from './reservation-dates';
import SessionsStatistics from './sessions-statistics';
import TimeSeriesChart from './time-series-chart';
import SingleMetricChart from './single-metric-chart';
import ReservationsCalendar from './reservations-calendar';
import { Loader } from '@/components/ui/loader';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import type { RateColorsByMetric } from '@/types/settings';
import cn from '@/utils/class-names';

interface AggregateData {
  customer_support?: {
    by_type: Array<{ 
      type: string; 
      label: string; 
      count: number;
      by_source_campaign?: Array<{ source_campaign: string; count: number }>;
    }>;
    total: number;
  };
  reservations?: {
    by_status: Array<{ 
      status: number | string; 
      label: string; 
      count: number;
      by_source_campaign?: Array<{ source_campaign: string; count: number }>;
    }>;
    total: number;
  };
  reservation_dates?: {
    by_date_and_status: Array<{
      date: string;
      by_status: Array<{
        status: string;
        label: string;
        count: number;
      }>;
      total: number;
    }>;
    total_dates: number;
    total_slots: number;
  };
  reservations_by_state?: {
    by_state: Array<{
      state_id: string | null;
      state_name: string;
      reservations_count: number;
      total_sessions: number;
    }>;
    total_states: number;
    total_reservations: number;
    total_sessions: number;
  };
  invoices?: {
    by_status: Array<{ status: string; count: number }>;
    total: number;
  };
  doctors?: {
    total: number;
  };
  clients?: {
    total: number;
  };
  total_revenue?: number;
  cost_ratio?: Array<{
    source_campaign: string;
    customer_support_count: number;
    confirmed_reservations_count: number;
    cost_ratio: number | null;
  }>;
  reservation_rate?: {
    successful_count: number;
    total_count: number;
    rate: number;
  };
  package_conversion_rate?: {
    repeat_clients: number;
    clients_with_reservation: number;
    rate: number;
  };
  conversion_rate?: Array<{
    source_campaign: string;
    customer_support_count: number;
    reservations_count: number;
    conversion_rate: number;
  }>;
  reservations_by_city?: {
    by_city: Array<{
      city_id: string | null;
      city_name: string;
      reservations_count: number;
      total_sessions: number;
    }>;
    total_cities: number;
    total_reservations: number;
    total_sessions: number;
  };
  sessions_statistics?: {
    by_session_count: Array<{
      sessions_count: number;
      reservations_count: number;
      total_sessions: number;
    }>;
    total_sessions: number;
    total_reservations: number;
  };
  chart_data?: {
    group_by: 'monthly' | 'weekly' | 'daily';
    date_from: string;
    date_to: string;
    reservations?: Array<{ date: string; count: number }>;
    sessions?: Array<{ date: string; count: number }>;
    revenue?: Array<{ date: string; amount: number }>;
    clients?: Array<{ date: string; count: number }>;
  };
  leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
  inbound_leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
  outbound_leads?: {
    total_leads: number;
    qualified_leads: number;
    lead_quality_rate: number;
  };
  filters_applied?: any[];
  [key: string]: any;
}

type DashboardTabId = StatisticsSection | 'calendar';

const DASHBOARD_TABS: Array<{
  id: DashboardTabId;
  label: string;
  description: string;
  icon: typeof PiChartLineUpBold;
}> = [
  {
    id: 'market',
    label: 'Market',
    description: 'Leads, campaigns, and conversion performance',
    icon: PiChartLineUpBold,
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Revenue, invoices, and financial trends',
    icon: PiCurrencyDollarBold,
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'Reservations, sessions, and delivery metrics',
    icon: PiGearBold,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    description: 'Monthly reservation sessions — Google Calendar style overview',
    icon: PiCalendarBlankBold,
  },
];

export default function StatisticsDashboard() {
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const { data: settingsResponse } = useSettings();
  const { mutate: updateSettings, isPending: isSavingRateColors } = useUpdateSettings();
  const fullSettings = settingsResponse?.data?.[0]?.setting;
  const rateColors = fullSettings?.rate_colors || {};

  const handleSaveRateColors = (
    nextRateColors: RateColorsByMetric,
    onSuccess?: () => void
  ) => {
    if (!fullSettings) return;
    updateSettings(
      { setting: { ...fullSettings, rate_colors: nextRateColors } },
      { onSuccess }
    );
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const permissionsRaw = window.localStorage.getItem('permissions');
      if (!permissionsRaw) return;

      const parsed = JSON.parse(permissionsRaw);
      if (Array.isArray(parsed)) {
        setPermissions(parsed.filter((permission): permission is string => typeof permission === 'string'));
      }
    } catch (storageError) {
      console.error('Failed to parse permissions from localStorage:', storageError);
    }
  }, []);

  const hasPermission = (permission: string) => permissions.includes(permission);
  const showLocationSection =
    hasPermission('dashboard.reservations_by_state') ||
    hasPermission('dashboard.top_states_performance');
  const showCampaignSection =
    hasPermission('dashboard.reservations_by_campaign') ||
    hasPermission('dashboard.support_tickets_by_campaign');

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters.client_id) params.append('client_id', filters.client_id);
      if (filters.center_id) params.append('center_id', filters.center_id);
      if (filters.source_campaign) params.append('source_campaign', filters.source_campaign);
      
      if (filters.reservation_statuses && filters.reservation_statuses.length > 0) {
        filters.reservation_statuses.forEach(status => {
          params.append('reservation_statuses[]', status.toString());
        });
      }
      
      if (filters.customer_support_types && filters.customer_support_types.length > 0) {
        filters.customer_support_types.forEach(type => {
          params.append('customer_support_types[]', type);
        });
      }

      const response = await fetch(`/api/statistics/aggregates?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const result = await response.json() as { message?: string; data: AggregateData };
      
      if (result.data) {
        setAggregateData(result.data);
        toast.success(result.message || 'تم تحديث الإحصائيات / Statistics updated');
      } else {
        setAggregateData(result as unknown as AggregateData);
        toast.success('تم تحديث الإحصائيات / Statistics updated');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
      toast.error('فشل تحميل الإحصائيات / Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: StatisticsFilters) => {
    setFilters(newFilters);
  };

  const isCalendarTab = DASHBOARD_TABS[activeTab]?.id === 'calendar';

  // Allow Calendar tab immediately; only block Market/Finance/Operations on first stats load
  if (!isCalendarTab && loading && !aggregateData) {
    return (
      <div className="@container">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 @xl:text-3xl dark:text-white">Statistics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Switch between Market, Finance, Operations, and Calendar
            </p>
          </div>
        </div>
        <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <TabList className="inline-flex w-full flex-wrap justify-start gap-1 border-0 p-0">
              {DASHBOARD_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      cn(
                        'relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all',
                        selected
                          ? 'border-b-2 border-primary bg-primary/5 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Tab>
                );
              })}
            </TabList>
          </div>
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="xl" />
          </div>
        </Tabs>
      </div>
    );
  }

  if (!isCalendarTab && error && !aggregateData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-600">Error loading statistics</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => fetchStatistics()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 @xl:text-3xl dark:text-white">Statistics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Switch between Market, Finance, Operations, and Calendar
          </p>
        </div>
      </div>

      {!isCalendarTab && (
        <StatisticsFiltersComponent onFilter={handleFilter} className="mb-6" />
      )}

      {loading && !isCalendarTab ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="xl" />
        </div>
      ) : (
        <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <TabList className="inline-flex w-full flex-wrap justify-start gap-1 border-0 p-0">
              {DASHBOARD_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.id}
                    className={({ selected }) =>
                      cn(
                        'relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all',
                        selected
                          ? 'border-b-2 border-primary bg-primary/5 text-primary'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Tab>
                );
              })}
            </TabList>
          </div>

          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            {DASHBOARD_TABS[activeTab]?.description}
          </p>

          <TabPanels>
            {/* Market */}
            <TabPanel className="outline-none">
              <div className="space-y-6">
                <StatCards
                  data={aggregateData}
                  section="market"
                  hasPermission={hasPermission}
                  rateColors={rateColors}
                  onSaveRateColors={handleSaveRateColors}
                  isSavingRateColors={isSavingRateColors}
                />

                {hasPermission('dashboard.support_tickets_by_type') &&
                  aggregateData?.customer_support &&
                  aggregateData.customer_support.by_type.length > 0 && (
                    <SupportTypeBreakdown
                      bySupportType={aggregateData.customer_support.by_type}
                      className="h-full"
                    />
                  )}

                {hasPermission('dashboard.conversion_rate') &&
                  aggregateData?.conversion_rate &&
                  aggregateData.conversion_rate.length > 0 && (
                    <ConversionRateChart
                      data={aggregateData.conversion_rate}
                      className="h-full"
                    />
                  )}

                {hasPermission('dashboard.campaign_statistics') &&
                  aggregateData?.cost_ratio &&
                  aggregateData.cost_ratio.length > 0 && (
                    <CostRatioChart data={aggregateData.cost_ratio} className="h-full" />
                  )}

                {showCampaignSection && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Campaign Analysis
                    </h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                      <div className="lg:col-span-6">
                        {hasPermission('dashboard.reservations_by_campaign') &&
                          aggregateData?.reservations &&
                          aggregateData.reservations.by_status.length > 0 && (
                            <ReservationCampaignsChart
                              data={aggregateData.reservations.by_status}
                              className="h-full"
                            />
                          )}
                      </div>
                      <div className="lg:col-span-6">
                        {hasPermission('dashboard.support_tickets_by_campaign') &&
                          aggregateData?.customer_support &&
                          aggregateData.customer_support.by_type.length > 0 && (
                            <SupportCampaignsChart
                              data={aggregateData.customer_support.by_type}
                              className="h-full"
                            />
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>

            {/* Finance */}
            <TabPanel className="outline-none">
              <div className="space-y-6">
                <StatCards
                  data={aggregateData}
                  section="finance"
                  hasPermission={hasPermission}
                  rateColors={rateColors}
                  onSaveRateColors={handleSaveRateColors}
                  isSavingRateColors={isSavingRateColors}
                />

                {hasPermission('dashboard.invoice_status') &&
                  aggregateData?.invoices &&
                  aggregateData.invoices.by_status.length > 0 && (
                    <InvoiceBreakdown
                      byStatus={aggregateData.invoices.by_status}
                      className="h-full"
                    />
                  )}

                {hasPermission('dashboard.daily_trends') && aggregateData?.chart_data && (
                  <TimeSeriesChart data={aggregateData.chart_data} className="h-full" />
                )}

                {hasPermission('dashboard.revenue_trend') &&
                  aggregateData?.chart_data?.revenue &&
                  aggregateData.chart_data.revenue.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Revenue Trend
                      </h2>
                      <SingleMetricChart
                        data={aggregateData.chart_data}
                        metric="revenue"
                        className="h-full"
                      />
                    </div>
                  )}
              </div>
            </TabPanel>

            {/* Operations */}
            <TabPanel className="outline-none">
              <div className="space-y-6">
                <StatCards
                  data={aggregateData}
                  section="operations"
                  hasPermission={hasPermission}
                  rateColors={rateColors}
                  onSaveRateColors={handleSaveRateColors}
                  isSavingRateColors={isSavingRateColors}
                />

                {hasPermission('dashboard.reservations_by_status') &&
                  aggregateData?.reservations &&
                  aggregateData.reservations.by_status.length > 0 && (
                    <StatusBreakdown
                      byStatus={aggregateData.reservations.by_status}
                      className="h-full"
                    />
                  )}

                {(hasPermission('dashboard.reservations_trend') ||
                  hasPermission('dashboard.sessions_trend') ||
                  hasPermission('dashboard.clients_trend')) &&
                  aggregateData?.chart_data && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Operational Trends
                      </h2>
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {hasPermission('dashboard.reservations_trend') &&
                          aggregateData.chart_data.reservations &&
                          aggregateData.chart_data.reservations.length > 0 && (
                            <SingleMetricChart
                              data={aggregateData.chart_data}
                              metric="reservations"
                              className="h-full"
                            />
                          )}
                        {hasPermission('dashboard.sessions_trend') &&
                          aggregateData.chart_data.sessions &&
                          aggregateData.chart_data.sessions.length > 0 && (
                            <SingleMetricChart
                              data={aggregateData.chart_data}
                              metric="sessions"
                              className="h-full"
                            />
                          )}
                        {hasPermission('dashboard.clients_trend') &&
                          aggregateData.chart_data.clients &&
                          aggregateData.chart_data.clients.length > 0 && (
                            <SingleMetricChart
                              data={aggregateData.chart_data}
                              metric="clients"
                              className="h-full"
                            />
                          )}
                      </div>
                    </div>
                  )}

                {hasPermission('dashboard.reservations_trend') &&
                  aggregateData?.reservation_dates &&
                  aggregateData.reservation_dates.by_date_and_status.length > 0 && (
                    <ReservationDates
                      data={aggregateData.reservation_dates}
                      className="h-full"
                    />
                  )}

                {showLocationSection && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Location Statistics
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {hasPermission('dashboard.reservations_by_state') &&
                        aggregateData?.reservations_by_city?.by_city &&
                        aggregateData.reservations_by_city.by_city.length > 0 && (
                          <ReservationsByCity
                            data={aggregateData.reservations_by_city}
                            className="h-full"
                          />
                        )}
                      {hasPermission('dashboard.top_states_performance') &&
                        aggregateData?.reservations_by_state?.by_state &&
                        aggregateData.reservations_by_state.by_state.length > 0 && (
                          <ReservationsByState
                            data={aggregateData.reservations_by_state}
                            className="h-full"
                          />
                        )}
                    </div>
                  </div>
                )}

                {hasPermission('dashboard.sessions_statistics') &&
                  aggregateData?.sessions_statistics?.by_session_count &&
                  aggregateData.sessions_statistics.by_session_count.length > 0 && (
                    <SessionsStatistics
                      data={aggregateData.sessions_statistics}
                      className="h-full"
                    />
                  )}
              </div>
            </TabPanel>

            {/* Calendar */}
            <TabPanel className="outline-none">
              <ReservationsCalendar />
            </TabPanel>
          </TabPanels>

          {!isCalendarTab &&
            aggregateData &&
            aggregateData.reservations?.total === 0 &&
            aggregateData.customer_support?.total === 0 &&
            (aggregateData.leads?.total_leads ?? 0) === 0 && (
              <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                <p className="text-lg font-medium text-gray-900 dark:text-white">No data found</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your filters to see statistics
                </p>
              </div>
            )}
        </Tabs>
      )}
    </div>
  );
}
