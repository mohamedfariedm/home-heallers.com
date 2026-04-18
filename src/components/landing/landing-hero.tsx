'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import {
  lpGradientBg,
  lpGradientButton,
  sectionBlockStyle,
} from './landing-theme';
import { LazyLandingImg } from './lazy-landing-img';
import cn from '@/utils/class-names';

export function LandingHero({ config }: { config: LandingPageConfig }) {
  const design = config.design;
  const imgStyle: CSSProperties = {
    aspectRatio: design.heroAspectRatio,
    objectFit: design.heroObjectFit,
    borderRadius: `${design.heroImageBorderRadiusPercent}%`,
    ...(design.heroMaxHeight?.trim()
      ? { maxHeight: design.heroMaxHeight.trim() }
      : {}),
  };

  return (
    <section id="hero" className="relative overflow-hidden" style={sectionBlockStyle()}>
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
        style={lpGradientBg()}
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p
            className="mb-3 font-semibold uppercase tracking-wider opacity-90"
            style={{ color: 'var(--lp-primary)', fontSize: '0.85em' }}
          >
            {config.productName}
          </p>
          <h1
            className="font-bold leading-tight tracking-tight text-zinc-900 dark:text-white"
            style={{ fontSize: 'var(--lp-hero-title-rem)' }}
          >
            {config.tagline}
          </h1>
          <p
            className="mt-4 text-zinc-600 dark:text-zinc-400"
            style={{ fontSize: '1.05em' }}
          >
            {config.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {config.heroButtons.map((b) => (
              <a
                key={b.id}
                href={b.href}
                target={b.openInNewTab ? '_blank' : undefined}
                rel={b.openInNewTab ? 'noreferrer' : undefined}
                className={cn(
                  'inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold transition',
                  b.variant === 'primary' && 'text-white shadow-lg',
                  b.variant === 'outline' &&
                    'border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white',
                  b.variant === 'secondary' && 'text-white shadow-md',
                )}
                style={
                  b.variant === 'primary' || b.variant === 'secondary'
                    ? lpGradientButton()
                    : undefined
                }
              >
                {b.label}
              </a>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full justify-self-end lg:justify-self-auto"
          style={{
            maxWidth:
              design.heroImageColumnMaxWidthPct < 100
                ? `${design.heroImageColumnMaxWidthPct}%`
                : undefined,
          }}
        >
          <LazyLandingImg
            src={config.heroImageUrl}
            alt=""
            className="w-full rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            style={imgStyle}
          />
        </motion.div>
      </div>
    </section>
  );
}
