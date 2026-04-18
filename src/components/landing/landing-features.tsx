'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import {
  cardTitleStyle,
  sectionBlockStyle,
  sectionHeadingStyle,
} from './landing-theme';
import { LazyLandingImg } from './lazy-landing-img';

export function LandingFeatures({ config }: { config: LandingPageConfig }) {
  const design = config.design;
  const imgWrap: CSSProperties = {
    aspectRatio: design.featureImageAspectRatio,
    minHeight: design.featureImageHeight,
    borderRadius: `${design.featureImageBorderRadiusPercent}%`,
    overflow: 'hidden',
  };

  return (
    <section id="features" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          className="text-center font-bold text-zinc-900 dark:text-white"
          style={sectionHeadingStyle()}
        >
          Features
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
          Everything you need to move faster.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {config.features.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {f.imageUrl ? (
                <div
                  className="relative mb-4 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                  style={imgWrap}
                >
                  <LazyLandingImg
                    src={f.imageUrl}
                    alt=""
                    className="absolute inset-0"
                    style={{
                      objectFit: design.featureImageObjectFit,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              ) : (
                <div className="mb-3 text-3xl">{f.icon ?? '✨'}</div>
              )}
              <h3
                className="font-semibold text-zinc-900 dark:text-white"
                style={cardTitleStyle()}
              >
                {f.title}
              </h3>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400 opacity-95">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
