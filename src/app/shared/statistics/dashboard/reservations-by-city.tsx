'use client';

import WidgetCard from '@/components/cards/widget-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import cn from '@/utils/class-names';

interface CityData {
  city_id: string | null;
  city_name: string;
  reservations_count: number;
  total_sessions: number;
}

interface ReservationsByCityData {
  by_city: CityData[];
  total_cities: number;
  total_reservations: number;
  total_sessions: number;
}

interface ReservationsByCityProps {
  data: ReservationsByCityData;
  className?: string;
}

export default function ReservationsByCity({ data, className }: ReservationsByCityProps) {
  if (!data || !data.by_city || data.by_city.length === 0) {
    return null;
  }

  const chartData = data.by_city.map((city) => ({
    name: city.city_name || 'Unknown',
    reservations: city.reservations_count,
    sessions: city.total_sessions,
  }));

  // Sort by reservations count descending
  chartData.sort((a, b) => b.reservations - a.reservations);

  return (
    <WidgetCard
      title="Reservations by City"
      description={`${data.total_cities} cities • ${data.total_reservations.toLocaleString()} reservations • ${data.total_sessions.toLocaleString()} sessions`}
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
            />
            <Legend />
            <Bar 
              dataKey="reservations" 
              fill="#3B82F6" 
              name="Reservations"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="sessions" 
              fill="#10B981" 
              name="Sessions"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* City Summary */}
      {data.by_city.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
          <div className="space-y-2">
            {data.by_city.slice(0, 5).map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {city.city_name || 'Unknown'}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {city.reservations_count.toLocaleString()} reservations
                  </span>
                  <span className="text-sm text-emerald-600 font-medium">
                    {city.total_sessions.toLocaleString()} sessions
                  </span>
                </div>
              </div>
            ))}
            {data.by_city.length > 5 && (
              <p className="text-xs text-gray-500 mt-2">
                +{data.by_city.length - 5} more cities
              </p>
            )}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
