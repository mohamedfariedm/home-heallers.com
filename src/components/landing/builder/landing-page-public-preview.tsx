'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CanvasPagePreview } from '@/components/landing/canvas/canvas-page-preview';
import { loadLandingProject } from '@/lib/landing-builder/project-storage';

type Props = {
  slug: string;
  locale: string;
};

export function LandingPagePublicPreview({ slug, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = useMemo(() => {
    const project = loadLandingProject();
    return project.pages.find((p) => p.slug === slug) ?? null;
  }, [slug]);

  if (!page) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Landing page not found.</p>
          <Link
            href={`/${locale}/landing-builder`}
            className="mt-3 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to landing pages
          </Link>
        </div>
      </div>
    );
  }

  const requestedLang = searchParams.get('lang') ?? locale;
  const activeLocale = page.locales.find((l) => l.code === requestedLang)?.code ?? page.locales[0]?.code ?? 'en';
  const previewCanvas = page.canvasLocales[activeLocale] ?? page.canvasLocales[page.locales[0]?.code ?? 'en'];
  const previewDir = page.locales.find((l) => l.code === activeLocale)?.dir === 'rtl' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-zinc-950">
      <CanvasPagePreview
        canvas={previewCanvas}
        previewDark={false}
        previewDir={previewDir}
        availableLocales={page.locales}
        currentLocale={activeLocale}
        onLocaleChange={(nextLocale) =>
          router.push(`/${locale}/landing-builder/${encodeURIComponent(slug)}?lang=${encodeURIComponent(nextLocale)}`)
        }
      />
    </div>
  );
}
