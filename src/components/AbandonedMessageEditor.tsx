'use client';

import React, { useRef, useState } from 'react';
import { MessageSquareText, Smartphone, RotateCcw, Wand2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AbandonedPaymentCouponSettings } from '@/types/settings';

/**
 * Keys of the editable message texts inside the `setting` object.
 * Kept in one place so they can be renamed in a single edit if the backend
 * uses different names.
 */
export const MESSAGE_KEYS = {
  title: {
    ar: 'abandoned_payment_message_title_ar',
    en: 'abandoned_payment_message_title_en',
  },
  body: {
    ar: 'abandoned_payment_message_body_ar',
    en: 'abandoned_payment_message_body_en',
  },
} as const;

export const MESSAGE_LIMITS = { title: 100, body: 500 } as const;

type Lang = 'ar' | 'en';
type Field = 'title' | 'body';

/** Placeholders the admin can insert; replaced by the server per customer. */
const PLACEHOLDERS = [
  { token: '{name}', ar: 'اسم العميل', en: 'Customer name' },
  { token: '{percent}', ar: 'نسبة الخصم', en: 'Discount %' },
  { token: '{code}', ar: 'كود الكوبون', en: 'Coupon code' },
] as const;

const SAMPLE: Record<Lang, { name: string; code: string }> = {
  ar: { name: 'أحمد', code: 'HH-7K2P9X' },
  en: { name: 'Ahmed', code: 'HH-7K2P9X' },
};

/** Starting point the admin can apply with one click. */
const SUGGESTED: Record<Lang, { title: string; body: string }> = {
  ar: {
    title: 'حجزك لسه ما اكتملش',
    body: 'أهلاً {name}، لاحظنا إن حجزك لسه ما اكتملش. كمّل حجزك دلوقتي واستخدم كود {code} لخصم {percent}%.',
  },
  en: {
    title: 'Your booking is not complete yet',
    body: 'Hi {name}, we noticed your booking is not complete. Finish it now and use code {code} to get {percent}% off.',
  },
};

function renderPreview(
  text: string,
  lang: Lang,
  percent: number | string
): string {
  return text
    .replace(/\{name\}/g, SAMPLE[lang].name)
    .replace(/\{code\}/g, SAMPLE[lang].code)
    .replace(/\{percent\}/g, String(percent ?? ''));
}

interface Props {
  values: AbandonedPaymentCouponSettings;
  onChange: (partial: Partial<AbandonedPaymentCouponSettings>) => void;
}

const AbandonedMessageEditor: React.FC<Props> = ({ values, onChange }) => {
  const { t } = useTranslation('settings');
  const [lang, setLang] = useState<Lang>('ar');
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastField = useRef<Field>('body');

  const reminderEnabled = Boolean(values.abandoned_payment_reminder_enabled);
  const couponEnabled = Boolean(values.abandoned_payment_coupon_enabled);

  const get = (field: Field, l: Lang): string =>
    ((values as any)[MESSAGE_KEYS[field][l]] as string | undefined) ?? '';
  const set = (field: Field, l: Lang, v: string) =>
    onChange({ [MESSAGE_KEYS[field][l]]: v } as any);

  const title = get('title', lang);
  const body = get('body', lang);
  const isEmpty = !title.trim() && !body.trim();
  const isRtl = lang === 'ar';

  const insertToken = (token: string) => {
    const field = lastField.current;
    const el = field === 'title' ? titleRef.current : bodyRef.current;
    const current = get(field, lang);
    const limit = MESSAGE_LIMITS[field];
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    if (next.length > limit) return;
    set(field, lang, next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + token.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  // Hints that explain how the text interacts with the coupon toggle.
  const joined = `${title} ${body}`;
  const usesCoupon = /\{code\}|\{percent\}/.test(joined);
  const hasCode = /\{code\}/.test(joined);
  let warning: string | null = null;
  if (!couponEnabled && usesCoupon) {
    warning = t(
      'settings_msg_warn_coupon_off',
      'The coupon is turned off, but this text uses {code} / {percent}. Remove them, or turn the coupon on.'
    );
  } else if (couponEnabled && !isEmpty && !hasCode) {
    warning = t(
      'settings_msg_warn_no_code',
      'The coupon is on, but the text does not include {code}. The customer will not see the coupon code.'
    );
  }

  const tabBtn = (l: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(l)}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        lang === l
          ? 'bg-[#143087] text-white'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="mb-2 flex items-start gap-3">
        <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#143087]" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('settings_msg_title', 'Message text')}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t(
              'settings_msg_desc',
              'This is the notification the customer receives. The same text is used whether or not a coupon is attached. Leave it empty to use the system default text.'
            )}
          </p>
        </div>
      </div>

      <div className="mb-5 mt-4 inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {tabBtn('ar', t('settings_msg_lang_ar', 'العربية'))}
        {tabBtn('en', t('settings_msg_lang_en', 'English'))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings_msg_field_title', 'Title')}
              </label>
              <span className="text-xs text-gray-400">
                {title.length}/{MESSAGE_LIMITS.title}
              </span>
            </div>
            <input
              ref={titleRef}
              type="text"
              dir={isRtl ? 'rtl' : 'ltr'}
              maxLength={MESSAGE_LIMITS.title}
              value={title}
              onFocus={() => (lastField.current = 'title')}
              onChange={(e) => set('title', lang, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {t('settings_msg_field_body', 'Message')}
              </label>
              <span className="text-xs text-gray-400">
                {body.length}/{MESSAGE_LIMITS.body}
              </span>
            </div>
            <textarea
              ref={bodyRef}
              rows={5}
              dir={isRtl ? 'rtl' : 'ltr'}
              maxLength={MESSAGE_LIMITS.body}
              value={body}
              onFocus={() => (lastField.current = 'body')}
              onChange={(e) => set('body', lang, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#143087] focus:outline-none focus:ring-2 focus:ring-[#143087]/20"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">
              {t(
                'settings_msg_placeholders',
                'Click to insert into the field you are editing:'
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {PLACEHOLDERS.map((p) => (
                <button
                  key={p.token}
                  type="button"
                  // keep focus (and cursor position) in the text field
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertToken(p.token)}
                  className="rounded-full border border-[#143087]/30 bg-white px-3 py-1 text-xs text-[#143087] hover:bg-[#143087]/5"
                >
                  <span className="font-mono">{p.token}</span>
                  <span className="mx-1 text-gray-400">·</span>
                  {lang === 'ar' ? p.ar : p.en}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                // One update for both fields (two calls would overwrite each other).
                onChange({
                  [MESSAGE_KEYS.title[lang]]: SUGGESTED[lang].title,
                  [MESSAGE_KEYS.body[lang]]: SUGGESTED[lang].body,
                } as any);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Wand2 className="h-4 w-4" />
              {t('settings_msg_use_suggested', 'Use suggested text')}
            </button>
            <button
              type="button"
              disabled={isEmpty}
              onClick={() => {
                onChange({
                  [MESSAGE_KEYS.title[lang]]: '',
                  [MESSAGE_KEYS.body[lang]]: '',
                } as any);
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              {t('settings_msg_reset', 'Reset to system default')}
            </button>
          </div>

          {warning && (
            <p
              role="alert"
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              {warning}
            </p>
          )}
        </div>

        {/* Live preview */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Smartphone className="h-4 w-4 text-[#143087]" />
            {t('settings_msg_preview', 'Preview as the customer sees it')}
          </div>
          <div
            className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-opacity ${
              reminderEnabled ? '' : 'opacity-60'
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#143087] text-[10px] font-bold text-white">
                HH
              </span>
              Home Healers · {lang === 'ar' ? 'الآن' : 'now'}
            </div>
            {isEmpty ? (
              <p className="text-sm italic text-gray-500">
                {t(
                  'settings_msg_preview_empty',
                  'The system default text will be sent.'
                )}
              </p>
            ) : (
              <div dir={isRtl ? 'rtl' : 'ltr'}>
                {title.trim() ? (
                  <p className="font-semibold text-gray-900">
                    {renderPreview(
                      title,
                      lang,
                      values.abandoned_payment_coupon_percent
                    )}
                  </p>
                ) : (
                  <p className="text-sm italic text-gray-500">
                    {t(
                      'settings_msg_preview_default_title',
                      'The system default title will be sent.'
                    )}
                  </p>
                )}
                {body.trim() ? (
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                    {renderPreview(
                      body,
                      lang,
                      values.abandoned_payment_coupon_percent
                    )}
                  </p>
                ) : (
                  <p className="mt-1 text-sm italic text-gray-500">
                    {t(
                      'settings_msg_preview_default_body',
                      'The system default message will be sent.'
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {reminderEnabled
              ? t(
                  'settings_msg_preview_note',
                  'Sample values are used for the name and code. The real values are filled in per customer.'
                )
              : t(
                  'settings_msg_preview_inactive',
                  'The message is not active right now, so nothing is sent until you turn it on.'
                )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AbandonedMessageEditor;
