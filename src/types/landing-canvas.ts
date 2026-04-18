export type CanvasTextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'caption'
  | /** Larger body for intros */ 'lead'
  | /** Under-headline line */ 'subtitle'
  | /** Small uppercase label */ 'overline';

export type CanvasTextBlock = {
  type: 'text';
  id: string;
  variant: CanvasTextVariant;
  content: string;
  align: 'left' | 'center' | 'right';
  color?: string;
  /** Optional CSS font-size e.g. 1.125rem, 32px */
  fontSize?: string;
  width: string;
  maxWidth: string;
};

/** Headline + supporting copy in one block (professional hero / feature text). */
export type CanvasCopyBlock = {
  type: 'copy';
  id: string;
  showEyebrow: boolean;
  eyebrow: string;
  headline: string;
  showSubheadline: boolean;
  subheadline: string;
  /** Multi-line body — use blank lines for paragraphs */
  body: string;
  align: 'left' | 'center' | 'right';
  gap: string;
  width: string;
  maxWidth: string;
  headlineTag: 'h1' | 'h2' | 'h3';
  eyebrowColor?: string;
  headlineColor?: string;
  subheadlineColor?: string;
  bodyColor?: string;
  eyebrowSize?: string;
  headlineSize?: string;
  subheadlineSize?: string;
  bodySize?: string;
};

export type CanvasNavLink = {
  id: string;
  label: string;
  href: string;
};

export type CanvasNavbarBlock = {
  type: 'navbar';
  id: string;
  logoText: string;
  logoUrl: string;
  logoHeight: string;
  links: CanvasNavLink[];
  ctaLabel: string;
  ctaHref: string;
  showCta: boolean;
  background: string;
  borderBottom: boolean;
  sticky: boolean;
  paddingY: string;
  /** Horizontal padding of the inner bar (helps on small screens). */
  paddingX: string;
  maxWidth: string;
  minHeight: string;
  linkGap: string;
};

export type CanvasFooterLink = {
  id: string;
  label: string;
  href: string;
};

export type CanvasFooterColumn = {
  id: string;
  title: string;
  links: CanvasFooterLink[];
};

export type CanvasFooterBlock = {
  type: 'footer';
  id: string;
  background: string;
  paddingY: string;
  paddingX: string;
  maxWidth: string;
  copyright: string;
  tagline: string;
  /** Grid columns (desktop) */
  columnCount: 1 | 2 | 3 | 4;
  columns: CanvasFooterColumn[];
};

export type CanvasImageBlock = {
  type: 'image';
  id: string;
  src: string;
  alt: string;
  width: string;
  height: string;
  objectFit: 'cover' | 'contain' | 'fill';
  borderRadius: string;
};

export type CanvasButtonVariant = 'primary' | 'secondary' | 'outline';

export type CanvasButtonBlock = {
  type: 'button';
  id: string;
  label: string;
  href: string;
  variant: CanvasButtonVariant;
  openInNewTab?: boolean;
  width: string;
  minHeight: string;
  alignSelf: 'auto' | 'start' | 'center' | 'end' | 'stretch';
};

export type CanvasStackBlock = {
  type: 'stack';
  id: string;
  direction: 'row' | 'column';
  gap: string;
  align: 'start' | 'center' | 'end' | 'stretch';
  justify: 'start' | 'center' | 'end' | 'between';
  wrap: boolean;
  width: string;
  children: CanvasBlock[];
};

/** Responsive column grid (e.g. 3 cards in a row). */
export type CanvasGridBlock = {
  type: 'grid';
  id: string;
  /** Columns from the `lg` breakpoint up (Tailwind `lg:` / `xl:` for 4-col). */
  columns: 1 | 2 | 3 | 4;
  /** Columns below `lg` (phones / small tablets). */
  columnsSmall: 1 | 2;
  gap: string;
  rowGap: string;
  alignItems: 'stretch' | 'start' | 'center' | 'end';
  justifyItems: 'start' | 'center' | 'end' | 'stretch';
  width: string;
  maxWidth: string;
  children: CanvasBlock[];
};

/** Default image sizing / radius for cards (used by new cards and “reset image frame”). */
export type CanvasCardImageFrame = {
  imageWidth: string;
  imageHeight: string;
  imageMinWidth: string;
  imageMaxWidth: string;
  imageBorderRadius: string;
  imageObjectFit: 'cover' | 'contain' | 'fill';
};

/** Image + title + body with borders, spacing, and layout (swap sides = row-reverse). */
export type CanvasCardBlock = {
  type: 'card';
  id: string;
  /** When false, only title + body render (text-only card). */
  showImage: boolean;
  layout: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /**
   * Cross-axis alignment of the image vs the text block (flex `align-self` on the image).
   * Row layouts: vertical (top / middle / bottom). Column layouts: horizontal (left / center / right).
   */
  imageJustify: 'start' | 'center' | 'end';
  gap: string;
  padding: string;
  background: string;
  borderWidth: string;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderColor: string;
  borderRadius: string;
  boxShadow: string;
  width: string;
  maxWidth: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: string;
  imageHeight: string;
  imageMinWidth: string;
  imageMaxWidth: string;
  imageObjectFit: 'cover' | 'contain' | 'fill';
  imageBorderRadius: string;
  title: string;
  body: string;
  titleTag: 'h2' | 'h3' | 'h4' | 'div';
  textAlign: 'left' | 'center' | 'right';
  titleColor?: string;
  titleSize?: string;
  bodyColor?: string;
  bodySize?: string;
  /** When true, row / row-reverse layouts stack vertically below the `md` breakpoint. */
  stackOnNarrowScreens: boolean;
  /** Whole-card link in published view (empty = not clickable as a link). */
  cardHref: string;
  cardOpenInNewTab: boolean;
  showCardCta: boolean;
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: CanvasButtonVariant;
  /** Open card CTA link in a new tab (whole-card link uses `cardOpenInNewTab`). */
  ctaOpenInNewTab: boolean;
};

export type CanvasBlock =
  | CanvasTextBlock
  | CanvasCopyBlock
  | CanvasImageBlock
  | CanvasButtonBlock
  | CanvasStackBlock
  | CanvasGridBlock
  | CanvasCardBlock
  | CanvasNavbarBlock
  | CanvasFooterBlock;

export type CanvasSection = {
  id: string;
  name: string;
  background: string;
  paddingY: string;
  paddingX: string;
  maxWidth: string;
  contentAlign: 'start' | 'center' | 'end';
  children: CanvasBlock[];
};

/** Fixed call / WhatsApp / social strip for published pages (and live preview). */
export type CanvasFloatingDock = {
  enabled: boolean;
  /** Shown in tel: link (digits and spaces ok). */
  phone: string;
  /** Country code + number, digits only (e.g. 15551234567) for WhatsApp. */
  whatsapp: string;
  showCall: boolean;
  showWhatsapp: boolean;
  facebookUrl: string;
  instagramUrl: string;
  xUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  position: 'bottom-right' | 'bottom-left';
};

export type CanvasPage = {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  pageBackground: string;
  sections: CanvasSection[];
  floatingDock: CanvasFloatingDock;
};

export function isCanvasStackBlock(b: CanvasBlock): b is CanvasStackBlock {
  return b.type === 'stack';
}

export function isCanvasGridBlock(b: CanvasBlock): b is CanvasGridBlock {
  return b.type === 'grid';
}

export function hasNestedBlockChildren(
  b: CanvasBlock,
): b is CanvasStackBlock | CanvasGridBlock {
  return b.type === 'stack' || b.type === 'grid';
}
