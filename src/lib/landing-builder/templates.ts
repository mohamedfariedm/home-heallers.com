import type { LandingPageConfig, LandingTemplateId } from '@/types/landing-builder';
import { LANDING_SECTION_IDS } from '@/types/landing-builder';
import { DEFAULT_LANDING_CONFIG } from './defaults';

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export const TEMPLATE_META: Record<
  LandingTemplateId,
  { label: string; description: string }
> = {
  saas: {
    label: 'SaaS',
    description: 'B2B software, dashboards, trials',
  },
  mobile: {
    label: 'Mobile app',
    description: 'App store CTAs, device hero, bold gradients',
  },
  ecommerce: {
    label: 'E-commerce',
    description: 'Products, shipping trust, offers',
  },
  agency: {
    label: 'Agency',
    description: 'Portfolio tone, case-study style copy',
  },
  portfolio: {
    label: 'Portfolio',
    description: 'Creative, minimal, showcase-first',
  },
};

export function getTemplateConfig(id: LandingTemplateId): LandingPageConfig {
  const base = clone(DEFAULT_LANDING_CONFIG);
  base.templateId = id;
  base.sectionOrder = [...LANDING_SECTION_IDS];

  switch (id) {
    case 'saas':
      return base;
    case 'mobile':
      return {
        ...base,
        productName: 'Pulse',
        tagline: 'Your life, organized in one tap',
        description:
          'Smart reminders, habits, and widgets that keep you in flow — on iOS and Android.',
        primaryColor: '#0ea5e9',
        secondaryColor: '#a855f7',
        heroImageUrl:
          'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&q=80',
        features: [
          {
            id: '1',
            title: 'Offline mode',
            description: 'Works on the subway. Syncs when you are back.',
            icon: '📱',
          },
          {
            id: '2',
            title: 'Widgets',
            description: 'Glanceable stats on your home screen.',
            icon: '🧩',
          },
          {
            id: '3',
            title: 'Privacy',
            description: 'On-device processing for sensitive data.',
            icon: '🛡️',
          },
        ],
        plans: [
          {
            id: 'p1',
            name: 'Free',
            price: '$0',
            period: '',
            description: 'Core habits & reminders',
            features: ['1 device', 'Basic widgets'],
            ctaLabel: 'Download',
            ctaHref: '#',
          },
          {
            id: 'p2',
            name: 'Plus',
            price: '$4.99',
            period: '/mo',
            description: 'Power users',
            features: ['Unlimited devices', 'Themes', 'iCloud backup'],
            highlighted: true,
            ctaLabel: 'Try Plus',
            ctaHref: '#',
          },
        ],
        navLinks: [
          { id: 'n1', label: 'Features', href: '#features' },
          { id: 'n2', label: 'Pricing', href: '#pricing' },
        ],
        ctaTitle: 'Download Pulse today',
        ctaSubtitle: 'Available on the App Store and Google Play.',
        heroButtons: [
          { id: 'hb1', label: 'App Store', href: '#', variant: 'primary' },
          { id: 'hb2', label: 'Play Store', href: '#', variant: 'outline' },
        ],
        ctaButtons: [
          { id: 'cb1', label: 'Get the app', href: '#', variant: 'primary' },
          { id: 'cb2', label: 'Watch trailer', href: '#', variant: 'outline' },
        ],
      };
    case 'ecommerce':
      return {
        ...base,
        productName: 'Lumen Goods',
        tagline: 'Everyday essentials, thoughtfully made',
        description:
          'Carbon-neutral shipping, fair trade partners, and quality you can feel — from kitchen to closet.',
        primaryColor: '#059669',
        secondaryColor: '#d97706',
        heroImageUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d?w=1200&q=80',
        aboutTitle: 'Why shoppers choose us',
        aboutBody:
          'We source directly from makers, publish full supply chain data, and offset every shipment.',
        features: [
          {
            id: '1',
            title: 'Free returns',
            description: '30 days, no questions — prepaid label included.',
            icon: '📦',
          },
          {
            id: '2',
            title: 'Rewards',
            description: 'Earn points on every order toward your next purchase.',
            icon: '⭐',
          },
          {
            id: '3',
            title: 'Secure checkout',
            description: 'Apple Pay, Shop Pay, and encrypted payments.',
            icon: '💳',
          },
        ],
        plans: [
          {
            id: 'p1',
            name: 'Member',
            price: '$12',
            period: '/yr',
            description: 'Loyalty perks',
            features: ['5% back', 'Early access drops', 'Birthday gift'],
            ctaLabel: 'Join',
            ctaHref: '#',
          },
          {
            id: 'p2',
            name: 'Member Plus',
            price: '$39',
            period: '/yr',
            description: 'Maximum value',
            features: ['10% back', 'Free express shipping', 'Extended returns'],
            highlighted: true,
            ctaLabel: 'Upgrade',
            ctaHref: '#',
          },
        ],
        ctaTitle: 'Get 15% off your first order',
        ctaSubtitle: 'Subscribe for product drops and member-only deals.',
        heroButtons: [
          { id: 'hb1', label: 'Shop bestsellers', href: '#', variant: 'primary' },
          { id: 'hb2', label: 'Our story', href: '#', variant: 'outline' },
        ],
      };
    case 'agency':
      return {
        ...base,
        productName: 'Studio North',
        tagline: 'Brand & product for ambitious teams',
        description:
          'We partner with founders and marketing leads to ship memorable sites, design systems, and campaigns.',
        primaryColor: '#18181b',
        secondaryColor: '#71717a',
        heroImageUrl:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        aboutTitle: 'How we work',
        aboutBody:
          'Embedded sprints, async-friendly workflows, and transparent pricing. You always know what ships next.',
        features: [
          {
            id: '1',
            title: 'Strategy',
            description: 'Positioning, narrative, and roadmap workshops.',
            icon: '🎯',
          },
          {
            id: '2',
            title: 'Design',
            description: 'Brand, UI, and motion that scales with your stack.',
            icon: '✏️',
          },
          {
            id: '3',
            title: 'Build',
            description: 'Next.js, Webflow, or design handoff — your call.',
            icon: '🛠️',
          },
        ],
        plans: [
          {
            id: 'p1',
            name: 'Sprint',
            price: '$18k',
            period: '',
            description: '2-week focused engagement',
            features: ['Discovery', 'Key screens', 'Handoff'],
            ctaLabel: 'Book intro',
            ctaHref: '#',
          },
          {
            id: 'p2',
            name: 'Retainer',
            price: '$12k',
            period: '/mo',
            description: 'Ongoing partnership',
            features: ['Dedicated lead', 'Slack access', 'Monthly roadmap'],
            highlighted: true,
            ctaLabel: 'Start retainer',
            ctaHref: '#',
          },
        ],
        ctaTitle: 'Tell us about your next launch',
        ctaSubtitle: 'We reply within one business day.',
        navLinks: [
          { id: 'n1', label: 'Work', href: '#features' },
          { id: 'n2', label: 'Services', href: '#pricing' },
          { id: 'n3', label: 'FAQ', href: '#faq' },
        ],
      };
    case 'portfolio':
      return {
        ...base,
        productName: 'Maya Chen',
        tagline: 'Product designer & creative director',
        description:
          'Crafting interfaces and brands for startups and cultural institutions. Based in Vancouver.',
        primaryColor: '#ec4899',
        secondaryColor: '#f97316',
        heroImageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        aboutTitle: 'Selected collaborations',
        aboutBody:
          'Recent partners include museums, fintech teams, and climate nonprofits. I focus on clarity, accessibility, and bold typography.',
        features: [
          {
            id: '1',
            title: 'Product design',
            description: 'End-to-end UX for web and mobile.',
            icon: '🎨',
          },
          {
            id: '2',
            title: 'Art direction',
            description: 'Campaigns, photography, and design systems.',
            icon: '📸',
          },
          {
            id: '3',
            title: 'Workshops',
            description: 'Facilitation for leadership and product teams.',
            icon: '💬',
          },
        ],
        plans: [
          {
            id: 'p1',
            name: 'Project',
            price: 'From $8k',
            period: '',
            description: 'Fixed scope engagements',
            features: ['Milestone billing', 'Figma delivery'],
            ctaLabel: 'Request availability',
            ctaHref: '#',
          },
          {
            id: 'p2',
            name: 'Advisory',
            price: '$350',
            period: '/hr',
            description: 'Office hours & critiques',
            features: ['Async Loom reviews', 'Slack Q&A blocks'],
            highlighted: true,
            ctaLabel: 'Book a call',
            ctaHref: '#',
          },
        ],
        sectionOrder: [
          'navbar',
          'hero',
          'about',
          'features',
          'testimonials',
          'pricing',
          'faq',
          'cta',
          'footer',
        ],
        ctaTitle: 'Let’s make something memorable',
        ctaSubtitle: 'Share a short brief — I’ll respond with next steps.',
        heroButtons: [
          { id: 'hb1', label: 'View work', href: '#', variant: 'primary' },
          { id: 'hb2', label: 'Download CV', href: '#', variant: 'outline' },
        ],
      };
    default:
      return base;
  }
}
