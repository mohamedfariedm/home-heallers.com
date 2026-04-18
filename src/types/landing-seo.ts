/** Per-page SEO stored with the landing builder project (not Next metadata). */
export type LandingPageSeo = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  /** Open Graph */
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogSiteName: string;
  ogLocale: string;
  /** Twitter / X cards */
  twitterCard: 'summary' | 'summary_large_image';
  twitterSite: string;
  twitterCreator: string;
  /** e.g. index,follow | noindex,nofollow */
  robots: string;
  /** Alternate locale hint (hreflang companion) */
  alternateLocale: string;
  hreflangEnUrl: string;
  hreflangArUrl: string;
  /** Optional JSON-LD (raw JSON string, merged into one script on publish) */
  jsonLd: string;
  /** PWA / browser chrome */
  themeColor: string;
};

export const DEFAULT_LANDING_PAGE_SEO: LandingPageSeo = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogUrl: '',
  ogSiteName: '',
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterSite: '',
  twitterCreator: '',
  robots: 'index, follow',
  alternateLocale: 'ar_SA',
  hreflangEnUrl: '',
  hreflangArUrl: '',
  jsonLd: '',
  themeColor: '#6366f1',
};

export function mergeLandingPageSeo(
  current: LandingPageSeo | undefined,
  patch: Partial<LandingPageSeo>,
): LandingPageSeo {
  return { ...DEFAULT_LANDING_PAGE_SEO, ...(current ?? {}), ...patch };
}
