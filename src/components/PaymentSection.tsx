'use client';

import React, { useMemo } from 'react';
import { BellRing, Percent, Clock } from 'lucide-react';
import { Switch } from 'rizzui';
import { useTranslation } from 'react-i18next';
import type { AbandonedPaymentCouponSettings } from '@/types/settings';
import AbandonedMessageEditor from './AbandonedMessageEditor';

interface PaymentSectionProps {
  values: AbandonedPaymentCouponSettings;
  onUpdate: (values: AbandonedPaymentCouponSettings) => void;
  errors?: {
    percent?: string;
    delayMinutes?: string;
  };
}

export const ABANDONED_DEFAULTS = {
  enabled: false,
  percent: 5,
  delayMinutes: 30,
} as const;

export function resolveAbandonedPaymentCouponSettings(
  settings: Partial<AbandonedPaymentCouponSettings> | null | undefined
): AbandonedPaymentCouponSettings {
  const couponEnabledRaw = settings?.abandoned_payment_coupon_enabled;
  const reminderEnabledRaw = settings?.abandoned_payment_reminder_enabled;
  const percentRaw = settings?.abandoned_payment_coupon_percent;
  const delayRaw = settings?.abandoned_payment_coupon_delay_minutes;

  const couponEnabled =
    typeof couponEnabledRaw === 'boolean'
      ? couponEnabledRaw
      : ABANDONED_DEFAULTS.enabled;

  return {
    // Legacy data without the reminder key: mirror the coupon toggle.
    abandoned_payment_reminder_enabled:
      typeof reminderEnabledRaw === 'boolean'
        ? reminderEnabledRaw
        : couponEnabled,
    abandoned_payment_coupon_enabled: couponEnabled,
    abandoned_payment_coupon_percent:
      percentRaw === null || percentRaw === undefined || (percentRaw as unknown) === ''
        ? ABANDONED_DEFAULTS.percent
        : Number(percentRaw),
    abandoned_payment_coupon_delay_minutes:
      delayRaw === null || delayRaw === undefined || (delayRaw as unknown) === ''
        ? ABANDONED_DEFAULTS.delayMinutes
        : Number(delayRaw),
    abandoned_payment_message_title_ar: str(
      settings?.abandoned_payment_message_title_ar
    ),
    abandoned_payment_message_title_en: str(
      settings?.abandoned_payment_message_title_en
    ),
    abandoned_payment_message_body_ar: str(
      settings?.abandoned_payment_message_body_ar
    ),
    abandoned_payment_message_body_en: str(
      settings?.abandoned_payment_message_body_en
    ),
  };
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function isIntInRange(value: unknown, min: number, max: number): boolean {
  if (value === null || value === undefined || value === '') return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

/**
 * Returns error messages if values are invalid for save.
 * The percent is only validated while the coupon toggle is on (field visible).
 */
export function validateAbandonedPaymentCouponSettings(
  values: Pick<
    AbandonedPaymentCouponSettings,
    | 'abandoned_payment_coupon_enabled'
    | 'abandoned_payment_coupon_percent'
    | 'abandoned_payment_coupon_delay_minutes'
  >,
  t: (...args: any[]) => any
): { percent?: string; delayMinutes?: string } {
  const errors: { percent?: string; delayMinutes?: string } = {};

  if (
    values.abandoned_payment_coupon_enabled &&
    !isIntInRange(values.abandoned_payment_coupon_percent, 1, 100)
  ) {
    errors.percent = t(
      'settings_abandoned_coupon_percent_error',
      'Discount percent must be a whole number from 1 to 100'
    );
  }

  if (!isIntInRange(values.abandoned_payment_coupon_delay_minutes, 1, 1440)) {
    errors.delayMinutes = t(
      'settings_abandoned_coupon_delay_error',
      'Delay must be a whole number from 1 to 1440 minutes'
    );
  }

  return errors;
}

/** Inline ON/OFF indicator shown under a toggle. */
export const StatusBanner: React.FC<{
  active: boolean;
  onText: string;
  offText: string;
}> = ({ active, onText, offText }) => (
  <div
    role="status"
    className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
      active
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-gray-200 bg-gray-100 text-gray-600'
    }`}
  >
    <span
      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
        active ? 'bg-green-500' : 'bg-gray-400'
      }`}
    />
    <span>{active ? onText : offText}</span>
  </div>
);

const PaymentSection: React.FC<PaymentSectionProps> = ({
  values,
  onUpdate,
  errors,
}) => {
  const { t } = useTranslation('settings');

  const reminderEnabled = Boolean(values.abandoned_payment_reminder_enabled);
  const couponEnabled = Boolean(values.abandoned_payment_coupon_enabled);

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

  const toggleCoupon = () => {
    const next = !couponEnabled;
    // The percent field gets hidden when turning the coupon off and is still
    // sent on save, so never leave a blank/invalid value behind it.
    if (
      !next &&
      !isIntInRange(values.abandoned_payment_coupon_percent, 1, 100)
    ) {
      patch({
        abandoned_payment_coupon_enabled: false,
        abandoned_payment_coupon_percent: ABANDONED_DEFAULTS.percent,
      });
      return;
    }
    patch({ abandoned_payment_coupon_enabled: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t('settings_payment_title', 'Abandoned Booking Notifications')}
        </h2>
        <p className="text-gray-600">
          {t(
            'settings_payment_desc',
            'Automatically notify customers whose app/website booking was left incomplete.'
          )}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-6 flex items-start space-x-3">
          <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#143087]" />
          <h3 className="text-lg font-medium text-gray-900">
            {t(
              'settings_abandoned_recovery_title',
              'Abandoned booking recovery'
            )}
          </h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-600">
                {t(
                  'settings_abandoned_reminder_enabled_help',
                  'Any app/website booking that is left unpaid (Draft or Failed) gets one message after the wait period.'
                )}
              </p>
              <Switch
                label={t(
                  'settings_abandoned_reminder_enabled',
                  'Send message for abandoned booking'
                )}
                checked={reminderEnabled}
                onChange={() =>
                  patch({
                    abandoned_payment_reminder_enabled: !reminderEnabled,
                  })
                }
              />
            </div>
            <StatusBanner
              active={reminderEnabled}
              onText={t(
                'settings_abandoned_reminder_on',
                'Active — messages are being sent to customers with incomplete bookings.'
              )}
              offText={t(
                'settings_abandoned_reminder_off',
                'Not active — no messages are sent to customers.'
              )}
            />
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20 md:max-w-sm"
            />
            {errors?.delayMinutes ? (
              <p className="mt-1 text-sm text-red-600">{errors.delayMinutes}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                {t(
                  'settings_abandoned_coupon_delay_help',
                  'How long to wait after the customer leaves the booking before sending the message. Example: 30 = sent 30 minutes later. Bookings abandoned more than 24 hours ago are skipped, so customers are not messaged about old bookings.'
                )}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-600">
                {t(
                  'settings_abandoned_coupon_enabled_help',
                  'Choose whether the message includes a personal one-time discount coupon or is just a plain reminder.'
                )}
              </p>
              <Switch
                label={t(
                  'settings_abandoned_coupon_enabled',
                  'Add coupon to the message'
                )}
                checked={couponEnabled}
                onChange={toggleCoupon}
              />
            </div>
            <StatusBanner
              active={couponEnabled}
              onText={t(
                'settings_abandoned_coupon_on',
                'Coupon included — the message carries a personal discount coupon.'
              )}
              offText={t(
                'settings_abandoned_coupon_off',
                'No coupon — the message is a plain reminder with no discount.'
              )}
            />
          </div>

          {couponEnabled && (
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20 md:max-w-sm"
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
          )}
        </div>
      </div>

      <AbandonedMessageEditor values={values} onChange={patch} />
    </div>
  );
};

export default PaymentSection;
