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

export interface MultilingualText {
  en: string;
  ar: string;
}

export interface CallToActionButton {
  text: MultilingualText;
  link: string;
  style?: 'primary' | 'secondary' | 'outline';
  open_in_new_tab?: boolean;
}

export interface FormFieldOption {
  value: string;
  label: MultilingualText;
}

export interface FormField {
  id: string;
  label: MultilingualText;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'file';
  placeholder?: MultilingualText;
  required?: boolean;
  options?: FormFieldOption[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: MultilingualText;
  };
}

export interface LandingPageSection {
  id?: number;
  type: 'hero' | 'section' | 'features' | 'services' | 'testimonials' | 'gallery' | 'about' | 'contact' | 'faq' | 'pricing' | 'banner' | 'form';
  title: MultilingualText;
  content: MultilingualText;
  image?: string;
  attachment?: {
    id: number;
    thumbnail: string;
    original: string;
  };
  order: number;
  active?: boolean; // Whether the section is active (default: true)
  display_mode?: 'section' | 'slider';
  slide_type?: 'services' | 'blogs' | 'packages' | 'offers' | 'doctors' | 'faqs';
  selected_services?: number[]; // For services section or slider
  selected_doctors?: number[]; // For doctors slider
  selected_packages?: number[]; // For packages slider
  selected_offers?: number[]; // For offers slider
  selected_blogs?: number[]; // For blogs slider
  selected_faqs?: number[]; // For faqs slider
  payment_link?: boolean; // Enable payment link for packages/offers (default: false)
  buttons?: CallToActionButton[]; // Array of CTA buttons for any section
  form_fields?: FormField[]; // For form section - array of form fields
  form_submit_text?: MultilingualText; // Submit button text for form
  form_success_message?: MultilingualText; // Success message after submission
  form_api_endpoint?: string; // API endpoint to submit form data
  [key: string]: any; // Allow additional properties for different section types
}

export interface LandingPageImages {
  hero_section?: {
    image: string;
    alt: MultilingualText;
  };
  about_section?: {
    image: string;
    alt: MultilingualText;
  };
  services_section?: {
    image: string;
    alt: MultilingualText;
  };
  testimonials_section?: {
    image: string;
    alt: MultilingualText;
  };
  gallery?: Array<{
    id: number;
    image: string;
    alt: MultilingualText;
    order: number;
  }>;
}

export interface LandingPageSEO {
  // Basic SEO
  meta_title: MultilingualText;
  meta_description: MultilingualText;
  meta_keywords?: MultilingualText;
  focus_keyword?: MultilingualText; // Primary keyword for ranking
  h1_tag?: MultilingualText; // H1 heading for the page
  
  // Technical SEO
  canonical_url?: string;
  meta_robots?: string; // index, noindex, follow, nofollow
  robots_txt?: string; // Custom robots directives
  
  // Open Graph (Facebook, LinkedIn)
  og_title?: MultilingualText;
  og_description?: MultilingualText;
  og_image?: string;
  og_type?: string; // website, article, product, etc.
  og_url?: string;
  og_site_name?: string;
  og_locale?: MultilingualText; // en_US, ar_SA, etc.
  
  // Twitter Card
  twitter_card?: string; // summary, summary_large_image, app, player
  twitter_title?: MultilingualText;
  twitter_description?: MultilingualText;
  twitter_image?: string;
  twitter_site?: string; // @username
  twitter_creator?: string; // @username
  
  // Schema.org Structured Data
  schema_type?: string; // WebPage, Article, Product, Service, Organization, etc.
  schema_data?: any; // JSON-LD structured data
  
  // Additional Meta Tags
  author?: string;
  published_date?: string;
  modified_date?: string;
  article_section?: MultilingualText;
  article_tags?: MultilingualText;
  
  // Language & Localization
  language?: string; // en, ar
  alternate_languages?: Array<{ lang: string; url: string }>; // hreflang
  
  // Advanced SEO
  breadcrumbs?: MultilingualText;
  alt_text?: MultilingualText; // For images
  internal_links?: string[]; // Related internal pages
  external_links?: string[]; // Authoritative external links
}

export interface LandingPage {
  id?: number;
  slug: string;
  name: MultilingualText;
  title: MultilingualText;
  description: MultilingualText;
  meta_title: MultilingualText;
  meta_description: MultilingualText;
  images?: LandingPageImages;
  sections: LandingPageSection[];
  seo?: LandingPageSEO;
  show_in_menu?: boolean; // Whether to show page in menu (default: false)
  show_in_footer?: boolean; // Whether to show page in footer (default: false)
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
  landing_pages?: LandingPage[];
}