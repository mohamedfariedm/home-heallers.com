export interface OnboardingBilingual {
  ar: string;
  en: string;
}

export interface OnboardingScreen {
  id: number;
  title: OnboardingBilingual;
  description: OnboardingBilingual;
  image: OnboardingBilingual;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OnboardingLang = 'ar' | 'en';
