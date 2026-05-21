'use client';

import { Text } from '@/components/ui/text';
import StatusBadge from '@/app/shared/zatca/status-badge';
import DateCell from '@/components/ui/date-cell';
import type { ZatcaSubmission } from '@/types/zatca';

export default function SubmissionTimeline({
  submissions = [],
}: {
  submissions: ZatcaSubmission[];
}) {
  if (!submissions.length) {
    return <Text className="text-sm text-gray-500">No submission history yet.</Text>;
  }

  const sorted = [...submissions].sort(
    (a, b) =>
      new Date(b.created_at ?? b.submitted_at ?? 0).getTime() -
      new Date(a.created_at ?? a.submitted_at ?? 0).getTime()
  );

  return (
    <ul className="space-y-4">
      {sorted.map((sub) => (
        <li
          key={sub.id}
          className="relative border-s-2 border-gray-200 ps-6 pb-2 last:pb-0"
        >
          <span className="absolute -start-1.5 top-1 h-3 w-3 rounded-full bg-gray-400" />
          <div className="flex flex-wrap items-center gap-2">
            <Text className="font-medium">Attempt #{sub.attempt_number}</Text>
            <StatusBadge kind="zatca" value={sub.status} />
            <StatusBadge kind="validation" value={sub.validation_status} />
          </div>
          <Text className="mt-1 text-xs text-gray-500">
            Mode: {sub.mode} · {sub.warning_count ?? 0} warnings · {sub.error_count ?? 0}{' '}
            errors
          </Text>
          {sub.submitted_at && (
            <div className="mt-1 text-xs text-gray-500">
              Submitted <DateCell date={sub.submitted_at} />
            </div>
          )}
          {sub.response_received_at && (
            <div className="text-xs text-gray-500">
              Response <DateCell date={sub.response_received_at} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
