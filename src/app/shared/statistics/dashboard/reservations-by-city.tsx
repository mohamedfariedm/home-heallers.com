'use client';

import { useState } from 'react';
import WidgetCard from '@/components/cards/widget-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import TopTenModal from './top-ten-modal';
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

const INITIAL_CITIES_SHOWN = 5;

export default function ReservationsByCity({ data, className }: ReservationsByCityProps) {
  const [isTopTenOpen, setIsTopTenOpen] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  
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
  
  // Prepare Top 10 data
  const sortedCities = [...data.by_city].sort((a, b) => b.reservations_count - a.reservations_count);
  const displayedCities = showAllCities
    ? sortedCities
    : sortedCities.slice(0, INITIAL_CITIES_SHOWN);
  const hiddenCitiesCount = Math.max(0, sortedCities.length - INITIAL_CITIES_SHOWN);

  const topTenItems = sortedCities.slice(0, 10).map((city) => ({
    name: city.city_name || 'Unknown',
    value: city.reservations_count,
    percentage: data.total_reservations > 0 ? (city.reservations_count / data.total_reservations) * 100 : 0,
    additionalInfo: {
      sessions: city.total_sessions,
      city_id: city.city_id,
    },
  }));

  return (
    <>
    <WidgetCard
      title="Reservations by City"
      description={`${data.total_cities} cities • ${data.total_reservations.toLocaleString()} reservations • ${data.total_sessions.toLocaleString()} sessions`}
      className={cn('min-h-[400px]', className)}
      action={
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsTopTenOpen(true)}
          className="text-xs"
        >
          Top 10
        </Button>
      }
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

      {/* City Summary with more details */}
      {data.by_city.length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-700">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Top Cities Performance
            </h4>
          </div>
          <div className="space-y-3">
            {displayedCities.map((city, index) => {
              const reservationPercentage = data.total_reservations > 0 
                ? (city.reservations_count / data.total_reservations) * 100 
                : 0;
              const sessionPercentage = data.total_sessions > 0 
                ? (city.total_sessions / data.total_sessions) * 100 
                : 0;
              const avgSessionsPerReservation = city.reservations_count > 0
                ? (city.total_sessions / city.reservations_count).toFixed(2)
                : '0';
              
              return (
                <div key={city.city_id || index} className="space-y-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                        index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {city.city_name || 'Unknown'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {reservationPercentage.toFixed(1)}% of total
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Reservations</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {city.reservations_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div
                          className="h-full bg-blue-600 rounded-full dark:bg-blue-500"
                          style={{ width: `${Math.min(reservationPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Sessions</span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {city.total_sessions.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                        <div
                          className="h-full bg-emerald-600 rounded-full dark:bg-emerald-500"
                          style={{ width: `${Math.min(sessionPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Avg. {avgSessionsPerReservation} sessions per reservation
                  </div>
                </div>
              );
            })}
            {hiddenCitiesCount > 0 && (
              <div className="mt-2 flex justify-center">
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => setShowAllCities((prev) => !prev)}
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  {showAllCities
                    ? 'Show less'
                    : `+${hiddenCitiesCount} more cities`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetCard>

    <TopTenModal
      isOpen={isTopTenOpen}
      onClose={() => setIsTopTenOpen(false)}
      title="Reservations by City"
      items={topTenItems}
      valueLabel="Reservations"
      showPercentage={true}
      additionalColumns={[
        {
          key: 'sessions',
          label: 'Sessions',
          render: (item) => (
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {item.additionalInfo?.sessions?.toLocaleString() || 0}
            </span>
          ),
        },
      ]}
    />
    </>
  );
}
