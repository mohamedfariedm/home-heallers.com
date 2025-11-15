'use client';

import MetricCard from '@/components/cards/metric-card';
import { PiCurrencyDollarBold, PiCalendarCheckBold, PiChartLineUpBold } from 'react-icons/pi';
import cn from '@/utils/class-names';

interface StatCardsProps {
  totalReservations: number;
  totalRevenue: number;
  averageAmount: number;
  className?: string;
}

export default function StatCards({
  totalReservations,
  totalRevenue,
  averageAmount,
  className,
}: StatCardsProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 @lg:grid-cols-3', className)}>
      <MetricCard
        title="Total Reservations"
        metric={totalReservations.toLocaleString()}
        icon={<PiCalendarCheckBold className="h-6 w-6 text-blue-500" />}
        iconClassName="bg-blue-50"
      />
      
      <MetricCard
        title="Total Revenue"
        metric={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={<PiCurrencyDollarBold className="h-6 w-6 text-green-500" />}
        iconClassName="bg-green-50"
      />
      
      <MetricCard
        title="Average Amount"
        metric={`$${averageAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={<PiChartLineUpBold className="h-6 w-6 text-purple-500" />}
        iconClassName="bg-purple-50"
      />
    </div>
  );
}

