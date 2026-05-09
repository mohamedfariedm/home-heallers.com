'use client';

import {
  createElement,
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { Menu, X } from 'lucide-react';
import type {
  CanvasBlock,
  CanvasCardBlock,
  CanvasCopyBlock,
  CanvasFooterBlock,
  CanvasFormBlock,
  CanvasGridBlock,
  CanvasNavbarBlock,
  CanvasPage,
  CanvasSection,
  CanvasTextBlock,
} from '@/types/landing-canvas';
import type { LandingLocaleConfig } from '@/types/landing-project';
import { CanvasThemeRoot } from './canvas-theme';
import { CanvasFloatingDockView } from './canvas-floating-dock';
import cn from '@/utils/class-names';

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
} as const;

const textAlignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const flexJustify = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;

const flexAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const btnBase =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function sectionAnchorId(name: string, explicit?: string): string {
  const seed = (explicit ?? name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return seed || 'section';
}

function buttonClass(variant: 'primary' | 'secondary' | 'outline'): string {
  if (variant === 'primary') {
    return cn(
      btnBase,
      'text-white shadow-md',
      'bg-[color:var(--lp-primary)] hover:opacity-95',
    );
  }
  if (variant === 'secondary') {
    return cn(
      btnBase,
      'text-white shadow-md',
      'bg-[color:var(--lp-secondary)] hover:opacity-95',
    );
  }
  return cn(
    btnBase,
    'border-2 border-[color:var(--lp-primary)] text-[color:var(--lp-primary)] bg-transparent hover:bg-[color:var(--lp-primary)]/10',
  );
}

type BlockOpts = {
  selectedId: string | null;
  onSelect: (id: string) => void;
  editable: boolean;
  locales?: LandingLocaleConfig[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
};

/** Footer grid: `@lg`/`@xl` follow preview width (container), not browser viewport. */
const footerGridCols: Record<1 | 2 | 3 | 4, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @lg:grid-cols-2',
  3: 'grid-cols-1 @lg:grid-cols-3',
  4: 'grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-4',
};

/** Below `lg` — from `columnsSmall`. */
const gridColsSmall: Record<CanvasGridBlock['columnsSmall'], string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

/** From container `lg` up — matches preview frame when editor constrains width. */
const gridColsLarge: Record<CanvasGridBlock['columns'], string> = {
  1: '@lg:grid-cols-1',
  2: '@lg:grid-cols-2',
  3: '@lg:grid-cols-3',
  4: '@lg:grid-cols-2 @xl:grid-cols-4',
};

function CopyBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasCopyBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;
  const HeadTag = block.headlineTag;
  const gap = block.gap || '12px';
  const align = textAlignClass[block.align];

  const eyebrowStyle: CSSProperties = {
    fontSize: block.eyebrowSize || '0.7rem',
    color: block.eyebrowColor,
  };
  const headlineStyle: CSSProperties = {
    fontSize: block.headlineSize || undefined,
    color: block.headlineColor,
  };
  const subStyle: CSSProperties = {
    fontSize: block.subheadlineSize || '1.0625rem',
    color: block.subheadlineColor,
  };
  const bodyStyle: CSSProperties = {
    fontSize: block.bodySize || '1rem',
    color: block.bodyColor,
  };

  const headlineFont =
    block.headlineTag === 'h1'
      ? 'text-[length:clamp(1.75rem,4vw,2.75rem)] font-bold leading-tight'
      : block.headlineTag === 'h2'
        ? 'text-[length:clamp(1.45rem,3vw,2rem)] font-bold leading-snug'
        : 'text-[length:1.35rem] font-bold leading-snug';

  return (
    <div
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn(
        'flex w-full flex-col',
        align,
        editable && 'cursor-pointer rounded-xl',
        editable && selectedId === block.id && ring,
      )}
      style={{ gap, width: block.width, maxWidth: block.maxWidth }}
    >
      {block.showEyebrow && block.eyebrow.trim() ? (
        <p
          className="font-semibold uppercase tracking-[0.18em] text-[color:var(--lp-primary)]"
          style={eyebrowStyle}
        >
          {block.eyebrow}
        </p>
      ) : null}
      <HeadTag className={cn('text-zinc-900 dark:text-white', headlineFont)} style={headlineStyle}>
        {block.headline}
      </HeadTag>
      {block.showSubheadline && block.subheadline.trim() ? (
        <p className="text-zinc-600 dark:text-zinc-300" style={subStyle}>
          {block.subheadline}
        </p>
      ) : null}
      {block.body.trim() ? (
        <div
          className="max-w-none whitespace-pre-wrap text-zinc-700 dark:text-zinc-300"
          style={bodyStyle}
        >
          {block.body}
        </div>
      ) : null}
    </div>
  );
}

function NavbarBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasNavbarBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const navClick = (e: MouseEvent) => {
    if (!editable) return;
    e.stopPropagation();
    onSelect(block.id);
  };
  const linkProps = (e: MouseEvent) => {
    if (editable) e.preventDefault();
  };

  const navigateToHref = (e: MouseEvent, href: string, closeMobile = false) => {
    if (editable) {
      e.preventDefault();
      return;
    }
    if (!href.startsWith('#')) return;
    e.preventDefault();
    const id = href.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const stickyOffset = block.sticky ? (headerRef.current?.getBoundingClientRect().height ?? 0) : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - stickyOffset - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    if (closeMobile) setMobileOpen(false);
  };

  const linkClass =
    'block rounded-lg px-2 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-[color:var(--lp-primary)] dark:text-zinc-200 dark:hover:bg-zinc-800 @lg:inline @lg:px-0 @lg:py-0 @lg:hover:bg-transparent';
  const localeOptions = opts.locales?.length ? opts.locales : null;
  const showLocaleSwitcher = Boolean(localeOptions && block.showLanguageSwitcher);
  const localeSelect = showLocaleSwitcher ? (
    <select
      value={opts.currentLocale}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        opts.onLocaleChange?.(e.target.value);
      }}
      className="outline-none"
      style={{
        background: block.languageSwitcherBg,
        color: block.languageSwitcherTextColor,
        border: `1px solid ${block.languageSwitcherBorderColor}`,
        borderRadius: block.languageSwitcherBorderRadius,
        paddingTop: block.languageSwitcherPaddingY,
        paddingBottom: block.languageSwitcherPaddingY,
        paddingLeft: block.languageSwitcherPaddingX,
        paddingRight: block.languageSwitcherPaddingX,
        fontSize: block.languageSwitcherFontSize,
        minWidth: block.languageSwitcherMinWidth,
      }}
      aria-label="Language"
    >
      {localeOptions.map((loc) => (
        <option key={loc.code} value={loc.code}>
          {`${loc.flag ?? '🏳️'} ${loc.label || loc.code.toUpperCase()}`}
        </option>
      ))}
    </select>
  ) : null;

  const renderCta = (compact: boolean) =>
    block.showCta ? (
      <div className={cn(compact ? 'pt-1' : '', 'shrink-0')} onClick={(e) => e.stopPropagation()}>
        {editable ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            className={cn(
              buttonClass('primary'),
              compact ? 'w-full justify-center px-4 py-2.5 text-sm' : 'px-4 py-2 text-sm',
            )}
          >
            {block.ctaLabel}
          </button>
        ) : (
          <a
            href={block.ctaHref}
            onClick={(e) => navigateToHref(e, block.ctaHref)}
            className={cn(
              buttonClass('primary'),
              compact ? 'flex w-full justify-center px-4 py-2.5 text-sm' : 'px-4 py-2 text-sm',
            )}
          >
            {block.ctaLabel}
          </a>
        )}
      </div>
    ) : null;

  return (
    <header
      ref={headerRef}
      className={cn(
        'w-full',
        block.sticky && 'sticky top-0 z-10 backdrop-blur-md',
        editable && selectedId === block.id && ring,
        editable && 'cursor-pointer rounded-xl',
      )}
      style={{
        background: block.background,
        borderBottom: block.borderBottom ? '1px solid rgba(15,23,42,0.08)' : undefined,
        paddingTop: block.paddingY,
        paddingBottom: block.paddingY,
      }}
      onClick={navClick}
    >
      <div
        className="mx-auto flex w-full min-w-0 items-center justify-between gap-3"
        style={{
          maxWidth: block.maxWidth,
          minHeight: block.minHeight,
          paddingLeft: block.paddingX,
          paddingRight: block.paddingX,
        }}
      >
        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          {block.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.logoUrl}
              alt=""
              className="object-contain"
              style={{ height: block.logoHeight, maxWidth: 'min(160px, 42vw)' }}
            />
          ) : (
            <span className="truncate text-base font-bold text-zinc-900 dark:text-white sm:text-lg">
              {block.logoText}
            </span>
          )}
        </div>
        <div className="hidden shrink-0 items-center gap-3 @lg:flex" onClick={(e) => e.stopPropagation()}>
          {showLocaleSwitcher && block.languageSwitcherPosition === 'before-links' ? localeSelect : null}
        </div>
        <nav
          className="mx-2 hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-y-1 @lg:flex"
          style={{ gap: block.linkGap }}
          onClick={(e) => e.stopPropagation()}
        >
          {block.links.map((l) => (
            <a
              key={l.id}
              href={editable ? '#' : l.href}
              onClick={(e) => {
                linkProps(e);
                navigateToHref(e, l.href);
              }}
              className="whitespace-nowrap text-sm font-medium text-zinc-700 transition hover:text-[color:var(--lp-primary)] dark:text-zinc-200"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-3 @lg:flex" onClick={(e) => e.stopPropagation()}>
          {showLocaleSwitcher && block.languageSwitcherPosition === 'after-links' ? localeSelect : null}
          {showLocaleSwitcher && block.languageSwitcherPosition === 'beside-cta' ? localeSelect : null}
          {block.showCta ? renderCta(false) : null}
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 rounded-lg border border-zinc-200 p-2 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800 @lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen((o) => !o);
          }}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen ? (
        <div
          className="border-t border-zinc-200/80 bg-[inherit] px-3 pb-3 pt-1 @lg:hidden dark:border-zinc-700/80"
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col" style={{ gap: block.linkGap }}>
            {block.links.map((l) => (
              <a
                key={l.id}
                href={editable ? '#' : l.href}
                onClick={(e) => {
                  linkProps(e);
                  navigateToHref(e, l.href, true);
                  if (!l.href.startsWith('#')) setMobileOpen(false);
                }}
                className={linkClass}
              >
                {l.label}
              </a>
            ))}
          </nav>
          {showLocaleSwitcher ? (
            <div className="mt-2">
              <select
                value={opts.currentLocale}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  opts.onLocaleChange?.(e.target.value);
                  setMobileOpen(false);
                }}
                className="w-full outline-none"
                style={{
                  background: block.languageSwitcherBg,
                  color: block.languageSwitcherTextColor,
                  border: `1px solid ${block.languageSwitcherBorderColor}`,
                  borderRadius: block.languageSwitcherBorderRadius,
                  paddingTop: block.languageSwitcherPaddingY,
                  paddingBottom: block.languageSwitcherPaddingY,
                  paddingLeft: block.languageSwitcherPaddingX,
                  paddingRight: block.languageSwitcherPaddingX,
                  fontSize: block.languageSwitcherFontSize,
                  minWidth: block.languageSwitcherMinWidth,
                }}
                aria-label="Language"
              >
                {localeOptions.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {`${loc.flag ?? '🏳️'} ${loc.label || loc.code.toUpperCase()}`}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {block.showCta ? <div className="mt-2">{renderCta(true)}</div> : null}
        </div>
      ) : null}
    </header>
  );
}

function FooterBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasFooterBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;
  const cols = footerGridCols[block.columnCount] ?? footerGridCols[3];

  return (
    <footer
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn(
        'w-full text-zinc-300',
        editable && 'cursor-pointer rounded-xl',
        editable && selectedId === block.id && ring,
      )}
      style={{
        background: block.background,
        paddingTop: block.paddingY,
        paddingBottom: block.paddingY,
        paddingLeft: block.paddingX,
        paddingRight: block.paddingX,
      }}
    >
      <div className="mx-auto w-full space-y-10" style={{ maxWidth: block.maxWidth }}>
        <div
          className={cn(
            'grid gap-8 max-sm:justify-items-center max-sm:text-center sm:justify-items-stretch sm:text-left',
            cols,
          )}
        >
          {block.columns.map((col) => (
            <div key={col.id} className="max-w-md sm:max-w-none">
              <p className="text-sm font-semibold text-white">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={editable ? '#' : l.href}
                      onClick={(e) => editable && e.preventDefault()}
                      className="text-sm text-zinc-400 transition hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 text-sm text-zinc-500">
          <p className="font-medium text-zinc-400">{block.copyright}</p>
          {block.tagline.trim() ? (
            <p className="mt-1 text-zinc-500">{block.tagline}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function textTag(block: CanvasTextBlock) {
  const size =
    block.fontSize ||
    (block.variant === 'h1'
      ? 'clamp(1.75rem, 4vw, 2.75rem)'
      : block.variant === 'h2'
        ? 'clamp(1.5rem, 3vw, 2rem)'
        : block.variant === 'h3'
          ? '1.35rem'
          : block.variant === 'caption'
            ? '0.8rem'
            : block.variant === 'lead'
              ? 'clamp(1.05rem, 2vw, 1.25rem)'
              : block.variant === 'subtitle'
                ? '1.0625rem'
                : block.variant === 'overline'
                  ? '0.7rem'
                  : '1rem');
  const weight =
    block.variant === 'body' ||
    block.variant === 'caption' ||
    block.variant === 'lead' ||
    block.variant === 'subtitle'
      ? 'font-normal'
      : block.variant === 'overline'
        ? 'font-semibold'
        : 'font-bold';
  const tracking = block.variant === 'overline' ? 'uppercase tracking-[0.2em]' : '';
  const Tag =
    block.variant === 'h1'
      ? 'h1'
      : block.variant === 'h2'
        ? 'h2'
        : block.variant === 'h3'
          ? 'h3'
          : 'p';
  return { Tag, size, weight, tracking };
}

function renderBlock(
  block: CanvasBlock,
  opts: {
    selectedId: string | null;
    onSelect: (id: string) => void;
    editable: boolean;
    locales?: LandingLocaleConfig[];
    currentLocale?: string;
    onLocaleChange?: (locale: string) => void;
  },
): ReactElement {
  const { selectedId, onSelect, editable } = opts;
  const ring =
    editable && selectedId === block.id
      ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900'
      : '';

  if (block.type === 'text') {
    const { Tag, size, weight, tracking } = textTag(block);
    const muted =
      block.variant === 'subtitle'
        ? 'text-zinc-600 dark:text-zinc-400'
        : block.variant === 'overline'
          ? 'text-[color:var(--lp-primary)]'
          : '';
    const style: CSSProperties = {
      fontSize: size,
      color: block.color || undefined,
      width: block.width,
      maxWidth: block.maxWidth,
    };
    return (
      <div
        key={block.id}
        className={cn('w-full', textAlignClass[block.align])}
        style={{ maxWidth: '100%' }}
      >
        {createElement(
          Tag as keyof JSX.IntrinsicElements,
          {
            role: editable ? 'button' : undefined,
            tabIndex: editable ? 0 : undefined,
            onClick: editable
              ? (e: MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  onSelect(block.id);
                }
              : undefined,
            onKeyDown: editable
              ? (e: KeyboardEvent<HTMLElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(block.id);
                  }
                }
              : undefined,
            className: cn(
              'outline-none',
              weight,
              tracking,
              muted,
              ring,
              editable && 'cursor-pointer rounded-lg',
            ),
            style,
          },
          block.content,
        )}
      </div>
    );
  }

  if (block.type === 'copy') {
    return <CopyBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  if (block.type === 'navbar') {
    return <NavbarBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  if (block.type === 'footer') {
    return <FooterBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  if (block.type === 'card') {
    return <CardBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  if (block.type === 'grid') {
    return <GridBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  if (block.type === 'image') {
    return (
      <button
        key={block.id}
        type="button"
        className={cn(
          'max-w-full border-0 bg-transparent p-0 text-left',
          ring,
          editable && 'cursor-pointer',
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (editable) onSelect(block.id);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.src}
          alt={block.alt}
          className="block max-w-full"
          style={{
            width: block.width,
            height: block.height === 'auto' ? 'auto' : block.height,
            objectFit: block.objectFit,
            borderRadius: block.borderRadius,
          }}
        />
      </button>
    );
  }

  if (block.type === 'button') {
    const self =
      block.alignSelf === 'auto'
        ? ''
        : block.alignSelf === 'start'
          ? 'self-start'
          : block.alignSelf === 'center'
            ? 'self-center'
            : block.alignSelf === 'end'
              ? 'self-end'
              : 'self-stretch';
    const cls = cn(buttonClass(block.variant), self, ring, editable && 'cursor-pointer');
    const style = { width: block.width, minHeight: block.minHeight } as CSSProperties;
    if (editable) {
      return (
        <button
          key={block.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(block.id);
          }}
          className={cls}
          style={style}
        >
          {block.label}
        </button>
      );
    }
    return (
      <a
        key={block.id}
        href={block.href}
        onClick={(e) => e.stopPropagation()}
        className={cls}
        style={style}
        {...(block.openInNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
      >
        {block.label}
      </a>
    );
  }

  if (block.type === 'form') {
    return <FormBlockView key={block.id} block={block} opts={opts} ring={ring} />;
  }

  const dirClass =
    block.direction === 'row'
      ? 'flex-col min-[480px]:flex-row'
      : 'flex-col';
  return (
    <div
      key={block.id}
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn(
        'flex',
        dirClass,
        flexJustify[block.justify],
        flexAlign[block.align],
        block.wrap && 'flex-wrap',
        editable && 'cursor-pointer rounded-xl',
        ring,
      )}
      style={{ gap: block.gap, width: block.width }}
    >
      {block.children.map((c) => renderBlock(c, opts))}
    </div>
  );
}

function FormBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasFormBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;
  const [status, setStatus] = useState('');

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    if (editable) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(block.id);
      return;
    }
    if (block.actionType === 'url' && block.actionValue.trim()) {
      window.open(block.actionValue, '_blank', 'noopener,noreferrer');
      return;
    }
    if (block.actionType === 'email') {
      window.location.href = `mailto:${block.actionValue}`;
      return;
    }
    if (block.actionType === 'tel') {
      window.location.href = `tel:${block.actionValue}`;
      return;
    }
    setStatus(block.successMessage || 'Submitted');
  };

  return (
    <div
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn('w-full', editable && 'cursor-pointer rounded-xl', editable && selectedId === block.id && ring)}
      style={{
        width: block.width,
        maxWidth: block.maxWidth,
        background: block.background,
        borderRadius: block.borderRadius,
        borderWidth: block.borderWidth,
        borderStyle: 'solid',
        borderColor: block.borderColor,
        padding: block.padding,
      }}
    >
      <div className="flex flex-col" style={{ gap: block.gap }}>
        {block.title.trim() ? <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{block.title}</h3> : null}
        {block.description.trim() ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{block.description}</p>
        ) : null}
        {block.fields.map((field) => (
          <label key={field.id} className="space-y-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                className="min-h-[96px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                onClick={(e) => editable && e.stopPropagation()}
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                required={field.required}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                onClick={(e) => editable && e.stopPropagation()}
                defaultValue=""
              >
                <option value="" disabled>
                  {field.placeholder || 'Select an option'}
                </option>
                {field.options.map((opt, index) => (
                  <option key={`${field.id}-opt-${index}`} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                onClick={(e) => editable && e.stopPropagation()}
              />
            )}
          </label>
        ))}
        <button
          type="button"
          className={cn(buttonClass('primary'), 'w-full')}
          onClick={handleSubmit}
        >
          {block.submitLabel}
        </button>
        {status ? <p className="text-xs text-emerald-600">{status}</p> : null}
      </div>
    </div>
  );
}

const cardLayoutFlex: Record<CanvasCardBlock['layout'], string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse',
};

const cardImageJustifySelf: Record<CanvasCardBlock['imageJustify'], string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};

function cardFlexDirectionClasses(
  layout: CanvasCardBlock['layout'],
  stackNarrow: boolean,
): string {
  if (!stackNarrow) {
    return cn('flex', cardLayoutFlex[layout]);
  }
  switch (layout) {
    case 'row':
      return 'flex flex-col @md:flex-row';
    case 'row-reverse':
      return 'flex flex-col @md:flex-row-reverse';
    case 'column':
      return 'flex flex-col';
    case 'column-reverse':
      return 'flex flex-col-reverse';
    default:
      return 'flex flex-col';
  }
}

function CardBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasCardBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;
  const borderCss: CSSProperties =
    block.borderStyle === 'none'
      ? { border: 'none' }
      : {
          borderWidth: block.borderWidth,
          borderStyle: block.borderStyle,
          borderColor: block.borderColor,
        };

  const cardHref = block.cardHref?.trim() ?? '';
  const cardLinkActive = !editable && cardHref.length > 0;
  const isRowLayout = block.layout === 'row' || block.layout === 'row-reverse';
  const imgWrapResponsive = block.stackOnNarrowScreens && isRowLayout;
  const body = (
    <>
      {block.showImage ? (
        <div
          className={cn(
            'relative z-[2] shrink-0',
            imgWrapResponsive &&
              'mx-auto w-full max-w-full @md:mx-0 @md:w-auto @md:max-w-none',
          )}
          style={{
            minWidth: block.imageMinWidth,
            maxWidth: '100%',
            alignSelf: cardImageJustifySelf[block.imageJustify ?? 'start'],
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.imageSrc}
            alt={block.imageAlt}
            className="max-w-full"
            style={{
              width: block.imageWidth,
              maxWidth: block.imageMaxWidth,
              height: block.imageHeight,
              objectFit: block.imageObjectFit,
              borderRadius: block.imageBorderRadius,
              display: 'block',
            }}
          />
        </div>
      ) : null}
      <div
        className={cn(
          'relative z-[2] min-w-0 space-y-2',
          block.showImage ? 'flex-1' : 'w-full',
          textAlignClass[block.textAlign],
        )}
      >
        {createElement(
          block.titleTag,
          {
            className: 'font-bold text-zinc-900 dark:text-white',
            style: {
              fontSize: block.titleSize,
              color: block.titleColor,
            },
          },
          block.title,
        )}
        <p
          className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300"
          style={{
            fontSize: block.bodySize,
            color: block.bodyColor,
          }}
        >
          {block.body}
        </p>
        {block.showCardCta && block.ctaLabel.trim() ? (
          <div className="pt-1">
            {editable ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(block.id);
                }}
                className={cn(buttonClass(block.ctaVariant), 'relative z-[3] px-4 py-2 text-sm')}
              >
                {block.ctaLabel}
              </button>
            ) : (
              <a
                href={block.ctaHref || '#'}
                className={cn(
                  buttonClass(block.ctaVariant),
                  'relative z-[3] inline-flex px-4 py-2 text-sm',
                )}
                {...(block.ctaOpenInNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
                onClick={(e) => e.stopPropagation()}
              >
                {block.ctaLabel}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn(
        'relative flex w-full min-w-0',
        cardFlexDirectionClasses(block.layout, block.stackOnNarrowScreens),
        editable && 'cursor-pointer',
        editable && selectedId === block.id && ring,
        cardLinkActive && 'transition hover:opacity-[0.98]',
      )}
      style={{
        gap: block.showImage ? block.gap : 0,
        padding: block.padding,
        background: block.background,
        borderRadius: block.borderRadius,
        boxShadow: block.boxShadow === 'none' ? undefined : block.boxShadow,
        width: block.width,
        maxWidth: block.maxWidth,
        ...borderCss,
      }}
    >
      {cardLinkActive ? (
        <a
          href={cardHref}
          className="absolute inset-0 z-[1]"
          style={{ borderRadius: block.borderRadius }}
          aria-label={block.title || 'Open link'}
          {...(block.cardOpenInNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
        />
      ) : null}
      {body}
    </div>
  );
}

const gridAlign: Record<CanvasGridBlock['alignItems'], string> = {
  stretch: 'stretch',
  start: 'start',
  center: 'center',
  end: 'end',
};

const gridJustify: Record<CanvasGridBlock['justifyItems'], string> = {
  stretch: 'stretch',
  start: 'start',
  center: 'center',
  end: 'end',
};

function GridBlockView({
  block,
  opts,
  ring,
}: {
  block: CanvasGridBlock;
  opts: BlockOpts;
  ring: string;
}) {
  const { selectedId, onSelect, editable } = opts;

  return (
    <div
      role={editable ? 'button' : undefined}
      tabIndex={editable ? 0 : undefined}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(block.id);
            }
          : undefined
      }
      onKeyDown={
        editable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(block.id);
              }
            }
          : undefined
      }
      className={cn(
        'grid w-full min-w-0',
        gridColsSmall[block.columnsSmall ?? 1],
        gridColsLarge[block.columns],
        editable && 'cursor-pointer rounded-xl',
        editable && selectedId === block.id && ring,
      )}
      style={{
        columnGap: block.gap,
        rowGap: block.rowGap,
        alignItems: gridAlign[block.alignItems],
        justifyItems: gridJustify[block.justifyItems],
        width: block.width,
        maxWidth: block.maxWidth,
      }}
    >
      {block.children.map((c) => renderBlock(c, opts))}
    </div>
  );
}

function renderSection(
  section: CanvasSection,
  opts: {
    selectedId: string | null;
    onSelect: (id: string) => void;
    editable: boolean;
    locales?: LandingLocaleConfig[];
    currentLocale?: string;
    onLocaleChange?: (locale: string) => void;
  },
) {
  const { selectedId, onSelect, editable } = opts;
  const secSelected = editable && selectedId === section.id;
  return (
    <section
      key={section.id}
      data-lp-canvas={section.id}
      id={sectionAnchorId(section.name, section.anchorId)}
      className={cn(
        'w-full',
        secSelected && 'ring-2 ring-indigo-500 ring-inset',
      )}
      style={{
        background: section.background,
        paddingTop: section.paddingY,
        paddingBottom: section.paddingY,
        paddingLeft: section.paddingX,
        paddingRight: section.paddingX,
      }}
      onClick={
        editable
          ? (e) => {
              e.stopPropagation();
              onSelect(section.id);
            }
          : undefined
      }
    >
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-4',
          alignMap[section.contentAlign],
        )}
        style={{ maxWidth: section.maxWidth }}
      >
        {section.children.map((b) => renderBlock(b, opts))}
      </div>
    </section>
  );
}

type Props = {
  canvas: CanvasPage;
  previewDark: boolean;
  previewDir?: 'ltr' | 'rtl';
  availableLocales?: LandingLocaleConfig[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  editable?: boolean;
  className?: string;
  /** In edit mode: add first section (empty page). */
  onAppendSection?: () => void;
  /** In edit mode: insert a new section directly below this one. */
  onInsertSectionAfter?: (sectionId: string) => void;
};

export function CanvasPagePreview({
  canvas,
  previewDark,
  previewDir = 'ltr',
  selectedId = null,
  onSelect = () => {},
  editable = false,
  className,
  onAppendSection,
  onInsertSectionAfter,
  availableLocales,
  currentLocale,
  onLocaleChange,
}: Props) {
  const opts = {
    selectedId,
    onSelect,
    editable,
    locales: availableLocales,
    currentLocale,
    onLocaleChange,
  };

  return (
    <CanvasThemeRoot
      canvas={canvas}
      previewDark={previewDark}
      dir={previewDir}
      className={className}
    >
      {canvas.sections.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-24 text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Empty page
          </p>
          <p className="max-w-sm text-sm">
            Add your first section here (it stays selected so you can style it and add
            blocks from the bar below), or use the Layers panel.
          </p>
          {editable && onAppendSection ? (
            <button
              type="button"
              onClick={onAppendSection}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500"
            >
              + Add first section
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {canvas.sections.map((s) => (
            <Fragment key={s.id}>
              {renderSection(s, opts)}
              {editable && onInsertSectionAfter ? (
                <div className="flex justify-center py-1.5">
                  <button
                    type="button"
                    onClick={() => onInsertSectionAfter(s.id)}
                    className="rounded-full border border-dashed border-zinc-300 bg-white/90 px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-600 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:border-indigo-500"
                  >
                    + Section below
                  </button>
                </div>
              ) : null}
            </Fragment>
          ))}
        </>
      )}
      <CanvasFloatingDockView dock={canvas.floatingDock} pinInsidePreview={editable} />
    </CanvasThemeRoot>
  );
}
