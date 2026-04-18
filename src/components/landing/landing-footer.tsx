'use client';

import type { LandingPageConfig } from '@/types/landing-builder';

export function LandingFooter({ config }: { config: LandingPageConfig }) {
  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 text-center text-zinc-500 sm:px-6">
        <span style={{ fontSize: '0.9em' }}>{config.footerNote}</span>
      </div>
    </footer>
  );
}
