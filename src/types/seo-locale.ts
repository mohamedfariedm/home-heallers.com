export type SeoLocale = 'en' | 'ar';

export type LocaleTextMap = {
  en: string | null;
  ar: string | null;
};

export const SEO_TITLE_MAX = 255;
export const SEO_DESCRIPTION_MAX = 500;

export type EntitySeoModule = 'category' | 'service' | 'blog';
