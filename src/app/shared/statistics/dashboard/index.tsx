'use client';

import { useState, useEffect } from 'react';
import StatisticsFiltersComponent, { StatisticsFilters } from './filters';
import StatCards from './stat-cards';
import StatusBreakdown from './status-breakdown';
import SupportTypeBreakdown from './support-type-breakdown';
import MonthlyChart from './monthly-chart';
import WeeklyChart from './weekly-chart';
import InvoiceBreakdown from './invoice-breakdown';
import CostRatioChart from './cost-ratio-chart';
import ReservationCampaignsChart from './reservation-campaigns';
import SupportCampaignsChart from './support-campaigns';
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
}

interface MonthlyData {
  month: string;
  year: number;
  month_number: number;
  total: number;
  revenue?: number;
  by_status: Array<{
    status: number | string;
    label: string;
    count: number;
    by_source_campaign?: Array<{ source_campaign: string; count: number }>;
  }>;
  cost_ratio?: Array<{
    source_campaign: string;
    customer_support_count: number;
    confirmed_reservations_count: number;
    cost_ratio: number | null;
  }>;
}

interface WeeklyData {
  year_week: string;
  year: number;
  week_number: number;
  week_start: string;
  total: number;
  revenue?: number;
  by_status: Array<{
    status: number | string;
    label: string;
    count: number;
    by_source_campaign?: Array<{ source_campaign: string; count: number }>;
  }>;
  cost_ratio?: Array<{
    source_campaign: string;
    customer_support_count: number;
    confirmed_reservations_count: number;
    cost_ratio: number | null;
  }>;
}

export default function StatisticsDashboard() {
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
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

      // Fetch all data in parallel with error handling for each
      const [aggregatesRes, monthlyRes, weeklyRes] = await Promise.allSettled([
        fetch(`/api/statistics/aggregates?${params.toString()}`),
        fetch(`/api/statistics/reservations/monthly?${params.toString()}`),
        fetch(`/api/statistics/reservations/weekly?${params.toString()}`),
      ]);

      // Handle aggregates
      if (aggregatesRes.status === 'fulfilled' && aggregatesRes.value.ok) {
        const data = await aggregatesRes.value.json();
        setAggregateData(data.data || data);
      } else {
        console.error('Aggregates fetch failed:', aggregatesRes);
      }

      // Handle monthly
      if (monthlyRes.status === 'fulfilled' && monthlyRes.value.ok) {
        const data = await monthlyRes.value.json();
        setMonthlyData(data.data?.data || data.data || []);
      } else {
        console.error('Monthly fetch failed:', monthlyRes);
        setMonthlyData([]);
      }

      // Handle weekly
      if (weeklyRes.status === 'fulfilled' && weeklyRes.value.ok) {
        const data = await weeklyRes.value.json();
        setWeeklyData(data.data?.data || data.data || []);
      } else {
        console.error('Weekly fetch failed:', weeklyRes);
        setWeeklyData([]);
      }
      
      toast.success('تم تحديث الإحصائيات / Statistics updated');
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
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

          {/* Top Row: Monthly Trend (8) + Status Breakdown (4) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              {monthlyData.length > 0 && <MonthlyChart data={monthlyData} className="h-full" />}
            </div>
            <div className="lg:col-span-4">
              {aggregateData?.reservations && aggregateData.reservations.by_status.length > 0 && (
                <StatusBreakdown byStatus={aggregateData.reservations.by_status} className="h-full" />
              )}
            </div>
          </div>

          {/* Bottom Row: Support Breakdown (4) + Weekly Trend (8) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
               {aggregateData?.customer_support && aggregateData.customer_support.by_type.length > 0 && (
                <SupportTypeBreakdown bySupportType={aggregateData.customer_support.by_type} className="h-full" />
              )}
            </div>
            <div className="lg:col-span-8">
               {weeklyData.length > 0 && <WeeklyChart data={weeklyData} className="h-full" />}
            </div>
          </div>

          {/* Invoices Breakdown & Cost Ratio Row */}
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

          {/* Campaign Breakdowns Row */}
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

          {/* Empty State */}
          {aggregateData && 
           aggregateData.reservations?.total === 0 && 
           aggregateData.customer_support?.total === 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-lg font-medium text-gray-900">No data found</p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters to see statistics
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
