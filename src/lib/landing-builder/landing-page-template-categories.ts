import type { LandingCanvasPageTemplateId } from '@/lib/landing-builder/canvas-templates';

export type LandingPageTemplateCategory = {
  id: string;
  label: string;
  description: string;
  /** Cover image for the category step (Unsplash). */
  previewImageUrl: string;
  templateIds: readonly LandingCanvasPageTemplateId[];
};

/**
 * Organizes page templates into browseable groups (category → templates).
 * Every template id in `LANDING_CANVAS_PAGE_TEMPLATE_IDS` should appear exactly once.
 */
export const LANDING_PAGE_TEMPLATE_CATEGORIES: readonly LandingPageTemplateCategory[] =
  [
    {
      id: 'starter',
      label: 'Starter',
      description: 'Blank canvas or a quick baseline with hero and form.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80&auto=format&fit=crop',
      templateIds: ['blank', 'starter'],
    },
    {
      id: 'medical',
      label: 'Medical & health',
      description: 'Clinics, dental practices, and wellness / spa brands.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop',
      templateIds: ['medical-clinic', 'medical-dental', 'medical-spa'],
    },
    {
      id: 'ecommerce',
      label: 'E‑commerce',
      description: 'Retail, luxury, and digital product storefronts.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d?w=800&q=80&auto=format&fit=crop',
      templateIds: ['ecommerce', 'ecommerce-luxury', 'ecommerce-digital'],
    },
    {
      id: 'saas',
      label: 'SaaS & business',
      description: 'Marketing sites, enterprise, agencies, and lead capture.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
      templateIds: ['saas-marketing', 'saas-enterprise', 'lead-capture', 'agency'],
    },
    {
      id: 'creative',
      label: 'Creative & media',
      description: 'Portfolios, weddings, podcasts, and minimal pro sites.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
      templateIds: ['portfolio', 'minimal-pro', 'wedding', 'podcast'],
    },
    {
      id: 'local',
      label: 'Local & lifestyle',
      description: 'Restaurants, gyms, property, and neighborhood services.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
      templateIds: ['local-business', 'restaurant', 'real-estate', 'fitness'],
    },
    {
      id: 'events',
      label: 'Events & learning',
      description: 'Conferences, courses, nonprofits, and coming soon pages.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1540575464067-76c5d61a47a4?w=800&q=80&auto=format&fit=crop',
      templateIds: ['event', 'elearning', 'nonprofit', 'coming-soon'],
    },
    {
      id: 'apps',
      label: 'Apps',
      description: 'Mobile product landings with store CTAs.',
      previewImageUrl:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
      templateIds: ['mobile-app'],
    },
  ] as const;

export type LandingPageTemplateCategoryId =
  (typeof LANDING_PAGE_TEMPLATE_CATEGORIES)[number]['id'];

export function getCategoryById(
  id: string,
): LandingPageTemplateCategory | undefined {
  return LANDING_PAGE_TEMPLATE_CATEGORIES.find((c) => c.id === id);
}
