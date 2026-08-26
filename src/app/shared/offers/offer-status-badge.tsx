'use client';

import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { OfferStatus } from '@/types/offer';
import { OFFER_STATUS_LABELS } from '@/app/shared/offers/utils';

const STATUS_COLOR: Record<OfferStatus, 'success' | 'warning' | 'danger' | 'info' | 'secondary'> = {
  published: 'success',
  scheduled: 'info',
  draft: 'secondary',
  expired: 'warning',
  archived: 'danger',
};

export default function OfferStatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const key = (status || 'draft') as OfferStatus;
  const label = OFFER_STATUS_LABELS[key] || status || 'Draft';
  const color = STATUS_COLOR[key] || 'secondary';

  return (
    <div className="flex items-center gap-2">
      <Badge color={color} renderAsDot />
      <Text className="font-medium capitalize">{label}</Text>
    </div>
  );
}
