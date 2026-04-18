import type { CanvasBlock, CanvasPage, CanvasSection } from '@/types/landing-canvas';
import { hasNestedBlockChildren } from '@/types/landing-canvas';
export function findSection(canvas: CanvasPage, sectionId: string): CanvasSection | null {
  return canvas.sections.find((s) => s.id === sectionId) ?? null;
}

function walkBlocks(blocks: CanvasBlock[], id: string): CanvasBlock | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (hasNestedBlockChildren(b)) {
      const inner = walkBlocks(b.children, id);
      if (inner) return inner;
    }
  }
  return null;
}

export function findBlock(canvas: CanvasPage, id: string): CanvasBlock | null {
  for (const sec of canvas.sections) {
    const b = walkBlocks(sec.children, id);
    if (b) return b;
  }
  return null;
}
