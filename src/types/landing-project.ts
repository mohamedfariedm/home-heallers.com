import type { CanvasPage } from '@/types/landing-canvas';
import type { LandingPageConfig } from '@/types/landing-builder';
import type { LandingPageSeo } from '@/types/landing-seo';

export type LandingLocale = 'en' | 'ar';

export type LandingPageDocument = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** English and Arabic canvas copies — edit each locale from the builder toolbar. */
  canvasLocales: Record<LandingLocale, CanvasPage>;
  seo: LandingPageSeo;
  /** @deprecated Loaded into canvasLocales.en then stripped in normalize */
  canvas?: CanvasPage;
  /** Legacy field — removed after load migration */
  config?: LandingPageConfig;
};

export type LandingProjectState = {
  version: 1;
  pages: LandingPageDocument[];
  /** null = show page list; string = editing that page */
  activePageId: string | null;
};

export const LANDING_PROJECT_STORAGE_KEY = 'landing-builder-project-v1';
export const LANDING_LEGACY_CONFIG_KEY = 'landing-builder-config-v1';
