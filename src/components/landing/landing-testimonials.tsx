'use client';

import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import { sectionBlockStyle, sectionHeadingStyle } from './landing-theme';
import { LazyLandingImg } from './lazy-landing-img';

export function LandingTestimonials({ config }: { config: LandingPageConfig }) {
  const av = config.design.testimonialAvatarPx;

  return (
    <section id="testimonials" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          className="text-center font-bold text-zinc-900 dark:text-white"
          style={sectionHeadingStyle()}
        >
          Loved by teams
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {config.testimonials.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-zinc-200/80 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="text-zinc-700 dark:text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3">
                {t.avatarUrl ? (
                  <LazyLandingImg
                    src={t.avatarUrl}
                    alt=""
                    className="shrink-0 object-cover"
                    style={{
                      width: av,
                      height: av,
                      minWidth: av,
                      minHeight: av,
                      borderRadius: `${config.design.testimonialAvatarRadiusPercent}%`,
                    }}
                  />
                ) : null}
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    {t.author}
                  </div>
                  <div className="text-zinc-500 opacity-90" style={{ fontSize: '0.9em' }}>
                    {t.role}
                  </div>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
