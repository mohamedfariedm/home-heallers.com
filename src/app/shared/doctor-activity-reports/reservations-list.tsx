'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import WidgetCard from '@/components/cards/widget-card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import DoctorHistoryCard from '@/app/shared/doctor-activity-reports/doctor-history-card';
import { formatReservationStatusLabel } from '@/utils/doctor-activity-query';
import type { DoctorHistoryItem } from '@/types/doctor-activity-report';

export default function DoctorReservationsList({
  reservations,
  totalItems,
}: {
  reservations: DoctorHistoryItem[];
  totalItems: number;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Number(searchParams.get('page') || 1);
  const pageSize = Number(
    searchParams.get('per_page') || searchParams.get('limit') || 25
  );
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const activeStatus = searchParams.get('status');
  const activeCampaign = searchParams.get('source_campaign');
  const hasRecordFilter = activeStatus != null || activeCampaign != null;

  const clearRecordFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('source_campaign');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    params.set('per_page', String(pageSize));
    params.delete('limit');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (reservations.length === 0) {
    return (
      <WidgetCard
        title="Reservations"
        description="Reservations assigned to this doctor in the selected date range"
      >
        {hasRecordFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Active filters:
            </Text>
            {activeStatus != null && (
              <Badge variant="flat" color="secondary">
                Status: {formatReservationStatusLabel(activeStatus)}
              </Badge>
            )}
            {activeCampaign != null && (
              <Badge variant="flat" color="secondary">
                Campaign: {activeCampaign === 'null' ? 'Unknown' : activeCampaign}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={clearRecordFilters}>
              Clear filters
            </Button>
          </div>
        )}
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            No reservations match the current filters.
          </Text>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Reservations"
      description={`${totalItems.toLocaleString()} reservations`}
    >
      {hasRecordFilter && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Filtering reservations by:
          </Text>
          {activeStatus != null && (
            <Badge variant="flat" color="secondary">
              Status: {formatReservationStatusLabel(activeStatus)}
            </Badge>
          )}
          {activeCampaign != null && (
            <Badge variant="flat" color="secondary">
              Campaign: {activeCampaign === 'null' ? 'Unknown' : activeCampaign}
            </Badge>
          )}
          <Button size="sm" variant="outline" onClick={clearRecordFilters}>
            Clear filters
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {reservations.map((item) => (
          <DoctorHistoryCard key={item.reservation_id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <Text className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </Text>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
