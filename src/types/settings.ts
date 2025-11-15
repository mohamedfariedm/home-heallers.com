export interface Attachment {
  id: number;
  thumbnail: string;
  original: string;
}

export interface Banner {
  page: string;
  attachment: Attachment;
}

export interface Social {
  twetter: string; // Note: keeping original typo from API
  facebook: string;
  instgram: string; // Note: keeping original typo from API
  linked_in: string;
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

export interface Settings {
  banners: Banner[];
  social: Social;
  ios_link: string;
  android_link: string;
  seo: any;
  terms: any;
  conditions: any;
}