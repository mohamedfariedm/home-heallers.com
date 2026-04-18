'use client';

import type { ReactNode } from 'react';
import type { LandingPageConfig, LandingSectionId } from '@/types/landing-builder';
import { LandingThemeRoot } from './landing-theme';
import { LandingNavbar } from './landing-navbar';
import { LandingHero } from './landing-hero';
import { LandingFeatures } from './landing-features';
import { LandingAbout } from './landing-about';
import { LandingPricing } from './landing-pricing';
import { LandingTestimonials } from './landing-testimonials';
import { LandingFaq } from './landing-faq';
import { LandingCta } from './landing-cta';
import { LandingFooter } from './landing-footer';

const RENDERERS: Record<
  LandingSectionId,
  (c: LandingPageConfig) => ReactNode
> = {
  navbar: (c) => <LandingNavbar config={c} />,
  hero: (c) => <LandingHero config={c} />,
  features: (c) => <LandingFeatures config={c} />,
  about: (c) => <LandingAbout config={c} />,
  pricing: (c) => <LandingPricing config={c} />,
  testimonials: (c) => <LandingTestimonials config={c} />,
  faq: (c) => <LandingFaq config={c} />,
  cta: (c) => <LandingCta config={c} />,
  footer: (c) => <LandingFooter config={c} />,
};

type Props = {
  config: LandingPageConfig;
  previewDark: boolean;
  className?: string;
};

export function LandingPagePreview({ config, previewDark, className }: Props) {
  const order = config.sectionOrder.filter((id) => id in RENDERERS);

  return (
    <LandingThemeRoot
      config={config}
      previewDark={previewDark}
      className={className}
    >
      {order.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 py-20 text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
            No sections on the page
          </p>
          <p className="max-w-sm text-sm">
            Use <strong>Sections on page</strong> in the form to add Navbar, Hero,
            Features, and other blocks.
          </p>
        </div>
      ) : (
        order.map((id) => (
          <div key={id}>{RENDERERS[id](config)}</div>
        ))
      )}
    </LandingThemeRoot>
  );
}
