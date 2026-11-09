'use client';

import React, { useMemo } from 'react';
import { CreditCard, Percent, Clock } from 'lucide-react';
import { Switch } from 'rizzui';
import { useTranslation } from 'react-i18next';
import type { AbandonedPaymentCouponSettings } from '@/types/settings';

interface PaymentSectionProps {
  values: AbandonedPaymentCouponSettings;
  onUpdate: (values: AbandonedPaymentCouponSettings) => void;
  errors?: {
    percent?: string;
    delayMinutes?: string;
  };
}

const DEFAULTS = {
  enabled: false,
  percent: 5,
  delayMinutes: 30,
} as const;

export function resolveAbandonedPaymentCouponSettings(
  settings: Partial<AbandonedPaymentCouponSettings> | null | undefined
): AbandonedPaymentCouponSettings {
  const enabledRaw = settings?.abandoned_payment_coupon_enabled;
  const percentRaw = settings?.abandoned_payment_coupon_percent;
  const delayRaw = settings?.abandoned_payment_coupon_delay_minutes;

  return {
    abandoned_payment_coupon_enabled:
      typeof enabledRaw === 'boolean' ? enabledRaw : DEFAULTS.enabled,
    abandoned_payment_coupon_percent:
      percentRaw === null || percentRaw === undefined || percentRaw === ''
        ? DEFAULTS.percent
        : Number(percentRaw),
    abandoned_payment_coupon_delay_minutes:
      delayRaw === null || delayRaw === undefined || delayRaw === ''
        ? DEFAULTS.delayMinutes
        : Number(delayRaw),
  };
}

/** Returns error messages if values are invalid for save. */
export function validateAbandonedPaymentCouponSettings(
  values: AbandonedPaymentCouponSettings,
  t: (key: string, fallback?: string) => string
): { percent?: string; delayMinutes?: string } {
  const errors: { percent?: string; delayMinutes?: string } = {};
  const percent = values.abandoned_payment_coupon_percent;
  const delay = values.abandoned_payment_coupon_delay_minutes;

  if (
    percent === null ||
    percent === undefined ||
    Number.isNaN(Number(percent)) ||
    !Number.isInteger(Number(percent)) ||
    Number(percent) < 1 ||
    Number(percent) > 100
  ) {
    errors.percent = t(
      'settings_abandoned_coupon_percent_error',
      'Discount percent must be a whole number from 1 to 100'
    );
  }

  if (
    delay === null ||
    delay === undefined ||
    Number.isNaN(Number(delay)) ||
    !Number.isInteger(Number(delay)) ||
    Number(delay) < 1 ||
    Number(delay) > 1440
  ) {
    errors.delayMinutes = t(
      'settings_abandoned_coupon_delay_error',
      'Delay must be a whole number from 1 to 1440 minutes'
    );
  }

  return errors;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  values,
  onUpdate,
  errors,
}) => {
  const { t } = useTranslation('settings');

  const enabled = Boolean(values.abandoned_payment_coupon_enabled);
  const percentDisplay = useMemo(() => {
    const n = values.abandoned_payment_coupon_percent;
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '';
    return String(n);
  }, [values.abandoned_payment_coupon_percent]);

  const delayDisplay = useMemo(() => {
    const n = values.abandoned_payment_coupon_delay_minutes;
    if (n === null || n === undefined || Number.isNaN(Number(n))) return '';
    return String(n);
  }, [values.abandoned_payment_coupon_delay_minutes]);

  const patch = (partial: Partial<AbandonedPaymentCouponSettings>) => {
    onUpdate({ ...values, ...partial });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t('settings_payment_title', 'Payment Settings')}
        </h2>
        <p className="text-gray-600">
          {t(
            'settings_payment_desc',
            'Configure payment-related options for the app and website.'
          )}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#143087]" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {t(
                  'settings_abandoned_coupon_title',
                  'Abandoned booking coupon'
                )}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {t(
                  'settings_abandoned_coupon_enabled_help',
                  'When enabled, an unpaid app/website booking that is still Draft or Failed gets a one-time personal coupon after the wait period. Off by default.'
                )}
              </p>
            </div>
          </div>
          <Switch
            label={t(
              'settings_abandoned_coupon_enabled',
              'Send coupon for unpaid booking'
            )}
            checked={enabled}
            onChange={() =>
              patch({ abandoned_payment_coupon_enabled: !enabled })
            }
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Percent className="h-4 w-4 text-[#143087]" />
              {t('settings_abandoned_coupon_percent', 'Discount percent')}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={100}
              step={1}
              value={percentDisplay}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  patch({ abandoned_payment_coupon_percent: '' as any });
                  return;
                }
                patch({
                  abandoned_payment_coupon_percent: Number(raw),
                });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20"
            />
            {errors?.percent ? (
              <p className="mt-1 text-sm text-red-600">{errors.percent}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {t(
                  'settings_abandoned_coupon_percent_hint',
                  'Whole number from 1 to 100. Default 5.'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4 text-[#143087]" />
              {t(
                'settings_abandoned_coupon_delay',
                'Wait before sending (minutes)'
              )}
            </label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={1440}
              step={1}
              value={delayDisplay}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') {
                  patch({ abandoned_payment_coupon_delay_minutes: '' as any });
                  return;
                }
                patch({
                  abandoned_payment_coupon_delay_minutes: Number(raw),
                });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20"
            />
            {errors?.delayMinutes ? (
              <p className="mt-1 text-sm text-red-600">{errors.delayMinutes}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {t(
                  'settings_abandoned_coupon_delay_help',
                  'Minutes the booking stays unpaid before the coupon is sent. Bookings older than 24 hours do not get a coupon.'
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
