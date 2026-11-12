'use client';

import React from 'react';
import { OfferPopup } from '@/types/settings';
import {
  formatDiscountDisplay,
  normalizeOfferPopup,
} from '@/utils/offers-popup-defaults';

interface OfferPopupPreviewProps {
  popup: OfferPopup;
  lang?: 'ar' | 'en';
}

export default function OfferPopupPreview({
  popup,
  lang = 'ar',
}: OfferPopupPreviewProps) {
  const p = normalizeOfferPopup(popup);
  const discount = formatDiscountDisplay(
    p.discount_type,
    p.discount_value,
    lang
  );
  const title = p.offer_title[lang] || p.offer_title.ar || p.offer_title.en;
  const badge = p.badge_text[lang] || p.badge_text.ar || p.badge_text.en;
  const button = p.button_text[lang] || p.button_text.ar || p.button_text.en;
  const isRtl = lang === 'ar';

  const namePh = isRtl ? 'اكتب اسمك' : 'Enter your name';
  const mobilePh = isRtl ? '5X XXX XXXX' : '5X XXX XXXX';
  const servicePh = isRtl ? 'اختر الخدمة' : 'Select a service';
  const consentLabel = isRtl
    ? 'أوافق على التواصل معي بخصوص العروض'
    : 'I agree to be contacted about offers';
  const formHeading = isRtl ? 'احجز عرضك الآن' : 'Book your offer now';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Live preview ({lang.toUpperCase()})
      </p>
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        className="mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      >
        <div className="bg-gradient-to-br from-[#143087] to-[#39519B] px-4 pb-5 pt-4 text-white">
          {badge ? (
            <span className="mb-3 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur">
              {badge}
            </span>
          ) : null}
          <p className="text-xs opacity-90">{discount.label}</p>
          <p className="mt-0.5 text-4xl font-bold leading-none tracking-tight">
            {discount.big}
          </p>
          <p className="mt-3 text-sm leading-snug opacity-95">
            {title || (isRtl ? 'عنوان العرض…' : 'Offer title…')}
          </p>
          {p.show_countdown && p.end_date ? (
            <p className="mt-3 text-[10px] opacity-80">
              {isRtl ? 'ينتهي العرض خلال —' : 'Offer ends in —'}
            </p>
          ) : null}
        </div>
        <div className="space-y-2.5 bg-gray-50 px-3 py-3">
          <p className="text-center text-xs font-semibold text-gray-800">
            {formHeading}
          </p>
          {p.form_fields.name.visible ? (
            <div className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[11px] leading-9 text-gray-400">
              {namePh}
              {p.form_fields.name.required ? ' *' : ''}
            </div>
          ) : null}
          {p.form_fields.mobile.visible ? (
            <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
              <span className="border-gray-200 bg-gray-100 px-2 text-[10px] leading-9 text-gray-600 ltr:border-r rtl:border-l">
                +966
              </span>
              <span className="flex-1 px-2 text-[11px] leading-9 text-gray-400">
                {mobilePh}
                {p.form_fields.mobile.required ? ' *' : ''}
              </span>
            </div>
          ) : null}
          {p.form_fields.service.visible ? (
            <div className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[11px] leading-9 text-gray-400">
              {servicePh}
              {p.form_fields.service.required ? ' *' : ''}
            </div>
          ) : null}
          {p.form_fields.consent.visible ? (
            <label className="flex items-start gap-2 text-[10px] text-gray-500">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded border border-gray-300 bg-white" />
              {consentLabel}
              {p.form_fields.consent.required ? ' *' : ''}
            </label>
          ) : null}
          <button
            type="button"
            className="w-full rounded-lg bg-[#143087] py-2.5 text-xs font-semibold text-white"
          >
            {button || (isRtl ? 'احصل على العرض' : 'Get the offer')}
          </button>
        </div>
      </div>
    </div>
  );
}
