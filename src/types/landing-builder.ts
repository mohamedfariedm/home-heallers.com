export type LandingButton = {
  id: string;
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  openInNewTab?: boolean;
};

export type LandingFeature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  /** Optional card image (lazy-loaded in preview) */
  imageUrl?: string;
};

export type LandingPlan = {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type LandingTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatarUrl?: string;
};

export type LandingFaq = {
  id: string;
  question: string;
  answer: string;
};

export type LandingSectionId =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'about'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'cta'
  | 'footer';

export type LandingTemplateId = 'saas' | 'mobile' | 'ecommerce' | 'agency' | 'portfolio';

export type TypographyPreset = 'sm' | 'md' | 'lg' | 'xl';

export type LandingDesign = {
  typographyPreset: TypographyPreset;
  /** CSS aspect-ratio value e.g. 16/9, 4/3 */
  heroAspectRatio: string;
  /** e.g. 400px or 50vh — empty = no max */
  heroMaxHeight: string;
  heroObjectFit: 'cover' | 'contain';
  /** On large screens, cap hero image column width (40–100%) */
  heroImageColumnMaxWidthPct: number;
  featureImageAspectRatio: string;
  /** Min height for feature card image area */
  featureImageHeight: string;
  featureImageObjectFit: 'cover' | 'contain';
  logoMaxHeightPx: number;
  testimonialAvatarPx: number;
  /** 0 = sharp, 50 = full circle on square avatars */
  testimonialAvatarRadiusPercent: number;
  sectionPadding: 'compact' | 'normal' | 'relaxed';
  /** Corner rounding as % of box (50% ≈ circle on square hero crop) */
  heroImageBorderRadiusPercent: number;
  featureImageBorderRadiusPercent: number;
  logoBorderRadiusPx: number;
};

export type LandingPageConfig = {
  productName: string;
  tagline: string;
  description: string;
  aboutTitle: string;
  aboutBody: string;
  features: LandingFeature[];
  plans: LandingPlan[];
  testimonials: LandingTestimonial[];
  faqs: LandingFaq[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtons: LandingButton[];
  heroButtons: LandingButton[];
  navLinks: { id: string; label: string; href: string }[];
  heroImageUrl: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  footerNote: string;
  /** Active sections only; drag to reorder in the builder */
  sectionOrder: LandingSectionId[];
  templateId: LandingTemplateId;
  design: LandingDesign;
};

export const LANDING_SECTION_IDS: LandingSectionId[] = [
  'navbar',
  'hero',
  'features',
  'about',
  'pricing',
  'testimonials',
  'faq',
  'cta',
  'footer',
];

export function isLandingSectionId(v: string): v is LandingSectionId {
  return (LANDING_SECTION_IDS as string[]).includes(v);
}
