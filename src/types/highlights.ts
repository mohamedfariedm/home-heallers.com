export interface BilingualText {
  ar: string;
  en: string;
}

export interface HighlightElementCTA {
  cta_type?: string | null;
  deep_link?: string | null;
  url?: string | null;
  extra_data?: Record<string, any> | null;
}

export interface HighlightElement {
  id: number;
  highlight_id: number;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url?: string | null;
  cta_type?: string | null;
  deep_link?: string | null;
  url?: string | null;
  extra_data?: Record<string, any> | null;
  order: number;
  is_active: boolean;
  is_expired: boolean;
  created_at: string;
}

export interface Highlight {
  id: number;
  title: BilingualText;
  cover: string;
  country_ids?: number[];
  visibility_type: 'always' | 'daily';
  is_pinned: boolean;
  order: number;
  is_active: boolean;
  elements_count: number;
  is_expired: boolean;
  created_at: string;
  elements?: HighlightElement[];
}

export interface HighlightSettings {
  highlight_image_duration_seconds: number;
}

export interface HighlightFormInput {
  title_ar: string;
  title_en: string;
  visibility_type: 'always' | 'daily';
  country_ids?: number[];
  is_pinned?: boolean;
  order?: number;
  is_active?: boolean;
  cover?: any;
}

export interface ElementFormInput {
  media_type: 'image' | 'video';
  media?: any;
  thumbnail?: any;
  cta_type?: string;
  deep_link?: string;
  url?: string;
  extra_data?: Record<string, any>;
  order?: number;
  is_active?: boolean;
}

export const HIGHLIGHT_PAGE_SIZE_KEY = 'highlight_page_size';
export const HIGHLIGHT_PAGE_SIZES = [10, 20, 50, 100] as const;
