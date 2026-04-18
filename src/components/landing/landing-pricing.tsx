'use client';

import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import {
  cardTitleStyle,
  lpGradientButton,
  sectionBlockStyle,
  sectionHeadingStyle,
} from './landing-theme';
import cn from '@/utils/class-names';

export function LandingPricing({ config }: { config: LandingPageConfig }) {
  return (
    <section id="pricing" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          className="text-center font-bold text-zinc-900 dark:text-white"
          style={sectionHeadingStyle()}
        >
          Pricing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
          Simple, transparent plans.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {config.plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                'flex flex-col rounded-2xl border p-8 shadow-sm',
                p.highlighted
                  ? 'border-2 bg-zinc-50 dark:bg-zinc-900/60'
                  : 'border-zinc-200 dark:border-zinc-800',
              )}
              style={
                p.highlighted
                  ? { borderColor: 'var(--lp-primary)' }
                  : undefined
              }
            >
              <h3
                className="font-semibold text-zinc-900 dark:text-white"
                style={cardTitleStyle()}
              >
                {p.name}
              </h3>
              <p className="mt-1 text-zinc-500 opacity-90">{p.description}</p>
              <p
                className="mt-6 font-bold text-zinc-900 dark:text-white"
                style={{ fontSize: '2.25em', lineHeight: 1.1 }}
              >
                {p.price}
                <span
                  className="font-normal text-zinc-500"
                  style={{ fontSize: '0.45em' }}
                >
                  {p.period}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-zinc-600 dark:text-zinc-400">
                {p.features.map((x, j) => (
                  <li key={j}>• {x}</li>
                ))}
              </ul>
              <a
                href={p.ctaHref}
                className={cn(
                  'mt-8 block rounded-2xl py-3 text-center font-semibold transition',
                  p.highlighted
                    ? 'text-white'
                    : 'border border-zinc-300 dark:border-zinc-600',
                )}
                style={p.highlighted ? lpGradientButton() : undefined}
              >
                {p.ctaLabel}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
