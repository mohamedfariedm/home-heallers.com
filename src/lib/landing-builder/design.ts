import type { LandingDesign, TypographyPreset } from '@/types/landing-builder';

export const DEFAULT_LANDING_DESIGN: LandingDesign = {
  typographyPreset: 'md',
  heroAspectRatio: '4/3',
  heroMaxHeight: '',
  heroObjectFit: 'cover',
  heroImageColumnMaxWidthPct: 100,
  featureImageAspectRatio: '16/9',
  featureImageHeight: '160px',
  featureImageObjectFit: 'cover',
  logoMaxHeightPx: 36,
  testimonialAvatarPx: 44,
  testimonialAvatarRadiusPercent: 50,
  sectionPadding: 'normal',
  heroImageBorderRadiusPercent: 12,
  featureImageBorderRadiusPercent: 12,
  logoBorderRadiusPx: 8,
};

const TYPO: Record<
  TypographyPreset,
  { bodyRem: number; heroTitleRem: number; sectionHeadingRem: number; cardTitleRem: number }
> = {
  sm: { bodyRem: 0.875, heroTitleRem: 1.75, sectionHeadingRem: 1.35, cardTitleRem: 1.05 },
  md: { bodyRem: 1, heroTitleRem: 2.35, sectionHeadingRem: 1.65, cardTitleRem: 1.125 },
  lg: { bodyRem: 1.0625, heroTitleRem: 2.85, sectionHeadingRem: 1.9, cardTitleRem: 1.2 },
  xl: { bodyRem: 1.125, heroTitleRem: 3.35, sectionHeadingRem: 2.15, cardTitleRem: 1.3 },
};

const SECTION_PY_REM: Record<LandingDesign['sectionPadding'], string> = {
  compact: '2.75rem',
  normal: '4.5rem',
  relaxed: '6.5rem',
};

export function resolveTypography(preset: TypographyPreset) {
  return TYPO[preset] ?? TYPO.md;
}

export function resolveSectionPadding(design: LandingDesign) {
  return SECTION_PY_REM[design.sectionPadding] ?? SECTION_PY_REM.normal;
}

export function mergeLandingDesign(
  partial?: Partial<LandingDesign>,
): LandingDesign {
  return { ...DEFAULT_LANDING_DESIGN, ...partial };
}

export const HERO_ASPECT_PRESETS = [
  { value: '21/9', label: '21:9 cinematic' },
  { value: '16/9', label: '16:9 widescreen' },
  { value: '3/2', label: '3:2 photo' },
  { value: '4/3', label: '4:3 standard' },
  { value: '1/1', label: '1:1 square' },
  { value: '9/16', label: '9:16 story' },
] as const;

export const FEATURE_ASPECT_PRESETS = [
  { value: '16/9', label: '16:9' },
  { value: '4/3', label: '4:3' },
  { value: '3/2', label: '3:2' },
  { value: '1/1', label: '1:1' },
] as const;
