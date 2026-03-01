'use client';

import { useState, useEffect } from 'react';
import StatisticsFiltersComponent, { StatisticsFilters } from './filters';
import StatCards from './stat-cards';
import StatusBreakdown from './status-breakdown';
import SupportTypeBreakdown from './support-type-breakdown';
import InvoiceBreakdown from './invoice-breakdown';
import CostRatioChart from './cost-ratio-chart';
import ReservationCampaignsChart from './reservation-campaigns';
import SupportCampaignsChart from './support-campaigns';
import ReservationsByCity from './reservations-by-city';
import ReservationsByState from './reservations-by-state';
import ReservationDates from './reservation-dates';
import SessionsStatistics from './sessions-statistics';
import { Loader } from '@/components/ui/loader';
import { toast } from 'react-hot-toast';

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
  filters_applied?: any[];
  [key: string]: any; // Allow any additional fields
}

export default function StatisticsDashboard() {
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
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

      // Fetch aggregate data only
      const response = await fetch(`/api/statistics/aggregates?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      }

      const result = await response.json() as { message?: string; data: AggregateData };
      
      // Handle response structure: { message: "...", data: { ... } }
      if (result.data) {
        setAggregateData(result.data);
        toast.success(result.message || 'تم تحديث الإحصائيات / Statistics updated');
      } else {
        // Fallback: if data is at root level
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

  if (loading && !aggregateData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  if (error && !aggregateData) {
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
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 @xl:text-3xl dark:text-white">Statistics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor reservations, revenue, and customer support metrics
          </p>
        </div>
      </div>

      {/* Filters */}
      <StatisticsFiltersComponent onFilter={handleFilter} className="mb-8" />

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards */}
          <StatCards data={aggregateData} />

          {/* Overview Section: Status & Support Breakdowns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              {aggregateData?.reservations && aggregateData.reservations.by_status.length > 0 && (
                <StatusBreakdown byStatus={aggregateData.reservations.by_status} className="h-full" />
              )}
            </div>
            <div className="lg:col-span-6">
              {aggregateData?.customer_support && aggregateData.customer_support.by_type.length > 0 && (
                <SupportTypeBreakdown bySupportType={aggregateData.customer_support.by_type} className="h-full" />
              )}
            </div>
          </div>

          {/* Reservations Timeline */}
          {aggregateData?.reservation_dates && aggregateData.reservation_dates.by_date_and_status.length > 0 && (
            <div>
              <ReservationDates data={aggregateData.reservation_dates} className="h-full" />
            </div>
          )}

          {/* Location Statistics: City & State */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Location Statistics</h2>
            <div className="grid grid-cols-1 gap-6">
              {aggregateData?.reservations_by_city && aggregateData.reservations_by_city.by_city && aggregateData.reservations_by_city.by_city.length > 0 && (
                <div className="lg:col-span-6">
                  <ReservationsByCity data={aggregateData.reservations_by_city} className="h-full" />
                </div>
              )}
              {aggregateData?.reservations_by_state && aggregateData.reservations_by_state.by_state && aggregateData.reservations_by_state.by_state.length > 0 && (
                <div className="lg:col-span-6">
                  <ReservationsByState data={aggregateData.reservations_by_state} className="h-full" />
                </div>
              )}
            </div>
          </div>

          {/* Sessions Statistics */}
          {aggregateData?.sessions_statistics && aggregateData.sessions_statistics.by_session_count && aggregateData.sessions_statistics.by_session_count.length > 0 && (
            <div>
              <SessionsStatistics data={aggregateData.sessions_statistics} className="h-full" />
            </div>
          )}

          {/* Financial & Performance Metrics */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial & Performance Metrics</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6">
                {aggregateData?.invoices && aggregateData.invoices.by_status.length > 0 && (
                  <InvoiceBreakdown byStatus={aggregateData.invoices.by_status} className="h-full" />
                )}
              </div>
              <div className="lg:col-span-6">
                {aggregateData?.cost_ratio && aggregateData.cost_ratio.length > 0 && (
                  <CostRatioChart data={aggregateData.cost_ratio} className="h-full" />
                )}
              </div>
            </div>
          </div>

          {/* Campaign Analysis */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campaign Analysis</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6">
                {aggregateData?.reservations && aggregateData.reservations.by_status.length > 0 && (
                  <ReservationCampaignsChart data={aggregateData.reservations.by_status} className="h-full" />
                )}
              </div>
              <div className="lg:col-span-6">
                {aggregateData?.customer_support && aggregateData.customer_support.by_type.length > 0 && (
                  <SupportCampaignsChart data={aggregateData.customer_support.by_type} className="h-full" />
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {aggregateData && 
           aggregateData.reservations?.total === 0 && 
           aggregateData.customer_support?.total === 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <p className="text-lg font-medium text-gray-900 dark:text-white">No data found</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters to see statistics
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

