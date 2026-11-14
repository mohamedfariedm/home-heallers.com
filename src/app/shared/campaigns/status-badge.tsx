'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { CampaignStatus } from '@/types/campaigns';

const STATUS_STYLE: Record<CampaignStatus, { color: string; key: string }> = {
  draft: { color: 'secondary', key: 'campaigns_status_draft' },
  active: { color: 'success', key: 'campaigns_status_active' },
  paused: { color: 'warning', key: 'campaigns_status_paused' },
  completed: { color: 'info', key: 'campaigns_status_completed' },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus | string }) {
  const { t } = useTranslation('campaigns');
  const item = STATUS_STYLE[status as CampaignStatus] ?? STATUS_STYLE.draft;

  return (
    <Badge variant="flat" color={item.color as any}>
      {t(item.key)}
    </Badge>
  );
}
