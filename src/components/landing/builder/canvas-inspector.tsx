'use client';

import type {
  CanvasBlock,
  CanvasPage,
  CanvasSection,
} from '@/types/landing-canvas';
import { findBlock, findSection } from '@/lib/landing-builder/canvas-query';
import {
  appendBlockToContainer,
  containerKeyForStack,
  deleteBlockById,
  removeSection,
  updateBlockById,
  updatePageMeta,
  updateSectionById,
} from '@/lib/landing-builder/canvas-mutators';
import {
  defaultButtonBlock,
  defaultCardBlock,
  defaultCopyBlock,
  defaultFormBlock,
  defaultFormField,
  defaultFooterBlock,
  defaultFooterColumn,
  defaultFooterLink,
  defaultGridBlock,
  defaultImageBlock,
  defaultNavbarBlock,
  defaultNavLink,
  defaultStackBlock,
  defaultTextBlock,
} from '@/lib/landing-builder/canvas-defaults';
import {
  STACK_BLOCK_PRESETS,
  createColumnBlock,
  createRowWithColumns,
} from '@/lib/landing-builder/block-presets';
import { ImageDropField } from './image-drop-field';
import {
  CardBlockInspector,
  GridBlockInspector,
} from './canvas-inspector-card-grid';

type Props = {
  canvas: CanvasPage;
  selectedId: string | null;
  onChange: (next: CanvasPage) => void;
  /** When set, deleting a section updates both EN and AR canvases the same way. */
  onMirrorSectionStructure?: (mutator: (c: CanvasPage) => CanvasPage) => void;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const colorSwatchClass =
  'h-10 w-12 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-950';

function toPickerColor(value?: string): string {
  const v = (value ?? '').trim();
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#000000';
}

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

export function CanvasInspector({
  canvas,
  selectedId,
  onChange,
  onMirrorSectionStructure,
}: Props) {
  if (!selectedId) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Page
        </p>
        <Field label="Site name">
          <input
            className={inputClass}
            value={canvas.siteName}
            onChange={(e) =>
              onChange(updatePageMeta(canvas, { siteName: e.target.value }))
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary">
            <div className="flex items-center gap-2">
              <input
                type="color"
                className={colorSwatchClass}
                value={toPickerColor(canvas.primaryColor)}
                onChange={(e) =>
                  onChange(
                    updatePageMeta(canvas, { primaryColor: e.target.value })
                  )
                }
              />
              <input
                className={inputClass}
                value={canvas.primaryColor}
                onChange={(e) =>
                  onChange(
                    updatePageMeta(canvas, { primaryColor: e.target.value })
                  )
                }
              />
            </div>
          </Field>
          <Field label="Secondary">
            <div className="flex items-center gap-2">
              <input
                type="color"
                className={colorSwatchClass}
                value={toPickerColor(canvas.secondaryColor)}
                onChange={(e) =>
                  onChange(
                    updatePageMeta(canvas, { secondaryColor: e.target.value })
                  )
                }
              />
              <input
                className={inputClass}
                value={canvas.secondaryColor}
                onChange={(e) =>
                  onChange(
                    updatePageMeta(canvas, { secondaryColor: e.target.value })
                  )
                }
              />
            </div>
          </Field>
        </div>
        <Field label="Page background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorSwatchClass}
              value={toPickerColor(canvas.pageBackground)}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, { pageBackground: e.target.value })
                )
              }
            />
            <input
              className={inputClass}
              value={canvas.pageBackground}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, { pageBackground: e.target.value })
                )
              }
              placeholder="#ffffff or linear-gradient(...)"
            />
          </div>
        </Field>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Floating contact and social
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Fixed buttons for phone, WhatsApp, and optional social links. They
          appear inside the live preview when enabled, and use the full browser
          window when you publish this page for real.
        </p>
        <p className="text-xs font-medium text-amber-800 dark:text-amber-200/90">
          You are only seeing this Page section when nothing is selected. Click
          outside the preview or press Esc to deselect a block, then open
          Properties again.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-100">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
            checked={canvas.floatingDock.enabled}
            onChange={(e) =>
              onChange(
                updatePageMeta(canvas, {
                  floatingDock: { enabled: e.target.checked },
                })
              )
            }
          />
          Enable floating strip
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          After enabling, enter at least one phone (with Show call), WhatsApp
          digits (with Show WhatsApp), or a social URL — otherwise nothing is
          shown.
        </p>
        <Field label="Position">
          <select
            className={inputClass}
            value={canvas.floatingDock.position}
            onChange={(e) =>
              onChange(
                updatePageMeta(canvas, {
                  floatingDock: {
                    position: e.target
                      .value as typeof canvas.floatingDock.position,
                  },
                })
              )
            }
          >
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone (tel link)">
            <input
              className={inputClass}
              value={canvas.floatingDock.phone}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { phone: e.target.value },
                  })
                )
              }
              placeholder="+1 555 0100"
            />
          </Field>
          <Field label="WhatsApp (digits, country code)">
            <input
              className={inputClass}
              value={canvas.floatingDock.whatsapp}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { whatsapp: e.target.value },
                  })
                )
              }
              placeholder="15550101000"
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={canvas.floatingDock.showCall}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { showCall: e.target.checked },
                  })
                )
              }
            />
            Show call
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={canvas.floatingDock.showWhatsapp}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { showWhatsapp: e.target.checked },
                  })
                )
              }
            />
            Show WhatsApp
          </label>
        </div>
        <Field label="Facebook URL">
          <input
            className={inputClass}
            value={canvas.floatingDock.facebookUrl}
            onChange={(e) =>
              onChange(
                updatePageMeta(canvas, {
                  floatingDock: { facebookUrl: e.target.value },
                })
              )
            }
            placeholder="https://facebook.com/…"
          />
        </Field>
        <Field label="Instagram URL">
          <input
            className={inputClass}
            value={canvas.floatingDock.instagramUrl}
            onChange={(e) =>
              onChange(
                updatePageMeta(canvas, {
                  floatingDock: { instagramUrl: e.target.value },
                })
              )
            }
          />
        </Field>
        <Field label="X (Twitter) URL">
          <input
            className={inputClass}
            value={canvas.floatingDock.xUrl}
            onChange={(e) =>
              onChange(
                updatePageMeta(canvas, {
                  floatingDock: { xUrl: e.target.value },
                })
              )
            }
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="LinkedIn URL">
            <input
              className={inputClass}
              value={canvas.floatingDock.linkedinUrl}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { linkedinUrl: e.target.value },
                  })
                )
              }
            />
          </Field>
          <Field label="YouTube URL">
            <input
              className={inputClass}
              value={canvas.floatingDock.youtubeUrl}
              onChange={(e) =>
                onChange(
                  updatePageMeta(canvas, {
                    floatingDock: { youtubeUrl: e.target.value },
                  })
                )
              }
            />
          </Field>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Click a section or block in the preview or layer list to edit it here.
        </p>
      </div>
    );
  }

  const section = findSection(canvas, selectedId);
  if (section) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            Section
          </p>
        </div>
        <Field label="Label (editor only)">
          <input
            className={inputClass}
            value={section.name}
            onChange={(e) =>
              onChange(
                updateSectionById(canvas, section.id, { name: e.target.value })
              )
            }
          />
        </Field>
        <Field label="Section anchor (#id)">
          <input
            className={inputClass}
            value={section.anchorId ?? ''}
            placeholder={sectionAnchorId(section.name)}
            onChange={(e) =>
              onChange(
                updateSectionById(canvas, section.id, {
                  anchorId: e.target.value,
                })
              )
            }
          />
        </Field>
        <Field label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorSwatchClass}
              value={toPickerColor(section.background)}
              onChange={(e) =>
                onChange(
                  updateSectionById(canvas, section.id, {
                    background: e.target.value,
                  })
                )
              }
            />
            <input
              className={inputClass}
              value={section.background}
              onChange={(e) =>
                onChange(
                  updateSectionById(canvas, section.id, {
                    background: e.target.value,
                  })
                )
              }
              placeholder="transparent, #fff, or CSS gradient"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Padding Y">
            <input
              className={inputClass}
              value={section.paddingY}
              onChange={(e) =>
                onChange(
                  updateSectionById(canvas, section.id, {
                    paddingY: e.target.value,
                  })
                )
              }
            />
          </Field>
          <Field label="Padding X">
            <input
              className={inputClass}
              value={section.paddingX}
              onChange={(e) =>
                onChange(
                  updateSectionById(canvas, section.id, {
                    paddingX: e.target.value,
                  })
                )
              }
            />
          </Field>
        </div>
        <Field label="Content max width">
          <input
            className={inputClass}
            value={section.maxWidth}
            onChange={(e) =>
              onChange(
                updateSectionById(canvas, section.id, {
                  maxWidth: e.target.value,
                })
              )
            }
          />
        </Field>
        <Field label="Align content">
          <select
            className={inputClass}
            value={section.contentAlign}
            onChange={(e) =>
              onChange(
                updateSectionById(canvas, section.id, {
                  contentAlign: e.target.value as CanvasSection['contentAlign'],
                })
              )
            }
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </Field>
        {canvas.sections.length > 1 ? (
          <button
            type="button"
            className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
            onClick={() =>
              onMirrorSectionStructure
                ? onMirrorSectionStructure((c) => removeSection(c, section.id))
                : onChange(removeSection(canvas, section.id))
            }
          >
            Delete section
          </button>
        ) : null}
      </div>
    );
  }

  const block = findBlock(canvas, selectedId);
  if (!block) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Selection not found.
      </p>
    );
  }

  if (block.type === 'text') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Text
        </p>
        <Field label="Content">
          <textarea
            className={cnTextarea()}
            rows={4}
            value={block.content}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'text' ? { ...b, content: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Style">
          <select
            className={inputClass}
            value={block.variant}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'text'
                    ? { ...b, variant: e.target.value as typeof block.variant }
                    : b
                )
              )
            }
          >
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="body">Body</option>
            <option value="lead">Lead (large body)</option>
            <option value="subtitle">Subtitle</option>
            <option value="overline">Overline (label)</option>
            <option value="caption">Caption</option>
          </select>
        </Field>
        <Field label="Text align">
          <select
            className={inputClass}
            value={block.align}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'text'
                    ? { ...b, align: e.target.value as typeof block.align }
                    : b
                )
              )
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <input
              className={inputClass}
              value={block.width}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'text' ? { ...b, width: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Max width">
            <input
              className={inputClass}
              value={block.maxWidth}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'text' ? { ...b, maxWidth: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Color (optional)">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorSwatchClass}
              value={toPickerColor(block.color)}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'text'
                      ? { ...b, color: e.target.value || undefined }
                      : b
                  )
                )
              }
            />
            <input
              className={inputClass}
              value={block.color ?? ''}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'text'
                      ? { ...b, color: e.target.value || undefined }
                      : b
                  )
                )
              }
              placeholder="#0f172a"
            />
          </div>
        </Field>
        <Field label="Font size (optional)">
          <input
            className={inputClass}
            value={block.fontSize ?? ''}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'text'
                    ? { ...b, fontSize: e.target.value || undefined }
                    : b
                )
              )
            }
            placeholder="e.g. 1.125rem"
          />
        </Field>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete block
        </button>
      </div>
    );
  }

  if (block.type === 'copy') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Copy block
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Eyebrow, headline, subheadline, and multi-line body in one block.
        </p>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={block.showEyebrow}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy'
                    ? { ...b, showEyebrow: e.target.checked }
                    : b
                )
              )
            }
          />
          Show eyebrow
        </label>
        {block.showEyebrow ? (
          <Field label="Eyebrow">
            <input
              className={inputClass}
              value={block.eyebrow}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy' ? { ...b, eyebrow: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        ) : null}
        <Field label="Headline">
          <input
            className={inputClass}
            value={block.headline}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy' ? { ...b, headline: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Headline tag">
          <select
            className={inputClass}
            value={block.headlineTag}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy'
                    ? {
                        ...b,
                        headlineTag: e.target.value as typeof block.headlineTag,
                      }
                    : b
                )
              )
            }
          >
            <option value="h1">H1 (hero)</option>
            <option value="h2">H2 (section)</option>
            <option value="h3">H3 (small title)</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={block.showSubheadline}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy'
                    ? { ...b, showSubheadline: e.target.checked }
                    : b
                )
              )
            }
          />
          Show subheadline
        </label>
        {block.showSubheadline ? (
          <Field label="Subheadline">
            <input
              className={inputClass}
              value={block.subheadline}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy'
                      ? { ...b, subheadline: e.target.value }
                      : b
                  )
                )
              }
            />
          </Field>
        ) : null}
        <Field label="Body (multi-line)">
          <textarea
            className={cnTextarea()}
            rows={6}
            value={block.body}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy' ? { ...b, body: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Align">
          <select
            className={inputClass}
            value={block.align}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy'
                    ? { ...b, align: e.target.value as typeof block.align }
                    : b
                )
              )
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gap">
            <input
              className={inputClass}
              value={block.gap}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy' ? { ...b, gap: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Max width">
            <input
              className={inputClass}
              value={block.maxWidth}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy' ? { ...b, maxWidth: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Width">
          <input
            className={inputClass}
            value={block.width}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'copy' ? { ...b, width: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Optional sizes
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Eyebrow size">
            <input
              className={inputClass}
              value={block.eyebrowSize ?? ''}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy'
                      ? { ...b, eyebrowSize: e.target.value || undefined }
                      : b
                  )
                )
              }
              placeholder="0.7rem"
            />
          </Field>
          <Field label="Headline size">
            <input
              className={inputClass}
              value={block.headlineSize ?? ''}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy'
                      ? { ...b, headlineSize: e.target.value || undefined }
                      : b
                  )
                )
              }
            />
          </Field>
          <Field label="Sub size">
            <input
              className={inputClass}
              value={block.subheadlineSize ?? ''}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy'
                      ? { ...b, subheadlineSize: e.target.value || undefined }
                      : b
                  )
                )
              }
            />
          </Field>
          <Field label="Body size">
            <input
              className={inputClass}
              value={block.bodySize ?? ''}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'copy'
                      ? { ...b, bodySize: e.target.value || undefined }
                      : b
                  )
                )
              }
            />
          </Field>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete block
        </button>
      </div>
    );
  }

  if (block.type === 'navbar') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Navbar
        </p>
        <Field label="Logo text (if no image)">
          <input
            className={inputClass}
            value={block.logoText}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'navbar' ? { ...b, logoText: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <ImageDropField
          label="Logo image (optional)"
          value={block.logoUrl}
          compact
          onChange={(url) =>
            onChange(
              updateBlockById(canvas, block.id, (b) =>
                b.type === 'navbar' ? { ...b, logoUrl: url } : b
              )
            )
          }
        />
        <Field label="Logo height">
          <input
            className={inputClass}
            value={block.logoHeight}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'navbar' ? { ...b, logoHeight: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <div className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Links
          </p>
          {block.links.map((l, i) => (
            <div
              key={l.id}
              className="flex flex-col gap-2 sm:flex-row sm:items-end"
            >
              <Field label="Label">
                <input
                  className={inputClass}
                  value={l.label}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'navbar') return b;
                        const links = [...b.links];
                        links[i] = { ...links[i], label: e.target.value };
                        return { ...b, links };
                      })
                    )
                  }
                />
              </Field>
              <Field label="Href">
                <input
                  className={inputClass}
                  value={l.href}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'navbar') return b;
                        const links = [...b.links];
                        links[i] = { ...links[i], href: e.target.value };
                        return { ...b, links };
                      })
                    )
                  }
                />
              </Field>
              <Field label="Section target">
                <select
                  className={inputClass}
                  value={l.href.startsWith('#') ? l.href : ''}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'navbar') return b;
                        const links = [...b.links];
                        if (e.target.value)
                          links[i] = { ...links[i], href: e.target.value };
                        return { ...b, links };
                      })
                    )
                  }
                >
                  <option value="">Custom URL</option>
                  {canvas.sections.map((s) => {
                    const anchor = `#${sectionAnchorId(s.name, s.anchorId)}`;
                    return (
                      <option key={s.id} value={anchor}>
                        {s.name} ({anchor})
                      </option>
                    );
                  })}
                </select>
              </Field>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-red-600 dark:border-zinc-600"
                onClick={() =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) => {
                      if (b.type !== 'navbar') return b;
                      return { ...b, links: b.links.filter((_, j) => j !== i) };
                    })
                  )
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
            onClick={() =>
              onChange(
                updateBlockById(canvas, block.id, (b) => {
                  if (b.type !== 'navbar') return b;
                  return { ...b, links: [...b.links, defaultNavLink()] };
                })
              )
            }
          >
            + Add link
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={block.showCta}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'navbar' ? { ...b, showCta: e.target.checked } : b
                )
              )
            }
          />
          Show CTA button
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={block.showLanguageSwitcher}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar'
                      ? { ...b, showLanguageSwitcher: e.target.checked }
                      : b
                  )
                )
              }
            />
            Show language switcher
          </label>
          <Field label="Switcher position">
            <select
              className={inputClass}
              value={block.languageSwitcherPosition}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar'
                      ? {
                          ...b,
                          languageSwitcherPosition: e.target
                            .value as typeof block.languageSwitcherPosition,
                        }
                      : b
                  )
                )
              }
            >
              <option value="before-links">Before links</option>
              <option value="after-links">After links</option>
              <option value="beside-cta">Beside CTA</option>
            </select>
          </Field>
        </div>
        {block.showCta ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="CTA label">
              <input
                className={inputClass}
                value={block.ctaLabel}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, ctaLabel: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
            <Field label="CTA href">
              <input
                className={inputClass}
                value={block.ctaHref}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, ctaHref: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
          </div>
        ) : null}
        <Field label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorSwatchClass}
              value={toPickerColor(block.background)}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar'
                      ? { ...b, background: e.target.value }
                      : b
                  )
                )
              }
            />
            <input
              className={inputClass}
              value={block.background}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar'
                      ? { ...b, background: e.target.value }
                      : b
                  )
                )
              }
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={block.borderBottom}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar'
                      ? { ...b, borderBottom: e.target.checked }
                      : b
                  )
                )
              }
            />
            Bottom border
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={block.sticky}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar' ? { ...b, sticky: e.target.checked } : b
                  )
                )
              }
            />
            Sticky
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Padding Y">
            <input
              className={inputClass}
              value={block.paddingY}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar' ? { ...b, paddingY: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Padding X">
            <input
              className={inputClass}
              value={block.paddingX}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar' ? { ...b, paddingX: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Link gap">
            <input
              className={inputClass}
              value={block.linkGap}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar' ? { ...b, linkGap: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Max width">
            <input
              className={inputClass}
              value={block.maxWidth}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'navbar' ? { ...b, maxWidth: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <div className="col-span-2">
            <Field label="Min height">
              <input
                className={inputClass}
                value={block.minHeight}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, minHeight: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Language switcher (dropdown)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Background">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className={colorSwatchClass}
                  value={toPickerColor(block.languageSwitcherBg)}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? { ...b, languageSwitcherBg: e.target.value }
                          : b
                      )
                    )
                  }
                />
                <input
                  className={inputClass}
                  value={block.languageSwitcherBg}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? { ...b, languageSwitcherBg: e.target.value }
                          : b
                      )
                    )
                  }
                />
              </div>
            </Field>
            <Field label="Text color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className={colorSwatchClass}
                  value={toPickerColor(block.languageSwitcherTextColor)}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? { ...b, languageSwitcherTextColor: e.target.value }
                          : b
                      )
                    )
                  }
                />
                <input
                  className={inputClass}
                  value={block.languageSwitcherTextColor}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? { ...b, languageSwitcherTextColor: e.target.value }
                          : b
                      )
                    )
                  }
                />
              </div>
            </Field>
            <Field label="Border color">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className={colorSwatchClass}
                  value={toPickerColor(block.languageSwitcherBorderColor)}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? {
                              ...b,
                              languageSwitcherBorderColor: e.target.value,
                            }
                          : b
                      )
                    )
                  }
                />
                <input
                  className={inputClass}
                  value={block.languageSwitcherBorderColor}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'navbar'
                          ? {
                              ...b,
                              languageSwitcherBorderColor: e.target.value,
                            }
                          : b
                      )
                    )
                  }
                />
              </div>
            </Field>
            <Field label="Border radius">
              <input
                className={inputClass}
                value={block.languageSwitcherBorderRadius}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, languageSwitcherBorderRadius: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
            <Field label="Padding Y">
              <input
                className={inputClass}
                value={block.languageSwitcherPaddingY}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, languageSwitcherPaddingY: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
            <Field label="Padding X">
              <input
                className={inputClass}
                value={block.languageSwitcherPaddingX}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, languageSwitcherPaddingX: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
            <Field label="Font size">
              <input
                className={inputClass}
                value={block.languageSwitcherFontSize}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, languageSwitcherFontSize: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
            <Field label="Min width">
              <input
                className={inputClass}
                value={block.languageSwitcherMinWidth}
                onChange={(e) =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) =>
                      b.type === 'navbar'
                        ? { ...b, languageSwitcherMinWidth: e.target.value }
                        : b
                    )
                  )
                }
              />
            </Field>
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete navbar
        </button>
      </div>
    );
  }

  if (block.type === 'footer') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Footer
        </p>
        <Field label="Background">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className={colorSwatchClass}
              value={toPickerColor(block.background)}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'footer'
                      ? { ...b, background: e.target.value }
                      : b
                  )
                )
              }
            />
            <input
              className={inputClass}
              value={block.background}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'footer'
                      ? { ...b, background: e.target.value }
                      : b
                  )
                )
              }
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Padding Y">
            <input
              className={inputClass}
              value={block.paddingY}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'footer' ? { ...b, paddingY: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Padding X">
            <input
              className={inputClass}
              value={block.paddingX}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'footer' ? { ...b, paddingX: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Max width">
          <input
            className={inputClass}
            value={block.maxWidth}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'footer' ? { ...b, maxWidth: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Column layout">
          <select
            className={inputClass}
            value={block.columnCount}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'footer'
                    ? {
                        ...b,
                        columnCount: Number(
                          e.target.value
                        ) as typeof b.columnCount,
                      }
                    : b
                )
              )
            }
          >
            <option value={1}>1 column</option>
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
        </Field>
        <Field label="Copyright">
          <input
            className={inputClass}
            value={block.copyright}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'footer' ? { ...b, copyright: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Tagline (optional)">
          <input
            className={inputClass}
            value={block.tagline}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'footer' ? { ...b, tagline: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <div className="space-y-4 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Columns
          </p>
          {block.columns.map((col, ci) => (
            <div
              key={col.id}
              className="space-y-2 border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  Column {ci + 1}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'footer') return b;
                        if (b.columns.length <= 1) return b;
                        return {
                          ...b,
                          columns: b.columns.filter((_, j) => j !== ci),
                        };
                      })
                    )
                  }
                >
                  Remove column
                </button>
              </div>
              <Field label="Title">
                <input
                  className={inputClass}
                  value={col.title}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'footer') return b;
                        const columns = [...b.columns];
                        columns[ci] = { ...columns[ci], title: e.target.value };
                        return { ...b, columns };
                      })
                    )
                  }
                />
              </Field>
              {col.links.map((l, li) => (
                <div
                  key={l.id}
                  className="ml-2 flex flex-col gap-2 border-l-2 border-indigo-200 pl-2 dark:border-indigo-800"
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="Label"
                      value={l.label}
                      onChange={(e) =>
                        onChange(
                          updateBlockById(canvas, block.id, (b) => {
                            if (b.type !== 'footer') return b;
                            const columns = [...b.columns];
                            const links = [...columns[ci].links];
                            links[li] = { ...links[li], label: e.target.value };
                            columns[ci] = { ...columns[ci], links };
                            return { ...b, columns };
                          })
                        )
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="Href"
                      value={l.href}
                      onChange={(e) =>
                        onChange(
                          updateBlockById(canvas, block.id, (b) => {
                            if (b.type !== 'footer') return b;
                            const columns = [...b.columns];
                            const links = [...columns[ci].links];
                            links[li] = { ...links[li], href: e.target.value };
                            columns[ci] = { ...columns[ci], links };
                            return { ...b, columns };
                          })
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="text-left text-xs text-red-600"
                    onClick={() =>
                      onChange(
                        updateBlockById(canvas, block.id, (b) => {
                          if (b.type !== 'footer') return b;
                          const columns = [...b.columns];
                          const links = columns[ci].links.filter(
                            (_, j) => j !== li
                          );
                          columns[ci] = { ...columns[ci], links };
                          return { ...b, columns };
                        })
                      )
                    }
                  >
                    Remove link
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="w-full rounded-lg border border-dashed border-zinc-300 py-1.5 text-xs dark:border-zinc-600"
                onClick={() =>
                  onChange(
                    updateBlockById(canvas, block.id, (b) => {
                      if (b.type !== 'footer') return b;
                      const columns = [...b.columns];
                      const links = [...columns[ci].links, defaultFooterLink()];
                      columns[ci] = { ...columns[ci], links };
                      return { ...b, columns };
                    })
                  )
                }
              >
                + Link in this column
              </button>
            </div>
          ))}
          <button
            type="button"
            className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium dark:border-zinc-600"
            onClick={() =>
              onChange(
                updateBlockById(canvas, block.id, (b) => {
                  if (b.type !== 'footer') return b;
                  return {
                    ...b,
                    columns: [...b.columns, defaultFooterColumn()],
                  };
                })
              )
            }
          >
            + Add column
          </button>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete footer
        </button>
      </div>
    );
  }

  if (block.type === 'card') {
    return (
      <CardBlockInspector canvas={canvas} block={block} onChange={onChange} />
    );
  }

  if (block.type === 'grid') {
    return (
      <GridBlockInspector canvas={canvas} block={block} onChange={onChange} />
    );
  }

  if (block.type === 'image') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Image
        </p>
        <ImageDropField
          label="Image URL"
          value={block.src}
          onChange={(url) =>
            onChange(
              updateBlockById(canvas, block.id, (b) =>
                b.type === 'image' ? { ...b, src: url } : b
              )
            )
          }
        />
        <Field label="Alt text">
          <input
            className={inputClass}
            value={block.alt}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'image' ? { ...b, alt: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <input
              className={inputClass}
              value={block.width}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'image' ? { ...b, width: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Height">
            <input
              className={inputClass}
              value={block.height}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'image' ? { ...b, height: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Object fit">
          <select
            className={inputClass}
            value={block.objectFit}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'image'
                    ? {
                        ...b,
                        objectFit: e.target.value as typeof block.objectFit,
                      }
                    : b
                )
              )
            }
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </Field>
        <Field label="Border radius">
          <input
            className={inputClass}
            value={block.borderRadius}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'image'
                    ? { ...b, borderRadius: e.target.value }
                    : b
                )
              )
            }
          />
        </Field>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete block
        </button>
      </div>
    );
  }

  if (block.type === 'button') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Button
        </p>
        <Field label="Label">
          <input
            className={inputClass}
            value={block.label}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'button' ? { ...b, label: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Link (href)">
          <input
            className={inputClass}
            value={block.href}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'button' ? { ...b, href: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Variant">
          <select
            className={inputClass}
            value={block.variant}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'button'
                    ? { ...b, variant: e.target.value as typeof block.variant }
                    : b
                )
              )
            }
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={Boolean(block.openInNewTab)}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'button'
                    ? { ...b, openInNewTab: e.target.checked }
                    : b
                )
              )
            }
          />
          Open in new tab
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Width">
            <input
              className={inputClass}
              value={block.width}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'button' ? { ...b, width: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Min height">
            <input
              className={inputClass}
              value={block.minHeight}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'button'
                      ? { ...b, minHeight: e.target.value }
                      : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Align in row">
          <select
            className={inputClass}
            value={block.alignSelf}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'button'
                    ? {
                        ...b,
                        alignSelf: e.target.value as typeof block.alignSelf,
                      }
                    : b
                )
              )
            }
          >
            <option value="auto">Auto</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </Field>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete block
        </button>
      </div>
    );
  }

  if (block.type === 'stack') {
    const rowColumnCount = block.children.filter(
      (child) => child.type === 'stack' && child.direction === 'column'
    ).length;

    const setRowColumns = (count: number) => {
      const safeCount = Math.min(6, Math.max(1, count));
      onChange(
        updateBlockById(canvas, block.id, (b) => {
          if (b.type !== 'stack') return b;
          const columnChildren = b.children.filter(
            (child) => child.type === 'stack' && child.direction === 'column'
          );
          const nonColumnChildren = b.children.filter(
            (child) => !(child.type === 'stack' && child.direction === 'column')
          );
          const nextColumns = Array.from({ length: safeCount }, (_, i) => {
            if (columnChildren[i]) {
              return {
                ...columnChildren[i],
                width: `calc((100% - ${
                  (safeCount - 1) * 16
                }px) / ${safeCount})`,
              };
            }
            const column = createColumnBlock(
              `calc((100% - ${(safeCount - 1) * 16}px) / ${safeCount})`
            );
            return column;
          });
          return { ...b, children: [...nextColumns, ...nonColumnChildren] };
        })
      );
    };

    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Row / group
        </p>
        <Field label="Direction">
          <select
            className={inputClass}
            value={block.direction}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'stack'
                    ? {
                        ...b,
                        direction: e.target.value as typeof block.direction,
                      }
                    : b
                )
              )
            }
          >
            <option value="row">Row</option>
            <option value="column">Column</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gap">
            <input
              className={inputClass}
              value={block.gap}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'stack' ? { ...b, gap: e.target.value } : b
                  )
                )
              }
            />
          </Field>
          <Field label="Width">
            <input
              className={inputClass}
              value={block.width}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'stack' ? { ...b, width: e.target.value } : b
                  )
                )
              }
            />
          </Field>
        </div>
        <Field label="Align items">
          <select
            className={inputClass}
            value={block.align}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'stack'
                    ? { ...b, align: e.target.value as typeof block.align }
                    : b
                )
              )
            }
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </Field>
        <Field label="Justify">
          <select
            className={inputClass}
            value={block.justify}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'stack'
                    ? { ...b, justify: e.target.value as typeof block.justify }
                    : b
                )
              )
            }
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="between">Space between</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={block.wrap}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'stack' ? { ...b, wrap: e.target.checked } : b
                )
              )
            }
          />
          Wrap
        </label>
        {block.direction === 'row' ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              Row columns
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                    rowColumnCount === n
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200'
                      : 'border-zinc-200 bg-white dark:border-zinc-600 dark:bg-zinc-950'
                  }`}
                  onClick={() => setRowColumns(n)}
                >
                  {n} col
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
                onClick={() => setRowColumns(Math.max(1, rowColumnCount - 1))}
              >
                - Column
              </button>
              <button
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
                onClick={() => setRowColumns(Math.min(6, rowColumnCount + 1))}
              >
                + Column
              </button>
            </div>
          </div>
        ) : null}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="mb-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Add inside this row
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STACK_BLOCK_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-950"
                onClick={() =>
                  onChange(
                    appendBlockToContainer(
                      canvas,
                      containerKeyForStack(block.id),
                      preset.create()
                    )
                  )
                }
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete group
        </button>
      </div>
    );
  }

  if (block.type === 'form') {
    return (
      <div className="space-y-4">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Form
        </p>
        <Field label="Title">
          <input
            className={inputClass}
            value={block.title}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'form' ? { ...b, title: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <Field label="Description">
          <textarea
            className={cnTextarea()}
            rows={3}
            value={block.description}
            onChange={(e) =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'form' ? { ...b, description: e.target.value } : b
                )
              )
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Action type">
            <select
              className={inputClass}
              value={block.actionType}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'form'
                      ? {
                          ...b,
                          actionType: e.target.value as typeof block.actionType,
                        }
                      : b
                  )
                )
              }
            >
              <option value="url">Open URL</option>
              <option value="email">Send email</option>
              <option value="tel">Call phone</option>
            </select>
          </Field>
          <Field label="Action value">
            <input
              className={inputClass}
              value={block.actionValue}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'form'
                      ? { ...b, actionValue: e.target.value }
                      : b
                  )
                )
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Submit label">
            <input
              className={inputClass}
              value={block.submitLabel}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'form'
                      ? { ...b, submitLabel: e.target.value }
                      : b
                  )
                )
              }
            />
          </Field>
          <Field label="Success message">
            <input
              className={inputClass}
              value={block.successMessage}
              onChange={(e) =>
                onChange(
                  updateBlockById(canvas, block.id, (b) =>
                    b.type === 'form'
                      ? { ...b, successMessage: e.target.value }
                      : b
                  )
                )
              }
            />
          </Field>
        </div>
        <div className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Fields
          </p>
          {block.fields.map((field, i) => (
            <div
              key={field.id}
              className="space-y-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'form') return b;
                        const fields = [...b.fields];
                        fields[i] = { ...fields[i], label: e.target.value };
                        return { ...b, fields };
                      })
                    )
                  }
                />
                <select
                  className={inputClass}
                  value={field.type}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'form') return b;
                        const fields = [...b.fields];
                        fields[i] = {
                          ...fields[i],
                          type: e.target.value as typeof field.type,
                        };
                        return { ...b, fields };
                      })
                    )
                  }
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="number">Number</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
                <input
                  className={inputClass}
                  placeholder="Name"
                  value={field.name}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'form') return b;
                        const fields = [...b.fields];
                        fields[i] = { ...fields[i], name: e.target.value };
                        return { ...b, fields };
                      })
                    )
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Placeholder"
                  value={field.placeholder}
                  onChange={(e) =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) => {
                        if (b.type !== 'form') return b;
                        const fields = [...b.fields];
                        fields[i] = {
                          ...fields[i],
                          placeholder: e.target.value,
                        };
                        return { ...b, fields };
                      })
                    )
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      onChange(
                        updateBlockById(canvas, block.id, (b) => {
                          if (b.type !== 'form') return b;
                          const fields = [...b.fields];
                          fields[i] = {
                            ...fields[i],
                            required: e.target.checked,
                          };
                          return { ...b, fields };
                        })
                      )
                    }
                  />
                  Required
                </label>
                <button
                  type="button"
                  className="text-xs text-red-600"
                  onClick={() =>
                    onChange(
                      updateBlockById(canvas, block.id, (b) =>
                        b.type === 'form'
                          ? {
                              ...b,
                              fields: b.fields.filter((_, idx) => idx !== i),
                            }
                          : b
                      )
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="w-full rounded-lg border border-dashed border-zinc-300 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
            onClick={() =>
              onChange(
                updateBlockById(canvas, block.id, (b) =>
                  b.type === 'form'
                    ? { ...b, fields: [...b.fields, defaultFormField()] }
                    : b
                )
              )
            }
          >
            + Add field
          </button>
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => onChange(deleteBlockById(canvas, block.id))}
        >
          Delete form
        </button>
      </div>
    );
  }

  return null;
}

function cnTextarea() {
  return `${inputClass} min-h-[96px] resize-y`;
}
