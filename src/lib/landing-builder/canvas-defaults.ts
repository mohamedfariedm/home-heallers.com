import type {
  CanvasBlock,
  CanvasButtonBlock,
  CanvasCardBlock,
  CanvasCardImageFrame,
  CanvasCopyBlock,
  CanvasFooterBlock,
  CanvasFooterColumn,
  CanvasFooterLink,
  CanvasGridBlock,
  CanvasImageBlock,
  CanvasNavbarBlock,
  CanvasNavLink,
  CanvasFloatingDock,
  CanvasPage,
  CanvasSection,
  CanvasStackBlock,
  CanvasTextBlock,
} from '@/types/landing-canvas';

export function newCanvasId(prefix = 'n') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const DEFAULT_FLOATING_DOCK: CanvasFloatingDock = {
  enabled: false,
  phone: '',
  whatsapp: '',
  showCall: true,
  showWhatsapp: true,
  facebookUrl: '',
  instagramUrl: '',
  xUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  position: 'bottom-right',
};

export function mergeFloatingDockPartial(
  current: CanvasFloatingDock | undefined,
  patch: Partial<CanvasFloatingDock>,
): CanvasFloatingDock {
  return { ...DEFAULT_FLOATING_DOCK, ...(current ?? {}), ...patch };
}

export const EMPTY_CANVAS_PAGE: CanvasPage = {
  siteName: 'My page',
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  pageBackground: '#ffffff',
  sections: [],
  floatingDock: { ...DEFAULT_FLOATING_DOCK },
};

export function defaultNavLink(partial?: Partial<CanvasNavLink>): CanvasNavLink {
  return {
    id: newCanvasId('nl'),
    label: 'Link',
    href: '#',
    ...partial,
  };
}

export function defaultFooterLink(partial?: Partial<CanvasFooterLink>): CanvasFooterLink {
  return {
    id: newCanvasId('fl'),
    label: 'Link',
    href: '#',
    ...partial,
  };
}

export function defaultFooterColumn(partial?: Partial<CanvasFooterColumn>): CanvasFooterColumn {
  const id = partial?.id ?? newCanvasId('fc');
  const title = partial?.title ?? 'Column';
  const links =
    partial?.links !== undefined
      ? partial.links.map((l) => ({ ...defaultFooterLink(), ...l }))
      : [defaultFooterLink({ label: 'Item', href: '#' })];
  return { id, title, links };
}

export function defaultTextBlock(): CanvasTextBlock {
  return {
    type: 'text',
    id: newCanvasId('text'),
    variant: 'body',
    content: 'New text',
    align: 'left',
    width: '100%',
    maxWidth: '100%',
  };
}

export function defaultCopyBlock(): CanvasCopyBlock {
  return {
    type: 'copy',
    id: newCanvasId('copy'),
    showEyebrow: true,
    eyebrow: 'Label',
    headline: 'Headline',
    showSubheadline: true,
    subheadline: 'One line that expands on the headline.',
    body: 'Longer supporting copy. Use multiple lines or blank lines between paragraphs.',
    align: 'left',
    gap: '12px',
    width: '100%',
    maxWidth: '40rem',
    headlineTag: 'h2',
  };
}

export function defaultNavbarBlock(): CanvasNavbarBlock {
  return {
    type: 'navbar',
    id: newCanvasId('nav'),
    logoText: 'Brand',
    logoUrl: '',
    logoHeight: '36px',
    links: [
      defaultNavLink({ label: 'Features', href: '#features' }),
      defaultNavLink({ label: 'Pricing', href: '#pricing' }),
      defaultNavLink({ label: 'Contact', href: '#contact' }),
    ],
    ctaLabel: 'Get started',
    ctaHref: '#',
    showCta: true,
    background: 'rgba(255,255,255,0.85)',
    borderBottom: true,
    sticky: true,
    paddingY: '12px',
    paddingX: '16px',
    maxWidth: '1200px',
    minHeight: '52px',
    linkGap: '20px',
  };
}

export function defaultFooterBlock(): CanvasFooterBlock {
  return {
    type: 'footer',
    id: newCanvasId('foot'),
    background: '#0f172a',
    paddingY: '48px',
    paddingX: '24px',
    maxWidth: '1200px',
    copyright: '© 2026 Your company. All rights reserved.',
    tagline: '',
    columnCount: 3,
    columns: [
      defaultFooterColumn({
        title: 'Product',
        links: [
          defaultFooterLink({ label: 'Overview', href: '#' }),
          defaultFooterLink({ label: 'Pricing', href: '#' }),
        ],
      }),
      defaultFooterColumn({
        title: 'Company',
        links: [
          defaultFooterLink({ label: 'About', href: '#' }),
          defaultFooterLink({ label: 'Careers', href: '#' }),
        ],
      }),
      defaultFooterColumn({
        title: 'Legal',
        links: [
          defaultFooterLink({ label: 'Privacy', href: '#' }),
          defaultFooterLink({ label: 'Terms', href: '#' }),
        ],
      }),
    ],
  };
}

export function defaultImageBlock(): CanvasImageBlock {
  return {
    type: 'image',
    id: newCanvasId('img'),
    src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80',
    alt: 'Image',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '12px',
  };
}

export function defaultButtonBlock(): CanvasButtonBlock {
  return {
    type: 'button',
    id: newCanvasId('btn'),
    label: 'Button',
    href: '#',
    variant: 'primary',
    width: 'auto',
    minHeight: '44px',
    alignSelf: 'auto',
  };
}

export function defaultStackBlock(): CanvasStackBlock {
  return {
    type: 'stack',
    id: newCanvasId('stack'),
    direction: 'row',
    gap: '12px',
    align: 'center',
    justify: 'start',
    wrap: true,
    width: '100%',
    children: [],
  };
}

/** Matches new card defaults — use after “circle” to restore the standard image frame. */
export const DEFAULT_CARD_IMAGE_FRAME: CanvasCardImageFrame = {
  imageWidth: '160px',
  imageHeight: '160px',
  imageMinWidth: '100px',
  imageMaxWidth: '100%',
  imageObjectFit: 'cover',
  imageBorderRadius: '12px',
};

export function defaultCardBlock(): CanvasCardBlock {
  return {
    type: 'card',
    id: newCanvasId('card'),
    showImage: true,
    layout: 'row',
    imageJustify: 'start',
    gap: '20px',
    padding: '24px',
    background: '#ffffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(15,23,42,0.1)',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    width: '100%',
    maxWidth: '100%',
    imageSrc:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80',
    imageAlt: '',
    ...DEFAULT_CARD_IMAGE_FRAME,
    title: 'Card title',
    body: 'Supporting text for this card. Swap image side, tune borders, or make the image circular from the toolbar or properties.',
    titleTag: 'h3',
    textAlign: 'left',
    stackOnNarrowScreens: true,
    cardHref: '',
    cardOpenInNewTab: false,
    showCardCta: false,
    ctaLabel: 'Learn more',
    ctaHref: '#',
    ctaVariant: 'primary',
    ctaOpenInNewTab: false,
  };
}

export function defaultGridBlock(columns: 1 | 2 | 3 | 4 = 3): CanvasGridBlock {
  const children: CanvasCardBlock[] = [];
  for (let i = 0; i < columns; i += 1) {
    children.push({
      ...defaultCardBlock(),
      id: newCanvasId('card'),
      title: `Card ${i + 1}`,
      body: 'Edit copy, image, and frame for each card.',
    });
  }
  return {
    type: 'grid',
    id: newCanvasId('grid'),
    columns,
    columnsSmall: 1,
    gap: '20px',
    rowGap: '24px',
    alignItems: 'stretch',
    justifyItems: 'stretch',
    width: '100%',
    maxWidth: '100%',
    children,
  };
}

export function defaultSection(name = 'Section'): CanvasSection {
  return {
    id: newCanvasId('sec'),
    name,
    background: 'transparent',
    paddingY: 'clamp(32px, 6vw, 48px)',
    paddingX: 'clamp(16px, 4vw, 24px)',
    maxWidth: '1200px',
    contentAlign: 'center',
    children: [],
  };
}

export function starterCanvasPage(): CanvasPage {
  const header = defaultSection('Header');
  header.background = 'rgba(255,255,255,0.92)';
  header.paddingY = '8px';
  header.paddingX = '20px';
  header.maxWidth = '100%';
  header.contentAlign = 'center';
  header.children = [defaultNavbarBlock()];

  const hero = defaultSection('Hero');
  hero.background =
    'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, transparent 60%)';
  hero.children = [
    {
      ...defaultCopyBlock(),
      id: newCanvasId('copy'),
      align: 'center',
      maxWidth: '48rem',
      headlineTag: 'h1',
      headline: 'Build any section you need',
      subheadline: 'Navbar, footer, multi-line copy, buttons, and images — all editable in one place.',
      body: 'Add a Copy block for headline + body together.\n\nUse Row blocks for CTAs or split layouts.',
      showEyebrow: true,
      eyebrow: 'Landing canvas',
    },
    {
      ...defaultStackBlock(),
      id: newCanvasId('stack'),
      direction: 'row',
      gap: '12px',
      align: 'center',
      justify: 'center',
      wrap: true,
      width: '100%',
      children: [
        { ...defaultButtonBlock(), id: newCanvasId('btn'), label: 'Primary' },
        {
          ...defaultButtonBlock(),
          id: newCanvasId('btn'),
          label: 'Outline',
          variant: 'outline',
        },
      ],
    },
  ];

  const footSec = defaultSection('Footer area');
  footSec.background = 'transparent';
  footSec.paddingY = '0';
  footSec.paddingX = '0';
  footSec.maxWidth = '100%';
  footSec.contentAlign = 'center';
  footSec.children = [defaultFooterBlock()];

  return {
    ...EMPTY_CANVAS_PAGE,
    siteName: 'Starter',
    sections: [header, hero, footSec],
  };
}

function mergeNavLink(p: Partial<CanvasNavLink>): CanvasNavLink {
  return { ...defaultNavLink(), ...p };
}

function mergeFooterLink(p: Partial<CanvasFooterLink>): CanvasFooterLink {
  return { ...defaultFooterLink(), ...p };
}

function mergeFooterColumn(p: Partial<CanvasFooterColumn>): CanvasFooterColumn {
  const d = defaultFooterColumn();
  const links = Array.isArray(p.links)
    ? p.links.map((l) => mergeFooterLink(l))
    : d.links;
  return { ...d, ...p, links };
}

function mergeBlock(partial: Partial<CanvasBlock> & { type: string }): CanvasBlock {
  switch (partial.type) {
    case 'text': {
      const d = defaultTextBlock();
      return { ...d, ...partial, type: 'text' } as CanvasTextBlock;
    }
    case 'copy': {
      const d = defaultCopyBlock();
      return { ...d, ...partial, type: 'copy' } as CanvasCopyBlock;
    }
    case 'image': {
      const d = defaultImageBlock();
      return { ...d, ...partial, type: 'image' } as CanvasImageBlock;
    }
    case 'button': {
      const d = defaultButtonBlock();
      return { ...d, ...partial, type: 'button' } as CanvasButtonBlock;
    }
    case 'stack': {
      const d = defaultStackBlock();
      const children = Array.isArray(partial.children)
        ? (partial.children as CanvasBlock[]).map((c) => mergeBlock(c as CanvasBlock))
        : d.children;
      return { ...d, ...partial, type: 'stack', children } as CanvasStackBlock;
    }
    case 'grid': {
      const d = defaultGridBlock(3);
      const children = Array.isArray(partial.children)
        ? (partial.children as CanvasBlock[]).map((c) => mergeBlock(c as CanvasBlock))
        : d.children;
      const c = partial.columns;
      const columns =
        c === 1 || c === 2 || c === 3 || c === 4 ? c : d.columns;
      const cs = partial.columnsSmall;
      const columnsSmall =
        cs === 1 || cs === 2 ? cs : d.columnsSmall;
      return {
        ...d,
        ...partial,
        type: 'grid',
        children,
        columns,
        columnsSmall,
      } as CanvasGridBlock;
    }
    case 'card': {
      const d = defaultCardBlock();
      return { ...d, ...partial, type: 'card' } as CanvasCardBlock;
    }
    case 'navbar': {
      const d = defaultNavbarBlock();
      const links = Array.isArray(partial.links)
        ? (partial.links as CanvasNavLink[]).map((l) => mergeNavLink(l))
        : d.links;
      return { ...d, ...partial, type: 'navbar', links } as CanvasNavbarBlock;
    }
    case 'footer': {
      const d = defaultFooterBlock();
      const columns = Array.isArray(partial.columns)
        ? (partial.columns as CanvasFooterColumn[]).map((c) => mergeFooterColumn(c))
        : d.columns;
      const cc = partial.columnCount;
      const columnCount =
        cc === 1 || cc === 2 || cc === 3 || cc === 4 ? cc : d.columnCount;
      return { ...d, ...partial, type: 'footer', columns, columnCount } as CanvasFooterBlock;
    }
    default:
      return defaultTextBlock();
  }
}

function mergeSection(partial: Partial<CanvasSection>): CanvasSection {
  const d = defaultSection();
  const children = Array.isArray(partial.children)
    ? partial.children.map((c) => mergeBlock(c as CanvasBlock))
    : d.children;
  return {
    ...d,
    ...partial,
    children,
  };
}

export function mergeCanvasPage(partial: Partial<CanvasPage> | null | undefined): CanvasPage {
  const d = EMPTY_CANVAS_PAGE;
  if (!partial || typeof partial !== 'object') return { ...d };
  const sections = Array.isArray(partial.sections)
    ? partial.sections.map((s) => mergeSection(s))
    : d.sections;
  return {
    siteName: partial.siteName ?? d.siteName,
    primaryColor: partial.primaryColor ?? d.primaryColor,
    secondaryColor: partial.secondaryColor ?? d.secondaryColor,
    pageBackground: partial.pageBackground ?? d.pageBackground,
    sections,
    floatingDock: mergeFloatingDockPartial(d.floatingDock, partial.floatingDock ?? {}),
  };
}
