'use client';

import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import { sectionBlockStyle, sectionHeadingStyle } from './landing-theme';

export function LandingAbout({ config }: { config: LandingPageConfig }) {
  return (
    <section id="about" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-12"
        >
          <h2
            className="font-bold text-zinc-900 dark:text-white"
            style={sectionHeadingStyle()}
          >
            {config.aboutTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-400">
            {config.aboutBody}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
