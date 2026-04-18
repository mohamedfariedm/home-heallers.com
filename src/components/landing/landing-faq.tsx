'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LandingPageConfig } from '@/types/landing-builder';
import { sectionBlockStyle, sectionHeadingStyle } from './landing-theme';

export function LandingFaq({ config }: { config: LandingPageConfig }) {
  const [openId, setOpenId] = useState<string | null>(
    config.faqs[0]?.id ?? null,
  );

  return (
    <section id="faq" style={sectionBlockStyle()}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2
          className="text-center font-bold text-zinc-900 dark:text-white"
          style={sectionHeadingStyle()}
        >
          FAQ
        </h2>
        <div className="mt-10 space-y-2">
          {config.faqs.map((f) => {
            const open = openId === f.id;
            return (
              <div
                key={f.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-zinc-900 dark:text-white"
                  onClick={() => setOpenId(open ? null : f.id)}
                >
                  {f.question}
                  <span className="text-zinc-400">{open ? '−' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <div className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                        {f.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
