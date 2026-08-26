'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import {
  useReservationReviews,
  useToggleReservationReview,
  useToggleReviewShowOnPackage,
} from '@/framework/reservation-reviews';
import DateCell from '@/components/ui/date-cell';

type FilterId = 'all' | 'unpublished' | 'published' | 'on-offer';

function effectiveBadge(status: boolean, showOnPackage: boolean) {
  if (!status) return { label: 'Unpublished', color: 'danger' as const };
  if (!showOnPackage) return { label: 'Published, not on offer', color: 'warning' as const };
  return { label: 'Live on offer page', color: 'success' as const };
}

export default function ReviewsTab({
  packageId,
  canGate1,
  canGate2,
}: {
  packageId?: number | string;
  canGate1: boolean;
  canGate2: boolean;
}) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const { data, isLoading, refetch, error } = useReservationReviews('limit=500');
  const { mutateAsync: toggleStatus } = useToggleReservationReview();
  const { mutateAsync: toggleShow } = useToggleReviewShowOnPackage();

  const reviews = useMemo(() => {
    const list = data?.data ?? [];
    const rows = Array.isArray(list) ? list : [];
    return rows.filter((row: any) => String(row.package_id) === String(packageId));
  }, [data, packageId]);

  const filtered = reviews.filter((row: any) => {
    if (filter === 'unpublished') return !row.status;
    if (filter === 'published') return row.status && !row.show_on_package;
    if (filter === 'on-offer') return row.status && row.show_on_package;
    return true;
  });

  const runToggle = async (key: string, fn: () => Promise<any>) => {
    setPending((prev) => ({ ...prev, [key]: true }));
    try {
      await fn();
      await refetch();
    } finally {
      setPending((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (!packageId) {
    return (
      <Text className="text-sm text-gray-500">
        Save the offer first to moderate reviews.
      </Text>
    );
  }

  if ((error as any)?.response?.status === 403) {
    return (
      <div className="rounded-md border border-gray-200 p-4 text-sm text-gray-600">
        You don&apos;t have permission to view reviews.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Approving or displaying reviews does <strong>not</strong> change{' '}
        <code>display_rating</code> or <code>display_reviews_count</code>. Those are
        editorial values on the Merchandising tab.
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['unpublished', 'Unpublished'],
            ['published', 'Published, not on offer'],
            ['on-offer', 'Live on offer'],
          ] as [FilterId, string][]
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant={filter === id ? 'solid' : 'outline'}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed p-6 text-sm text-gray-500">
          No reviews for this offer yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th scope="col" className="p-3">Client</th>
                <th scope="col" className="p-3">Rating</th>
                <th scope="col" className="p-3">Comment</th>
                <th scope="col" className="p-3">Date</th>
                <th scope="col" className="p-3">Effective state</th>
                <th scope="col" className="p-3">Published (site-wide)</th>
                <th scope="col" className="p-3">Show on this offer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: any) => {
                const rate = row.reservation_rate ?? row.doctor_rate;
                const comment = row.reservation_comment || row.doctor_comment || '';
                const badge = effectiveBadge(Boolean(row.status), Boolean(row.show_on_package));
                const unlinked = row.package_id == null;
                return (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="p-3">{row.client?.name || '—'}</td>
                    <td className="p-3">
                      {rate != null ? `${rate}/5` : <span className="text-gray-400">Comment only</span>}
                    </td>
                    <td className="max-w-xs p-3">
                      <details>
                        <summary className="line-clamp-2 cursor-pointer">
                          {comment || '—'}
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap text-gray-600">{comment}</p>
                      </details>
                    </td>
                    <td className="p-3">
                      {row.created_at ? <DateCell date={new Date(row.created_at)} /> : '—'}
                    </td>
                    <td className="p-3">
                      {unlinked ? (
                        <Badge color="secondary">Not linked to an offer</Badge>
                      ) : (
                        <Badge color={badge.color}>{badge.label}</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Switch
                        checked={Boolean(row.status)}
                        disabled={!canGate1 || pending[`s-${row.id}`]}
                        onChange={() =>
                          runToggle(`s-${row.id}`, () => toggleStatus(row.id))
                        }
                      />
                    </td>
                    <td className="p-3">
                      <Switch
                        checked={Boolean(row.show_on_package)}
                        disabled={!canGate2 || unlinked || pending[`p-${row.id}`]}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          if (checked && !row.status) {
                            const ok = window.confirm(
                              'This review is unpublished site-wide. Showing it on the offer will not make it visible until Published (site-wide) is also on.'
                            );
                            if (!ok) return;
                          }
                          runToggle(`p-${row.id}`, () => toggleShow(row.id));
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
