'use client';

import MetricCard from '@/components/cards/widget-card';
import { 
  PiCalendarCheckBold, 
  PiUsersBold, 
  PiUserCircleBold,
  PiFileTextBold 
} from 'react-icons/pi';
import cn from '@/utils/class-names';

interface AggregateData {
  customer_support?: {
    by_type: Array<{ type: string; label: string; count: number }>;
    total: number;
  };
  reservations?: {
    by_status: Array<{ status: number | string; label: string; count: number }>;
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
}

interface StatCardsProps {
  data: AggregateData | null;
  className?: string;
}

export default function StatCards({ data, className }: StatCardsProps) {
  if (!data) return null;

  return (
    <div className={cn('grid grid-cols-1 gap-5 @lg:grid-cols-2 @3xl:grid-cols-5', className)}>
      {/* Reservations */}
      <MetricCard
        title="Total Reservations"
        description={
          <div className="mt-2 text-xs text-gray-500">
            {data.reservations?.by_status.map((status) => (
              <div key={status.status} className="flex justify-between">
                <span>{status.label}:</span>
                <span className="font-medium">{status.count}</span>
              </div>
            ))}
          </div>
        }
        className="border border-gray-200"
      >
        <div className="mt-3 flex items-center gap-1.5">
          <PiCalendarCheckBold className="h-6 w-6 text-blue-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.reservations?.total || 0}
            </p>
            <p className="text-xs text-gray-500">Active reservations</p>
          </div>
        </div>
      </MetricCard>

      {/* Customer Support */}
      <MetricCard
        title="Customer Support"
        description={
          <div className="mt-2 text-xs text-gray-500">
            {data.customer_support?.by_type.map((type) => (
              <div key={type.type} className="flex justify-between">
                <span>{type.label}:</span>
                <span className="font-medium">{type.count}</span>
              </div>
            ))}
          </div>
        }
        className="border border-gray-200"
      >
        <div className="mt-3 flex items-center gap-1.5">
          <PiFileTextBold className="h-6 w-6 text-green-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.customer_support?.total || 0}
            </p>
            <p className="text-xs text-gray-500">Total support tickets</p>
          </div>
        </div>
      </MetricCard>

      {/* Invoices */}
      {data.invoices && (
        <MetricCard
          title="Invoices"
          description={
            <div className="mt-2 text-xs text-gray-500">
              {data.invoices.by_status.map((status, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{status.status}:</span>
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          }
          className="border border-gray-200"
        >
          <div className="mt-3 flex items-center gap-1.5">
            <PiFileTextBold className="h-6 w-6 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {data.invoices.total || 0}
              </p>
              <p className="text-xs text-gray-500">Total invoices</p>
            </div>
          </div>
        </MetricCard>
      )}

      {/* Doctors */}
      <MetricCard
        title="Doctors"
        className="border border-gray-200"
      >
        <div className="mt-3 flex items-center gap-1.5">
          <PiUserCircleBold className="h-6 w-6 text-orange-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.doctors?.total || 0}
            </p>
            <p className="text-xs text-gray-500">Active doctors</p>
          </div>
        </div>
      </MetricCard>

      {/* Clients */}
      <MetricCard
        title="Clients"
        className="border border-gray-200"
      >
        <div className="mt-3 flex items-center gap-1.5">
          <PiUsersBold className="h-6 w-6 text-pink-500" />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {data.clients?.total || 0}
            </p>
            <p className="text-xs text-gray-500">Registered clients</p>
          </div>
        </div>
      </MetricCard>
    </div>
  );
}

