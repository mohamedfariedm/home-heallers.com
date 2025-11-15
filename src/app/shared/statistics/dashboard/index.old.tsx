'use client';

import { useState, useEffect } from 'react';
import StatisticsFiltersComponent, { StatisticsFilters } from './filters';
import StatCards from './stat-cards';
import StatusBreakdown from './status-breakdown';
import SupportTypeBreakdown from './support-type-breakdown';
import MonthlyChart from './monthly-chart';
import WeeklyChart from './weekly-chart';
import { Loader } from '@/components/ui/loader';

interface AggregateData {
  total_reservations: number;
  total_revenue: number;
  average_amount: number;
  by_status: Record<number, number>;
  by_support_type: Record<string, number>;
}

interface MonthlyData {
  period: string;
  month: string;
  year: number;
  total_reservations: number;
  total_revenue: number;
  average_amount: number;
}

interface WeeklyData {
  period: string;
  week: number;
  year: number;
  week_start_date: string;
  total_reservations: number;
  total_revenue: number;
  average_amount: number;
}

export default function StatisticsDashboard() {
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [filters]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
      if (filters.client_id) params.append('client_id', filters.client_id);
      
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

      // Fetch all data in parallel
      const [aggregatesRes, monthlyRes, weeklyRes] = await Promise.all([
        fetch(`/api/statistics/aggregates?${params.toString()}`),
        fetch(`/api/statistics/reservations/monthly?${params.toString()}`),
        fetch(`/api/statistics/reservations/weekly?${params.toString()}`),
      ]);

      const [aggregatesData, monthlyDataRes, weeklyDataRes] = await Promise.all([
        aggregatesRes.json(),
        monthlyRes.json(),
        weeklyRes.json(),
      ]);

      setAggregateData(aggregatesData.data);
      setMonthlyData(monthlyDataRes.data || []);
      setWeeklyData(weeklyDataRes.data || []);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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

  return (
    <div className="@container">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze your reservations statistics with advanced filtering
        </p>
      </div>

      {/* Filters */}
      <StatisticsFiltersComponent onFilter={handleFilter} className="mb-6" />

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader size="xl" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          {aggregateData && (
            <StatCards
              totalReservations={aggregateData.total_reservations}
              totalRevenue={aggregateData.total_revenue}
              averageAmount={aggregateData.average_amount}
              className="mb-6"
            />
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2">
            {/* Status Breakdown */}
            {aggregateData && Object.keys(aggregateData.by_status).length > 0 && (
              <StatusBreakdown byStatus={aggregateData.by_status} />
            )}

            {/* Support Type Breakdown */}
            {aggregateData && Object.keys(aggregateData.by_support_type).length > 0 && (
              <SupportTypeBreakdown bySupportType={aggregateData.by_support_type} />
            )}
          </div>

          {/* Monthly and Weekly Charts */}
          <div className="mt-6 grid grid-cols-1 gap-6">
            {monthlyData.length > 0 && (
              <MonthlyChart data={monthlyData} />
            )}

            {weeklyData.length > 0 && (
              <WeeklyChart data={weeklyData} />
            )}
          </div>

          {/* Empty State */}
          {aggregateData && aggregateData.total_reservations === 0 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
              <p className="text-lg font-medium text-gray-900">No data found</p>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters to see statistics
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

