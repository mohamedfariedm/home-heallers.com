import type { LandingPageConfig } from '@/types/landing-builder';
import type { CanvasPage } from '@/types/landing-canvas';
import {
  defaultButtonBlock,
  defaultImageBlock,
  defaultSection,
  defaultTextBlock,
  EMPTY_CANVAS_PAGE,
  mergeCanvasPage,
  newCanvasId,
} from '@/lib/landing-builder/canvas-defaults';

/** Best-effort: legacy structured landing → freeform canvas (one hero-style section). */
export function legacyLandingConfigToCanvas(config: LandingPageConfig): CanvasPage {
  const sec = defaultSection('Imported');
  sec.background = '#fafafa';
  sec.contentAlign = 'center';
  sec.children = [
    {
      ...defaultTextBlock(),
      id: newCanvasId('text'),
      variant: 'h1',
      content: config.tagline || config.productName,
      align: 'center',
      width: '100%',
      maxWidth: '48rem',
    },
    {
      ...defaultTextBlock(),
      id: newCanvasId('text'),
      variant: 'body',
      content: config.description,
      align: 'center',
      width: '100%',
      maxWidth: '40rem',
    },
  ];
  if (config.heroImageUrl) {
    sec.children.push({
      ...defaultImageBlock(),
      id: newCanvasId('img'),
      src: config.heroImageUrl,
      alt: '',
      width: 'min(100%, 56rem)',
      height: 'auto',
    });
  }
  const row = {
    type: 'stack' as const,
    id: newCanvasId('stack'),
    direction: 'row' as const,
    gap: '12px',
    align: 'center' as const,
    justify: 'center' as const,
    wrap: true,
    width: '100%',
    children: config.heroButtons.map((b) => ({
      ...defaultButtonBlock(),
      id: b.id || newCanvasId('btn'),
      label: b.label,
      href: b.href,
      variant: b.variant ?? 'primary',
      openInNewTab: b.openInNewTab,
    })),
  };
  if (row.children.length) sec.children.push(row);

  return mergeCanvasPage({
    siteName: config.productName,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    pageBackground: '#ffffff',
    sections: [sec],
  });
}

export function normalizeStoredCanvas(
  raw: unknown,
  legacyConfig?: LandingPageConfig,
): CanvasPage {
  if (raw && typeof raw === 'object' && Array.isArray((raw as CanvasPage).sections)) {
    return mergeCanvasPage(raw as CanvasPage);
  }
  if (legacyConfig) return legacyLandingConfigToCanvas(legacyConfig);
  return mergeCanvasPage(EMPTY_CANVAS_PAGE);
}
