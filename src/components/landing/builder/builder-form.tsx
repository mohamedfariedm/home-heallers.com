'use client';

import type { LandingPageConfig } from '@/types/landing-builder';
import { BuilderDesignPanel } from './builder-design-panel';
import { SectionManager } from './section-manager';
import { ImageDropField } from './image-drop-field';
import cn from '@/utils/class-names';

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'mt-0 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-indigo-500/0 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now());
}

type Props = {
  config: LandingPageConfig;
  onChange: (next: LandingPageConfig) => void;
};

export function BuilderForm({ config, onChange }: Props) {
  const patch = (partial: Partial<LandingPageConfig>) =>
    onChange({ ...config, ...partial });

  return (
    <div className="space-y-10 pb-24">
      <BuilderDesignPanel config={config} onChange={onChange} />

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Brand &amp; theme
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name">
            <input
              className={inputClass}
              value={config.productName}
              onChange={(e) => patch({ productName: e.target.value })}
            />
          </Field>
          <Field label="Logo URL">
            <input
              className={inputClass}
              value={config.logoUrl}
              onChange={(e) => patch({ logoUrl: e.target.value })}
              placeholder="https://... or drop an image below"
            />
            <ImageDropField
              compact
              className="mt-2"
              label=""
              value={config.logoUrl}
              onChange={(v) => patch({ logoUrl: v })}
            />
          </Field>
          <Field label="Primary color">
            <input
              type="color"
              className={cn(inputClass, 'h-10 cursor-pointer')}
              value={config.primaryColor}
              onChange={(e) => patch({ primaryColor: e.target.value })}
            />
          </Field>
          <Field label="Secondary color">
            <input
              type="color"
              className={cn(inputClass, 'h-10 cursor-pointer')}
              value={config.secondaryColor}
              onChange={(e) => patch({ secondaryColor: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Hero
        </h3>
        <Field label="Tagline">
          <input
            className={inputClass}
            value={config.tagline}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </Field>
        <Field label="Description">
          <textarea
            className={cn(inputClass, 'min-h-[88px] resize-y')}
            value={config.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </Field>
        <Field label="Hero image URL">
          <input
            className={inputClass}
            value={config.heroImageUrl}
            onChange={(e) => patch({ heroImageUrl: e.target.value })}
            placeholder="https://... or drop an image below"
          />
          <ImageDropField
            label=""
            value={config.heroImageUrl}
            onChange={(v) => patch({ heroImageUrl: v })}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Navbar links
        </h3>
        <div className="space-y-3">
          {config.navLinks.map((l, i) => (
            <div key={l.id} className="flex flex-wrap gap-2">
              <input
                className={cn(inputClass, 'min-w-[120px] flex-1')}
                value={l.label}
                onChange={(e) => {
                  const navLinks = [...config.navLinks];
                  navLinks[i] = { ...l, label: e.target.value };
                  patch({ navLinks });
                }}
                placeholder="Label"
              />
              <input
                className={cn(inputClass, 'min-w-[120px] flex-1')}
                value={l.href}
                onChange={(e) => {
                  const navLinks = [...config.navLinks];
                  navLinks[i] = { ...l, href: e.target.value };
                  patch({ navLinks });
                }}
                placeholder="#features"
              />
              <button
                type="button"
                className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-red-600 dark:border-zinc-700"
                onClick={() =>
                  patch({
                    navLinks: config.navLinks.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-400"
            onClick={() =>
              patch({
                navLinks: [
                  ...config.navLinks,
                  { id: newId(), label: 'Link', href: '#' },
                ],
              })
            }
          >
            + Add nav link
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Hero buttons
        </h3>
        <div className="space-y-3">
          {config.heroButtons.map((b, i) => (
            <div
              key={b.id}
              className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-700"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  className={cn(inputClass, 'min-w-[100px] flex-1')}
                  value={b.label}
                  onChange={(e) => {
                    const heroButtons = [...config.heroButtons];
                    heroButtons[i] = { ...b, label: e.target.value };
                    patch({ heroButtons });
                  }}
                />
                <input
                  className={cn(inputClass, 'min-w-[100px] flex-1')}
                  value={b.href}
                  onChange={(e) => {
                    const heroButtons = [...config.heroButtons];
                    heroButtons[i] = { ...b, href: e.target.value };
                    patch({ heroButtons });
                  }}
                  placeholder="https://"
                />
                <select
                  className={inputClass}
                  value={b.variant ?? 'primary'}
                  onChange={(e) => {
                    const heroButtons = [...config.heroButtons];
                    heroButtons[i] = {
                      ...b,
                      variant: e.target.value as typeof b.variant,
                    };
                    patch({ heroButtons });
                  }}
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={!!b.openInNewTab}
                    onChange={(e) => {
                      const heroButtons = [...config.heroButtons];
                      heroButtons[i] = {
                        ...b,
                        openInNewTab: e.target.checked,
                      };
                      patch({ heroButtons });
                    }}
                  />
                  New tab
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600"
                  onClick={() =>
                    patch({
                      heroButtons: config.heroButtons.filter(
                        (_, j) => j !== i,
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                heroButtons: [
                  ...config.heroButtons,
                  {
                    id: newId(),
                    label: 'Button',
                    href: '#',
                    variant: 'primary',
                  },
                ],
              })
            }
          >
            + Add hero button
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          About
        </h3>
        <Field label="Title">
          <input
            className={inputClass}
            value={config.aboutTitle}
            onChange={(e) => patch({ aboutTitle: e.target.value })}
          />
        </Field>
        <Field label="Body">
          <textarea
            className={cn(inputClass, 'min-h-[100px] resize-y')}
            value={config.aboutBody}
            onChange={(e) => patch({ aboutBody: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Features
        </h3>
        <div className="space-y-4">
          {config.features.map((f, i) => (
            <div
              key={f.id}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                  <input
                    className={inputClass}
                    value={f.title}
                    onChange={(e) => {
                      const features = [...config.features];
                      features[i] = { ...f, title: e.target.value };
                      patch({ features });
                    }}
                  />
                </Field>
                <Field label="Icon (emoji)">
                  <input
                    className={inputClass}
                    value={f.icon ?? ''}
                    onChange={(e) => {
                      const features = [...config.features];
                      features[i] = { ...f, icon: e.target.value };
                      patch({ features });
                    }}
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea
                    className={cn(inputClass, 'min-h-[72px] resize-y')}
                    value={f.description}
                    onChange={(e) => {
                      const features = [...config.features];
                      features[i] = { ...f, description: e.target.value };
                      patch({ features });
                    }}
                  />
                </Field>
                <Field label="Card image URL (optional)" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    value={f.imageUrl ?? ''}
                    onChange={(e) => {
                      const features = [...config.features];
                      features[i] = {
                        ...f,
                        imageUrl: e.target.value || undefined,
                      };
                      patch({ features });
                    }}
                    placeholder="https://..."
                  />
                  <ImageDropField
                    compact
                    className="mt-2"
                    label=""
                    value={f.imageUrl ?? ''}
                    onChange={(v) => {
                      const features = [...config.features];
                      features[i] = {
                        ...f,
                        imageUrl: v || undefined,
                      };
                      patch({ features });
                    }}
                  />
                </Field>
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-red-600"
                onClick={() =>
                  patch({
                    features: config.features.filter((_, j) => j !== i),
                  })
                }
              >
                Remove feature
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                features: [
                  ...config.features,
                  {
                    id: newId(),
                    title: 'New feature',
                    description: 'Description',
                    icon: '✨',
                  },
                ],
              })
            }
          >
            + Add feature
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Pricing
        </h3>
        <div className="space-y-4">
          {config.plans.map((p, i) => (
            <div
              key={p.id}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Plan name">
                  <input
                    className={inputClass}
                    value={p.name}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, name: e.target.value };
                      patch({ plans });
                    }}
                  />
                </Field>
                <Field label="Price">
                  <input
                    className={inputClass}
                    value={p.price}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, price: e.target.value };
                      patch({ plans });
                    }}
                  />
                </Field>
                <Field label="Period">
                  <input
                    className={inputClass}
                    value={p.period ?? ''}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, period: e.target.value };
                      patch({ plans });
                    }}
                    placeholder="/mo"
                  />
                </Field>
                <Field label="CTA label">
                  <input
                    className={inputClass}
                    value={p.ctaLabel}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, ctaLabel: e.target.value };
                      patch({ plans });
                    }}
                  />
                </Field>
                <Field label="CTA href" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    value={p.ctaHref}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, ctaHref: e.target.value };
                      patch({ plans });
                    }}
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    value={p.description}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, description: e.target.value };
                      patch({ plans });
                    }}
                  />
                </Field>
                <Field label="Features (one per line)" className="sm:col-span-2">
                  <textarea
                    className={cn(inputClass, 'min-h-[88px] resize-y font-mono text-xs')}
                    value={p.features.join('\n')}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = {
                        ...p,
                        features: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      patch({ plans });
                    }}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!p.highlighted}
                    onChange={(e) => {
                      const plans = [...config.plans];
                      plans[i] = { ...p, highlighted: e.target.checked };
                      patch({ plans });
                    }}
                  />
                  Highlight plan
                </label>
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-red-600"
                onClick={() =>
                  patch({
                    plans: config.plans.filter((_, j) => j !== i),
                  })
                }
              >
                Remove plan
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                plans: [
                  ...config.plans,
                  {
                    id: newId(),
                    name: 'Plan',
                    price: '$0',
                    description: '',
                    features: ['Feature'],
                    ctaLabel: 'Choose',
                    ctaHref: '#',
                  },
                ],
              })
            }
          >
            + Add plan
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Testimonials
        </h3>
        <div className="space-y-4">
          {config.testimonials.map((t, i) => (
            <div
              key={t.id}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Quote" className="sm:col-span-2">
                  <textarea
                    className={cn(inputClass, 'min-h-[72px] resize-y')}
                    value={t.quote}
                    onChange={(e) => {
                      const testimonials = [...config.testimonials];
                      testimonials[i] = { ...t, quote: e.target.value };
                      patch({ testimonials });
                    }}
                  />
                </Field>
                <Field label="Author">
                  <input
                    className={inputClass}
                    value={t.author}
                    onChange={(e) => {
                      const testimonials = [...config.testimonials];
                      testimonials[i] = { ...t, author: e.target.value };
                      patch({ testimonials });
                    }}
                  />
                </Field>
                <Field label="Role">
                  <input
                    className={inputClass}
                    value={t.role}
                    onChange={(e) => {
                      const testimonials = [...config.testimonials];
                      testimonials[i] = { ...t, role: e.target.value };
                      patch({ testimonials });
                    }}
                  />
                </Field>
                <Field label="Avatar URL" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    value={t.avatarUrl ?? ''}
                    onChange={(e) => {
                      const testimonials = [...config.testimonials];
                      testimonials[i] = {
                        ...t,
                        avatarUrl: e.target.value || undefined,
                      };
                      patch({ testimonials });
                    }}
                  />
                  <ImageDropField
                    compact
                    className="mt-2"
                    label=""
                    value={t.avatarUrl ?? ''}
                    onChange={(v) => {
                      const testimonials = [...config.testimonials];
                      testimonials[i] = {
                        ...t,
                        avatarUrl: v || undefined,
                      };
                      patch({ testimonials });
                    }}
                  />
                </Field>
              </div>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-red-600"
                onClick={() =>
                  patch({
                    testimonials: config.testimonials.filter(
                      (_, j) => j !== i,
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                testimonials: [
                  ...config.testimonials,
                  {
                    id: newId(),
                    quote: 'Great product!',
                    author: 'Name',
                    role: 'Role',
                  },
                ],
              })
            }
          >
            + Add testimonial
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          FAQ
        </h3>
        <div className="space-y-4">
          {config.faqs.map((f, i) => (
            <div
              key={f.id}
              className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <Field label="Question">
                <input
                  className={inputClass}
                  value={f.question}
                  onChange={(e) => {
                    const faqs = [...config.faqs];
                    faqs[i] = { ...f, question: e.target.value };
                    patch({ faqs });
                  }}
                />
              </Field>
              <Field label="Answer" className="mt-3">
                <textarea
                  className={cn(inputClass, 'min-h-[72px] resize-y')}
                  value={f.answer}
                  onChange={(e) => {
                    const faqs = [...config.faqs];
                    faqs[i] = { ...f, answer: e.target.value };
                    patch({ faqs });
                  }}
                />
              </Field>
              <button
                type="button"
                className="mt-3 text-xs font-medium text-red-600"
                onClick={() =>
                  patch({
                    faqs: config.faqs.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                faqs: [
                  ...config.faqs,
                  { id: newId(), question: 'Question?', answer: 'Answer.' },
                ],
              })
            }
          >
            + Add FAQ
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          CTA section
        </h3>
        <Field label="Title">
          <input
            className={inputClass}
            value={config.ctaTitle}
            onChange={(e) => patch({ ctaTitle: e.target.value })}
          />
        </Field>
        <Field label="Subtitle">
          <textarea
            className={cn(inputClass, 'min-h-[72px] resize-y')}
            value={config.ctaSubtitle}
            onChange={(e) => patch({ ctaSubtitle: e.target.value })}
          />
        </Field>
        <div className="space-y-3">
          {config.ctaButtons.map((b, i) => (
            <div key={b.id} className="flex flex-wrap gap-2">
              <input
                className={cn(inputClass, 'min-w-[100px] flex-1')}
                value={b.label}
                onChange={(e) => {
                  const ctaButtons = [...config.ctaButtons];
                  ctaButtons[i] = { ...b, label: e.target.value };
                  patch({ ctaButtons });
                }}
              />
              <input
                className={cn(inputClass, 'min-w-[100px] flex-1')}
                value={b.href}
                onChange={(e) => {
                  const ctaButtons = [...config.ctaButtons];
                  ctaButtons[i] = { ...b, href: e.target.value };
                  patch({ ctaButtons });
                }}
              />
              <select
                className={inputClass}
                value={b.variant ?? 'primary'}
                onChange={(e) => {
                  const ctaButtons = [...config.ctaButtons];
                  ctaButtons[i] = {
                    ...b,
                    variant: e.target.value as typeof b.variant,
                  };
                  patch({ ctaButtons });
                }}
              >
                <option value="primary">Primary (filled)</option>
                <option value="outline">Outline</option>
              </select>
              <label className="flex items-center gap-2 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={!!b.openInNewTab}
                  onChange={(e) => {
                    const ctaButtons = [...config.ctaButtons];
                    ctaButtons[i] = {
                      ...b,
                      openInNewTab: e.target.checked,
                    };
                    patch({ ctaButtons });
                  }}
                />
                New tab
              </label>
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() =>
                  patch({
                    ctaButtons: config.ctaButtons.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600"
            onClick={() =>
              patch({
                ctaButtons: [
                  ...config.ctaButtons,
                  {
                    id: newId(),
                    label: 'CTA',
                    href: '#',
                    variant: 'primary',
                  },
                ],
              })
            }
          >
            + Add CTA button
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Footer
        </h3>
        <Field label="Footer note">
          <input
            className={inputClass}
            value={config.footerNote}
            onChange={(e) => patch({ footerNote: e.target.value })}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          Sections on page
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Remove blocks, add them back, and drag to reorder. The preview updates
          instantly.
        </p>
        <SectionManager
          order={config.sectionOrder}
          onChange={(sectionOrder) => patch({ sectionOrder })}
        />
      </section>
    </div>
  );
}
