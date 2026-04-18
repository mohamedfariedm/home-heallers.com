'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import type { CanvasPage } from '@/types/landing-canvas';
import type { LandingLocale } from '@/types/landing-project';
import { mergeCanvasPage } from '@/lib/landing-builder/canvas-defaults';
import { useCanvasPage } from '@/hooks/use-canvas-page';

export type LandingEditorCanvasApi = ReturnType<typeof useCanvasPage>;

const Ctx = createContext<LandingEditorCanvasApi | null>(null);

export function useLandingEditorCanvas(): LandingEditorCanvasApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLandingEditorCanvas must be used within LandingEditorCanvasProvider');
  return v;
}

type Props = {
  pageId: string;
  locale: LandingLocale;
  seed: CanvasPage;
  onUnmountPersist: (pageId: string, locale: LandingLocale, canvas: CanvasPage) => void;
  onDebouncedPersist: (pageId: string, locale: LandingLocale, canvas: CanvasPage) => void;
  children: ReactNode;
};

export function LandingEditorCanvasProvider({
  pageId,
  locale,
  seed,
  onUnmountPersist,
  onDebouncedPersist,
  children,
}: Props) {
  const api = useCanvasPage(mergeCanvasPage(seed));
  const canvasRef = useRef(api.canvas);
  canvasRef.current = api.canvas;

  useEffect(() => {
    return () => {
      onUnmountPersist(pageId, locale, mergeCanvasPage(canvasRef.current));
    };
  }, [pageId, locale, onUnmountPersist]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      onDebouncedPersist(pageId, locale, mergeCanvasPage(canvasRef.current));
    }, 500);
    return () => window.clearTimeout(t);
  }, [api.canvas, pageId, locale, onDebouncedPersist]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
