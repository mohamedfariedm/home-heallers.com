export interface Attachment {
  id: number;
  thumbnail: string;
  original: string;
}

export interface Banner {
  page: string;
  type?: 'web' | 'mobile app';
  attachment: Attachment;
}

export interface SocialLink {
  url: string;
  show: boolean;
}

export interface Social {
  facebook: SocialLink;
  instgram: SocialLink; // Note: keeping original typo from API
  linked_in: SocialLink;
  tiktok: SocialLink;
  x: SocialLink;
  snapchat: SocialLink;
  youtube: SocialLink;
}

export interface SEOData {
  title: string;
  description: string;
  h1: string;
  canonical: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
}

export interface BusinessInfo {
  commercial_registration: string;
  health_license: string;
  known_number: string;
  whatsapp: string;
  contact: string;
  email: string;
  address: string;
  brand: string;
}

export interface Settings {
  banners: Banner[];
  social: Social;
  ios_link: string;
  android_link: string;
  seo: any;
  terms: any;
  conditions: any;
  business_info?: BusinessInfo;
}