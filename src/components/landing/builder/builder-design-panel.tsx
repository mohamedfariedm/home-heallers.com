'use client';

import type { LandingPageConfig, TypographyPreset } from '@/types/landing-builder';
import {
  FEATURE_ASPECT_PRESETS,
  HERO_ASPECT_PRESETS,
} from '@/lib/landing-builder/design';

const inputClass =
  'mt-0 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-zinc-400">{hint}</span>
      ) : null}
    </label>
  );
}

type Props = {
  config: LandingPageConfig;
  onChange: (next: LandingPageConfig) => void;
};

export function BuilderDesignPanel({ config, onChange }: Props) {
  const d = config.design;

  const patchDesign = (partial: Partial<LandingPageConfig['design']>) =>
    onChange({
      ...config,
      design: { ...config.design, ...partial },
    });

  return (
    <section className="space-y-6 rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 p-4 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-violet-950/10">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Typography &amp; layout
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Controls scale for headings, body text, and vertical spacing between
          sections.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Text scale" hint="Affects entire preview">
          <select
            className={inputClass}
            value={d.typographyPreset}
            onChange={(e) =>
              patchDesign({
                typographyPreset: e.target.value as TypographyPreset,
              })
            }
          >
            <option value="sm">Small — dense</option>
            <option value="md">Medium — balanced</option>
            <option value="lg">Large — marketing</option>
            <option value="xl">Extra large — hero</option>
          </select>
        </Field>
        <Field label="Section spacing">
          <select
            className={inputClass}
            value={d.sectionPadding}
            onChange={(e) =>
              patchDesign({
                sectionPadding: e.target.value as typeof d.sectionPadding,
              })
            }
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </Field>
      </div>

      <div className="border-t border-indigo-200/50 pt-4 dark:border-indigo-900/40">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Hero image
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aspect ratio">
            <select
              className={inputClass}
              value={d.heroAspectRatio}
              onChange={(e) => patchDesign({ heroAspectRatio: e.target.value })}
            >
              {HERO_ASPECT_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Max height"
            hint='CSS e.g. 400px, 50vh — leave empty for none'
          >
            <input
              className={inputClass}
              value={d.heroMaxHeight}
              onChange={(e) => patchDesign({ heroMaxHeight: e.target.value })}
              placeholder="e.g. 480px"
            />
          </Field>
          <Field label="Object fit">
            <select
              className={inputClass}
              value={d.heroObjectFit}
              onChange={(e) =>
                patchDesign({
                  heroObjectFit: e.target.value as 'cover' | 'contain',
                })
              }
            >
              <option value="cover">Cover (fill, crop)</option>
              <option value="contain">Contain (full image)</option>
            </select>
          </Field>
          <Field
            label="Image column max width (desktop %)"
            hint="Narrower image = more focus on copy"
          >
            <input
              type="range"
              min={40}
              max={100}
              step={5}
              className="w-full accent-indigo-600"
              value={d.heroImageColumnMaxWidthPct}
              onChange={(e) =>
                patchDesign({
                  heroImageColumnMaxWidthPct: Number(e.target.value),
                })
              }
            />
            <div className="text-xs text-zinc-500">
              {d.heroImageColumnMaxWidthPct}%
            </div>
          </Field>
        </div>
      </div>

      <div className="border-t border-indigo-200/50 pt-4 dark:border-indigo-900/40">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Feature cards — images
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aspect ratio">
            <select
              className={inputClass}
              value={d.featureImageAspectRatio}
              onChange={(e) =>
                patchDesign({ featureImageAspectRatio: e.target.value })
              }
            >
              {FEATURE_ASPECT_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Image area height (min)" hint="CSS min-height">
            <input
              className={inputClass}
              value={d.featureImageHeight}
              onChange={(e) =>
                patchDesign({ featureImageHeight: e.target.value })
              }
              placeholder="160px"
            />
          </Field>
          <Field label="Object fit">
            <select
              className={inputClass}
              value={d.featureImageObjectFit}
              onChange={(e) =>
                patchDesign({
                  featureImageObjectFit: e.target.value as 'cover' | 'contain',
                })
              }
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-indigo-200/50 pt-4 dark:border-indigo-900/40">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Image corners (rectangle → circle)
        </h4>
        <p className="mb-3 text-[11px] text-zinc-500">
          Percent is relative to each image box — 50% on a square gives a
          circle. Hero uses your aspect ratio; use 1:1 + 50% for round hero
          shots.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Hero image rounding"
            hint={`${d.heroImageBorderRadiusPercent}%`}
          >
            <input
              type="range"
              min={0}
              max={50}
              className="w-full accent-indigo-600"
              value={d.heroImageBorderRadiusPercent}
              onChange={(e) =>
                patchDesign({
                  heroImageBorderRadiusPercent: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field
            label="Feature card images"
            hint={`${d.featureImageBorderRadiusPercent}%`}
          >
            <input
              type="range"
              min={0}
              max={50}
              className="w-full accent-indigo-600"
              value={d.featureImageBorderRadiusPercent}
              onChange={(e) =>
                patchDesign({
                  featureImageBorderRadiusPercent: Number(e.target.value),
                })
              }
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-indigo-200/50 pt-4 dark:border-indigo-900/40">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          Logo &amp; avatars
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logo max height (px)">
            <input
              type="number"
              min={24}
              max={80}
              className={inputClass}
              value={d.logoMaxHeightPx}
              onChange={(e) =>
                patchDesign({ logoMaxHeightPx: Number(e.target.value) || 36 })
              }
            />
          </Field>
          <Field
            label="Logo corner radius (px)"
            hint="0 = square, 9999 = pill"
          >
            <input
              type="number"
              min={0}
              max={9999}
              className={inputClass}
              value={d.logoBorderRadiusPx}
              onChange={(e) =>
                patchDesign({
                  logoBorderRadiusPx: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
          <Field label="Testimonial avatar size (px)">
            <input
              type="number"
              min={32}
              max={96}
              className={inputClass}
              value={d.testimonialAvatarPx}
              onChange={(e) =>
                patchDesign({
                  testimonialAvatarPx: Number(e.target.value) || 44,
                })
              }
            />
          </Field>
          <Field
            label="Avatar roundness"
            hint={`${d.testimonialAvatarRadiusPercent}% (50 = circle)`}
          >
            <input
              type="range"
              min={0}
              max={50}
              className="w-full accent-indigo-600"
              value={d.testimonialAvatarRadiusPercent}
              onChange={(e) =>
                patchDesign({
                  testimonialAvatarRadiusPercent: Number(e.target.value),
                })
              }
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
