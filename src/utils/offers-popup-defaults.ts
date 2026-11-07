import {
  MultilingualText,
  OfferPopup,
  OfferPopupDiscountType,
  OfferPopupFormFieldKey,
  OfferPopupFormFields,
  OfferPopupTriggerType,
  OfferPopupUrlRule,
} from '@/types/settings';

export const OFFER_POPUP_DEFAULTS = {
  badge_text: {
    ar: 'عرض لفترة محدودة',
    en: 'Limited time offer',
  } satisfies MultilingualText,
  button_text: {
    ar: 'احصل على العرض',
    en: 'Get the offer',
  } satisfies MultilingualText,
  success_message: {
    ar: 'تم استلام طلبك، فريقنا بيتواصل معك قريبًا',
    en: 'We received your request. Our team will contact you soon.',
  } satisfies MultilingualText,
  show_after_seconds: 8,
  show_after_scroll_percent: 50,
  hide_after_close_days: 3,
  offer_title_max: 60,
  badge_max: 25,
  button_max: 25,
} as const;

export const OFFER_POPUP_FORM_FIELD_META: Record<
  OfferPopupFormFieldKey,
  { label: string; validation: string }
> = {
  name: { label: 'Name', validation: 'Min. 2 characters' },
  mobile: {
    label: 'Mobile number',
    validation: 'Saudi format, +966 5X XXX XXXX',
  },
  service: {
    label: 'Service',
    validation: 'Dropdown from services list',
  },
  consent: {
    label: 'Marketing consent',
    validation: 'Checkbox, unchecked by default',
  },
};

export function createDefaultFormFields(
  overrides: Partial<OfferPopupFormFields> = {}
): OfferPopupFormFields {
  return {
    name: { visible: true, required: true },
    mobile: { visible: true, required: true },
    service: { visible: false, required: false },
    consent: { visible: true, required: true },
    ...overrides,
  };
}

function emptyLang(ar = '', en = ''): MultilingualText {
  return { ar, en };
}

function asMultilingual(
  value: unknown,
  fallbackAr = '',
  fallbackEn = ''
): MultilingualText {
  if (value && typeof value === 'object' && ('ar' in value || 'en' in value)) {
    const v = value as Partial<MultilingualText>;
    return {
      ar: typeof v.ar === 'string' ? v.ar : fallbackAr,
      en: typeof v.en === 'string' ? v.en : fallbackEn,
    };
  }
  if (typeof value === 'string') {
    return { ar: value, en: fallbackEn || value };
  }
  return emptyLang(fallbackAr, fallbackEn);
}

export function createDefaultOfferPopup(
  overrides: Partial<OfferPopup> = {}
): OfferPopup {
  return {
    id: `popup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    status: 'active',
    url_rules: [{ match: 'contains', value: '/offers' }],
    devices: 'both',
    priority: 1,
    trigger_type: 'whichever_first',
    show_after_seconds: OFFER_POPUP_DEFAULTS.show_after_seconds,
    show_after_scroll_percent: OFFER_POPUP_DEFAULTS.show_after_scroll_percent,
    offer_title: emptyLang(),
    badge_text: { ...OFFER_POPUP_DEFAULTS.badge_text },
    discount_type: 'percentage',
    discount_value: 20,
    start_date: null,
    end_date: null,
    coupon_id: null,
    coupon_code: '',
    show_countdown: true,
    auto_hide_after_end: true,
    form_fields: createDefaultFormFields(),
    button_text: { ...OFFER_POPUP_DEFAULTS.button_text },
    success_message: { ...OFFER_POPUP_DEFAULTS.success_message },
    max_times_per_visitor: 'once_per_session',
    hide_after_close_days: OFFER_POPUP_DEFAULTS.hide_after_close_days,
    never_show_after_submit: true,
    save_to_leads: true,
    notify_call_center: true,
    tracking: {
      meta_lead: true,
      snapchat_sign_up: true,
      ga4_generate_lead: true,
      tiktok_submit_form: true,
    },
    ...overrides,
  };
}

/** Normalize older saved popups into the current shape. */
export function normalizeOfferPopup(raw: any): OfferPopup {
  const base = createDefaultOfferPopup();
  if (!raw || typeof raw !== 'object') return base;

  const legacyServiceVisible = Boolean(raw.show_service_field);
  const form_fields = createDefaultFormFields(
    raw.form_fields && typeof raw.form_fields === 'object'
      ? {
          name: {
            visible: raw.form_fields.name?.visible !== false,
            required: raw.form_fields.name?.required !== false,
          },
          mobile: {
            visible: raw.form_fields.mobile?.visible !== false,
            required: raw.form_fields.mobile?.required !== false,
          },
          service: {
            visible:
              raw.form_fields.service?.visible ?? legacyServiceVisible,
            required: Boolean(raw.form_fields.service?.required),
          },
          consent: {
            visible: raw.form_fields.consent?.visible !== false,
            required: raw.form_fields.consent?.required !== false,
          },
        }
      : {
          service: { visible: legacyServiceVisible, required: false },
        }
  );

  return {
    ...base,
    ...raw,
    offer_title: asMultilingual(
      raw.offer_title ?? raw.offer_title_ar,
      '',
      ''
    ),
    badge_text: asMultilingual(
      raw.badge_text,
      OFFER_POPUP_DEFAULTS.badge_text.ar,
      OFFER_POPUP_DEFAULTS.badge_text.en
    ),
    button_text: asMultilingual(
      raw.button_text,
      OFFER_POPUP_DEFAULTS.button_text.ar,
      OFFER_POPUP_DEFAULTS.button_text.en
    ),
    success_message: asMultilingual(
      raw.success_message,
      OFFER_POPUP_DEFAULTS.success_message.ar,
      OFFER_POPUP_DEFAULTS.success_message.en
    ),
    coupon_id: raw.coupon_id ?? null,
    coupon_code: raw.coupon_code || raw.promo_code || '',
    form_fields,
    tracking: {
      ...base.tracking,
      ...(raw.tracking || {}),
    },
    url_rules: Array.isArray(raw.url_rules)
      ? raw.url_rules.map((r: OfferPopupUrlRule) => ({ ...r }))
      : base.url_rules,
  };
}

export function duplicateOfferPopup(popup: OfferPopup): OfferPopup {
  const normalized = normalizeOfferPopup(popup);
  return {
    ...normalized,
    id: `popup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: `${normalized.name || 'Popup'} (copy)`,
    tracking: { ...normalized.tracking },
    url_rules: normalized.url_rules.map((r) => ({ ...r })),
    offer_title: { ...normalized.offer_title },
    badge_text: { ...normalized.badge_text },
    button_text: { ...normalized.button_text },
    success_message: { ...normalized.success_message },
    form_fields: {
      name: { ...normalized.form_fields.name },
      mobile: { ...normalized.form_fields.mobile },
      service: { ...normalized.form_fields.service },
      consent: { ...normalized.form_fields.consent },
    },
  };
}

export type OfferPopupValidationErrors = Partial<
  Record<string, string>
>;

function langLenError(
  value: MultilingualText,
  max: number,
  label: string,
  requireBoth: boolean
): string | undefined {
  if (requireBoth) {
    if (!value.ar.trim()) return `${label} (Arabic) is required`;
    if (!value.en.trim()) return `${label} (English) is required`;
  }
  if (value.ar.length > max || value.en.length > max) {
    return `${label}: max ${max} characters per language`;
  }
  return undefined;
}

export function validateOfferPopup(
  popup: OfferPopup
): OfferPopupValidationErrors {
  const errors: OfferPopupValidationErrors = {};
  const p = normalizeOfferPopup(popup);

  if (!p.name.trim()) {
    errors.name = 'Popup name is required';
  }

  const titleErr = langLenError(
    p.offer_title,
    OFFER_POPUP_DEFAULTS.offer_title_max,
    'Offer title',
    true
  );
  if (titleErr) errors.offer_title = titleErr;

  const badgeErr = langLenError(
    p.badge_text,
    OFFER_POPUP_DEFAULTS.badge_max,
    'Badge text',
    false
  );
  if (badgeErr) errors.badge_text = badgeErr;

  const buttonErr = langLenError(
    p.button_text,
    OFFER_POPUP_DEFAULTS.button_max,
    'Button text',
    true
  );
  if (buttonErr) errors.button_text = buttonErr;

  if (!p.success_message.ar.trim() || !p.success_message.en.trim()) {
    errors.success_message = 'Success message is required in Arabic and English';
  }

  const rules = p.url_rules.filter((r) => r.value.trim());
  if (rules.length === 0) {
    errors.url_rules = 'At least one URL rule is required';
  }

  if (!p.coupon_id) {
    errors.coupon_id = 'Select or create a promo coupon';
  }

  if (p.discount_type !== 'free_session') {
    if (p.discount_value == null || Number.isNaN(p.discount_value)) {
      errors.discount_value = 'Discount value is required';
    } else if (
      p.discount_type === 'percentage' &&
      (p.discount_value < 1 || p.discount_value > 100)
    ) {
      errors.discount_value = 'Percentage must be between 1 and 100';
    } else if (p.discount_type === 'fixed' && p.discount_value < 1) {
      errors.discount_value = 'Fixed amount must be at least 1';
    }
  }

  if (p.start_date && p.end_date) {
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    if (end < start) {
      errors.dates = 'End date must be after start date';
    }
  }

  if (p.show_after_seconds < 0 || p.show_after_seconds > 120) {
    errors.show_after_seconds = 'Must be between 0 and 120';
  }

  if (
    p.show_after_scroll_percent < 10 ||
    p.show_after_scroll_percent > 100
  ) {
    errors.show_after_scroll_percent = 'Must be between 10 and 100';
  }

  if (p.hide_after_close_days < 0 || p.hide_after_close_days > 30) {
    errors.hide_after_close_days = 'Must be between 0 and 30';
  }

  if (p.priority < 1) {
    errors.priority = 'Priority must be at least 1';
  }

  const visibleFields = (
    Object.keys(p.form_fields) as OfferPopupFormFieldKey[]
  ).filter((key) => p.form_fields[key].visible);
  if (visibleFields.length === 0) {
    errors.form_fields = 'At least one form field must be visible';
  }

  return errors;
}

export function isOfferPopupValid(popup: OfferPopup): boolean {
  return Object.keys(validateOfferPopup(popup)).length === 0;
}

export function formatDiscountDisplay(
  type: OfferPopupDiscountType,
  value: number | null,
  lang: 'ar' | 'en' = 'ar'
): { label: string; big: string } {
  if (type === 'free_session') {
    return lang === 'en'
      ? { label: 'Assessment session', big: 'Free' }
      : { label: 'جلسة تقييم', big: 'مجانًا' };
  }
  if (type === 'fixed') {
    return lang === 'en'
      ? { label: 'Discount', big: `${value ?? 0} SAR` }
      : { label: 'خصم', big: `${value ?? 0} ر.س` };
  }
  return lang === 'en'
    ? { label: 'Discount', big: `${value ?? 0}%` }
    : { label: 'خصم', big: `${value ?? 0}%` };
}

export function mapPopupDiscountToCouponType(
  type: OfferPopupDiscountType
): 'percent' | 'fixed' | 'free_service' {
  if (type === 'fixed') return 'fixed';
  if (type === 'free_session') return 'free_service';
  return 'percent';
}

/** Prefill values for CreateOrUpdateCoupon from the popup offer. */
export function buildCouponInitFromPopup(popup: OfferPopup) {
  const p = normalizeOfferPopup(popup);
  const truncate = (s: string, max: number) =>
    s.trim().slice(0, max) || undefined;

  return {
    name: {
      en:
        truncate(p.offer_title.en, 16) ||
        truncate(p.name, 16) ||
        'Offer popup',
      ar:
        truncate(p.offer_title.ar, 16) ||
        truncate(p.name, 16) ||
        'عرض',
    },
    description: {
      en: truncate(p.badge_text.en, 30) || '',
      ar: truncate(p.badge_text.ar, 30) || '',
    },
    code: p.coupon_code || '',
    type: mapPopupDiscountToCouponType(p.discount_type),
    value:
      p.discount_type === 'free_session'
        ? 0
        : p.discount_value ?? 0,
    starts_at: p.start_date
      ? `${p.start_date} 00:00:00`
      : null,
    ends_at: p.end_date ? `${p.end_date} 23:59:59` : null,
    is_active: p.status === 'active',
    global: false,
    eligible_user_type: 'any' as const,
    first_booking_scope: 'none' as const,
    service_ids: [] as number[],
    free_service_ids: [] as number[],
    city_ids: [] as number[],
    country_ids: [] as number[],
    phone_numbers: [] as string[],
    insurance_types: [],
    patient_segments: [] as string[],
  };
}

export function triggerNeedsSeconds(type: OfferPopupTriggerType): boolean {
  return type === 'time_delay' || type === 'whichever_first';
}

export function triggerNeedsScroll(type: OfferPopupTriggerType): boolean {
  return type === 'scroll_depth' || type === 'whichever_first';
}

export function formatUrlRulesSummary(rules: OfferPopupUrlRule[]): string {
  const valid = rules.filter((r) => r.value.trim());
  if (!valid.length) return 'no pages configured';
  return valid
    .map((r) =>
      r.match === 'equals' ? `equals ${r.value}` : `containing ${r.value}`
    )
    .join(', or ');
}

export function formatTriggerSummary(popup: OfferPopup): string {
  switch (popup.trigger_type) {
    case 'time_delay':
      return `after ${popup.show_after_seconds} seconds`;
    case 'scroll_depth':
      return `after ${popup.show_after_scroll_percent}% scroll`;
    case 'exit_intent':
      return 'on exit intent (desktop)';
    case 'whichever_first':
    default:
      return `after ${popup.show_after_seconds} seconds or ${popup.show_after_scroll_percent}% scroll, whichever comes first`;
  }
}

export function formatFrequencySummary(popup: OfferPopup): string {
  const max =
    popup.max_times_per_visitor === 'once_per_session'
      ? 'once per session'
      : popup.max_times_per_visitor === 'once_per_day'
        ? 'once per day'
        : 'every visit';
  return `${max}, hidden ${popup.hide_after_close_days} days after close`;
}

export function formatDateRangeSummary(popup: OfferPopup): string {
  if (!popup.start_date && !popup.end_date) return 'no date range set';
  const fmt = (d: string | null) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };
  return `${fmt(popup.start_date)} – ${fmt(popup.end_date)}`;
}

/** Public website base used for “Preview on site”. */
export function getWebsitePreviewBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://home-healers.com'
  );
}

export function buildPopupPreviewUrl(popup: OfferPopup): string {
  const base = getWebsitePreviewBaseUrl().replace(/\/$/, '');
  const rule =
    popup.url_rules.find((r) => r.value.trim())?.value.trim() || '/offers';
  const path = rule.startsWith('http')
    ? rule
    : `${base}${rule.startsWith('/') ? rule : `/${rule}`}`;
  const url = new URL(path.startsWith('http') ? path : `${base}${path}`);
  url.searchParams.set('popup_preview', '1');
  url.searchParams.set('popup_id', popup.id);
  return url.toString();
}
