'use client';

import type { LandingPageConfig } from '@/types/landing-builder';
import { lpGradientButton } from './landing-theme';
import { LazyLandingImg } from './lazy-landing-img';

export function LandingNavbar({ config }: { config: LandingPageConfig }) {
  const firstHero = config.heroButtons[0];
  const logoH = config.design.logoMaxHeightPx;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a
          href="#"
          className="flex min-w-0 items-center gap-2 font-semibold text-zinc-900 dark:text-white"
        >
          {config.logoUrl ? (
            <LazyLandingImg
              src={config.logoUrl}
              alt=""
              className="w-auto max-w-[160px] object-contain"
              style={{
                maxHeight: logoH,
                height: 'auto',
                borderRadius:
                  config.design.logoBorderRadiusPx >= 9999
                    ? '9999px'
                    : `${config.design.logoBorderRadiusPx}px`,
              }}
            />
          ) : null}
          <span className="truncate">{config.productName}</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {config.navLinks.map((l) => (
            <a
              key={l.id}
              href={l.href}
              className="font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              style={{ fontSize: '0.9em' }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        {firstHero ? (
          <a
            href={firstHero.href}
            target={firstHero.openInNewTab ? '_blank' : undefined}
            rel={firstHero.openInNewTab ? 'noreferrer' : undefined}
            className="shrink-0 rounded-2xl px-4 py-2 font-semibold text-white shadow-lg transition hover:opacity-90"
            style={lpGradientButton()}
          >
            <span style={{ fontSize: '0.9em' }}>{firstHero.label}</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}
