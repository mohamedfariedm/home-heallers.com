export interface AppMessageBilingual {
  ar: string;
  en: string;
}

// Set by the backend (always 'doctor' for now); not editable from the dashboard.
export type AppMessageAudience = 'doctor' | 'client';

export type AppMessageLang = 'ar' | 'en';

export type AppMessageStatusFilter = 'all' | 'active' | 'inactive';

export interface AppMessage {
  id: number;
  title: AppMessageBilingual;
  description: AppMessageBilingual;
  audience: AppMessageAudience;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppMessageInput {
  title: AppMessageBilingual;
  description: AppMessageBilingual;
  is_active?: boolean;
}

export interface AppMessagesFilters {
  status: AppMessageStatusFilter;
  search: string;
  page: number;
  limit: number;
}

export interface AppMessagesPage {
  data: AppMessage[];
  total: number;
  currentPage: number;
  lastPage: number;
}
