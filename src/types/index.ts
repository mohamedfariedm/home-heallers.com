import { CouponType } from '@/config/enums';

export interface Coupon {
  id: string;
  name: string;
  type: CouponType;
  slug: string;
  amount?: string;
  code?: string;
}

export interface Address {
  customerName?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  street?: string;
}

export interface GoogleMapLocation {
  lat?: number;
  lng?: number;
  street_number?: string;
  route?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  formattedAddress?: string;
}

export type ProductColor = {
  name?: string;
  code?: string;
};

export interface CartItem {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  image: string;
  color?: ProductColor | null;
  price: number;
  salePrice?: number;
  quantity: number;
  size: number;
  stock?: number;
  discount?: number;
}

export type Product = {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  price: number;
  sale_price?: number;
  thumbnail: string;
  colors?: ProductColor[];
  sizes?: number[];
  base64?: string;
};

export type PosProduct = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  salePrice: number;
  quantity: number;
  size: number;
  discount: number;
  base64?: string;
};
export interface CalendarEvent {
  id?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  title: string;
  description?: string;
  location?: string;
}

export interface SearchParamOptions {
  type: string;
  name: string;
  categories: string;
  tags: string;
  author: string;
  price: string;
  manufacturer: string;
  status: string;
  is_active: string;
  shop_id: string;
  min_price: string;
  max_price: string;
  rating: string;
  question: string;
  notice: string;
}

export interface CreateRuleInput {
  name: any;
  permissions: number[]
}
export interface CreateBrandInput {
  name: string;
  permission?: number[]
}

export interface IPermission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  created_at?: Date,
}
export interface UserInput {
  user_id?: number;
  name: any;
  phone?: string;
  gendor?: number;
  mac_id?: string;
  email: string;
  image?:any;
  password:any;
  password_confirmation:any;
  roles:any;
}

export interface Region {
  region_id?: number;
  id?: number;
  name: string;
  en_name?: string;
  ar_name?: string;
  is_active: number;
  created_at?: Date,
}

export interface City {
  id?: number;
  city_id?: number;
  name: string;
  region_id?: number;
  is_active: number;
  created_at?: Date;
}

export interface Retailer {
  id?: number;
  retailer_id?: number;
  name: string;
  is_active: number;
  created_at?: Date;
  title?:string;
}

export interface Store {
  id?: number;
  store_id?: number;
  store_code:string;
  image?:any;
  name: string;
  is_active: number;
  region_id: number;
  city_id: number;
  retailer_id: number;
  // channel_code: string;
  type: string;
  contact_number: string;
  address: string;
  contact_email: string;
  created_at?: Date;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    token: string;
    permissions: string[];
    role: string;
    id:string;
  }
}

export interface Category {
  id?: string;
  name: string;
  is_active: number;
  priority: string;
  category_id?: string | null;
  created_at?: Date;
  en_name?: string;
  ar_name?: string;
  parent_category?: string | null;
  type?:string;
  grand_parent_category?:any;
}

export interface Journey {
  id?: string;
  store_id: string;
  user_id: string;
  priority: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  journey_id?: string;
  parent_category?: string;
}
export interface Inquerie {
  inquiry_id:string,
  response:string,
  seen:string
}
export interface features_categories {
  name: string;
  is_active: number;
  category_id?: string | null;
}

export interface Products {
  id?: number;
  product_id?: number;
  category_id: number;
  sub_category_id?: number;
  brand_id: number;
  barcode: string;
  model: string;
  sku_code:string;
  description: string;
  features: number[];
  image?:any;
}
export interface stock {
  product_id?: number;
  store_id:number;
  price:number;
  quentity:number;
  discount:number;
  stock_id?:number;
}

export interface Target {
  target_id?: number;
  user_id: number;
  store_id: number;
  product_id: number;
  tgt_quentity: string;
  tgt_value: string;
  date: string;
}
export interface notifications {
  users_type:string,
  title:string,
  body:string,
  image?:string,
  users?:any,
}

export type ContractOwnerType = 'company' | 'doctor';
export type ContractType = 'offline' | 'online';

export type ContractAttachmentType =
  | 'signed_contract'
  | 'manager_id'
  | 'commercial_registration'
  | 'national_address'
  | 'bank_iban'
  | 'vat_certificate'
  | 'national_id'
  | 'other';

export interface ContractAssignedUser {
  id: number;
  name: string | { en?: string; ar?: string };
  email?: string | null;
}

export interface ContractAttachment {
  id: number;
  type: ContractAttachmentType | string;
  notes?: string | null;
  file_url: string;
  file_name?: string | null;
  created_at?: string | null;
  thumbnail?: string | null;
}

export interface Contract {
  id: number;
  contract_owner_type?: ContractOwnerType | null;
  contract_type?: ContractType | null;
  visit_date?: string | null;
  last_date?: string | null;
  visit_time?: string | null;
  last_time?: string | null;
  communication_date?: string | null;
  communication_times_count?: number | null;
  service_manager_name?: string | null;
  last_service_manager?: string | null;
  company_activity?: string | null;
  company_activity_custom?: string | null;
  company_location?: string | null;
  company_name?: string | null;
  manager_name?: string | null;
  manager_mobile?: string | null;
  manager_email?: string | null;
  visit_summary?: string | null;
  visit_type?: string | null;
  next_visit_at?: string | null;
  meeting_postponed_note?: string | null;
  requirements?: string | null;
  sales_rep_notes?: string | null;
  center_interest_level?: number | null;
  website?: string | null;
  social_media_links?: string[] | null;
  attachments?: ContractAttachment[] | null;
  assigned_to?: number | null;
  assigned_user?: ContractAssignedUser | null;
  creator?: ContractAssignedUser | null;
  updater?: ContractAssignedUser | null;
  /** @deprecated Use attachments endpoint instead */
  document_signed_contract_path?: string | null;
  document_signed_contract_url?: string | null;
  document_manager_id_path?: string | null;
  document_manager_id_url?: string | null;
  document_commercial_reg_path?: string | null;
  document_commercial_reg_url?: string | null;
  document_optional_path?: string | null;
  document_optional_url?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ContractResponse {
  data: Contract[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
  message: string;
}

export interface ContractFormInput {
  contract_owner_type?: ContractOwnerType | null;
  contract_type?: ContractType | null;
  visit_date?: string;
  visit_time?: string;
  visit_type?: string;
  visit_summary?: string;
  company_location?: string;
  center_interest_level?: number | null;
  company_name?: string;
  company_activity?: string;
  company_activity_custom?: string;
  manager_name?: string;
  manager_mobile?: string;
  manager_email?: string;
  requirements?: string;
  sales_rep_notes?: string;
  communication_date?: string | null;
  communication_times_count?: number | null;
  website?: string;
  social_media_links?: string;
  assigned_to?: number | null;
}

export interface ContractNotesInput {
  sales_rep_notes?: string;
  requirements?: string;
}