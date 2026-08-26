export type OfferLocale = 'en' | 'ar';

export type TranslationMap = {
  en?: string;
  ar?: string;
  [locale: string]: string | undefined;
};

export type LocaleListMap = {
  en?: string[];
  ar?: string[];
  [locale: string]: string[] | undefined;
};

export type OfferStatus =
  | 'expired'
  | 'archived'
  | 'draft'
  | 'scheduled'
  | 'published';

export type OfferSort =
  | 'featured'
  | 'best_seller'
  | 'highest_discount'
  | 'newest'
  | 'price_asc'
  | 'price_desc';

export const OFFER_PAGE_SIZES = [25, 50, 100] as const;
export const OFFER_PAGE_SIZE_KEY = 'offers-page-size';

export const TRANSLATABLE_FIELDS = [
  'name',
  'short_description',
  'description',
  'tags',
  'highlights',
  'package_includes',
  'suitable_conditions',
  'why_choose_home_healers',
  'patient_journey',
  'benefits',
  'before_treatment',
  'after_treatment',
  'terms_conditions',
  'cancellation_policy',
  'visit_duration',
  'location_type',
  'meta_title',
  'meta_description',
] as const;

export const RICH_TEXT_FIELDS = [
  'description',
  'why_choose_home_healers',
  'benefits',
  'before_treatment',
  'after_treatment',
  'terms_conditions',
  'cancellation_policy',
] as const;

export const LIST_FIELDS = [
  'highlights',
  'package_includes',
  'suitable_conditions',
  'patient_journey',
  'tags',
] as const;
