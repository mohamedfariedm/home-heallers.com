'use client';

import type { CanvasFloatingDock } from '@/types/landing-canvas';
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Phone,
  Share2,
  Youtube,
} from 'lucide-react';
import { useState } from 'react';
import cn from '@/utils/class-names';

function digitsOnly(s: string) {
  return s.replace(/\D/g, '');
}

const fab =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

type CanvasFloatingDockViewProps = {
  dock: CanvasFloatingDock;
  /**
   * When true (builder preview), dock is `absolute` inside the preview so it stays visible.
   * When false / omitted, `fixed` to the viewport for a real full-page publish.
   */
  pinInsidePreview?: boolean;
};

export function CanvasFloatingDockView({
  dock,
  pinInsidePreview = false,
}: CanvasFloatingDockViewProps) {
  const [open, setOpen] = useState(false);

  if (!dock.enabled) return null;

  const tel = dock.phone.replace(/[^\d+]/g, '');
  const wa = digitsOnly(dock.whatsapp);
  const hasCall = dock.showCall && tel.length > 0;
  const hasWa = dock.showWhatsapp && wa.length > 0;
  const socials = [
    { href: dock.facebookUrl, Icon: Facebook, label: 'Facebook' },
    { href: dock.instagramUrl, Icon: Instagram, label: 'Instagram' },
    { href: dock.xUrl, Icon: Share2, label: 'X' },
    { href: dock.linkedinUrl, Icon: Linkedin, label: 'LinkedIn' },
    { href: dock.youtubeUrl, Icon: Youtube, label: 'YouTube' },
  ].filter((s) => s.href.trim().length > 0);

  const hasAnyAction = hasCall || hasWa || socials.length > 0;

  const pos =
    dock.position === 'bottom-left'
      ? 'bottom-4 left-4 items-start'
      : 'bottom-4 right-4 items-end';

  const rootLayout = pinInsidePreview
    ? cn('pointer-events-none absolute z-[40] flex flex-col gap-2', pos)
    : cn('pointer-events-none fixed z-[60] flex flex-col gap-2', pos);

  if (!hasAnyAction) {
    if (!pinInsidePreview) return null;
    return (
      <div className={rootLayout} aria-live="polite">
        <div className="pointer-events-none max-w-[11rem] rounded-xl border border-dashed border-indigo-300/80 bg-indigo-50/95 px-2.5 py-2 text-[10px] font-medium leading-snug text-indigo-900 shadow-sm dark:border-indigo-600/60 dark:bg-indigo-950/80 dark:text-indigo-100">
          Floating dock is on — add a phone number, WhatsApp digits, or a social URL in Page
          properties (deselect blocks to open Page).
        </div>
      </div>
    );
  }

  return (
    <div className={cn(rootLayout)} aria-live="polite">
      <div
        className={cn(
          'pointer-events-auto flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95',
          open ? 'flex' : 'max-sm:hidden',
          'sm:flex',
        )}
      >
        {hasCall ? (
          <a
            href={`tel:${tel}`}
            title="Call us"
            className={cn(fab, 'bg-indigo-600')}
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>
        ) : null}
        {hasWa ? (
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            title="WhatsApp"
            className={cn(fab, 'bg-emerald-600')}
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>
        ) : null}
        {socials.map(({ href, Icon, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            title={label}
            className={cn(
              fab,
              'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600',
            )}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </a>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-xl ring-2 ring-white/30 sm:hidden"
        aria-expanded={open}
        aria-label={open ? 'Close contact menu' : 'Open contact menu'}
      >
        {open ? '×' : '⋯'}
      </button>
    </div>
  );
}
