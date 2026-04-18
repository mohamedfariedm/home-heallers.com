'use client';

import type {
  CanvasButtonVariant,
  CanvasCardBlock,
  CanvasGridBlock,
  CanvasPage,
} from '@/types/landing-canvas';
import {
  appendBlockToContainer,
  containerKeyForGrid,
  deleteBlockById,
  updateBlockById,
} from '@/lib/landing-builder/canvas-mutators';
import { DEFAULT_CARD_IMAGE_FRAME, defaultCardBlock } from '@/lib/landing-builder/canvas-defaults';

import { ImageDropField } from './image-drop-field';

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function cnTextarea() {
  return `${inputClass} min-h-[80px] resize-y`;
}

function swapCardLayout(l: CanvasCardBlock['layout']): CanvasCardBlock['layout'] {
  if (l === 'row') return 'row-reverse';
  if (l === 'row-reverse') return 'row';
  if (l === 'column') return 'column-reverse';
  return 'column';
}

export function CardBlockInspector({
  canvas,
  block,
  onChange,
}: {
  canvas: CanvasPage;
  block: CanvasCardBlock;
  onChange: (next: CanvasPage) => void;
}) {
  const patch = (partial: Partial<CanvasCardBlock>) =>
    onChange(
      updateBlockById(canvas, block.id, (b) =>
        b.type === 'card' ? { ...b, ...partial } : b,
      ),
    );

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Card</p>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
          checked={block.showImage}
          onChange={(e) => patch({ showImage: e.target.checked })}
        />
        Show image
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
          checked={block.stackOnNarrowScreens}
          onChange={(e) => patch({ stackOnNarrowScreens: e.target.checked })}
        />
        Stack on small screens (row cards become column under md)
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium dark:border-zinc-600"
          disabled={!block.showImage}
          onClick={() => patch({ layout: swapCardLayout(block.layout) })}
        >
          Swap image ↔ text
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium dark:border-zinc-600"
          disabled={!block.showImage}
          onClick={() =>
            patch({
              imageBorderRadius: '50%',
              imageWidth: block.imageWidth || '140px',
              imageHeight: block.imageHeight || '140px',
            })
          }
        >
          Circle image
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs font-medium dark:border-zinc-600"
          disabled={!block.showImage}
          onClick={() => patch({ ...DEFAULT_CARD_IMAGE_FRAME })}
        >
          Reset image frame
        </button>
      </div>
      <Field label="Image position (when image is on)">
        <select
          className={inputClass}
          disabled={!block.showImage}
          value={block.layout}
          onChange={(e) =>
            patch({ layout: e.target.value as CanvasCardBlock['layout'] })
          }
        >
          <option value="row">Image left</option>
          <option value="row-reverse">Image right</option>
          <option value="column">Image top</option>
          <option value="column-reverse">Image bottom</option>
        </select>
      </Field>
      <Field label="Image align (start / center / end)">
        <p className="mb-1.5 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
          With image left or right: aligns the image vertically. With image top or bottom: aligns it
          horizontally.
        </p>
        <select
          className={inputClass}
          disabled={!block.showImage}
          value={block.imageJustify}
          onChange={(e) =>
            patch({ imageJustify: e.target.value as CanvasCardBlock['imageJustify'] })
          }
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Gap">
          <input className={inputClass} value={block.gap} onChange={(e) => patch({ gap: e.target.value })} />
        </Field>
        <Field label="Padding">
          <input
            className={inputClass}
            value={block.padding}
            onChange={(e) => patch({ padding: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Width">
          <input className={inputClass} value={block.width} onChange={(e) => patch({ width: e.target.value })} />
        </Field>
        <Field label="Max width">
          <input
            className={inputClass}
            value={block.maxWidth}
            onChange={(e) => patch({ maxWidth: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Background">
        <input
          className={inputClass}
          value={block.background}
          onChange={(e) => patch({ background: e.target.value })}
        />
      </Field>
      <Field label="Box shadow (CSS or none)">
        <input
          className={inputClass}
          value={block.boxShadow}
          onChange={(e) => patch({ boxShadow: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Border width">
          <input
            className={inputClass}
            value={block.borderWidth}
            onChange={(e) => patch({ borderWidth: e.target.value })}
          />
        </Field>
        <Field label="Border style">
          <select
            className={inputClass}
            value={block.borderStyle}
            onChange={(e) =>
              patch({ borderStyle: e.target.value as CanvasCardBlock['borderStyle'] })
            }
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Border color">
          <input
            className={inputClass}
            value={block.borderColor}
            onChange={(e) => patch({ borderColor: e.target.value })}
          />
        </Field>
        <Field label="Border radius">
          <input
            className={inputClass}
            value={block.borderRadius}
            onChange={(e) => patch({ borderRadius: e.target.value })}
          />
        </Field>
      </div>
      {block.showImage ? (
        <>
          <ImageDropField
            label="Card image"
            value={block.imageSrc}
            compact
            onChange={(url) => patch({ imageSrc: url })}
          />
          <Field label="Image alt">
            <input
              className={inputClass}
              value={block.imageAlt}
              onChange={(e) => patch({ imageAlt: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image width">
              <input
                className={inputClass}
                value={block.imageWidth}
                onChange={(e) => patch({ imageWidth: e.target.value })}
              />
            </Field>
            <Field label="Image height">
              <input
                className={inputClass}
                value={block.imageHeight}
                onChange={(e) => patch({ imageHeight: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Image min width">
              <input
                className={inputClass}
                value={block.imageMinWidth}
                onChange={(e) => patch({ imageMinWidth: e.target.value })}
              />
            </Field>
            <Field label="Image fit">
              <select
                className={inputClass}
                value={block.imageObjectFit}
                onChange={(e) =>
                  patch({ imageObjectFit: e.target.value as CanvasCardBlock['imageObjectFit'] })
                }
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </Field>
          </div>
          <Field label="Image max width (CSS, responsive)">
            <input
              className={inputClass}
              value={block.imageMaxWidth}
              onChange={(e) => patch({ imageMaxWidth: e.target.value })}
              placeholder="100% or min(100%, 280px)"
            />
          </Field>
          <Field label="Image border radius (e.g. 12px or 50%)">
            <input
              className={inputClass}
              value={block.imageBorderRadius}
              onChange={(e) => patch({ imageBorderRadius: e.target.value })}
            />
          </Field>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-2 text-xs text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
          Image is hidden — turn on &quot;Show image&quot; to edit the picture and layout around it.
        </p>
      )}
      <Field label="Title">
        <input className={inputClass} value={block.title} onChange={(e) => patch({ title: e.target.value })} />
      </Field>
      <Field label="Title tag">
        <select
          className={inputClass}
          value={block.titleTag}
          onChange={(e) => patch({ titleTag: e.target.value as CanvasCardBlock['titleTag'] })}
        >
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
          <option value="div">Div</option>
        </select>
      </Field>
      <Field label="Body">
        <textarea
          className={cnTextarea()}
          rows={4}
          value={block.body}
          onChange={(e) => patch({ body: e.target.value })}
        />
      </Field>
      <Field label="Text align">
        <select
          className={inputClass}
          value={block.textAlign}
          onChange={(e) => patch({ textAlign: e.target.value as CanvasCardBlock['textAlign'] })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title size (optional)">
          <input
            className={inputClass}
            value={block.titleSize ?? ''}
            onChange={(e) => patch({ titleSize: e.target.value || undefined })}
            placeholder="1.25rem"
          />
        </Field>
        <Field label="Body size (optional)">
          <input
            className={inputClass}
            value={block.bodySize ?? ''}
            onChange={(e) => patch({ bodySize: e.target.value || undefined })}
            placeholder="0.95rem"
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Title color">
          <input
            className={inputClass}
            value={block.titleColor ?? ''}
            onChange={(e) => patch({ titleColor: e.target.value || undefined })}
            placeholder="#0f172a"
          />
        </Field>
        <Field label="Body color">
          <input
            className={inputClass}
            value={block.bodyColor ?? ''}
            onChange={(e) => patch({ bodyColor: e.target.value || undefined })}
          />
        </Field>
      </div>
      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">Published card</p>
      <Field label="Whole card opens URL (leave empty for no link)">
        <input
          className={inputClass}
          value={block.cardHref}
          onChange={(e) => patch({ cardHref: e.target.value })}
          placeholder="https://…"
        />
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
          checked={block.cardOpenInNewTab}
          onChange={(e) => patch({ cardOpenInNewTab: e.target.checked })}
        />
        Open whole-card link in new tab
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
          checked={block.showCardCta}
          onChange={(e) => patch({ showCardCta: e.target.checked })}
        />
        Show button on card
      </label>
      {block.showCardCta ? (
        <div className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Button label">
              <input
                className={inputClass}
                value={block.ctaLabel}
                onChange={(e) => patch({ ctaLabel: e.target.value })}
              />
            </Field>
            <Field label="Button URL">
              <input
                className={inputClass}
                value={block.ctaHref}
                onChange={(e) => patch({ ctaHref: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Button style">
            <select
              className={inputClass}
              value={block.ctaVariant}
              onChange={(e) =>
                patch({ ctaVariant: e.target.value as CanvasButtonVariant })
              }
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              checked={block.ctaOpenInNewTab}
              onChange={(e) => patch({ ctaOpenInNewTab: e.target.checked })}
            />
            Open button link in new tab
          </label>
        </div>
      ) : null}
      <button
        type="button"
        className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
        onClick={() => onChange(deleteBlockById(canvas, block.id))}
      >
        Delete card
      </button>
    </div>
  );
}

export function GridBlockInspector({
  canvas,
  block,
  onChange,
}: {
  canvas: CanvasPage;
  block: CanvasGridBlock;
  onChange: (next: CanvasPage) => void;
}) {
  const patch = (partial: Partial<CanvasGridBlock>) =>
    onChange(
      updateBlockById(canvas, block.id, (b) =>
        b.type === 'grid' ? { ...b, ...partial } : b,
      ),
    );

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Grid</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Columns (small)">
          <select
            className={inputClass}
            value={block.columnsSmall ?? 1}
            onChange={(e) => {
              const n = Number(e.target.value) as CanvasGridBlock['columnsSmall'];
              patch({ columnsSmall: n });
            }}
          >
            <option value={1}>1 — below lg</option>
            <option value={2}>2 — below lg</option>
          </select>
        </Field>
        <Field label="Columns (large)">
          <select
            className={inputClass}
            value={block.columns}
            onChange={(e) => {
              const n = Number(e.target.value) as CanvasGridBlock['columns'];
              patch({ columns: n });
            }}
          >
            <option value={1}>1 — lg+</option>
            <option value={2}>2 — lg+</option>
            <option value={3}>3 — lg+</option>
            <option value={4}>4 — lg / xl</option>
          </select>
        </Field>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Breakpoints use the live preview width (phone / tablet / desktop toggles), not your whole
        browser window. Changing counts does not auto-add/remove cells — use “Add card” or delete
        blocks in Layers.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Column gap">
          <input className={inputClass} value={block.gap} onChange={(e) => patch({ gap: e.target.value })} />
        </Field>
        <Field label="Row gap">
          <input
            className={inputClass}
            value={block.rowGap}
            onChange={(e) => patch({ rowGap: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Align items">
          <select
            className={inputClass}
            value={block.alignItems}
            onChange={(e) =>
              patch({ alignItems: e.target.value as CanvasGridBlock['alignItems'] })
            }
          >
            <option value="stretch">Stretch</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </Field>
        <Field label="Justify items">
          <select
            className={inputClass}
            value={block.justifyItems}
            onChange={(e) =>
              patch({ justifyItems: e.target.value as CanvasGridBlock['justifyItems'] })
            }
          >
            <option value="stretch">Stretch</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Width">
          <input className={inputClass} value={block.width} onChange={(e) => patch({ width: e.target.value })} />
        </Field>
        <Field label="Max width">
          <input
            className={inputClass}
            value={block.maxWidth}
            onChange={(e) => patch({ maxWidth: e.target.value })}
          />
        </Field>
      </div>
      <button
        type="button"
        className="w-full rounded-xl border border-zinc-200 py-2 text-sm font-medium dark:border-zinc-600"
        onClick={() =>
          onChange(
            appendBlockToContainer(canvas, containerKeyForGrid(block.id), defaultCardBlock()),
          )
        }
      >
        + Add card to grid
      </button>
      <button
        type="button"
        className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
        onClick={() => onChange(deleteBlockById(canvas, block.id))}
      >
        Delete grid
      </button>
    </div>
  );
}
