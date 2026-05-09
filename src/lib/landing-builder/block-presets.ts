import type { CanvasBlock, CanvasStackBlock } from '@/types/landing-canvas';
import {
  defaultButtonBlock,
  defaultCardBlock,
  defaultCopyBlock,
  defaultFormBlock,
  defaultFooterBlock,
  defaultGridBlock,
  defaultImageBlock,
  defaultNavbarBlock,
  defaultStackBlock,
  defaultTextBlock,
} from '@/lib/landing-builder/canvas-defaults';

export type BlockPreset = {
  key: string;
  label: string;
  create: () => CanvasBlock;
};

export const SECTION_BLOCK_PRESETS: BlockPreset[] = [
  { key: 'copy', label: 'Copy', create: () => defaultCopyBlock() },
  { key: 'text', label: 'Text', create: () => defaultTextBlock() },
  { key: 'image', label: 'Image', create: () => defaultImageBlock() },
  { key: 'button', label: 'Button', create: () => defaultButtonBlock() },
  { key: 'form', label: 'Form', create: () => defaultFormBlock() },
  { key: 'row', label: 'Row', create: () => createRowWithColumns(2) },
  { key: 'grid', label: 'Grid×3', create: () => defaultGridBlock(3) },
  { key: 'card', label: 'Card', create: () => defaultCardBlock() },
  { key: 'navbar', label: 'Navbar', create: () => defaultNavbarBlock() },
  { key: 'footer', label: 'Footer', create: () => defaultFooterBlock() },
];

export const STACK_BLOCK_PRESETS: BlockPreset[] = [
  { key: 'column', label: 'Column', create: () => createColumnBlock() },
  { key: 'text', label: 'Text', create: () => defaultTextBlock() },
  { key: 'image', label: 'Image', create: () => defaultImageBlock() },
  { key: 'button', label: 'Button', create: () => defaultButtonBlock() },
  { key: 'form', label: 'Form', create: () => defaultFormBlock() },
  { key: 'copy', label: 'Copy', create: () => defaultCopyBlock() },
  { key: 'row', label: 'Row', create: () => createRowWithColumns(2) },
  { key: 'grid', label: 'Grid×3', create: () => defaultGridBlock(3) },
  { key: 'card', label: 'Card', create: () => defaultCardBlock() },
  { key: 'navbar', label: 'Navbar', create: () => defaultNavbarBlock() },
  { key: 'footer', label: 'Footer', create: () => defaultFooterBlock() },
];

export function createColumnBlock(width = 'min(100%, 420px)'): CanvasStackBlock {
  const column = defaultStackBlock();
  column.direction = 'column';
  column.align = 'stretch';
  column.justify = 'start';
  column.wrap = false;
  column.width = width;
  column.children = [defaultTextBlock()];
  return column;
}

export function createRowWithColumns(columnCount: number): CanvasStackBlock {
  const count = Math.min(6, Math.max(1, Math.floor(columnCount)));
  const row = defaultStackBlock();
  row.direction = 'row';
  row.align = 'stretch';
  row.justify = 'between';
  row.wrap = true;
  row.gap = '16px';
  row.children = Array.from({ length: count }, (_, i) => {
    const column = createColumnBlock(`calc((100% - ${(count - 1) * 16}px) / ${count})`);
    if (i === 0) {
      column.children = [defaultCopyBlock()];
    } else if (i === 1) {
      column.children = [defaultImageBlock()];
    }
    return column;
  });
  return row;
}
