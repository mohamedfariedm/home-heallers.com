'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { CanvasPage } from '@/types/landing-canvas';
import cn from '@/utils/class-names';

type Props = {
  canvas: CanvasPage;
  previewDark: boolean;
  /** Document direction for bilingual preview (e.g. Arabic). */
  dir?: 'ltr' | 'rtl';
  className?: string;
  children: ReactNode;
};

export function CanvasThemeRoot({
  canvas,
  previewDark,
  dir = 'ltr',
  className,
  children,
}: Props) {
  const style = {
    '--lp-primary': canvas.primaryColor,
    '--lp-secondary': canvas.secondaryColor,
  } as CSSProperties;

  return (
    <div
      className={cn(
        '@container w-full min-w-0',
        previewDark && 'dark',
        className,
      )}
      style={style}
      data-canvas-preview
    >
      <div
        className="relative min-h-full text-zinc-900 dark:text-zinc-100"
        dir={dir}
        style={{ background: canvas.pageBackground, fontSize: '1rem' }}
      >
        {children}
      </div>
    </div>
  );
}
