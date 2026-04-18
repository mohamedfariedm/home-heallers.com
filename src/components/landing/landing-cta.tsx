'use client';

import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import { lpGradientButton, sectionBlockStyle } from './landing-theme';
import cn from '@/utils/class-names';

export function LandingCta({ config }: { config: LandingPageConfig }) {
  return (
    <section id="cta" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl px-8 py-16 text-center text-white shadow-xl"
          style={lpGradientButton()}
        >
          <h2
            className="font-bold"
            style={{ fontSize: 'var(--lp-section-heading-rem)' }}
          >
            {config.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">
            {config.ctaSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {config.ctaButtons.map((b) => (
              <a
                key={b.id}
                href={b.href}
                target={b.openInNewTab ? '_blank' : undefined}
                rel={b.openInNewTab ? 'noreferrer' : undefined}
                className={cn(
                  'inline-flex rounded-2xl px-6 py-3 font-semibold transition',
                  b.variant === 'outline'
                    ? 'border-2 border-white/80 text-white hover:bg-white/10'
                    : 'bg-white text-zinc-900 hover:bg-zinc-100',
                )}
              >
                {b.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
