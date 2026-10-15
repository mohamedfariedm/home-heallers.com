'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import type {
  GeoRegionStatus,
  GeoSkipReason,
  GeoVisitStatus,
} from '@/types/geo-regions';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';

export function RegionStatusBadge({ status }: { status: GeoRegionStatus }) {
  const { t } = useTranslation();
  const map: Record<GeoRegionStatus, { color: any; key: string; text: string }> =
    {
      active: { color: 'success', key: 'geo_status_active', text: 'Active' },
      inactive: {
        color: 'secondary',
        key: 'geo_status_inactive',
        text: 'Inactive',
      },
      expired: { color: 'danger', key: 'geo_status_expired', text: 'Expired' },
    };
  const item = map[status] ?? map.inactive;
  return (
    <Badge variant="flat" color={item.color}>
      {t(item.key, item.text)}
    </Badge>
  );
}

export function VisitStatusBadge({ status }: { status: GeoVisitStatus }) {
  const { t } = useTranslation();
  const map: Record<GeoVisitStatus, { color: any; key: string; text: string }> =
    {
      pending: { color: 'warning', key: 'geo_visit_pending', text: 'Pending' },
      sent: { color: 'success', key: 'geo_visit_sent', text: 'Sent' },
      skipped: { color: 'secondary', key: 'geo_visit_skipped', text: 'Skipped' },
      failed: { color: 'danger', key: 'geo_visit_failed', text: 'Failed' },
    };
  const item = map[status] ?? map.pending;
  return (
    <Badge variant="flat" color={item.color}>
      {t(item.key, item.text)}
    </Badge>
  );
}

const SKIP_DEFAULTS: Record<GeoSkipReason, string> = {
  daily_cap: 'The user already received a geo notification today',
  lower_priority: 'An overlapping region with a higher priority was sent',
  region_inactive: 'The region was stopped, expired or deleted before sending',
  coupon_unavailable:
    'The coupon is inactive, expired, exhausted, or already used by the user',
};

export function useSkipReasonText() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  return (reason: GeoSkipReason | { ar?: string; en?: string } | null) => {
    if (!reason) return '';
    if (typeof reason === 'object') return resolveLocalizedName(reason, lang);
    return t(`geo_skip_${reason}`, SKIP_DEFAULTS[reason] ?? reason);
  };
}
