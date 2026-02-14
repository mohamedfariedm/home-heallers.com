'use client';

import WidgetCard from '@/components/cards/widget-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import cn from '@/utils/class-names';

interface SessionCountData {
  sessions_count: number;
  reservations_count: number;
  total_sessions: number;
}

interface SessionsStatisticsData {
  by_session_count: SessionCountData[];
  total_sessions: number;
  total_reservations: number;
}

interface SessionsStatisticsProps {
  data: SessionsStatisticsData;
  className?: string;
}

export default function SessionsStatistics({ data, className }: SessionsStatisticsProps) {
  if (!data || !data.by_session_count || data.by_session_count.length === 0) {
    return null;
  }

  // Sort by sessions_count ascending
  const sortedData = [...data.by_session_count].sort((a, b) => a.sessions_count - b.sessions_count);

  const chartData = sortedData.map((item) => ({
    name: `${item.sessions_count} session${item.sessions_count !== 1 ? 's' : ''}`,
    sessions_count: item.sessions_count,
    reservations: item.reservations_count,
    total_sessions: item.total_sessions,
  }));

  return (
    <WidgetCard
      title="Sessions Statistics"
      description={`${data.total_reservations.toLocaleString()} reservations • ${data.total_sessions.toLocaleString()} total sessions`}
      className={cn('min-h-[400px]', className)}
    >
      <div className="h-[300px] w-full pt-5 @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'reservations') {
                  return [value.toLocaleString(), 'Reservations'];
                }
                if (name === 'total_sessions') {
                  return [value.toLocaleString(), 'Total Sessions'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar 
              dataKey="reservations" 
              fill="#8B5CF6" 
              name="Reservations"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="total_sessions" 
              fill="#F59E0B" 
              name="Total Sessions"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      {sortedData.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Most Common</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {sortedData.reduce((max, item) => 
                  item.reservations_count > max.reservations_count ? item : max
                ).sessions_count} sessions
              </p>
              <p className="text-xs text-gray-400">
                {sortedData.reduce((max, item) => 
                  item.reservations_count > max.reservations_count ? item : max
                ).reservations_count} reservations
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Average Sessions</p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                {(data.total_sessions / data.total_reservations).toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">per reservation</p>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
