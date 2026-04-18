'use client';

import type { LandingPageSeo } from '@/types/landing-seo';

const label = 'block text-xs font-medium text-zinc-500 dark:text-zinc-400';
const input =
  'mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const textarea =
  'mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-950/5 px-3 py-2 font-mono text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100';
const section = 'space-y-1 border-t border-zinc-200 pt-4 first:border-t-0 first:pt-0 dark:border-zinc-700';

type Props = {
  seo: LandingPageSeo;
  onChange: (next: LandingPageSeo) => void;
};

export function LandingSeoPanel({ seo, onChange }: Props) {
  const patch = (partial: Partial<LandingPageSeo>) => onChange({ ...seo, ...partial });

  return (
    <div className="space-y-5">
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        These fields map to standard meta tags, Open Graph, Twitter cards, hreflang, and optional
        JSON-LD. Use them when you wire this page to a route or static export.
      </p>

      <div className={section}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Primary meta
        </p>
        <label className={label}>
          Meta title
          <input
            className={input}
            value={seo.metaTitle}
            onChange={(e) => patch({ metaTitle: e.target.value })}
            placeholder="Page title for search results"
          />
        </label>
        <label className={label}>
          Meta description
          <textarea
            className={textarea}
            rows={3}
            value={seo.metaDescription}
            onChange={(e) => patch({ metaDescription: e.target.value })}
            placeholder="150–160 characters recommended"
          />
        </label>
        <label className={label}>
          Meta keywords (comma-separated)
          <input
            className={input}
            value={seo.metaKeywords}
            onChange={(e) => patch({ metaKeywords: e.target.value })}
            placeholder="keyword one, keyword two"
          />
        </label>
        <label className={label}>
          Canonical URL
          <input
            className={input}
            value={seo.canonicalUrl}
            onChange={(e) => patch({ canonicalUrl: e.target.value })}
            placeholder="https://example.com/this-page"
          />
        </label>
        <label className={label}>
          Robots
          <input
            className={input}
            value={seo.robots}
            onChange={(e) => patch({ robots: e.target.value })}
            placeholder="index, follow"
          />
        </label>
      </div>

      <div className={section}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Open Graph
        </p>
        <label className={label}>
          og:title (empty = use meta title)
          <input
            className={input}
            value={seo.ogTitle}
            onChange={(e) => patch({ ogTitle: e.target.value })}
          />
        </label>
        <label className={label}>
          og:description
          <textarea
            className={textarea}
            rows={2}
            value={seo.ogDescription}
            onChange={(e) => patch({ ogDescription: e.target.value })}
          />
        </label>
        <label className={label}>
          og:image URL
          <input
            className={input}
            value={seo.ogImage}
            onChange={(e) => patch({ ogImage: e.target.value })}
            placeholder="https://…/og-cover.jpg"
          />
        </label>
        <label className={label}>
          og:url
          <input
            className={input}
            value={seo.ogUrl}
            onChange={(e) => patch({ ogUrl: e.target.value })}
          />
        </label>
        <label className={label}>
          og:site_name
          <input
            className={input}
            value={seo.ogSiteName}
            onChange={(e) => patch({ ogSiteName: e.target.value })}
          />
        </label>
        <label className={label}>
          og:locale
          <input
            className={input}
            value={seo.ogLocale}
            onChange={(e) => patch({ ogLocale: e.target.value })}
            placeholder="en_US"
          />
        </label>
      </div>

      <div className={section}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Twitter / X
        </p>
        <label className={label}>
          Card type
          <select
            className={input}
            value={seo.twitterCard}
            onChange={(e) =>
              patch({ twitterCard: e.target.value as LandingPageSeo['twitterCard'] })
            }
          >
            <option value="summary">summary</option>
            <option value="summary_large_image">summary_large_image</option>
          </select>
        </label>
        <label className={label}>
          twitter:site (@handle)
          <input
            className={input}
            value={seo.twitterSite}
            onChange={(e) => patch({ twitterSite: e.target.value })}
            placeholder="@yoursite"
          />
        </label>
        <label className={label}>
          twitter:creator
          <input
            className={input}
            value={seo.twitterCreator}
            onChange={(e) => patch({ twitterCreator: e.target.value })}
          />
        </label>
      </div>

      <div className={section}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Hreflang (EN / AR)
        </p>
        <label className={label}>
          Alternate locale hint (og:locale:alternate)
          <input
            className={input}
            value={seo.alternateLocale}
            onChange={(e) => patch({ alternateLocale: e.target.value })}
            placeholder="ar_SA"
          />
        </label>
        <label className={label}>
          English page URL
          <input
            className={input}
            value={seo.hreflangEnUrl}
            onChange={(e) => patch({ hreflangEnUrl: e.target.value })}
            placeholder="https://example.com/en/landing"
          />
        </label>
        <label className={label}>
          Arabic page URL
          <input
            className={input}
            value={seo.hreflangArUrl}
            onChange={(e) => patch({ hreflangArUrl: e.target.value })}
            placeholder="https://example.com/ar/landing"
          />
        </label>
      </div>

      <div className={section}>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Structured data & PWA
        </p>
        <label className={label}>
          JSON-LD (raw JSON — validated on publish in your app)
          <textarea
            className={textarea}
            rows={6}
            value={seo.jsonLd}
            onChange={(e) => patch({ jsonLd: e.target.value })}
            spellCheck={false}
            placeholder='{"@context":"https://schema.org","@type":"WebPage",...}'
          />
        </label>
        <label className={label}>
          Theme color (browser UI)
          <input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700"
            value={seo.themeColor || '#6366f1'}
            onChange={(e) => patch({ themeColor: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
