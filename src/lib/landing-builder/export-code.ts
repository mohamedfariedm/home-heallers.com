import type { LandingPageConfig } from '@/types/landing-builder';
import { DEFAULT_LANDING_DESIGN } from '@/lib/landing-builder/design';

/**
 * Single-file React component for copy / ZIP export (Tailwind classes + inline gradients).
 */
export function generateLandingExportTsx(config: LandingPageConfig): string {
  const embedded = JSON.stringify(config, null, 2);
  const designJson = JSON.stringify(DEFAULT_LANDING_DESIGN);
  return `'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const CONFIG = ${embedded} as const;
const DEFAULT_DESIGN = ${designJson};
type Design = typeof DEFAULT_DESIGN;
const D: Design = { ...DEFAULT_DESIGN, ...((CONFIG as { design?: Partial<Design> }).design || {}) };

function cn(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id.replace('#', '')}>{children}</section>;
}

export default function ExportedLandingPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(CONFIG.faqs[0]?.id ?? null);
  const primary = CONFIG.primaryColor;
  const secondary = CONFIG.secondaryColor;
  const order = CONFIG.sectionOrder;

  const sections: Record<string, React.ReactNode> = {
    navbar: (
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
            {CONFIG.logoUrl ? (
              <img src={CONFIG.logoUrl} alt="" className="w-auto max-w-[160px] object-contain" loading="lazy" style={{ maxHeight: D.logoMaxHeightPx, borderRadius: D.logoBorderRadiusPx >= 9999 ? '9999px' : D.logoBorderRadiusPx + 'px' }} />
            ) : null}
            <span>{CONFIG.productName}</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {CONFIG.navLinks.map((l) => (
              <a key={l.id} href={l.href} className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href={CONFIG.heroButtons[0]?.href ?? '#'}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
            style={{ background: \`linear-gradient(135deg, \${primary}, \${secondary})\` }}
          >
            {CONFIG.heroButtons[0]?.label ?? 'Get started'}
          </a>
        </div>
      </header>
    ),
    hero: (
      <Section id="hero">
        <div className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
            style={{
              background: \`radial-gradient(ellipse 80% 50% at 50% -20%, \${primary}, transparent), radial-gradient(ellipse 60% 40% at 100% 0%, \${secondary}, transparent)\`,
            }}
          />
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: primary }}>
                {CONFIG.productName}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">{CONFIG.tagline}</h1>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">{CONFIG.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {CONFIG.heroButtons.map((b) => (
                  <a
                    key={b.id}
                    href={b.href}
                    className={cn(
                      'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition',
                      b.variant === 'primary' && 'text-white shadow-lg',
                      b.variant === 'outline' && 'border border-zinc-300 bg-white text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white',
                      b.variant === 'secondary' && 'text-white',
                    )}
                    style={
                      b.variant === 'primary' || b.variant === 'secondary'
                        ? { background: \`linear-gradient(135deg, \${primary}, \${secondary})\` }
                        : undefined
                    }
                  >
                    {b.label}
                  </a>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="relative w-full justify-self-end lg:justify-self-auto" style={{ maxWidth: D.heroImageColumnMaxWidthPct < 100 ? String(D.heroImageColumnMaxWidthPct) + '%' : undefined }}>
              <img
                src={CONFIG.heroImageUrl}
                alt=""
                className="w-full rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
                loading="lazy"
                style={{ aspectRatio: D.heroAspectRatio, objectFit: D.heroObjectFit, maxHeight: D.heroMaxHeight || undefined, borderRadius: String(D.heroImageBorderRadiusPercent) + '%' }}
              />
            </motion.div>
          </div>
        </div>
      </Section>
    ),
    features: (
      <Section id="features">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">Features</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">Everything you need to move faster.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CONFIG.features.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
              >
                {f.imageUrl ? (
                  <div className="mb-4 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800" style={{ aspectRatio: D.featureImageAspectRatio, minHeight: D.featureImageHeight, borderRadius: String(D.featureImageBorderRadiusPercent) + '%' }}>
                    <img src={f.imageUrl} alt="" className="h-full w-full" loading="lazy" style={{ objectFit: D.featureImageObjectFit, width: '100%', height: '100%' }} />
                  </div>
                ) : (
                  <div className="mb-3 text-3xl">{f.icon ?? '✨'}</div>
                )}
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    ),
    about: (
      <Section id="about">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-12">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{CONFIG.aboutTitle}</h2>
            <p className="mt-4 max-w-3xl text-zinc-600 dark:text-zinc-400">{CONFIG.aboutBody}</p>
          </div>
        </div>
      </Section>
    ),
    pricing: (
      <Section id="pricing">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">Pricing</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">Simple, transparent plans.</p>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {CONFIG.plans.map((p) => (
              <div
                key={p.id}
                className={cn(
                  'flex flex-col rounded-2xl border p-8 shadow-sm',
                  p.highlighted ? 'border-2 bg-zinc-50 dark:bg-zinc-900/60' : 'border-zinc-200 dark:border-zinc-800',
                )}
                style={p.highlighted ? { borderColor: primary } : undefined}
              >
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{p.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{p.description}</p>
                <p className="mt-6 text-4xl font-bold text-zinc-900 dark:text-white">
                  {p.price}
                  <span className="text-lg font-normal text-zinc-500">{p.period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.features.map((x, i) => (
                    <li key={i}>• {x}</li>
                  ))}
                </ul>
                <a
                  href={p.ctaHref}
                  className={cn(
                    'mt-8 block rounded-2xl py-3 text-center text-sm font-semibold',
                    p.highlighted ? 'text-white' : 'border border-zinc-300 dark:border-zinc-600',
                  )}
                  style={p.highlighted ? { background: \`linear-gradient(135deg, \${primary}, \${secondary})\` } : undefined}
                >
                  {p.ctaLabel}
                </a>
              </div>
            ))}
          </div>
        </div>
      </Section>
    ),
    testimonials: (
      <Section id="testimonials">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">Loved by teams</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {CONFIG.testimonials.map((t) => (
              <blockquote key={t.id} className="rounded-2xl border border-zinc-200/80 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
                <p className="text-zinc-700 dark:text-zinc-300">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-6 flex items-center gap-3">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt="" className="shrink-0 object-cover" loading="lazy" style={{ width: D.testimonialAvatarPx, height: D.testimonialAvatarPx, minWidth: D.testimonialAvatarPx, minHeight: D.testimonialAvatarPx, borderRadius: String(D.testimonialAvatarRadiusPercent) + '%' }} />
                  ) : null}
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-white">{t.author}</div>
                    <div className="text-sm text-zinc-500">{t.role}</div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </Section>
    ),
    faq: (
      <Section id="faq">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-white">FAQ</h2>
          <div className="mt-10 space-y-2">
            {CONFIG.faqs.map((f) => {
              const open = openFaq === f.id;
              return (
                <div key={f.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-zinc-900 dark:text-white"
                    onClick={() => setOpenFaq(open ? null : f.id)}
                  >
                    {f.question}
                    <span className="text-zinc-400">{open ? '−' : '+'}</span>
                  </button>
                  {open ? <div className="border-t border-zinc-200 px-5 py-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">{f.answer}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    ),
    cta: (
      <Section id="cta">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div
            className="rounded-2xl px-8 py-16 text-center text-white shadow-xl"
            style={{ background: \`linear-gradient(135deg, \${primary}, \${secondary})\` }}
          >
            <h2 className="text-3xl font-bold">{CONFIG.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{CONFIG.ctaSubtitle}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {CONFIG.ctaButtons.map((b) => (
                <a
                  key={b.id}
                  href={b.href}
                  className={cn(
                    'inline-flex rounded-2xl px-6 py-3 text-sm font-semibold',
                    b.variant === 'outline' ? 'border-2 border-white/80 text-white' : 'bg-white text-zinc-900',
                  )}
                >
                  {b.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    ),
    footer: (
      <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500 sm:px-6">{CONFIG.footerNote}</div>
      </footer>
    ),
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {order.map((key) => (
        <div key={key}>{sections[key as keyof typeof sections]}</div>
      ))}
    </div>
  );
}
`;
}

export function generateReadme(): string {
  return `# Exported landing page

1. Save as \`ExportedLandingPage.tsx\` in your Next.js app.
2. Dependencies: \`framer-motion\`, \`react\`, and Tailwind CSS (zinc palette).
3. Page:

\`\`\`tsx
import ExportedLandingPage from '@/components/ExportedLandingPage';

export default function Page() {
  return <ExportedLandingPage />;
}
\`\`\`

4. Dark mode: add \`dark\` class on \`<html>\` or use \`next-themes\`.

Use \`next/image\` in production and configure \`remotePatterns\` for external image hosts.
`;
}
