'use client';

import WidgetCard from '@/components/cards/widget-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import cn from '@/utils/class-names';

const SUPPORT_TYPE_NAMES: Record<string, string> = {
  operation: 'Operation',
  maintenance: 'Maintenance',
  consultation: 'Consultation',
  emergency: 'Emergency',
};

interface SupportTypeBreakdownProps {
  bySupportType: Record<string, number>;
  className?: string;
}

export default function SupportTypeBreakdown({
  bySupportType,
  className,
}: SupportTypeBreakdownProps) {
  const data = Object.entries(bySupportType).map(([type, count]) => ({
    name: SUPPORT_TYPE_NAMES[type] || type,
    count: count,
  }));

  return (
    <WidgetCard
      title="Reservations by Support Type"
      className={cn('', className)}
    >
      <div className="h-[300px] w-full @lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8B5CF6" name="Reservations" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}

