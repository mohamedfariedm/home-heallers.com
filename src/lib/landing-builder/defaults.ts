import type { LandingPageConfig, LandingSectionId } from '@/types/landing-builder';
import {
  LANDING_SECTION_IDS,
  isLandingSectionId,
} from '@/types/landing-builder';
import { DEFAULT_LANDING_DESIGN, mergeLandingDesign } from './design';

export const DEFAULT_LANDING_CONFIG: LandingPageConfig = {
  productName: 'Acme',
  tagline: 'Ship faster with confidence',
  description:
    'The modern platform teams use to launch products, collaborate, and grow revenue — without the busywork.',
  aboutTitle: 'Built for teams who move fast',
  aboutBody:
    'We combine powerful automation with a delightful experience so you can focus on what matters: your customers.',
  features: [
    {
      id: '1',
      title: 'Realtime sync',
      description: 'Changes propagate instantly across your workspace.',
      icon: '⚡',
    },
    {
      id: '2',
      title: 'Enterprise security',
      description: 'SOC2-ready controls and audit logs by default.',
      icon: '🔒',
    },
    {
      id: '3',
      title: 'Insights',
      description: 'Dashboards that actually help you decide what to ship next.',
      icon: '📊',
    },
  ],
  plans: [
    {
      id: 'p1',
      name: 'Starter',
      price: '$29',
      period: '/mo',
      description: 'For individuals and side projects',
      features: ['5 projects', 'Email support', 'Core analytics'],
      ctaLabel: 'Start trial',
      ctaHref: '#',
    },
    {
      id: 'p2',
      name: 'Pro',
      price: '$79',
      period: '/mo',
      description: 'For growing teams',
      features: ['Unlimited projects', 'Priority support', 'SSO', 'Audit logs'],
      highlighted: true,
      ctaLabel: 'Get Pro',
      ctaHref: '#',
    },
    {
      id: 'p3',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Dedicated success', 'Custom SLA', 'On-prem option'],
      ctaLabel: 'Contact sales',
      ctaHref: '#',
    },
  ],
  testimonials: [
    {
      id: 't1',
      quote: 'We cut our launch cycle in half. The polish is unreal.',
      author: 'Jordan Lee',
      role: 'VP Product, Northwind',
      avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 't2',
      quote: 'Finally a tool our design and eng teams both love.',
      author: 'Sam Rivera',
      role: 'CTO, Brightline',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
  ],
  faqs: [
    {
      id: 'f1',
      question: 'Can I cancel anytime?',
      answer: 'Yes. You can downgrade or cancel from billing settings with no hidden fees.',
    },
    {
      id: 'f2',
      question: 'Do you offer annual billing?',
      answer: 'Yes — save around 20% when you pay annually on Pro and above.',
    },
    {
      id: 'f3',
      question: 'Is there a free trial?',
      answer: 'Start a 14-day trial on Pro. No credit card required.',
    },
  ],
  ctaTitle: 'Ready to build your next launch?',
  ctaSubtitle: 'Join thousands of teams shipping with Acme.',
  ctaButtons: [
    {
      id: 'cb1',
      label: 'Start free trial',
      href: '#',
      variant: 'primary',
    },
    {
      id: 'cb2',
      label: 'Talk to sales',
      href: '#',
      variant: 'outline',
    },
  ],
  heroButtons: [
    {
      id: 'hb1',
      label: 'Get started',
      href: '#',
      variant: 'primary',
    },
    {
      id: 'hb2',
      label: 'View demo',
      href: '#',
      variant: 'outline',
    },
  ],
  navLinks: [
    { id: 'n1', label: 'Features', href: '#features' },
    { id: 'n2', label: 'Pricing', href: '#pricing' },
    { id: 'n3', label: 'FAQ', href: '#faq' },
  ],
  heroImageUrl:
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
  logoUrl: '',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  footerNote: '© 2026 Acme Inc. All rights reserved.',
  sectionOrder: [...LANDING_SECTION_IDS],
  templateId: 'saas',
  design: DEFAULT_LANDING_DESIGN,
};

const TEMPLATE_IDS = new Set([
  'saas',
  'mobile',
  'ecommerce',
  'agency',
  'portfolio',
]);

/** Merges partial JSON into defaults so missing keys do not break the preview. */
export function mergeLandingConfig(
  partial: Partial<LandingPageConfig>,
): LandingPageConfig {
  const d = DEFAULT_LANDING_CONFIG;
  const rawOrder = partial.sectionOrder ?? d.sectionOrder;
  const sectionOrder = rawOrder.filter((id): id is LandingSectionId =>
    isLandingSectionId(id),
  );
  const order =
    sectionOrder.length > 0 ? sectionOrder : [...LANDING_SECTION_IDS];

  const templateId =
    partial.templateId && TEMPLATE_IDS.has(partial.templateId)
      ? partial.templateId
      : d.templateId;

  return {
    ...d,
    ...partial,
    features: partial.features ?? d.features,
    plans: partial.plans ?? d.plans,
    testimonials: partial.testimonials ?? d.testimonials,
    faqs: partial.faqs ?? d.faqs,
    heroButtons: partial.heroButtons ?? d.heroButtons,
    ctaButtons: partial.ctaButtons ?? d.ctaButtons,
    navLinks: partial.navLinks ?? d.navLinks,
    sectionOrder: order,
    templateId,
    design: mergeLandingDesign(partial.design),
  };
}
