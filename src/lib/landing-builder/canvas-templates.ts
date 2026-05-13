import type {
  CanvasCardBlock,
  CanvasGridBlock,
  CanvasPage,
  CanvasSection,
  CanvasStackBlock,
} from '@/types/landing-canvas';
import {
  defaultButtonBlock,
  defaultCardBlock,
  defaultCopyBlock,
  defaultFooterBlock,
  defaultFormBlock,
  defaultFormField,
  defaultGridBlock,
  defaultImageBlock,
  defaultNavbarBlock,
  defaultNavLink,
  defaultSection,
  defaultStackBlock,
  defaultTextBlock,
  mergeCanvasPage,
  newCanvasId,
  starterCanvasPage,
} from '@/lib/landing-builder/canvas-defaults';
import { createRowWithColumns } from '@/lib/landing-builder/block-presets';

/** Full-page starting points on “My pages”. */
export const LANDING_CANVAS_PAGE_TEMPLATE_IDS = [
  'blank',
  'starter',
  'saas-marketing',
  'lead-capture',
  'portfolio',
  'local-business',
  'event',
  'agency',
  'ecommerce',
  'ecommerce-digital',
  'ecommerce-luxury',
  'medical-clinic',
  'medical-dental',
  'medical-spa',
  'mobile-app',
  'nonprofit',
  'real-estate',
  'elearning',
  'fitness',
  'coming-soon',
  'podcast',
  'minimal-pro',
  'wedding',
  'saas-enterprise',
  'restaurant',
] as const;

export type LandingCanvasPageTemplateId =
  (typeof LANDING_CANVAS_PAGE_TEMPLATE_IDS)[number];

export const LANDING_CANVAS_PAGE_TEMPLATE_META: Record<
  LandingCanvasPageTemplateId,
  {
    label: string;
    description: string;
    suggestedName: string;
    /** Placeholder art for the template picker (not used on the canvas). */
    previewImageUrl: string;
  }
> = {
  blank: {
    label: 'Blank',
    description: 'Empty canvas — add sections and blocks yourself.',
    suggestedName: 'New page',
    previewImageUrl:
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80&auto=format&fit=crop',
  },
  starter: {
    label: 'Starter',
    description: 'Navbar, hero, lead form, and footer — quick baseline.',
    suggestedName: 'Starter landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&auto=format&fit=crop',
  },
  'saas-marketing': {
    label: 'SaaS marketing',
    description: 'Hero, features, social proof, pricing, FAQ, CTA, footer.',
    suggestedName: 'SaaS landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
  },
  'lead-capture': {
    label: 'Lead capture',
    description: 'Focused hero plus form and trust line — for ads and webinars.',
    suggestedName: 'Lead capture',
    previewImageUrl:
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80&auto=format&fit=crop',
  },
  portfolio: {
    label: 'Portfolio',
    description: 'Creative hero, work grid, about, contact, footer.',
    suggestedName: 'Portfolio',
    previewImageUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop',
  },
  'local-business': {
    label: 'Local business',
    description: 'Services, map-style story, hours, booking form.',
    suggestedName: 'Local business',
    previewImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
  },
  event: {
    label: 'Event / conference',
    description: 'Event hero, schedule, speakers, register CTA.',
    suggestedName: 'Event page',
    previewImageUrl:
      'https://images.unsplash.com/photo-1540575464067-76c5d61a47a4?w=800&q=80&auto=format&fit=crop',
  },
  agency: {
    label: 'Agency',
    description: 'Positioning hero, services, case cards, contact.',
    suggestedName: 'Agency site',
    previewImageUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  },
  ecommerce: {
    label: 'E‑commerce',
    description: 'Shop story, product highlights, trust row, checkout CTA.',
    suggestedName: 'Shop launch',
    previewImageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d?w=800&q=80&auto=format&fit=crop',
  },
  'ecommerce-digital': {
    label: 'Digital products',
    description: 'SaaS-style hero, feature cards, pricing, and checkout CTA.',
    suggestedName: 'Digital storefront',
    previewImageUrl:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&auto=format&fit=crop',
  },
  'ecommerce-luxury': {
    label: 'Luxury retail',
    description: 'Dark editorial hero, gallery, testimonials, premium CTA.',
    suggestedName: 'Luxury shop',
    previewImageUrl:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80&auto=format&fit=crop',
  },
  'medical-clinic': {
    label: 'Medical clinic',
    description: 'Primary care hero, services, trust row, appointment form.',
    suggestedName: 'Clinic landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80&auto=format&fit=crop',
  },
  'medical-dental': {
    label: 'Dental practice',
    description: 'Smile-forward hero, social proof, plans, booking form.',
    suggestedName: 'Dental practice',
    previewImageUrl:
      'https://images.unsplash.com/photo-1606811971618-4486f14f3b99?w=800&q=80&auto=format&fit=crop',
  },
  'medical-spa': {
    label: 'Med spa / wellness',
    description: 'Calm hero, treatment highlights, story, consultation form.',
    suggestedName: 'Med spa',
    previewImageUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&auto=format&fit=crop',
  },
  'mobile-app': {
    label: 'Mobile app',
    description: 'App store hero, feature grid, social proof, download CTA.',
    suggestedName: 'App landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
  },
  nonprofit: {
    label: 'Nonprofit',
    description: 'Mission hero, impact stats, story, donate form.',
    suggestedName: 'Campaign page',
    previewImageUrl:
      'https://images.unsplash.com/photo-1469571486292-0ba58a1f5da7?w=800&q=80&auto=format&fit=crop',
  },
  'real-estate': {
    label: 'Real estate',
    description: 'Property hero, details, gallery strip, contact agent.',
    suggestedName: 'Property listing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop',
  },
  elearning: {
    label: 'Online course',
    description: 'Course promise, curriculum list, instructor, enroll form.',
    suggestedName: 'Course landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop',
  },
  fitness: {
    label: 'Fitness / gym',
    description: 'Bold hero, programs grid, testimonials, join CTA.',
    suggestedName: 'Gym landing',
    previewImageUrl:
      'https://images.unsplash.com/photo-1534438327276-14e53078660e?w=800&q=80&auto=format&fit=crop',
  },
  'coming-soon': {
    label: 'Coming soon',
    description: 'Minimal waitlist: headline, teaser, email capture.',
    suggestedName: 'Coming soon',
    previewImageUrl:
      'https://images.unsplash.com/photo-1431440869469-c8949d6df0a4?w=800&q=80&auto=format&fit=crop',
  },
  podcast: {
    label: 'Podcast / media',
    description: 'Show hero, latest episodes grid, subscribe newsletter.',
    suggestedName: 'Podcast show',
    previewImageUrl:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80&auto=format&fit=crop',
  },
  'minimal-pro': {
    label: 'Minimal pro',
    description: 'Ultra-clean: hero, single feature row, quote, footer.',
    suggestedName: 'Minimal site',
    previewImageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format&fit=crop',
  },
  wedding: {
    label: 'Wedding / RSVP',
    description: 'Romantic hero, schedule, story, RSVP form.',
    suggestedName: 'Wedding site',
    previewImageUrl:
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop',
  },
  'saas-enterprise': {
    label: 'Enterprise SaaS',
    description: 'Security-forward hero, compliance row, features, contact.',
    suggestedName: 'Enterprise',
    previewImageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80&auto=format&fit=crop',
  },
  restaurant: {
    label: 'Restaurant',
    description: 'Menu hero, chef story, reservation form, hours.',
    suggestedName: 'Restaurant',
    previewImageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop',
  },
};

/** Single-section layouts for the Layers panel (“add from template”). */
export const LANDING_CANVAS_SECTION_TEMPLATE_IDS = [
  'header-navbar',
  'hero-centered',
  'hero-split',
  'hero-video-style',
  'logos-row',
  'logo-grid',
  'stats-row',
  'stats-four',
  'features-grid',
  'feature-cards-4',
  'bento-grid',
  'testimonials',
  'pricing-grid',
  'pricing-duo',
  'faq-cards',
  'faq-stack',
  'cta-banner',
  'cta-inline-bar',
  'contact-split',
  'story-image',
  'image-text-row',
  'two-columns',
  'vs-comparison',
  'team-grid',
  'schedule-text',
  'steps-timeline',
  'newsletter-inline',
  'app-download-cta',
  'gallery-grid',
  'quote-spotlight',
  'icon-features-row',
  'trust-checkmarks',
  'benefit-checklist',
  'announcement-banner',
  'text-lead-only',
  'divider-spacer',
  'footer-dark',
] as const;

export type LandingCanvasSectionTemplateId =
  (typeof LANDING_CANVAS_SECTION_TEMPLATE_IDS)[number];

export const LANDING_CANVAS_SECTION_TEMPLATE_META: Record<
  LandingCanvasSectionTemplateId,
  {
    label: string;
    description: string;
    previewImageUrl: string;
  }
> = {
  'header-navbar': {
    label: 'Header + navbar',
    description: 'Sticky bar with logo, links, and CTA.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=480&q=80&auto=format&fit=crop',
  },
  'hero-centered': {
    label: 'Hero (centered)',
    description: 'Eyebrow, headline, buttons.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=480&q=80&auto=format&fit=crop',
  },
  'hero-split': {
    label: 'Hero (split)',
    description: 'Copy and image in two columns.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=480&q=80&auto=format&fit=crop',
  },
  'logos-row': {
    label: 'Logo / partner row',
    description: 'Trust line plus partner placeholders.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&q=80&auto=format&fit=crop',
  },
  'stats-row': {
    label: 'Stats row',
    description: 'Three impact numbers with labels.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=480&q=80&auto=format&fit=crop',
  },
  'features-grid': {
    label: 'Features grid',
    description: 'Three feature cards in a row.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1507925929438-61e75d5e6a31?w=480&q=80&auto=format&fit=crop',
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Three quote cards.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=480&q=80&auto=format&fit=crop',
  },
  'pricing-grid': {
    label: 'Pricing',
    description: 'Three tier cards (highlight middle).',
    previewImageUrl:
      'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=480&q=80&auto=format&fit=crop',
  },
  'faq-cards': {
    label: 'FAQ',
    description: 'Question and answer cards.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=480&q=80&auto=format&fit=crop',
  },
  'cta-banner': {
    label: 'CTA band',
    description: 'Bold gradient strip with dual buttons.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=480&q=80&auto=format&fit=crop',
  },
  'contact-split': {
    label: 'Contact + form',
    description: 'Copy beside a contact form.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=480&q=80&auto=format&fit=crop',
  },
  'story-image': {
    label: 'Story + image',
    description: 'Large visual with supporting copy.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=480&q=80&auto=format&fit=crop',
  },
  'two-columns': {
    label: 'Two columns',
    description: 'Side-by-side copy blocks.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=480&q=80&auto=format&fit=crop',
  },
  'team-grid': {
    label: 'Team grid',
    description: 'People cards in a grid.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=480&q=80&auto=format&fit=crop',
  },
  'schedule-text': {
    label: 'Schedule list',
    description: 'Simple agenda-style text blocks.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=480&q=80&auto=format&fit=crop',
  },
  'newsletter-inline': {
    label: 'Newsletter',
    description: 'Short pitch plus email capture.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=480&q=80&auto=format&fit=crop',
  },
  'hero-video-style': {
    label: 'Hero + poster',
    description: 'Wide visual with headline — like a video hero.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=480&q=80&auto=format&fit=crop',
  },
  'logo-grid': {
    label: 'Logo grid',
    description: 'Six partner names in a tidy grid.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=480&q=80&auto=format&fit=crop',
  },
  'stats-four': {
    label: 'Stats (4-up)',
    description: 'Four KPIs in one row.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=480&q=80&auto=format&fit=crop',
  },
  'feature-cards-4': {
    label: 'Feature cards ×4',
    description: 'Four equal feature tiles.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=480&q=80&auto=format&fit=crop',
  },
  'bento-grid': {
    label: 'Bento grid',
    description: 'Two×two card mosaic.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1559027615-cd4628902a4a?w=480&q=80&auto=format&fit=crop',
  },
  'pricing-duo': {
    label: 'Pricing (2 tiers)',
    description: 'Side‑by‑side plans.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=480&q=80&auto=format&fit=crop',
  },
  'faq-stack': {
    label: 'FAQ (stacked)',
    description: 'Vertical Q&A lines — compact.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=480&q=80&auto=format&fit=crop',
  },
  'cta-inline-bar': {
    label: 'CTA inline',
    description: 'Headline + buttons in one row.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=480&q=80&auto=format&fit=crop',
  },
  'image-text-row': {
    label: 'Image + text row',
    description: 'Photo beside a short copy block.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=480&q=80&auto=format&fit=crop',
  },
  'vs-comparison': {
    label: 'Us vs them',
    description: 'Two cards comparing options.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&q=80&auto=format&fit=crop',
  },
  'steps-timeline': {
    label: 'Steps / timeline',
    description: 'Numbered steps in a row.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1506784365847-b57bdbfa640e?w=480&q=80&auto=format&fit=crop',
  },
  'app-download-cta': {
    label: 'App download',
    description: 'Copy plus dual store buttons.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=480&q=80&auto=format&fit=crop',
  },
  'gallery-grid': {
    label: 'Image gallery',
    description: 'Four image tiles.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=480&q=80&auto=format&fit=crop',
  },
  'quote-spotlight': {
    label: 'Quote spotlight',
    description: 'One bold testimonial quote.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=80&auto=format&fit=crop',
  },
  'icon-features-row': {
    label: 'Icon row',
    description: 'Three emoji-led mini features.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=480&q=80&auto=format&fit=crop',
  },
  'trust-checkmarks': {
    label: 'Trust checklist',
    description: 'Checklist of promises / certifications.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=480&q=80&auto=format&fit=crop',
  },
  'benefit-checklist': {
    label: 'Benefits list',
    description: 'Headline plus bullet-style benefits.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=480&q=80&auto=format&fit=crop',
  },
  'announcement-banner': {
    label: 'Announcement bar',
    description: 'Tinted strip with news + link.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1540575464067-76c5d61a47a4?w=480&q=80&auto=format&fit=crop',
  },
  'text-lead-only': {
    label: 'Lead paragraph',
    description: 'Single centered intro paragraph.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=480&q=80&auto=format&fit=crop',
  },
  'divider-spacer': {
    label: 'Spacer / divider',
    description: 'Breathing room between sections.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=480&q=80&auto=format&fit=crop',
  },
  'footer-dark': {
    label: 'Footer',
    description: 'Multi-column footer on dark background.',
    previewImageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=480&q=80&auto=format&fit=crop',
  },
};

function headerNavbarSection(brand: string): CanvasSection {
  const sec = defaultSection('Header');
  sec.anchorId = 'top';
  sec.background = 'rgba(255,255,255,0.92)';
  sec.paddingY = '8px';
  sec.paddingX = 'clamp(16px, 4vw, 24px)';
  sec.maxWidth = '100%';
  sec.contentAlign = 'center';
  sec.children = [
    {
      ...defaultNavbarBlock(),
      logoText: brand,
      links: [
        defaultNavLink({ label: 'Features', href: '#features' }),
        defaultNavLink({ label: 'Pricing', href: '#pricing' }),
        defaultNavLink({ label: 'FAQ', href: '#faq' }),
        defaultNavLink({ label: 'Contact', href: '#contact' }),
      ],
    },
  ];
  return sec;
}

function heroCenteredSection(opts: {
  eyebrow: string;
  headline: string;
  sub: string;
  body: string;
  primaryLabel: string;
  secondaryLabel?: string;
}): CanvasSection {
  const hero = defaultSection('Hero');
  hero.background =
    'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 65%)';
  hero.children = [
    {
      ...defaultCopyBlock(),
      align: 'center',
      maxWidth: '48rem',
      headlineTag: 'h1',
      showEyebrow: true,
      eyebrow: opts.eyebrow,
      headline: opts.headline,
      showSubheadline: true,
      subheadline: opts.sub,
      body: opts.body,
    },
    {
      ...defaultStackBlock(),
      direction: 'row',
      gap: '12px',
      align: 'center',
      justify: 'center',
      wrap: true,
      width: '100%',
      children: [
        { ...defaultButtonBlock(), label: opts.primaryLabel },
        ...(opts.secondaryLabel
          ? [
              {
                ...defaultButtonBlock(),
                label: opts.secondaryLabel,
                variant: 'outline' as const,
              },
            ]
          : []),
      ],
    },
  ];
  return hero;
}

function footerSection(): CanvasSection {
  const foot = defaultSection('Footer');
  foot.background = 'transparent';
  foot.paddingY = '0';
  foot.paddingX = '0';
  foot.maxWidth = '100%';
  foot.contentAlign = 'center';
  foot.children = [defaultFooterBlock()];
  return foot;
}

export function getLandingCanvasSectionTemplate(
  id: LandingCanvasSectionTemplateId,
): CanvasSection {
  switch (id) {
    case 'header-navbar':
      return headerNavbarSection('Your brand');

    case 'hero-centered': {
      return heroCenteredSection({
        eyebrow: 'Welcome',
        headline: 'Headline goes here',
        sub: 'Supporting line under the headline.',
        body: 'Use this block for a short intro. Edit text, buttons, and colors in the inspector.',
        primaryLabel: 'Primary action',
        secondaryLabel: 'Learn more',
      });
    }

    case 'hero-split': {
      const sec = defaultSection('Hero');
      sec.background =
        'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, transparent 55%)';
      sec.contentAlign = 'center';
      const row = createRowWithColumns(2);
      const copyCol = row.children[0];
      const imgCol = row.children[1];
      if (copyCol?.type === 'stack' && copyCol.children[0]?.type === 'copy') {
        copyCol.children[0] = {
          ...copyCol.children[0],
          align: 'left',
          headlineTag: 'h1',
          eyebrow: 'Product',
          headline: 'Split hero layout',
          subheadline: 'Great for product shots or app UI on the right.',
          body: 'Swap the image, tune column widths from the row block, or stack on mobile.',
        };
      }
      if (imgCol?.type === 'stack' && imgCol.children[0]?.type === 'image') {
        imgCol.children[0] = {
          ...imgCol.children[0],
          borderRadius: '16px',
          src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80',
        };
      }
      sec.children = [row];
      return sec;
    }

    case 'logos-row': {
      const sec = defaultSection('Social proof');
      sec.anchorId = 'customers';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultTextBlock(),
          variant: 'overline',
          align: 'center',
          content: 'Trusted by teams at',
        },
        {
          ...defaultStackBlock(),
          direction: 'row',
          gap: 'clamp(12px, 3vw, 28px)',
          align: 'center',
          justify: 'center',
          wrap: true,
          width: '100%',
          children: ['Acme', 'Northwind', 'Globex', 'Umbrella', 'Stark'].map(
            (name) => ({
              ...defaultTextBlock(),
              variant: 'caption',
              align: 'center',
              content: name,
              fontSize: '0.95rem',
              color: 'rgba(15,23,42,0.55)',
            }),
          ),
        },
      ];
      return sec;
    }

    case 'stats-row': {
      const sec = defaultSection('Impact');
      sec.background = 'rgba(15,23,42,0.03)';
      sec.contentAlign = 'center';
      const items = [
        { n: '99.9%', l: 'Uptime SLA' },
        { n: '12k+', l: 'Active users' },
        { n: '48h', l: 'Avg. support reply' },
      ];
      const stack: CanvasStackBlock = {
          ...defaultStackBlock(),
          direction: 'row',
          gap: 'clamp(24px, 6vw, 48px)',
          align: 'stretch',
          justify: 'center',
          wrap: true,
          width: '100%',
          children: items.map((it) => ({
            ...defaultStackBlock(),
            id: newCanvasId('stack'),
            direction: 'column',
            gap: '4px',
            align: 'center',
            justify: 'center',
            wrap: false,
            width: 'min(160px, 100%)',
            children: [
              {
                ...defaultTextBlock(),
                variant: 'h2',
                align: 'center',
                content: it.n,
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              },
              {
                ...defaultTextBlock(),
                variant: 'caption',
                align: 'center',
                content: it.l,
              },
            ],
          })),
        };
      sec.children = [stack];
      return sec;
    }

    case 'features-grid': {
      const sec = defaultSection('Features');
      sec.anchorId = 'features';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          maxWidth: '40rem',
          headlineTag: 'h2',
          eyebrow: 'Features',
          headline: 'Everything you need',
          subheadline: 'Three pillars you can rewrite for your product.',
          body: '',
          showSubheadline: true,
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          children: [
            {
              ...defaultCardBlock(),
              title: 'Fast setup',
              body: 'Ship a polished page in hours, not weeks.',
              imageSrc:
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Secure by default',
              body: 'HTTPS, forms, and patterns that respect privacy.',
              imageSrc:
                'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Works everywhere',
              body: 'Responsive layouts for phone, tablet, and desktop.',
              imageSrc:
                'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
            },
          ] as CanvasCardBlock[],
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'testimonials': {
      const sec = defaultSection('Testimonials');
      sec.anchorId = 'testimonials';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Testimonials',
          headline: 'Loved by customers',
          subheadline: 'Swap quotes and photos for real social proof.',
          body: '',
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          children: [
            {
              ...defaultCardBlock(),
              title: '“Cut our bounce rate in half.”',
              body: 'Alex P. · VP Marketing, Acme',
              imageSrc:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
              imageBorderRadius: '9999px',
              imageWidth: '72px',
              imageHeight: '72px',
              imageMinWidth: '72px',
              imageMaxWidth: '72px',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: '“Finally one tool for landing tests.”',
              body: 'Jamie L. · Founder',
              imageSrc:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
              imageBorderRadius: '9999px',
              imageWidth: '72px',
              imageHeight: '72px',
              imageMinWidth: '72px',
              imageMaxWidth: '72px',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: '“Our team ships pages weekly now.”',
              body: 'Sam R. · Product lead',
              imageSrc:
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
              imageBorderRadius: '9999px',
              imageWidth: '72px',
              imageHeight: '72px',
              imageMinWidth: '72px',
              imageMaxWidth: '72px',
            },
          ] as CanvasCardBlock[],
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'pricing-grid': {
      const sec = defaultSection('Pricing');
      sec.anchorId = 'pricing';
      sec.contentAlign = 'center';
      const cards: CanvasCardBlock[] = [
        {
          ...defaultCardBlock(),
          title: 'Starter',
          body: '$19/mo — core features for small teams.',
          showCardCta: true,
          ctaLabel: 'Choose Starter',
          ctaHref: '#',
          ctaVariant: 'outline',
        },
        {
          ...defaultCardBlock(),
          id: newCanvasId('card'),
          title: 'Pro',
          body: '$49/mo — advanced analytics and priority support.',
          showCardCta: true,
          ctaLabel: 'Choose Pro',
          ctaHref: '#',
          ctaVariant: 'primary',
          background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, #ffffff 40%)',
          borderColor: 'rgba(99,102,241,0.35)',
        },
        {
          ...defaultCardBlock(),
          id: newCanvasId('card'),
          title: 'Enterprise',
          body: 'Custom contracts, SSO, and dedicated success.',
          showCardCta: true,
          ctaLabel: 'Talk to sales',
          ctaHref: '#',
          ctaVariant: 'outline',
        },
      ];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Pricing',
          headline: 'Simple plans',
          subheadline: 'Highlight one tier with border and gradient.',
          body: '',
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          alignItems: 'stretch',
          children: cards,
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'faq-cards': {
      const sec = defaultSection('FAQ');
      sec.anchorId = 'faq';
      sec.contentAlign = 'center';
      const qa = [
        { q: 'Can I change sections later?', a: 'Yes — duplicate, reorder, or delete anytime.' },
        { q: 'Do templates support RTL?', a: 'Locale previews follow each language direction.' },
        { q: 'Where is data stored?', a: 'In this browser until you export or wire a backend.' },
      ];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'FAQ',
          headline: 'Common questions',
          subheadline: 'Edit these cards or replace with your own topics.',
          body: '',
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          children: qa.map((row, i) => ({
            ...defaultCardBlock(),
            id: newCanvasId('card'),
            title: row.q,
            body: row.a,
            showImage: false,
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'cta-banner': {
      const sec = defaultSection('Call to action');
      sec.background =
        'linear-gradient(120deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)';
      sec.paddingY = 'clamp(48px, 8vw, 72px)';
      sec.contentAlign = 'center';
      const copy = defaultCopyBlock();
      sec.children = [
        {
          ...copy,
          align: 'center',
          maxWidth: '42rem',
          headlineTag: 'h2',
          eyebrowColor: 'rgba(255,255,255,0.85)',
          headlineColor: '#ffffff',
          subheadlineColor: 'rgba(255,255,255,0.9)',
          bodyColor: 'rgba(255,255,255,0.88)',
          eyebrow: 'Ready?',
          headline: 'Start your free trial',
          subheadline: 'No credit card required for the first 14 days.',
          body: '',
          showSubheadline: true,
        },
        {
          ...defaultStackBlock(),
          direction: 'row',
          gap: '12px',
          align: 'center',
          justify: 'center',
          wrap: true,
          width: '100%',
          children: [
            { ...defaultButtonBlock(), label: 'Get started', href: '#' },
            {
              ...defaultButtonBlock(),
              label: 'Book a demo',
              variant: 'outline',
              href: '#',
            },
          ],
        },
      ];
      return sec;
    }

    case 'contact-split': {
      const sec = defaultSection('Contact');
      sec.anchorId = 'contact';
      sec.contentAlign = 'center';
      const row = createRowWithColumns(2);
      const left = row.children[0];
      const right = row.children[1];
      if (left?.type === 'stack' && left.children[0]?.type === 'copy') {
        left.children[0] = {
          ...left.children[0],
          align: 'left',
          headlineTag: 'h2',
          eyebrow: 'Contact',
          headline: 'Let’s talk',
          subheadline: 'Sales, partnerships, or support — we reply fast.',
          body: 'Email: hello@example.com\nPhone: +1 (555) 010-2000',
        };
      }
      if (right?.type === 'stack') {
        right.children = [
          {
            ...defaultFormBlock(),
            title: 'Send a message',
            description: 'Tell us what you need and we’ll follow up.',
          },
        ];
      }
      sec.children = [row];
      return sec;
    }

    case 'story-image': {
      const sec = defaultSection('Story');
      sec.contentAlign = 'center';
      const row = defaultStackBlock();
      row.direction = 'column';
      row.gap = '20px';
      row.align = 'center';
      row.width = '100%';
      row.children = [
        {
          ...defaultImageBlock(),
          width: 'min(100%, 960px)',
          borderRadius: '20px',
          src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        },
        {
          ...defaultCopyBlock(),
          align: 'center',
          maxWidth: '40rem',
          headlineTag: 'h2',
          eyebrow: 'Inside look',
          headline: 'Show your space, product, or team',
          subheadline: 'Pair a strong photo with a short narrative.',
          body: 'Use this pattern for case studies, studio tours, or flagship products.',
        },
      ];
      sec.children = [row];
      return sec;
    }

    case 'two-columns': {
      const sec = defaultSection('Details');
      sec.contentAlign = 'center';
      const row = defaultStackBlock();
      row.direction = 'row';
      row.gap = '24px';
      row.align = 'start';
      row.justify = 'center';
      row.wrap = true;
      row.width = '100%';
      row.children = [
        {
          ...defaultStackBlock(),
          id: newCanvasId('stack'),
          direction: 'column',
          gap: '10px',
          width: 'min(100%, 420px)',
          align: 'stretch',
          children: [
            {
              ...defaultCopyBlock(),
              headlineTag: 'h3',
              align: 'left',
              showEyebrow: false,
              headline: 'Column one',
              showSubheadline: false,
              subheadline: '',
              body: 'Use for benefits, checklist, or long-form copy.',
            },
          ],
        },
        {
          ...defaultStackBlock(),
          id: newCanvasId('stack'),
          direction: 'column',
          gap: '10px',
          width: 'min(100%, 420px)',
          align: 'stretch',
          children: [
            {
              ...defaultCopyBlock(),
              headlineTag: 'h3',
              align: 'left',
              showEyebrow: false,
              headline: 'Column two',
              showSubheadline: false,
              subheadline: '',
              body: 'Pair with specs, timeline, or secondary story.',
            },
          ],
        },
      ];
      sec.children = [row];
      return sec;
    }

    case 'team-grid': {
      const sec = defaultSection('Team');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'People',
          headline: 'Meet the team',
          subheadline: 'Faces build trust — swap for your crew.',
          body: '',
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          children: ['Jordan', 'Riley', 'Taylor'].map((name, i) => ({
            ...defaultCardBlock(),
            id: newCanvasId('card'),
            title: name,
            body: i === 0 ? 'CEO' : i === 1 ? 'Design' : 'Engineering',
            imageSrc: [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
            ][i],
            imageBorderRadius: '16px',
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'schedule-text': {
      const sec = defaultSection('Schedule');
      sec.anchorId = 'schedule';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Agenda',
          headline: 'Day one',
          subheadline: 'Replace with your conference or workshop times.',
          body: '',
        },
        ...['09:00 — Registration', '10:00 — Opening keynote', '12:30 — Lunch', '14:00 — Workshops', '17:30 — Networking'].map(
          (line) => ({
            ...defaultTextBlock(),
            variant: 'body',
            align: 'center',
            maxWidth: '32rem',
            content: line,
          }),
        ),
      ];
      return sec;
    }

    case 'newsletter-inline': {
      const sec = defaultSection('Newsletter');
      sec.background = 'rgba(99,102,241,0.06)';
      sec.contentAlign = 'center';
      const form = defaultFormBlock();
      form.title = 'Stay in the loop';
      form.description = 'Monthly product notes — no spam.';
      form.fields = [
        defaultFormField({
          name: 'email',
          label: 'Email',
          placeholder: 'you@company.com',
          type: 'email',
          required: true,
        }),
      ];
      form.maxWidth = '480px';
      sec.children = [form];
      return sec;
    }

    case 'hero-video-style': {
      const sec = defaultSection('Video hero');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          maxWidth: '42rem',
          headlineTag: 'h1',
          eyebrow: 'Watch',
          headline: 'See the product in 90 seconds',
          subheadline: 'Replace with your trailer or demo embed later.',
          body: '',
        },
        {
          ...defaultImageBlock(),
          width: 'min(100%, 960px)',
          borderRadius: '16px',
          src: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=80',
        },
      ];
      return sec;
    }

    case 'logo-grid': {
      const sec = defaultSection('Partners');
      sec.contentAlign = 'center';
      const names = ['Stripe', 'Notion', 'Figma', 'Slack', 'Linear', 'Vercel'];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h3',
          eyebrow: 'Trusted',
          headline: 'Teams who rely on us',
          subheadline: '',
          body: '',
          showEyebrow: true,
          showSubheadline: false,
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 2,
          gap: '12px',
          children: names.map((n) => ({
            ...defaultCardBlock(),
            id: newCanvasId('card'),
            title: n,
            body: 'Partner',
            showImage: false,
            padding: '16px',
            textAlign: 'center',
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'stats-four': {
      const sec = defaultSection('Metrics');
      sec.contentAlign = 'center';
      const items = [
        { n: '4.9', l: 'Avg. rating' },
        { n: '2M+', l: 'API calls / day' },
        { n: '140+', l: 'Countries' },
        { n: '24/7', l: 'Support' },
      ];
      const stack: CanvasStackBlock = {
        ...defaultStackBlock(),
        direction: 'row',
        gap: 'clamp(16px, 4vw, 28px)',
        align: 'stretch',
        justify: 'center',
        wrap: true,
        width: '100%',
        children: items.map((it) => ({
          ...defaultStackBlock(),
          id: newCanvasId('stack'),
          direction: 'column',
          gap: '4px',
          align: 'center',
          width: 'min(140px, 45%)',
          children: [
            {
              ...defaultTextBlock(),
              variant: 'h3',
              align: 'center',
              content: it.n,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            },
            {
              ...defaultTextBlock(),
              variant: 'caption',
              align: 'center',
              content: it.l,
            },
          ],
        })),
      };
      sec.children = [stack];
      return sec;
    }

    case 'feature-cards-4': {
      const sec = defaultSection('Highlights');
      sec.anchorId = 'features';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultGridBlock(4),
          columnsSmall: 2,
          gap: '16px',
          children: ['Speed', 'Security', 'Scale', 'Support'].map((t, i) => ({
            ...defaultCardBlock(),
            id: newCanvasId('card'),
            title: t,
            body: 'Short benefit line you can rewrite per card.',
            showImage: false,
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'bento-grid': {
      const sec = defaultSection('Bento');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultGridBlock(2),
          columns: 2,
          columnsSmall: 1,
          gap: '16px',
          children: [
            {
              ...defaultCardBlock(),
              title: 'Launch',
              body: 'Ship campaigns and landings from one canvas.',
              imageSrc:
                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Measure',
              body: 'Iterate with previews for every locale.',
              imageSrc:
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Collaborate',
              body: 'Share structure across marketing and product.',
              showImage: false,
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Export',
              body: 'JSON and handoff when engineering is ready.',
              showImage: false,
            },
          ] as CanvasCardBlock[],
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'pricing-duo': {
      const sec = defaultSection('Plans');
      sec.anchorId = 'pricing';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Pricing',
          headline: 'Pick what fits',
          subheadline: 'Two clear options — add a third anytime.',
          body: '',
        },
        {
          ...defaultGridBlock(2),
          columns: 2,
          columnsSmall: 1,
          children: [
            {
              ...defaultCardBlock(),
              title: 'Standard',
              body: '$29/mo — everything to publish and test.',
              showCardCta: true,
              ctaLabel: 'Choose',
              ctaHref: '#',
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Business',
              body: '$79/mo — SSO, roles, and priority support.',
              showCardCta: true,
              ctaLabel: 'Choose',
              ctaHref: '#',
              background: 'linear-gradient(180deg, rgba(99,102,241,0.1) 0%, #fff 50%)',
              borderColor: 'rgba(99,102,241,0.35)',
            },
          ] as CanvasCardBlock[],
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'faq-stack': {
      const sec = defaultSection('FAQ');
      sec.anchorId = 'faq';
      sec.contentAlign = 'center';
      const lines = [
        'Q: Can I import content? — A: Yes, paste or rebuild blocks visually.',
        'Q: Is RTL supported? — A: Locale previews follow direction per language.',
        'Q: Where is data stored? — A: In-browser until you connect a backend.',
      ];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'FAQ',
          headline: 'Quick answers',
          subheadline: '',
          body: '',
          showSubheadline: false,
        },
        {
          ...defaultStackBlock(),
          direction: 'column',
          gap: '12px',
          align: 'stretch',
          width: 'min(100%, 36rem)',
          children: lines.map((t) => ({
            ...defaultTextBlock(),
            variant: 'body',
            align: 'left',
            content: t,
          })),
        },
      ];
      return sec;
    }

    case 'cta-inline-bar': {
      const sec = defaultSection('CTA strip');
      sec.background = 'rgba(15,23,42,0.04)';
      sec.paddingY = 'clamp(24px, 4vw, 36px)';
      sec.contentAlign = 'center';
      const row = defaultStackBlock();
      row.direction = 'row';
      row.gap = '20px';
      row.align = 'center';
      row.justify = 'center';
      row.wrap = true;
      row.width = '100%';
      row.children = [
        {
          ...defaultTextBlock(),
          variant: 'subtitle',
          align: 'center',
          content: 'Ready to ship your next landing?',
          maxWidth: '22rem',
        },
        {
          ...defaultButtonBlock(),
          label: 'Start free',
          href: '#',
        },
        {
          ...defaultButtonBlock(),
          id: newCanvasId('btn'),
          label: 'Talk to sales',
          variant: 'outline',
          href: '#',
        },
      ];
      sec.children = [row];
      return sec;
    }

    case 'image-text-row': {
      const sec = defaultSection('Highlight');
      sec.contentAlign = 'center';
      const row = createRowWithColumns(2);
      if (row.children.length >= 2) {
        row.children = [row.children[1], row.children[0]];
      }
      const imgCol = row.children[0];
      const copyCol = row.children[1];
      if (imgCol?.type === 'stack' && imgCol.children[0]?.type === 'image') {
        imgCol.children[0] = {
          ...imgCol.children[0],
          borderRadius: '16px',
          src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
        };
      }
      if (copyCol?.type === 'stack' && copyCol.children[0]?.type === 'copy') {
        copyCol.children[0] = {
          ...copyCol.children[0],
          align: 'left',
          headlineTag: 'h2',
          eyebrow: 'Spotlight',
          headline: 'Image beside narrative',
          subheadline: 'Swap column order in the row block anytime.',
          body: 'Use for product shots, team photos, or venue imagery.',
        };
      }
      sec.children = [row];
      return sec;
    }

    case 'vs-comparison': {
      const sec = defaultSection('Compare');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultGridBlock(2),
          columns: 2,
          columnsSmall: 1,
          children: [
            {
              ...defaultCardBlock(),
              title: 'With us',
              body: '✓ Visual builder\n✓ Locale previews\n✓ Fast export',
              showImage: false,
            },
            {
              ...defaultCardBlock(),
              id: newCanvasId('card'),
              title: 'Without',
              body: '○ Static mocks only\n○ Manual handoff\n○ Slower iteration',
              showImage: false,
            },
          ] as CanvasCardBlock[],
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'steps-timeline': {
      const sec = defaultSection('How it works');
      sec.anchorId = 'features';
      sec.contentAlign = 'center';
      const steps = [
        { t: '01 — Discover', b: 'Align on goals and audience in a short workshop.' },
        { t: '02 — Design', b: 'Build sections, copy, and visuals in the canvas.' },
        { t: '03 — Launch', b: 'Preview, polish RTL, then publish or hand off JSON.' },
      ];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Process',
          headline: 'Three simple steps',
          subheadline: '',
          body: '',
          showSubheadline: false,
        },
        {
          ...defaultGridBlock(3),
          columnsSmall: 1,
          children: steps.map((s) => ({
            ...defaultCardBlock(),
            id: newCanvasId('card'),
            title: s.t,
            body: s.b,
            showImage: false,
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'app-download-cta': {
      const sec = defaultSection('Get the app');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Mobile',
          headline: 'Download for iOS & Android',
          subheadline: 'Same account everywhere — sync in real time.',
          body: '',
        },
        {
          ...defaultStackBlock(),
          direction: 'row',
          gap: '12px',
          align: 'center',
          justify: 'center',
          wrap: true,
          width: '100%',
          children: [
            { ...defaultButtonBlock(), label: 'App Store', href: '#' },
            {
              ...defaultButtonBlock(),
              id: newCanvasId('btn'),
              label: 'Google Play',
              variant: 'outline',
              href: '#',
            },
          ],
        },
      ];
      return sec;
    }

    case 'gallery-grid': {
      const sec = defaultSection('Gallery');
      sec.contentAlign = 'center';
      const urls = [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&q=80',
        'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
      ];
      sec.children = [
        {
          ...defaultGridBlock(4),
          columnsSmall: 2,
          gap: '12px',
          children: urls.map((u) => ({
            ...defaultImageBlock(),
            id: newCanvasId('img'),
            src: u,
            borderRadius: '12px',
            height: '180px',
            width: '100%',
            objectFit: 'cover',
          })),
        } as CanvasGridBlock,
      ];
      return sec;
    }

    case 'quote-spotlight': {
      const sec = defaultSection('Quote');
      sec.background = 'rgba(99,102,241,0.06)';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultTextBlock(),
          variant: 'overline',
          align: 'center',
          content: 'Customer story',
        },
        {
          ...defaultTextBlock(),
          variant: 'h2',
          align: 'center',
          maxWidth: '40rem',
          content: '“This builder cut our launch cycle from weeks to days.”',
          fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
        },
        {
          ...defaultTextBlock(),
          variant: 'caption',
          align: 'center',
          content: '— Riley K., Head of Growth',
        },
      ];
      return sec;
    }

    case 'icon-features-row': {
      const sec = defaultSection('Why us');
      sec.contentAlign = 'center';
      const feats = [
        { icon: '⚡', t: 'Fast', b: 'Ship sections without waiting on eng.' },
        { icon: '🎨', t: 'On-brand', b: 'Tune colors, type, and spacing visually.' },
        { icon: '🌍', t: 'Global', b: 'Duplicate structure across locales easily.' },
      ];
      sec.children = [
        {
          ...defaultStackBlock(),
          direction: 'row',
          gap: 'clamp(16px, 4vw, 32px)',
          align: 'start',
          justify: 'center',
          wrap: true,
          width: '100%',
          children: feats.map((f) => ({
            ...defaultStackBlock(),
            id: newCanvasId('stack'),
            direction: 'column',
            gap: '8px',
            width: 'min(100%, 220px)',
            align: 'center',
            children: [
              {
                ...defaultTextBlock(),
                variant: 'h2',
                align: 'center',
                content: f.icon,
                fontSize: '2rem',
              },
              {
                ...defaultTextBlock(),
                variant: 'h3',
                align: 'center',
                content: f.t,
              },
              {
                ...defaultTextBlock(),
                variant: 'body',
                align: 'center',
                content: f.b,
              },
            ],
          })),
        },
      ];
      return sec;
    }

    case 'trust-checkmarks': {
      const sec = defaultSection('Trust');
      sec.contentAlign = 'center';
      const checks = [
        '✓ SOC2-ready patterns you can document',
        '✓ No credit card for the builder sandbox',
        '✓ Export clean JSON for your stack',
      ];
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Assurance',
          headline: 'Built for serious teams',
          subheadline: '',
          body: '',
          showSubheadline: false,
        },
        {
          ...defaultStackBlock(),
          direction: 'column',
          gap: '10px',
          align: 'center',
          width: 'min(100%, 28rem)',
          children: checks.map((c) => ({
            ...defaultTextBlock(),
            variant: 'body',
            align: 'left',
            content: c,
          })),
        },
      ];
      return sec;
    }

    case 'benefit-checklist': {
      const sec = defaultSection('Benefits');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultCopyBlock(),
          align: 'center',
          headlineTag: 'h2',
          eyebrow: 'Benefits',
          headline: 'What you get on day one',
          subheadline: '',
          body: '',
          showSubheadline: false,
        },
        {
          ...defaultStackBlock(),
          direction: 'column',
          gap: '8px',
          align: 'stretch',
          width: 'min(100%, 32rem)',
          children: [
            'Unlimited section drafts in the browser',
            'Reorder blocks with drag handles in layers',
            'Duplicate pages to try risky ideas safely',
            'Swap images from Unsplash or your CDN',
          ].map((b) => ({
            ...defaultTextBlock(),
            variant: 'body',
            align: 'left',
            content: `• ${b}`,
          })),
        },
      ];
      return sec;
    }

    case 'announcement-banner': {
      const sec = defaultSection('Announcement');
      sec.background =
        'linear-gradient(90deg, rgba(79,70,229,0.12) 0%, rgba(168,85,247,0.12) 100%)';
      sec.paddingY = '14px';
      sec.contentAlign = 'center';
      const row = defaultStackBlock();
      row.direction = 'row';
      row.gap = '16px';
      row.align = 'center';
      row.justify = 'center';
      row.wrap = true;
      row.width = '100%';
      row.children = [
        {
          ...defaultTextBlock(),
          variant: 'caption',
          align: 'center',
          content: 'New: multi-locale canvas previews — try Arabic and English side by side.',
          fontSize: '0.9rem',
        },
        { ...defaultButtonBlock(), label: 'Learn more', href: '#', minHeight: '36px' },
      ];
      sec.children = [row];
      return sec;
    }

    case 'text-lead-only': {
      const sec = defaultSection('Intro');
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultTextBlock(),
          variant: 'lead',
          align: 'center',
          maxWidth: '42rem',
          content:
            'Use this block for a manifesto, positioning paragraph, or founder letter. Keep it short and confident — readers skim first, then dive deeper below.',
        },
      ];
      return sec;
    }

    case 'divider-spacer': {
      const sec = defaultSection('—');
      sec.name = 'Spacer';
      sec.background = 'transparent';
      sec.paddingY = 'clamp(24px, 5vw, 48px)';
      sec.contentAlign = 'center';
      sec.children = [
        {
          ...defaultTextBlock(),
          variant: 'caption',
          align: 'center',
          content: '—',
          color: 'rgba(15,23,42,0.15)',
        },
      ];
      return sec;
    }

    case 'footer-dark':
      return footerSection();

    default: {
      return defaultSection('Section');
    }
  }
}

function pageTheme(
  partial: Pick<CanvasPage, 'siteName' | 'primaryColor' | 'secondaryColor' | 'pageBackground'>,
  sections: CanvasSection[],
): CanvasPage {
  return mergeCanvasPage({
    ...partial,
    sections,
  });
}

export function getLandingCanvasPageTemplate(
  id: LandingCanvasPageTemplateId,
): CanvasPage {
  switch (id) {
    case 'blank':
      return mergeCanvasPage({});
    case 'starter':
      return mergeCanvasPage(starterCanvasPage());
    case 'saas-marketing':
      return pageTheme(
        {
          siteName: 'SaaS landing',
          primaryColor: '#4f46e5',
          secondaryColor: '#7c3aed',
          pageBackground: '#ffffff',
        },
        [
          headerNavbarSection('Nimbus'),
          heroCenteredSection({
            eyebrow: 'Modern SaaS',
            headline: 'Ship landing pages your whole team can edit',
            sub: 'Visual builder, responsive canvas, and locale previews built in.',
            body: 'Duplicate sections, try new copy, and export when you are ready.',
            primaryLabel: 'Start free trial',
            secondaryLabel: 'View demo',
          }),
          getLandingCanvasSectionTemplate('logos-row'),
          getLandingCanvasSectionTemplate('features-grid'),
          getLandingCanvasSectionTemplate('testimonials'),
          getLandingCanvasSectionTemplate('pricing-grid'),
          getLandingCanvasSectionTemplate('faq-cards'),
          getLandingCanvasSectionTemplate('cta-banner'),
          footerSection(),
        ],
      );
    case 'lead-capture':
      return pageTheme(
        {
          siteName: 'Lead capture',
          primaryColor: '#059669',
          secondaryColor: '#0d9488',
          pageBackground: '#fafafa',
        },
        [
          headerNavbarSection('Webinar'),
          heroCenteredSection({
            eyebrow: 'Live session',
            headline: 'Reserve your seat — limited spots',
            sub: 'Thursday · 45 minutes · workbook included',
            body: 'Use this layout for ads, LinkedIn campaigns, or partner co-marketing.',
            primaryLabel: 'Save my seat',
            secondaryLabel: 'Add to calendar',
          }),
          (() => {
            const sec = defaultSection('Register');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Register',
                description: 'We will email the join link before the event.',
                fields: [
                  defaultFormField({
                    name: 'name',
                    label: 'Full name',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'email',
                    label: 'Work email',
                    type: 'email',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'company',
                    label: 'Company',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          (() => {
            const sec = defaultSection('Trust');
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultTextBlock(),
                variant: 'caption',
                align: 'center',
                content: 'We never sell your data. Unsubscribe anytime.',
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'portfolio':
      return pageTheme(
        {
          siteName: 'Portfolio',
          primaryColor: '#ec4899',
          secondaryColor: '#f97316',
          pageBackground: '#0c0a09',
        },
        [
          (() => {
            const h = headerNavbarSection('Maya Chen');
            h.background = 'rgba(12,10,9,0.85)';
            const nav = h.children[0];
            if (nav?.type === 'navbar') {
              nav.background = 'transparent';
              nav.borderBottom = false;
            }
            return h;
          })(),
          (() => {
            const sec = defaultSection('Intro');
            sec.background = 'transparent';
            sec.contentAlign = 'center';
            const row = createRowWithColumns(2);
            const copyCol = row.children[0];
            if (copyCol?.type === 'stack' && copyCol.children[0]?.type === 'copy') {
              copyCol.children[0] = {
                ...copyCol.children[0],
                align: 'left',
                headlineTag: 'h1',
                eyebrow: 'Portfolio',
                headline: 'Product designer & art director',
                subheadline: 'Interfaces, brands, and systems for teams that care about craft.',
                body: 'Based in Vancouver · Available for select projects in 2026.',
                eyebrowColor: 'rgba(255,255,255,0.7)',
                headlineColor: '#fafaf9',
                subheadlineColor: 'rgba(255,255,255,0.85)',
                bodyColor: 'rgba(255,255,255,0.75)',
              };
            }
            const imgCol = row.children[1];
            if (imgCol?.type === 'stack' && imgCol.children[0]?.type === 'image') {
              imgCol.children[0] = {
                ...imgCol.children[0],
                borderRadius: '24px',
                src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
              };
            }
            sec.children = [row];
            return sec;
          })(),
          (() => {
            const sec = defaultSection('Selected work');
            sec.anchorId = 'features';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultCopyBlock(),
                align: 'center',
                headlineTag: 'h2',
                eyebrow: 'Work',
                headline: 'Case studies',
                subheadline: 'Replace cards with your real projects.',
                body: '',
                eyebrowColor: 'rgba(255,255,255,0.65)',
                headlineColor: '#fafaf9',
                subheadlineColor: 'rgba(255,255,255,0.8)',
              },
              {
                ...defaultGridBlock(2),
                columns: 2,
                children: [
                  {
                    ...defaultCardBlock(),
                    title: 'Fintech onboarding',
                    body: 'Reduced drop-off with a calmer verification flow.',
                    imageSrc:
                      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
                  },
                  {
                    ...defaultCardBlock(),
                    id: newCanvasId('card'),
                    title: 'Museum digital guide',
                    body: 'Accessible audio + map for 120k annual visitors.',
                    imageSrc:
                      'https://images.unsplash.com/photo-1513475382583-d06e58bcb0e0?w=800&q=80',
                  },
                ] as CanvasCardBlock[],
              } as CanvasGridBlock,
            ];
            return sec;
          })(),
          (() => {
            const contact = getLandingCanvasSectionTemplate('contact-split');
            contact.background = '#fafaf9';
            contact.paddingY = 'clamp(40px, 6vw, 72px)';
            return contact;
          })(),
          (() => {
            const f = footerSection();
            const foot = f.children[0];
            if (foot?.type === 'footer') {
              return {
                ...f,
                children: [
                  {
                    ...foot,
                    background: '#020617',
                    copyright: '© 2026 Maya Chen. All rights reserved.',
                  },
                ],
              };
            }
            return f;
          })(),
        ],
      );
    case 'local-business':
      return pageTheme(
        {
          siteName: 'Local studio',
          primaryColor: '#0f766e',
          secondaryColor: '#ea580c',
          pageBackground: '#fffbeb',
        },
        [
          headerNavbarSection('Harbor Wellness'),
          heroCenteredSection({
            eyebrow: 'Downtown clinic',
            headline: 'Care that fits your schedule',
            sub: 'Same-week appointments · Insurance accepted',
            body: 'Swap this hero for your clinic, salon, gym, or restaurant.',
            primaryLabel: 'Book online',
            secondaryLabel: 'Call us',
          }),
          getLandingCanvasSectionTemplate('features-grid'),
          getLandingCanvasSectionTemplate('story-image'),
          (() => {
            const sec = defaultSection('Hours');
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultCopyBlock(),
                align: 'center',
                headlineTag: 'h2',
                eyebrow: 'Visit',
                headline: 'Hours & location',
                subheadline: 'Mon–Fri 8a–6p · Sat 9a–1p',
                body: '123 Harbor Ave, Suite 200\nParking in rear lot.',
              },
            ];
            return sec;
          })(),
          (() => {
            const sec = defaultSection('Book');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Request an appointment',
                description: 'Tell us your preferred day — we will confirm by text.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Name', required: true }),
                  defaultFormField({
                    name: 'phone',
                    label: 'Phone',
                    type: 'tel',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'notes',
                    label: 'Notes',
                    type: 'textarea',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'event':
      return pageTheme(
        {
          siteName: 'Summit 2026',
          primaryColor: '#2563eb',
          secondaryColor: '#9333ea',
          pageBackground: '#f8fafc',
        },
        [
          headerNavbarSection('Summit'),
          heroCenteredSection({
            eyebrow: 'June 12–13 · Austin',
            headline: 'Where product and growth leaders meet',
            sub: 'Two days of talks, workshops, and office hours.',
            body: 'Early-bird pricing ends May 1.',
            primaryLabel: 'Get tickets',
            secondaryLabel: 'See agenda',
          }),
          getLandingCanvasSectionTemplate('schedule-text'),
          getLandingCanvasSectionTemplate('team-grid'),
          getLandingCanvasSectionTemplate('cta-banner'),
          footerSection(),
        ],
      );
    case 'agency':
      return pageTheme(
        {
          siteName: 'Studio North',
          primaryColor: '#18181b',
          secondaryColor: '#52525b',
          pageBackground: '#ffffff',
        },
        [
          headerNavbarSection('Studio North'),
          heroCenteredSection({
            eyebrow: 'Creative agency',
            headline: 'Brand and product for ambitious teams',
            sub: 'Positioning, UI systems, and campaigns — shipped together.',
            body: 'Swap copy for your positioning and add real case logos.',
            primaryLabel: 'Start a project',
            secondaryLabel: 'Download capabilities',
          }),
          getLandingCanvasSectionTemplate('features-grid'),
          (() => {
            const sec = defaultSection('Case snapshots');
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultGridBlock(2),
                columns: 2,
                children: [
                  {
                    ...defaultCardBlock(),
                    title: 'Fintech rebrand',
                    body: 'New narrative, site, and launch campaign in 10 weeks.',
                    imageSrc:
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
                  },
                  {
                    ...defaultCardBlock(),
                    id: newCanvasId('card'),
                    title: 'B2B SaaS site',
                    body: 'Conversion-focused pages with modular sections.',
                    imageSrc:
                      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
                  },
                ] as CanvasCardBlock[],
              } as CanvasGridBlock,
            ];
            return sec;
          })(),
          getLandingCanvasSectionTemplate('contact-split'),
          footerSection(),
        ],
      );
    case 'ecommerce':
      return pageTheme(
        {
          siteName: 'Lumen Shop',
          primaryColor: '#059669',
          secondaryColor: '#d97706',
          pageBackground: '#fafaf9',
        },
        [
          headerNavbarSection('Lumen'),
          heroCenteredSection({
            eyebrow: 'New collection',
            headline: 'Thoughtful goods for everyday life',
            sub: 'Carbon-neutral shipping · Fair partners · 30-day returns',
            body: 'Swap copy and imagery for your catalog or dropship store.',
            primaryLabel: 'Shop bestsellers',
            secondaryLabel: 'Our story',
          }),
          getLandingCanvasSectionTemplate('logo-grid'),
          getLandingCanvasSectionTemplate('feature-cards-4'),
          getLandingCanvasSectionTemplate('testimonials'),
          getLandingCanvasSectionTemplate('cta-banner'),
          footerSection(),
        ],
      );
    case 'ecommerce-luxury':
      return pageTheme(
        {
          siteName: 'Maison Noir',
          primaryColor: '#ca8a04',
          secondaryColor: '#a3a3a3',
          pageBackground: '#0c0a09',
        },
        [
          (() => {
            const h = headerNavbarSection('Maison Noir');
            h.background = 'rgba(12,10,9,0.92)';
            const nav = h.children[0];
            if (nav?.type === 'navbar') {
              nav.background = 'transparent';
              nav.borderBottom = false;
            }
            return h;
          })(),
          (() => {
            const s = heroCenteredSection({
              eyebrow: 'Atelier 2026',
              headline: 'Pieces made to be lived in for decades',
              sub: 'Limited runs · Hand-finished · Complimentary tailoring',
              body: 'Swap for jewelry, leather goods, or couture — keep the editorial tone.',
              primaryLabel: 'Shop the edit',
              secondaryLabel: 'Book a private fitting',
            });
            s.background = 'transparent';
            const copy = s.children.find((c) => c.type === 'copy');
            if (copy?.type === 'copy') {
              Object.assign(copy, {
                eyebrowColor: 'rgba(250,250,249,0.65)',
                headlineColor: '#fafaf9',
                subheadlineColor: 'rgba(250,250,249,0.88)',
                bodyColor: 'rgba(250,250,249,0.72)',
              });
            }
            return s;
          })(),
          getLandingCanvasSectionTemplate('gallery-grid'),
          getLandingCanvasSectionTemplate('testimonials'),
          getLandingCanvasSectionTemplate('cta-banner'),
          footerSection(),
        ],
      );
    case 'ecommerce-digital':
      return pageTheme(
        {
          siteName: 'Northline Kits',
          primaryColor: '#4f46e5',
          secondaryColor: '#0ea5e9',
          pageBackground: '#f8fafc',
        },
        [
          headerNavbarSection('Northline'),
          heroCenteredSection({
            eyebrow: 'Templates & presets',
            headline: 'Ship polished client work in half the time',
            sub: 'Notion packs · Figma systems · Email sequences',
            body: 'Replace with your digital goods, courses, or license tiers.',
            primaryLabel: 'Browse kits',
            secondaryLabel: 'See what’s inside',
          }),
          getLandingCanvasSectionTemplate('feature-cards-4'),
          getLandingCanvasSectionTemplate('pricing-duo'),
          getLandingCanvasSectionTemplate('faq-stack'),
          getLandingCanvasSectionTemplate('cta-inline-bar'),
          footerSection(),
        ],
      );
    case 'medical-clinic':
      return pageTheme(
        {
          siteName: 'Harbor Family Health',
          primaryColor: '#0d9488',
          secondaryColor: '#0369a1',
          pageBackground: '#f0fdfa',
        },
        [
          headerNavbarSection('Harbor Health'),
          heroCenteredSection({
            eyebrow: 'Primary & urgent care',
            headline: 'Same-week visits when you need a real clinician',
            sub: 'Most insurance accepted · Labs on-site · Virtual follow-ups',
            body: 'Tailor this page for your group practice or specialty clinic.',
            primaryLabel: 'Book a visit',
            secondaryLabel: 'Our providers',
          }),
          getLandingCanvasSectionTemplate('trust-checkmarks'),
          getLandingCanvasSectionTemplate('features-grid'),
          (() => {
            const sec = defaultSection('Appointments');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Request an appointment',
                description: 'We will call or text to confirm your slot.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Full name', required: true }),
                  defaultFormField({
                    name: 'dob',
                    label: 'Date of birth',
                    type: 'text',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'reason',
                    label: 'Reason for visit',
                    type: 'textarea',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'medical-dental':
      return pageTheme(
        {
          siteName: 'Brightline Dental',
          primaryColor: '#0284c7',
          secondaryColor: '#0ea5e9',
          pageBackground: '#f0f9ff',
        },
        [
          headerNavbarSection('Brightline'),
          heroCenteredSection({
            eyebrow: 'Cosmetic & family dentistry',
            headline: 'Confident smiles, gentle care',
            sub: 'Evening hours · Insurance & financing · Digital scans',
            body: 'Swap team bios, before/after policy, and office photos.',
            primaryLabel: 'New patient visit',
            secondaryLabel: 'Tour the office',
          }),
          getLandingCanvasSectionTemplate('testimonials'),
          getLandingCanvasSectionTemplate('pricing-duo'),
          (() => {
            const sec = defaultSection('Book');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Book online',
                description: 'Tell us your preferred day — we will confirm by text.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Name', required: true }),
                  defaultFormField({
                    name: 'phone',
                    label: 'Phone',
                    type: 'tel',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'service',
                    label: 'Service interest',
                    type: 'text',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'medical-spa':
      return pageTheme(
        {
          siteName: 'Lumen Med Spa',
          primaryColor: '#047857',
          secondaryColor: '#be185d',
          pageBackground: '#ecfdf5',
        },
        [
          headerNavbarSection('Lumen'),
          heroCenteredSection({
            eyebrow: 'Skin · body · recovery',
            headline: 'Treatments that look natural — never overdone',
            sub: 'Board-certified providers · Private suites · Complimentary consult',
            body: 'Ideal for aesthetics, IV therapy, or massage-forward wellness.',
            primaryLabel: 'Book a consult',
            secondaryLabel: 'View services',
          }),
          getLandingCanvasSectionTemplate('story-image'),
          getLandingCanvasSectionTemplate('feature-cards-4'),
          (() => {
            const sec = defaultSection('Consultation');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Request a consultation',
                description: 'Tell us your goals — we will match you with a provider.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Name', required: true }),
                  defaultFormField({
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'treatment',
                    label: 'Treatment interest',
                    type: 'textarea',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'mobile-app':
      return pageTheme(
        {
          siteName: 'Pulse app',
          primaryColor: '#0ea5e9',
          secondaryColor: '#a855f7',
          pageBackground: '#0f172a',
        },
        [
          (() => {
            const h = headerNavbarSection('Pulse');
            h.background = 'rgba(15,23,42,0.9)';
            const nav = h.children[0];
            if (nav?.type === 'navbar') {
              nav.background = 'transparent';
              nav.borderBottom = false;
            }
            return h;
          })(),
          (() => {
            const s = getLandingCanvasSectionTemplate('hero-split');
            s.background = 'transparent';
            const row = s.children[0];
            if (row?.type === 'stack') {
              const cols = row.children;
              const copyStack = cols.find((c) => c.type === 'stack' && c.children.some((x) => x.type === 'copy'));
              if (copyStack?.type === 'stack') {
                const cp = copyStack.children.find((x) => x.type === 'copy');
                if (cp?.type === 'copy') {
                  Object.assign(cp, {
                    eyebrowColor: 'rgba(255,255,255,0.75)',
                    headlineColor: '#f8fafc',
                    subheadlineColor: 'rgba(248,250,252,0.9)',
                    bodyColor: 'rgba(248,250,252,0.8)',
                    eyebrow: 'Mobile',
                    headline: 'Your day, organized in one tap',
                    subheadline: 'Habits, reminders, and widgets that sync everywhere.',
                    body: 'Replace with your app value props and store links.',
                  });
                }
              }
            }
            return s;
          })(),
          getLandingCanvasSectionTemplate('stats-four'),
          getLandingCanvasSectionTemplate('app-download-cta'),
          footerSection(),
        ],
      );
    case 'nonprofit':
      return pageTheme(
        {
          siteName: 'Hope Forward',
          primaryColor: '#0d9488',
          secondaryColor: '#ea580c',
          pageBackground: '#fffbeb',
        },
        [
          headerNavbarSection('Hope Forward'),
          heroCenteredSection({
            eyebrow: 'Together we rise',
            headline: 'Every donation fuels local classrooms',
            sub: '92¢ of every dollar goes directly to programs.',
            body: 'Use this flow for campaigns, drives, and annual appeals.',
            primaryLabel: 'Donate now',
            secondaryLabel: 'See impact report',
          }),
          getLandingCanvasSectionTemplate('stats-row'),
          getLandingCanvasSectionTemplate('story-image'),
          getLandingCanvasSectionTemplate('newsletter-inline'),
          footerSection(),
        ],
      );
    case 'real-estate':
      return pageTheme(
        {
          siteName: 'Harbor loft',
          primaryColor: '#1e3a8a',
          secondaryColor: '#b45309',
          pageBackground: '#f8fafc',
        },
        [
          headerNavbarSection('UrbanNest'),
          getLandingCanvasSectionTemplate('hero-split'),
          getLandingCanvasSectionTemplate('two-columns'),
          getLandingCanvasSectionTemplate('gallery-grid'),
          getLandingCanvasSectionTemplate('contact-split'),
          footerSection(),
        ],
      );
    case 'elearning':
      return pageTheme(
        {
          siteName: 'Design Systems 101',
          primaryColor: '#7c3aed',
          secondaryColor: '#db2777',
          pageBackground: '#faf5ff',
        },
        [
          headerNavbarSection('Academy'),
          heroCenteredSection({
            eyebrow: '6-week cohort',
            headline: 'Master UI craft with a cohort that ships',
            sub: 'Live sessions · Figma files · Certificate of completion',
            body: 'Perfect for designers leveling up to staff and lead roles.',
            primaryLabel: 'Enroll today',
            secondaryLabel: 'View syllabus',
          }),
          getLandingCanvasSectionTemplate('steps-timeline'),
          getLandingCanvasSectionTemplate('feature-cards-4'),
          getLandingCanvasSectionTemplate('faq-stack'),
          (() => {
            const sec = defaultSection('Enroll');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Save your seat',
                description: 'We will invoice or send a payment link after review.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Full name', required: true }),
                  defaultFormField({
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'fitness':
      return pageTheme(
        {
          siteName: 'Iron & Flow',
          primaryColor: '#dc2626',
          secondaryColor: '#171717',
          pageBackground: '#fef2f2',
        },
        [
          headerNavbarSection('Iron & Flow'),
          heroCenteredSection({
            eyebrow: 'Downtown gym',
            headline: 'Stronger every session — coached, tracked, celebrated',
            sub: 'Small groups · smart programming · no contracts',
            body: 'Tune for CrossFit, yoga studio, or personal training brand.',
            primaryLabel: 'Book a trial',
            secondaryLabel: 'Class schedule',
          }),
          getLandingCanvasSectionTemplate('pricing-duo'),
          getLandingCanvasSectionTemplate('testimonials'),
          getLandingCanvasSectionTemplate('cta-banner'),
          footerSection(),
        ],
      );
    case 'coming-soon':
      return pageTheme(
        {
          siteName: 'Something big',
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          pageBackground: '#0c0a09',
        },
        [
          (() => {
            const h = headerNavbarSection('Soon');
            h.background = 'transparent';
            const nav = h.children[0];
            if (nav?.type === 'navbar') {
              nav.background = 'rgba(12,10,9,0.6)';
              nav.borderBottom = false;
            }
            return h;
          })(),
          (() => {
            const hero = heroCenteredSection({
              eyebrow: 'Launching Q3',
              headline: 'We are building something you will feel',
              sub: 'Be first to try — one email, zero spam.',
              body: '',
              primaryLabel: 'Notify me',
            });
            const cb = hero.children.find((c) => c.type === 'copy');
            if (cb?.type === 'copy') {
              Object.assign(cb, {
                eyebrowColor: 'rgba(250,250,249,0.75)',
                headlineColor: '#fafaf9',
                subheadlineColor: 'rgba(250,250,249,0.88)',
                bodyColor: 'rgba(250,250,249,0.75)',
              });
            }
            hero.background =
              'linear-gradient(180deg, rgba(99,102,241,0.18) 0%, transparent 72%)';
            return hero;
          })(),
          (() => {
            const sec = defaultSection('Waitlist');
            sec.contentAlign = 'center';
            const f = defaultFormBlock();
            f.title = 'Join the list';
            f.description = '';
            f.fields = [
              defaultFormField({
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
              }),
            ];
            f.maxWidth = '400px';
            sec.children = [f];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'podcast':
      return pageTheme(
        {
          siteName: 'Signal & Noise',
          primaryColor: '#7c3aed',
          secondaryColor: '#f43f5e',
          pageBackground: '#fafafa',
        },
        [
          headerNavbarSection('Signal & Noise'),
          heroCenteredSection({
            eyebrow: 'Weekly show',
            headline: 'Stories from builders who ship under pressure',
            sub: 'New episodes every Tuesday · 40 minutes',
            body: 'Swap artwork and episode titles for your RSS and YouTube.',
            primaryLabel: 'Subscribe',
            secondaryLabel: 'Latest episode',
          }),
          getLandingCanvasSectionTemplate('bento-grid'),
          getLandingCanvasSectionTemplate('quote-spotlight'),
          getLandingCanvasSectionTemplate('newsletter-inline'),
          footerSection(),
        ],
      );
    case 'minimal-pro':
      return pageTheme(
        {
          siteName: 'Aperture',
          primaryColor: '#18181b',
          secondaryColor: '#71717a',
          pageBackground: '#ffffff',
        },
        [
          headerNavbarSection('Aperture'),
          heroCenteredSection({
            eyebrow: 'Studio',
            headline: 'Clarity in product, brand, and motion',
            sub: 'One partner from narrative to launch.',
            body: '',
            primaryLabel: 'Start a project',
            secondaryLabel: 'View selected work',
          }),
          getLandingCanvasSectionTemplate('text-lead-only'),
          getLandingCanvasSectionTemplate('quote-spotlight'),
          getLandingCanvasSectionTemplate('cta-inline-bar'),
          footerSection(),
        ],
      );
    case 'wedding':
      return pageTheme(
        {
          siteName: 'A & J',
          primaryColor: '#be185d',
          secondaryColor: '#c4af9a',
          pageBackground: '#fffdf7',
        },
        [
          headerNavbarSection('A & J'),
          heroCenteredSection({
            eyebrow: 'June 14, 2026',
            headline: 'We are getting married',
            sub: 'Cape Town · Garden ceremony · Sunset reception',
            body: 'Replace with your names, venue, and dress code.',
            primaryLabel: 'RSVP',
            secondaryLabel: 'Registry',
          }),
          getLandingCanvasSectionTemplate('schedule-text'),
          getLandingCanvasSectionTemplate('story-image'),
          (() => {
            const sec = defaultSection('RSVP');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Will you join us?',
                description: 'Please respond by May 1.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Guest name(s)', required: true }),
                  defaultFormField({
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'diet',
                    label: 'Dietary notes',
                    type: 'textarea',
                    required: false,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    case 'saas-enterprise':
      return pageTheme(
        {
          siteName: 'VaultGrid',
          primaryColor: '#1e40af',
          secondaryColor: '#0f172a',
          pageBackground: '#f8fafc',
        },
        [
          headerNavbarSection('VaultGrid'),
          heroCenteredSection({
            eyebrow: 'Enterprise security',
            headline: 'Deploy compliant workspaces without slowing teams down',
            sub: 'Audit trails, SSO, and data residency you can document.',
            body: 'Ideal for regulated industries piloting new digital properties.',
            primaryLabel: 'Request security pack',
            secondaryLabel: 'Talk to sales',
          }),
          getLandingCanvasSectionTemplate('trust-checkmarks'),
          getLandingCanvasSectionTemplate('vs-comparison'),
          getLandingCanvasSectionTemplate('features-grid'),
          getLandingCanvasSectionTemplate('contact-split'),
          footerSection(),
        ],
      );
    case 'restaurant':
      return pageTheme(
        {
          siteName: 'Saffron Table',
          primaryColor: '#b45309',
          secondaryColor: '#15803d',
          pageBackground: '#fffbeb',
        },
        [
          headerNavbarSection('Saffron Table'),
          heroCenteredSection({
            eyebrow: 'Reservations open',
            headline: 'Modern plates rooted in family recipes',
            sub: 'Seasonal menu · wine pairings · chef’s counter',
            body: 'Swap for your cuisine, chef story, and neighborhood.',
            primaryLabel: 'Book a table',
            secondaryLabel: 'View menu',
          }),
          getLandingCanvasSectionTemplate('bento-grid'),
          getLandingCanvasSectionTemplate('announcement-banner'),
          (() => {
            const sec = defaultSection('Reserve');
            sec.anchorId = 'contact';
            sec.contentAlign = 'center';
            sec.children = [
              {
                ...defaultFormBlock(),
                title: 'Reservation request',
                description: 'We will confirm by SMS.',
                fields: [
                  defaultFormField({ name: 'name', label: 'Name', required: true }),
                  defaultFormField({
                    name: 'party',
                    label: 'Party size',
                    type: 'number',
                    required: true,
                  }),
                  defaultFormField({
                    name: 'datetime',
                    label: 'Preferred date & time',
                    type: 'text',
                    required: true,
                  }),
                ],
              },
            ];
            return sec;
          })(),
          footerSection(),
        ],
      );
    default:
      return mergeCanvasPage({});
  }
}
