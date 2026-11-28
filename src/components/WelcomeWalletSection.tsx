'use client';

import React, { useState } from 'react';
import { Gift, Coins, CalendarClock, Bell, Clock } from 'lucide-react';
import { Switch } from 'rizzui';
import { useTranslation } from 'react-i18next';
import type { WelcomeWalletSettings } from '@/types/settings';
import { StatusBanner } from './PaymentSection';

export const WELCOME_DEFAULTS = {
  enabled: false,
  amount: 50,
  expiryDays: 30,
  creditNotification: true,
  expiryNotification: true,
  reminderHours: 72,
} as const;

export const WELCOME_LIMITS = {
  amount: { min: 0.01, max: 10000 },
  days: { min: 1, max: 365 },
  hours: { min: 1, max: 720 },
  title: 100,
  body: 500,
} as const;

export interface WelcomeWalletErrors {
  amount?: string;
  days?: string;
  hours?: string;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;
const num = (v: unknown, fallback: number): number =>
  v === null || v === undefined || v === '' ? fallback : Number(v);

export function resolveWelcomeWalletSettings(
  s: Partial<WelcomeWalletSettings> | null | undefined
): WelcomeWalletSettings {
  return {
    welcome_wallet_enabled: bool(s?.welcome_wallet_enabled, WELCOME_DEFAULTS.enabled),
    welcome_wallet_amount: num(s?.welcome_wallet_amount, WELCOME_DEFAULTS.amount),
    welcome_wallet_expiry_days: num(
      s?.welcome_wallet_expiry_days,
      WELCOME_DEFAULTS.expiryDays
    ),
    welcome_wallet_credit_notification_enabled: bool(
      s?.welcome_wallet_credit_notification_enabled,
      WELCOME_DEFAULTS.creditNotification
    ),
    welcome_wallet_expiry_notification_enabled: bool(
      s?.welcome_wallet_expiry_notification_enabled,
      WELCOME_DEFAULTS.expiryNotification
    ),
    welcome_wallet_expiry_reminder_hours: num(
      s?.welcome_wallet_expiry_reminder_hours,
      WELCOME_DEFAULTS.reminderHours
    ),
    welcome_wallet_credit_title_ar: str(s?.welcome_wallet_credit_title_ar),
    welcome_wallet_credit_title_en: str(s?.welcome_wallet_credit_title_en),
    welcome_wallet_credit_body_ar: str(s?.welcome_wallet_credit_body_ar),
    welcome_wallet_credit_body_en: str(s?.welcome_wallet_credit_body_en),
    welcome_wallet_expiry_title_ar: str(s?.welcome_wallet_expiry_title_ar),
    welcome_wallet_expiry_title_en: str(s?.welcome_wallet_expiry_title_en),
    welcome_wallet_expiry_body_ar: str(s?.welcome_wallet_expiry_body_ar),
    welcome_wallet_expiry_body_en: str(s?.welcome_wallet_expiry_body_en),
  };
}

/**
 * Reads the welcome wallet keys from the (already normalised) form state
 * exactly as they are, so a field the admin just cleared stays empty
 * instead of snapping back to its default.
 */
export function pickWelcomeWalletSettings(
  s: Partial<WelcomeWalletSettings>
): WelcomeWalletSettings {
  const d = resolveWelcomeWalletSettings(undefined);
  const out: any = {};
  (Object.keys(d) as (keyof WelcomeWalletSettings)[]).forEach((k) => {
    out[k] = s[k] === undefined ? d[k] : s[k];
  });
  return out as WelcomeWalletSettings;
}

function inRange(v: unknown, min: number, max: number, integer: boolean) {
  if (v === null || v === undefined || v === '') return false;
  const n = Number(v);
  if (Number.isNaN(n) || n < min || n > max) return false;
  return integer ? Number.isInteger(n) : true;
}

/**
 * The amount is only required while the feature is on, and the reminder hours
 * only while the expiry reminder is on (the field is hidden otherwise).
 */
export function validateWelcomeWalletSettings(
  v: WelcomeWalletSettings,
  t: (...args: any[]) => any
): WelcomeWalletErrors {
  const errors: WelcomeWalletErrors = {};
  const L = WELCOME_LIMITS;

  if (
    v.welcome_wallet_enabled &&
    !inRange(v.welcome_wallet_amount, L.amount.min, L.amount.max, false)
  ) {
    errors.amount = t(
      'settings_ww_amount_error',
      'Amount must be a number from 0.01 to 10000'
    );
  }
  if (!inRange(v.welcome_wallet_expiry_days, L.days.min, L.days.max, true)) {
    errors.days = t(
      'settings_ww_days_error',
      'Days must be a whole number from 1 to 365'
    );
  }
  if (
    v.welcome_wallet_expiry_notification_enabled &&
    !inRange(v.welcome_wallet_expiry_reminder_hours, L.hours.min, L.hours.max, true)
  ) {
    errors.hours = t(
      'settings_ww_hours_error',
      'Hours must be a whole number from 1 to 720'
    );
  }
  return errors;
}

/**
 * Values to send on save. A value hidden or not required (amount while the
 * feature is off, hours while the reminder is off) that is blank/invalid falls
 * back to its default so the server always receives valid numbers.
 */
export function buildWelcomeWalletPayload(
  v: WelcomeWalletSettings
): WelcomeWalletSettings {
  const L = WELCOME_LIMITS;
  return {
    ...v,
    welcome_wallet_amount: inRange(v.welcome_wallet_amount, L.amount.min, L.amount.max, false)
      ? Number(v.welcome_wallet_amount)
      : WELCOME_DEFAULTS.amount,
    welcome_wallet_expiry_days: Number(v.welcome_wallet_expiry_days),
    welcome_wallet_expiry_reminder_hours: inRange(
      v.welcome_wallet_expiry_reminder_hours,
      L.hours.min,
      L.hours.max,
      true
    )
      ? Number(v.welcome_wallet_expiry_reminder_hours)
      : WELCOME_DEFAULTS.reminderHours,
  };
}

type Lang = 'ar' | 'en';
type Group = 'credit' | 'expiry';

const DEFAULT_TEXTS: Record<Group, Record<Lang, { title: string; body: string }>> = {
  credit: {
    ar: {
      title: 'أهلاً بك في هوم هيلرز 🎁',
      body: 'أضفنا {amount} ريال هدية في محفظتك. تقدر تستخدمها في حجوزاتك لحد {expiry_date}.',
    },
    en: {
      title: 'Welcome to Home Healers 🎁',
      body: 'We added {amount} SAR as a gift to your wallet. You can use it on your bookings until {expiry_date}.',
    },
  },
  expiry: {
    ar: {
      title: 'رصيدك الهدية قرب ينتهي',
      body: 'باقي {amount} ريال من رصيدك الهدية وينتهي في {expiry_date}. استخدمه في حجزك قبل ما يخلص.',
    },
    en: {
      title: 'Your gift balance is about to expire',
      body: '{amount} SAR of your gift balance expires on {expiry_date}. Use it on a booking before it runs out.',
    },
  },
};

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20';

interface Props {
  values: WelcomeWalletSettings;
  onUpdate: (values: WelcomeWalletSettings) => void;
  errors?: WelcomeWalletErrors;
}

const WelcomeWalletSection: React.FC<Props> = ({ values, onUpdate, errors }) => {
  const { t } = useTranslation('settings');
  const [lang, setLang] = useState<Lang>('ar');
  const L = WELCOME_LIMITS;

  const enabled = values.welcome_wallet_enabled;
  const creditOn = values.welcome_wallet_credit_notification_enabled;
  const expiryOn = values.welcome_wallet_expiry_notification_enabled;

  const patch = (p: Partial<WelcomeWalletSettings>) => onUpdate({ ...values, ...p });

  const display = (n: unknown) =>
    n === null || n === undefined || Number.isNaN(Number(n)) ? '' : String(n);

  const numberInput = (
    key: 'welcome_wallet_amount' | 'welcome_wallet_expiry_days' | 'welcome_wallet_expiry_reminder_hours',
    attrs: { min: number; max: number; step: number }
  ) => (
    <input
      type="number"
      inputMode={attrs.step === 1 ? 'numeric' : 'decimal'}
      {...attrs}
      value={display(values[key])}
      onChange={(e) =>
        patch({ [key]: e.target.value === '' ? ('' as any) : Number(e.target.value) })
      }
      className={`${inputCls} md:max-w-sm`}
    />
  );

  const hint = (err: string | undefined, help: string) =>
    err ? (
      <p className="mt-1 text-sm text-red-600">{err}</p>
    ) : (
      <p className="mt-1 text-xs text-gray-500">{help}</p>
    );

  const label = (icon: React.ReactNode, text: string) => (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
      {icon}
      {text}
    </label>
  );

  // reminder must be shorter than the bonus lifetime
  const reminderTooLong =
    expiryOn &&
    inRange(values.welcome_wallet_expiry_days, L.days.min, L.days.max, true) &&
    inRange(values.welcome_wallet_expiry_reminder_hours, L.hours.min, L.hours.max, true) &&
    Number(values.welcome_wallet_expiry_reminder_hours) >=
      Number(values.welcome_wallet_expiry_days) * 24;

  const textGroup = (group: Group, title: string) => {
    const k = (f: 'title' | 'body') =>
      `welcome_wallet_${group}_${f}_${lang}` as keyof WelcomeWalletSettings;
    const titleVal = str(values[k('title')]);
    const bodyVal = str(values[k('body')]);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">{title}</h4>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('settings_ww_text_title', 'Title')}
              </span>
              <span className="text-xs text-gray-400">
                {titleVal.length}/{L.title}
              </span>
            </div>
            <input
              type="text"
              dir={dir}
              maxLength={L.title}
              value={titleVal}
              placeholder={DEFAULT_TEXTS[group][lang].title}
              onChange={(e) => patch({ [k('title')]: e.target.value } as any)}
              className={inputCls}
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t('settings_ww_text_body', 'Message')}
              </span>
              <span className="text-xs text-gray-400">
                {bodyVal.length}/{L.body}
              </span>
            </div>
            <textarea
              rows={3}
              dir={dir}
              maxLength={L.body}
              value={bodyVal}
              placeholder={DEFAULT_TEXTS[group][lang].body}
              onChange={(e) => patch({ [k('body')]: e.target.value } as any)}
              className={inputCls}
            />
          </div>
        </div>
      </div>
    );
  };

  const langBtn = (l: Lang, text: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        lang === l ? 'bg-[#143087] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {text}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t('settings_ww_title', 'Welcome wallet bonus')}
        </h2>
        <p className="text-gray-600">
          {t(
            'settings_ww_desc',
            'A gift amount added to the wallet of every new client when they verify their phone for the first time.'
          )}
        </p>
      </div>

      {/* Main controls */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-start gap-3">
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[#143087]" />
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings_ww_main_title', 'Bonus')}
          </h3>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-600">
                {t(
                  'settings_ww_enabled_help',
                  'A new client who verifies their phone for the first time gets the amount in their wallet. It can be spent inside the app only, it cannot be withdrawn, and it expires.'
                )}
              </p>
              <Switch
                label={t('settings_ww_enabled', 'Enable welcome wallet bonus')}
                checked={enabled}
                onChange={() => patch({ welcome_wallet_enabled: !enabled })}
              />
            </div>
            <StatusBanner
              active={enabled}
              onText={t(
                'settings_ww_on',
                'Active — new clients receive the welcome bonus.'
              )}
              offText={t(
                'settings_ww_off',
                'Not active — new clients do not receive a bonus.'
              )}
            />
          </div>

          <div>
            {label(
              <Coins className="h-4 w-4 text-[#143087]" />,
              t('settings_ww_amount', 'Bonus amount (SAR)')
            )}
            {numberInput('welcome_wallet_amount', {
              min: L.amount.min,
              max: L.amount.max,
              step: 0.01,
            })}
            {hint(
              errors?.amount,
              t('settings_ww_amount_help', 'Applies to new registrations only.')
            )}
          </div>

          <div>
            {label(
              <CalendarClock className="h-4 w-4 text-[#143087]" />,
              t('settings_ww_days', 'Expires after (days)')
            )}
            {numberInput('welcome_wallet_expiry_days', {
              min: L.days.min,
              max: L.days.max,
              step: 1,
            })}
            {hint(
              errors?.days,
              t(
                'settings_ww_days_help',
                'Counted from the day the bonus is credited. Whatever is unused is removed from the wallet.'
              )
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <div className="mb-4 flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-[#143087]" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {t('settings_ww_notif_title', 'Notifications')}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {t(
                'settings_ww_notif_desc',
                'Each switch turns off only its own notification. Turning them off does not stop the bonus itself.'
              )}
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-600">
                {t(
                  'settings_ww_credit_notif_help',
                  'Sent to the client when the gift is added to their wallet.'
                )}
              </p>
              <Switch
                label={t('settings_ww_credit_notif', 'Notification when credited')}
                checked={creditOn}
                onChange={() =>
                  patch({ welcome_wallet_credit_notification_enabled: !creditOn })
                }
              />
            </div>
            <StatusBanner
              active={creditOn}
              onText={t('settings_ww_credit_notif_on', 'Active — the client is notified when credited.')}
              offText={t('settings_ww_credit_notif_off', 'Not active — no notification when credited.')}
            />
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-gray-600">
                {t(
                  'settings_ww_expiry_notif_help',
                  'Sent before the gift expires. Applies immediately to bonuses that are already running.'
                )}
              </p>
              <Switch
                label={t('settings_ww_expiry_notif', 'Reminder before expiry')}
                checked={expiryOn}
                onChange={() => {
                  const next = !expiryOn;
                  // hours get hidden and are still sent: never leave junk behind
                  const hoursOk = inRange(
                    values.welcome_wallet_expiry_reminder_hours,
                    L.hours.min,
                    L.hours.max,
                    true
                  );
                  patch({
                    welcome_wallet_expiry_notification_enabled: next,
                    ...(!next && !hoursOk
                      ? { welcome_wallet_expiry_reminder_hours: WELCOME_DEFAULTS.reminderHours }
                      : {}),
                  });
                }}
              />
            </div>
            <StatusBanner
              active={expiryOn}
              onText={t('settings_ww_expiry_notif_on', 'Active — the client is reminded before expiry.')}
              offText={t('settings_ww_expiry_notif_off', 'Not active — no reminder before expiry.')}
            />
          </div>

          {expiryOn && (
            <div>
              {label(
                <Clock className="h-4 w-4 text-[#143087]" />,
                t('settings_ww_hours', 'Send reminder this many hours before expiry')
              )}
              {numberInput('welcome_wallet_expiry_reminder_hours', {
                min: L.hours.min,
                max: L.hours.max,
                step: 1,
              })}
              {hint(
                errors?.hours,
                t(
                  'settings_ww_hours_help',
                  'Must be shorter than the bonus lifetime, otherwise no reminder is sent. Example: a 2-day lifetime is 48 hours, so a 72-hour reminder is never sent.'
                )
              )}
              {reminderTooLong && (
                <p
                  role="alert"
                  className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  {t(
                    'settings_ww_hours_warn',
                    'The reminder time is not shorter than the bonus lifetime, so no reminder will be sent. Lower the hours or increase the days.'
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Texts */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="text-lg font-medium text-gray-900">
          {t('settings_ww_texts_title', 'Notification texts')}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {t(
            'settings_ww_texts_desc',
            'All texts are optional. When a field is empty the system default (shown in grey) is used. If only the title or only the message is empty, the default is used for that part alone. The notification is sent in the client\'s language.'
          )}
        </p>
        <div className="mt-3 rounded-md border border-[#143087]/20 bg-white px-3 py-2 text-xs text-gray-600">
          <p className="mb-1 font-medium text-gray-700">
            {t('settings_ww_placeholders_title', 'Placeholders you can type in the text:')}
          </p>
          <ul className="space-y-0.5">
            <li>
              <code className="font-mono">{'{name}'}</code> —{' '}
              {t('settings_ww_ph_name', "the client's name (removed if the client has no name)")}
            </li>
            <li>
              <code className="font-mono">{'{amount}'}</code> —{' '}
              {t('settings_ww_ph_amount', 'the amount (in the reminder: what is left of it)')}
            </li>
            <li>
              <code className="font-mono">{'{expiry_date}'}</code> —{' '}
              {t('settings_ww_ph_date', 'the expiry date, e.g. 2026-12-31 (Riyadh time)')}
            </li>
            <li>
              <code className="font-mono">{'{days_left}'}</code> —{' '}
              {t('settings_ww_ph_days', 'number of days left')}
            </li>
          </ul>
        </div>

        <div className="mb-4 mt-4 inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
          {langBtn('ar', 'العربية')}
          {langBtn('en', 'English')}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {textGroup('credit', t('settings_ww_credit_text', 'Credit notification'))}
          {textGroup('expiry', t('settings_ww_expiry_text', 'Expiry reminder'))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeWalletSection;
