'use client';

import type { CanvasBlock, CanvasPage } from '@/types/landing-canvas';
import { findBlock, findSection } from '@/lib/landing-builder/canvas-query';
import {
  appendBlockToContainer,
  containerKeyForSection,
  updateBlockById,
  updateSectionById,
} from '@/lib/landing-builder/canvas-mutators';
import {
  defaultButtonBlock,
  DEFAULT_CARD_IMAGE_FRAME,
  defaultCardBlock,
  defaultCopyBlock,
  defaultFooterBlock,
  defaultGridBlock,
  defaultImageBlock,
  defaultNavbarBlock,
  defaultStackBlock,
  defaultTextBlock,
} from '@/lib/landing-builder/canvas-defaults';
import cn from '@/utils/class-names';

type Props = {
  canvas: CanvasPage;
  selectedId: string | null;
  onChange: (next: CanvasPage) => void;
  /** Focus selection after adding a block from the section strip (e.g. for quick canvas edits). */
  onSelect?: (id: string) => void;
};

const inp =
  'w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white';
const inpSm =
  'w-full rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-white';
const btn =
  'rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-800 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40';
const btnHi =
  'rounded-lg border border-indigo-300 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-800 dark:border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-200';

function cycle3<T extends string>(cur: T, opts: readonly T[]): T {
  const i = opts.indexOf(cur);
  return opts[(i + 1) % opts.length] ?? opts[0];
}

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-lp-quick-edit
      className="fixed bottom-4 left-1/2 z-[95] w-[min(28rem,calc(100vw-2rem))] max-h-[min(52vh,420px)] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95"
    >
      <p className="mb-2 shrink-0 text-xs font-semibold text-zinc-600 dark:text-zinc-300">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function AlignSelfRow({
  canvas,
  blockId,
  value,
  onChange,
}: {
  canvas: CanvasPage;
  blockId: string;
  value: 'auto' | 'start' | 'center' | 'end' | 'stretch';
  onChange: (next: CanvasPage) => void;
}) {
  const set = (alignSelf: 'auto' | 'start' | 'center' | 'end' | 'stretch') =>
    onChange(
      updateBlockById(canvas, blockId, (b) =>
        b.type === 'button' ? { ...b, alignSelf } : b,
      ),
    );
  const opts: Array<{ v: 'auto' | 'start' | 'center' | 'end' | 'stretch'; label: string; hint: string }> = [
    { v: 'start', label: 'Top', hint: 'Start of row (top) / start of column (left)' },
    { v: 'end', label: 'Bottom', hint: 'End of row (bottom) / end of column (right)' },
    { v: 'center', label: 'Center', hint: 'Center on cross-axis' },
    { v: 'stretch', label: 'Full', hint: 'Stretch to fill cross-axis' },
    { v: 'auto', label: 'Auto', hint: 'Default alignment' },
  ];
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        Position in row / column
      </p>
      <div className="flex flex-wrap gap-1">
        {opts.map(({ v, label, hint }) => (
          <button
            key={v}
            type="button"
            title={hint}
            onClick={() => set(v)}
            className={cn(btn, value === v && btnHi)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function appendToSection(
  canvas: CanvasPage,
  sectionId: string,
  block: CanvasBlock,
  onChange: (next: CanvasPage) => void,
  onSelect?: (id: string) => void,
) {
  onChange(
    appendBlockToContainer(canvas, containerKeyForSection(sectionId), block),
  );
  onSelect?.(block.id);
}

export function CanvasQuickEditBar({ canvas, selectedId, onChange, onSelect }: Props) {
  if (!selectedId) return null;

  const sec = findSection(canvas, selectedId);
  if (sec) {
    return (
      <Shell title="Section — quick edit">
        <p className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
          Shape the section here, then add blocks. Click the canvas to re-select and tweak
          anything.
        </p>
        <input
          className={inp}
          value={sec.name}
          onChange={(e) =>
            onChange(updateSectionById(canvas, sec.id, { name: e.target.value }))
          }
          placeholder="Section name"
        />
        <input
          className={inpSm}
          value={sec.maxWidth}
          onChange={(e) =>
            onChange(updateSectionById(canvas, sec.id, { maxWidth: e.target.value }))
          }
          placeholder="Content max-width (e.g. 1200px, 72rem, 100%)"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inpSm}
            value={sec.paddingY}
            onChange={(e) =>
              onChange(updateSectionById(canvas, sec.id, { paddingY: e.target.value }))
            }
            placeholder="Padding Y"
          />
          <input
            className={inpSm}
            value={sec.paddingX}
            onChange={(e) =>
              onChange(updateSectionById(canvas, sec.id, { paddingX: e.target.value }))
            }
            placeholder="Padding X"
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Content align
          </p>
          <div className="flex flex-wrap gap-1">
            {(['start', 'center', 'end'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onChange(updateSectionById(canvas, sec.id, { contentAlign: a }))}
                className={cn(btn, sec.contentAlign === a && btnHi)}
              >
                {a === 'start' ? 'Left' : a === 'center' ? 'Center' : 'Right'}
              </button>
            ))}
          </div>
        </div>
        <input
          className={inpSm}
          value={sec.background}
          onChange={(e) =>
            onChange(updateSectionById(canvas, sec.id, { background: e.target.value }))
          }
          placeholder="Background (color, gradient, or CSS)"
        />
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            Add to this section
          </p>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { label: 'Copy', factory: () => defaultCopyBlock() },
                { label: 'Text', factory: () => defaultTextBlock() },
                { label: 'Image', factory: () => defaultImageBlock() },
                { label: 'Button', factory: () => defaultButtonBlock() },
                { label: 'Row', factory: () => defaultStackBlock() },
                { label: 'Grid', factory: () => defaultGridBlock(3) },
                { label: 'Card', factory: () => defaultCardBlock() },
                { label: 'Navbar', factory: () => defaultNavbarBlock() },
                { label: 'Footer', factory: () => defaultFooterBlock() },
              ] as const
            ).map(({ label, factory }) => (
              <button
                key={label}
                type="button"
                className={btn}
                onClick={() => appendToSection(canvas, sec.id, factory(), onChange, onSelect)}
              >
                + {label}
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  const b = findBlock(canvas, selectedId);
  if (!b) return null;

  if (b.type === 'text') {
    return (
      <Shell title="Text — quick edit">
        <textarea
          className={`${inpSm} min-h-[72px] resize-y`}
          value={b.content}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'text' ? { ...x, content: e.target.value } : x,
              ),
            )
          }
        />
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'text'
                    ? {
                        ...x,
                        align: cycle3(x.align, ['left', 'center', 'right'] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap text align →
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'text'
                    ? {
                        ...x,
                        variant: cycle3(x.variant, [
                          'h1',
                          'h2',
                          'h3',
                          'body',
                          'lead',
                          'subtitle',
                          'overline',
                          'caption',
                        ] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap style →
          </button>
        </div>
      </Shell>
    );
  }

  if (b.type === 'copy') {
    return (
      <Shell title="Copy — quick edit">
        <input
          className={inp}
          value={b.headline}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'copy' ? { ...x, headline: e.target.value } : x,
              ),
            )
          }
          placeholder="Headline"
        />
        <textarea
          className={`${inpSm} min-h-[64px] resize-y`}
          value={b.body}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'copy' ? { ...x, body: e.target.value } : x,
              ),
            )
          }
          placeholder="Body"
        />
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'copy'
                    ? {
                        ...x,
                        align: cycle3(x.align, ['left', 'center', 'right'] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap text align →
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) => {
                  if (x.type !== 'copy') return x;
                  return { ...x, headline: x.body, body: x.headline };
                }),
              )
            }
          >
            Swap headline ↔ body
          </button>
        </div>
      </Shell>
    );
  }

  if (b.type === 'image') {
    return (
      <Shell title="Image — quick edit">
        <input
          className={inpSm}
          value={b.src}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'image' ? { ...x, src: e.target.value } : x,
              ),
            )
          }
          placeholder="Image URL"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inpSm}
            value={b.width}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'image' ? { ...x, width: e.target.value } : x,
                ),
              )
            }
            placeholder="Width"
          />
          <input
            className={inpSm}
            value={b.height}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'image' ? { ...x, height: e.target.value } : x,
                ),
              )
            }
            placeholder="Height"
          />
        </div>
        <button
          type="button"
          className={btn}
          onClick={() =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'image'
                  ? {
                      ...x,
                      objectFit: cycle3(x.objectFit, ['cover', 'contain', 'fill'] as const),
                    }
                  : x,
              ),
            )
          }
        >
          Swap fit (cover / contain / fill) →
        </button>
      </Shell>
    );
  }

  if (b.type === 'button') {
    return (
      <Shell title="Button — quick edit">
        <input
          className={inp}
          value={b.label}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'button' ? { ...x, label: e.target.value } : x,
              ),
            )
          }
          placeholder="Label"
        />
        <input
          className={inpSm}
          value={b.href}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'button' ? { ...x, href: e.target.value } : x,
              ),
            )
          }
          placeholder="Link"
        />
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'button'
                    ? {
                        ...x,
                        variant: cycle3(x.variant, [
                          'primary',
                          'secondary',
                          'outline',
                        ] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap variant →
          </button>
        </div>
        <AlignSelfRow canvas={canvas} blockId={b.id} value={b.alignSelf} onChange={onChange} />
      </Shell>
    );
  }

  if (b.type === 'stack') {
    return (
      <Shell title="Row — quick edit">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'stack'
                    ? { ...x, direction: x.direction === 'row' ? 'column' : 'row' }
                    : x,
                ),
              )
            }
          >
            Swap row ↔ column
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'stack'
                    ? {
                        ...x,
                        justify: cycle3(x.justify, [
                          'start',
                          'center',
                          'end',
                          'between',
                        ] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap main align →
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'stack'
                    ? {
                        ...x,
                        align: cycle3(x.align, ['start', 'center', 'end', 'stretch'] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap cross align →
          </button>
        </div>
      </Shell>
    );
  }

  if (b.type === 'grid') {
    return (
      <Shell title="Grid — quick edit">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Small
        </p>
        <div className="flex flex-wrap gap-1">
          {([1, 2] as const).map((n) => (
            <button
              key={`sm-${n}`}
              type="button"
              className={cn(btn, (b.columnsSmall ?? 1) === n && btnHi)}
              onClick={() =>
                onChange(
                  updateBlockById(canvas, b.id, (x) =>
                    x.type === 'grid' ? { ...x, columnsSmall: n } : x,
                  ),
                )
              }
            >
              {n} col{n === 1 ? '' : 's'}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Large (lg+)
        </p>
        <div className="flex flex-wrap gap-1">
          {([1, 2, 3, 4] as const).map((n) => (
            <button
              key={`lg-${n}`}
              type="button"
              className={cn(btn, b.columns === n && btnHi)}
              onClick={() =>
                onChange(updateBlockById(canvas, b.id, (x) => (x.type === 'grid' ? { ...x, columns: n } : x)))
              }
            >
              {n} cols
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inpSm}
            value={b.gap}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'grid' ? { ...x, gap: e.target.value } : x,
                ),
              )
            }
            placeholder="Gap"
          />
          <input
            className={inpSm}
            value={b.rowGap}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'grid' ? { ...x, rowGap: e.target.value } : x,
                ),
              )
            }
            placeholder="Row gap"
          />
        </div>
      </Shell>
    );
  }

  if (b.type === 'card') {
    const card = b;
    const setLayout = (layout: typeof card.layout) =>
      onChange(
        updateBlockById(canvas, card.id, (x) => (x.type === 'card' ? { ...x, layout } : x)),
      );
    const setImageJustify = (imageJustify: typeof card.imageJustify) =>
      onChange(
        updateBlockById(canvas, card.id, (x) =>
          x.type === 'card' ? { ...x, imageJustify } : x,
        ),
      );
    return (
      <Shell title="Card — quick edit">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={cn(btn, card.showImage && btnHi)}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, showImage: true } : x,
                ),
              )
            }
          >
            With image
          </button>
          <button
            type="button"
            className={cn(btn, !card.showImage && btnHi)}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, showImage: false } : x,
                ),
              )
            }
          >
            Text only
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={cn(btn, card.stackOnNarrowScreens && btnHi)}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, stackOnNarrowScreens: true } : x,
                ),
              )
            }
          >
            Stack on mobile
          </button>
          <button
            type="button"
            className={cn(btn, !card.stackOnNarrowScreens && btnHi)}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, stackOnNarrowScreens: false } : x,
                ),
              )
            }
          >
            Always side-by-side
          </button>
          <button
            type="button"
            className={cn(btn, card.showCardCta && btnHi)}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, showCardCta: !x.showCardCta } : x,
                ),
              )
            }
          >
            Card button
          </button>
        </div>
        <input
          className={inpSm}
          value={card.cardHref}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, card.id, (x) =>
                x.type === 'card' ? { ...x, cardHref: e.target.value } : x,
              ),
            )
          }
          placeholder="Whole card opens URL (optional)"
        />
        {card.showImage ? (
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Image position
            </p>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  { layout: 'column' as const, label: 'Top' },
                  { layout: 'row' as const, label: 'Left' },
                  { layout: 'row-reverse' as const, label: 'Right' },
                  { layout: 'column-reverse' as const, label: 'Bottom' },
                ] as const
              ).map(({ layout, label }) => (
                <button
                  key={layout}
                  type="button"
                  className={cn(btn, card.layout === layout && btnHi)}
                  onClick={() => setLayout(layout)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mb-1 mt-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Image align
            </p>
            <div className="flex flex-wrap gap-1">
              {(['start', 'center', 'end'] as const).map((j) => (
                <button
                  key={j}
                  type="button"
                  className={cn(btn, card.imageJustify === j && btnHi)}
                  onClick={() => setImageJustify(j)}
                >
                  {j === 'start' ? 'Start' : j === 'center' ? 'Center' : 'End'}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <input
          className={inp}
          value={card.title}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, card.id, (x) =>
                x.type === 'card' ? { ...x, title: e.target.value } : x,
              ),
            )
          }
          placeholder="Title"
        />
        {card.showImage ? (
          <input
            className={inpSm}
            value={card.imageSrc}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, imageSrc: e.target.value } : x,
                ),
              )
            }
            placeholder="Image URL"
          />
        ) : null}
        {card.showImage ? (
          <input
            className={inpSm}
            value={card.imageMaxWidth}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, imageMaxWidth: e.target.value } : x,
                ),
              )
            }
            placeholder="Image max-width (e.g. 100%, min(100%,280px))"
          />
        ) : null}
        <textarea
          className={`${inpSm} min-h-[56px] resize-y`}
          value={card.body}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, card.id, (x) =>
                x.type === 'card' ? { ...x, body: e.target.value } : x,
              ),
            )
          }
          placeholder="Body"
        />
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={btn}
            disabled={!card.showImage}
            title="Flip image and text along the current axis"
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) => {
                  if (x.type !== 'card') return x;
                  const l = x.layout;
                  const next =
                    l === 'row'
                      ? 'row-reverse'
                      : l === 'row-reverse'
                        ? 'row'
                        : l === 'column'
                          ? 'column-reverse'
                          : 'column';
                  return { ...x, layout: next };
                }),
              )
            }
          >
            Swap image ↔ text
          </button>
          <button
            type="button"
            className={btn}
            disabled={!card.showImage}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card'
                    ? {
                        ...x,
                        imageBorderRadius: '50%',
                        imageWidth: x.imageWidth || '140px',
                        imageHeight: x.imageHeight || '140px',
                      }
                    : x,
                ),
              )
            }
          >
            Circle image
          </button>
          <button
            type="button"
            className={btn}
            disabled={!card.showImage}
            title="Restore default corner radius and image size"
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card' ? { ...x, ...DEFAULT_CARD_IMAGE_FRAME } : x,
                ),
              )
            }
          >
            Reset image frame
          </button>
          <button
            type="button"
            className={btn}
            onClick={() =>
              onChange(
                updateBlockById(canvas, card.id, (x) =>
                  x.type === 'card'
                    ? {
                        ...x,
                        textAlign: cycle3(x.textAlign, ['left', 'center', 'right'] as const),
                      }
                    : x,
                ),
              )
            }
          >
            Swap text align →
          </button>
        </div>
      </Shell>
    );
  }

  if (b.type === 'navbar') {
    return (
      <Shell title="Navbar — quick edit">
        <input
          className={inp}
          value={b.logoText}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'navbar' ? { ...x, logoText: e.target.value } : x,
              ),
            )
          }
          placeholder="Logo text"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className={inpSm}
            value={b.ctaLabel}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'navbar' ? { ...x, ctaLabel: e.target.value } : x,
                ),
              )
            }
            placeholder="CTA label"
          />
          <input
            className={inpSm}
            value={b.ctaHref}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, b.id, (x) =>
                  x.type === 'navbar' ? { ...x, ctaHref: e.target.value } : x,
                ),
              )
            }
            placeholder="CTA link"
          />
        </div>
      </Shell>
    );
  }

  if (b.type === 'footer') {
    return (
      <Shell title="Footer — quick edit">
        <textarea
          className={`${inpSm} min-h-[56px] resize-y`}
          value={b.copyright}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'footer' ? { ...x, copyright: e.target.value } : x,
              ),
            )
          }
        />
        <input
          className={inpSm}
          value={b.tagline}
          onChange={(e) =>
            onChange(
              updateBlockById(canvas, b.id, (x) =>
                x.type === 'footer' ? { ...x, tagline: e.target.value } : x,
              ),
            )
          }
          placeholder="Tagline"
        />
      </Shell>
    );
  }

  return null;
}
