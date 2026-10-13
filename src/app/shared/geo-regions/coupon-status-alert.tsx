'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PiWarningBold } from 'react-icons/pi';
import type { GeoCouponStatus } from '@/types/geo-regions';

const DEFAULTS: Record<Exclude<GeoCouponStatus, 'ok' | 'none'>, string> = {
  inactive:
    'The coupon is inactive. The notification will not be sent until you change or remove it.',
  not_started:
    'The coupon has not started yet. The notification will not be sent until it starts.',
  expired:
    'The coupon has expired. The notification will not be sent until you change or remove it.',
  exhausted:
    'The coupon has no redemptions left. The notification will not be sent until you change or remove it.',
};

export function couponNeedsAttention(status?: GeoCouponStatus | null) {
  return Boolean(status && status !== 'ok' && status !== 'none');
}

export default function CouponStatusAlert({
  status,
  compact = false,
}: {
  status?: GeoCouponStatus | null;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  if (!status || !couponNeedsAttention(status)) return null;

  const key = status as keyof typeof DEFAULTS;
  const message = t(`geo_coupon_warn_${key}`, DEFAULTS[key]);

  return (
    <div
      className={`flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 text-amber-800 ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
      }`}
    >
      <PiWarningBold className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
