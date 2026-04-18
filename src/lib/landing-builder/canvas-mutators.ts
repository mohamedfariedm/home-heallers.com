import { arrayMove } from '@dnd-kit/sortable';
import type {
  CanvasBlock,
  CanvasFloatingDock,
  CanvasPage,
  CanvasSection,
} from '@/types/landing-canvas';
import { mergeFloatingDockPartial } from '@/lib/landing-builder/canvas-defaults';
import { hasNestedBlockChildren } from '@/types/landing-canvas';

function mapBlocks(blocks: CanvasBlock[], mapper: (b: CanvasBlock) => CanvasBlock): CanvasBlock[] {
  return blocks.map((b) => {
    const mapped = mapper(b);
    if (hasNestedBlockChildren(mapped)) {
      return { ...mapped, children: mapBlocks(mapped.children, mapper) };
    }
    return mapped;
  });
}

export function updateBlockById(
  canvas: CanvasPage,
  id: string,
  updater: (b: CanvasBlock) => CanvasBlock,
): CanvasPage {
  return {
    ...canvas,
    sections: canvas.sections.map((sec) => ({
      ...sec,
      children: mapBlocks(sec.children, (b) => (b.id === id ? updater(b) : b)),
    })),
  };
}

export function deleteBlockById(canvas: CanvasPage, id: string): CanvasPage {
  const strip = (blocks: CanvasBlock[]): CanvasBlock[] =>
    blocks
      .filter((b) => b.id !== id)
      .map((b) =>
        hasNestedBlockChildren(b) ? { ...b, children: strip(b.children) } : b,
      );
  return {
    ...canvas,
    sections: canvas.sections.map((sec) => ({
      ...sec,
      children: strip(sec.children),
    })),
  };
}

type ContainerRef =
  | { kind: 'section'; sectionId: string }
  | { kind: 'stack'; stackId: string }
  | { kind: 'grid'; gridId: string };

function findNestedContainerChildren(
  blocks: CanvasBlock[],
  containerId: string,
): CanvasBlock[] | null {
  for (const b of blocks) {
    if (hasNestedBlockChildren(b) && b.id === containerId) return b.children;
    if (hasNestedBlockChildren(b)) {
      const inner = findNestedContainerChildren(b.children, containerId);
      if (inner) return inner;
    }
  }
  return null;
}

function getContainerChildren(page: CanvasPage, ref: ContainerRef): CanvasBlock[] | null {
  if (ref.kind === 'section') {
    const sec = page.sections.find((s) => s.id === ref.sectionId);
    return sec ? sec.children : null;
  }
  const id = ref.kind === 'stack' ? ref.stackId : ref.gridId;
  for (const sec of page.sections) {
    const found = findNestedContainerChildren(sec.children, id);
    if (found) return found;
  }
  return null;
}

function setContainerChildren(
  page: CanvasPage,
  ref: ContainerRef,
  nextChildren: CanvasBlock[],
): CanvasPage {
  if (ref.kind === 'section') {
    return {
      ...page,
      sections: page.sections.map((s) =>
        s.id === ref.sectionId ? { ...s, children: nextChildren } : s,
      ),
    };
  }
  const targetId = ref.kind === 'stack' ? ref.stackId : ref.gridId;
  const setInBlocks = (blocks: CanvasBlock[]): CanvasBlock[] =>
    blocks.map((b) => {
      if (hasNestedBlockChildren(b) && b.id === targetId) {
        return { ...b, children: nextChildren };
      }
      if (hasNestedBlockChildren(b)) {
        return { ...b, children: setInBlocks(b.children) };
      }
      return b;
    });
  return {
    ...page,
    sections: page.sections.map((s) => ({
      ...s,
      children: setInBlocks(s.children),
    })),
  };
}

export function parseContainerKey(key: string): ContainerRef | null {
  if (key.startsWith('section:')) {
    return { kind: 'section', sectionId: key.slice('section:'.length) };
  }
  if (key.startsWith('stack:')) {
    return { kind: 'stack', stackId: key.slice('stack:'.length) };
  }
  if (key.startsWith('grid:')) {
    return { kind: 'grid', gridId: key.slice('grid:'.length) };
  }
  return null;
}

export function containerKeyForSection(sectionId: string) {
  return `section:${sectionId}`;
}

export function containerKeyForStack(stackId: string) {
  return `stack:${stackId}`;
}

export function containerKeyForGrid(gridId: string) {
  return `grid:${gridId}`;
}

export function reorderInContainer(
  canvas: CanvasPage,
  containerKey: string,
  activeId: string,
  overId: string,
): CanvasPage {
  const ref = parseContainerKey(containerKey);
  if (!ref) return canvas;
  const list = getContainerChildren(canvas, ref);
  if (!list) return canvas;
  const oldIndex = list.findIndex((b) => b.id === activeId);
  const newIndex = list.findIndex((b) => b.id === overId);
  if (oldIndex < 0 || newIndex < 0) return canvas;
  const next = arrayMove(list, oldIndex, newIndex);
  return setContainerChildren(canvas, ref, next);
}

export function appendBlockToContainer(
  canvas: CanvasPage,
  containerKey: string,
  block: CanvasBlock,
): CanvasPage {
  const ref = parseContainerKey(containerKey);
  if (!ref) return canvas;
  const list = getContainerChildren(canvas, ref);
  if (!list) return canvas;
  return setContainerChildren(canvas, ref, [...list, block]);
}

export function insertBlockAtIndex(
  canvas: CanvasPage,
  containerKey: string,
  index: number,
  block: CanvasBlock,
): CanvasPage {
  const ref = parseContainerKey(containerKey);
  if (!ref) return canvas;
  const list = getContainerChildren(canvas, ref);
  if (!list) return canvas;
  const next = [...list.slice(0, index), block, ...list.slice(index)];
  return setContainerChildren(canvas, ref, next);
}

export function reorderSections(
  canvas: CanvasPage,
  activeId: string,
  overId: string,
): CanvasPage {
  const oldIndex = canvas.sections.findIndex((s) => s.id === activeId);
  const newIndex = canvas.sections.findIndex((s) => s.id === overId);
  if (oldIndex < 0 || newIndex < 0) return canvas;
  return {
    ...canvas,
    sections: arrayMove(canvas.sections, oldIndex, newIndex),
  };
}

export function updateSectionById(
  canvas: CanvasPage,
  sectionId: string,
  patch: Partial<CanvasSection>,
): CanvasPage {
  return {
    ...canvas,
    sections: canvas.sections.map((s) =>
      s.id === sectionId ? { ...s, ...patch } : s,
    ),
  };
}

export function addSection(canvas: CanvasPage, section: CanvasSection): CanvasPage {
  return { ...canvas, sections: [...canvas.sections, section] };
}

export function insertSectionAfter(
  canvas: CanvasPage,
  afterSectionId: string,
  section: CanvasSection,
): CanvasPage {
  const idx = canvas.sections.findIndex((s) => s.id === afterSectionId);
  if (idx < 0) return addSection(canvas, section);
  const next = [
    ...canvas.sections.slice(0, idx + 1),
    section,
    ...canvas.sections.slice(idx + 1),
  ];
  return { ...canvas, sections: next };
}

export function removeSection(canvas: CanvasPage, sectionId: string): CanvasPage {
  return { ...canvas, sections: canvas.sections.filter((s) => s.id !== sectionId) };
}

export type CanvasPageMetaPatch = Partial<
  Pick<CanvasPage, 'siteName' | 'primaryColor' | 'secondaryColor' | 'pageBackground'>
> & {
  floatingDock?: Partial<CanvasFloatingDock>;
};

export function updatePageMeta(canvas: CanvasPage, patch: CanvasPageMetaPatch): CanvasPage {
  const { floatingDock: fdPatch, ...rest } = patch;
  const next = { ...canvas, ...rest };
  if (fdPatch !== undefined) {
    next.floatingDock = mergeFloatingDockPartial(canvas.floatingDock, fdPatch);
  }
  return next;
}
