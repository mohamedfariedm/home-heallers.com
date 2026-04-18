'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { LandingPageConfig } from '@/types/landing-builder';
import {
  resolveSectionPadding,
  resolveTypography,
} from '@/lib/landing-builder/design';
import cn from '@/utils/class-names';

type Props = {
  config: LandingPageConfig;
  previewDark: boolean;
  className?: string;
  children: ReactNode;
};

export function LandingThemeRoot({
  config,
  previewDark,
  className,
  children,
}: Props) {
  const typo = resolveTypography(config.design.typographyPreset);
  const sectionPy = resolveSectionPadding(config.design);

  const style = {
    '--lp-primary': config.primaryColor,
    '--lp-secondary': config.secondaryColor,
    '--lp-body-rem': `${typo.bodyRem}rem`,
    '--lp-hero-title-rem': `${typo.heroTitleRem}rem`,
    '--lp-section-heading-rem': `${typo.sectionHeadingRem}rem`,
    '--lp-card-title-rem': `${typo.cardTitleRem}rem`,
    '--lp-section-py': sectionPy,
  } as CSSProperties;

  return (
    <div
      className={cn(previewDark && 'dark', className)}
      style={style}
      data-landing-preview
    >
      <div
        className="min-h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
        style={{ fontSize: 'var(--lp-body-rem)' }}
      >
        {children}
      </div>
    </div>
  );
}

export function lpGradientBg() {
  return {
    background: `radial-gradient(ellipse 80% 50% at 50% -20%, var(--lp-primary), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, var(--lp-secondary), transparent)`,
  } as CSSProperties;
}

export function lpGradientButton(): CSSProperties {
  return {
    background: `linear-gradient(135deg, var(--lp-primary), var(--lp-secondary))`,
  };
}

/** Vertical padding for standard sections */
export function sectionBlockStyle(): CSSProperties {
  return {
    paddingTop: 'var(--lp-section-py)',
    paddingBottom: 'var(--lp-section-py)',
  };
}

export function sectionHeadingStyle(): CSSProperties {
  return { fontSize: 'var(--lp-section-heading-rem)' };
}

export function cardTitleStyle(): CSSProperties {
  return { fontSize: 'var(--lp-card-title-rem)' };
}
