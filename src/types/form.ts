export interface MultiLangText {
  en: string;
  ar: string;
  value?: number;
}

export interface FormItem {
  id: number;
  title?: MultiLangText;
  description?: MultiLangText;
  attachment?: any[];
  section_id: number;
  active: number;
  created_at: string;
  updated_at: string;
  additional?: {
    link?: string;
    date?: MultiLangText;
  };
  children?: FormItem[];
}

export interface Section {
  id: number;
  title: MultiLangText;
  page_id: number;
  active: number;
  style?: any;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface FormData {
  data: FormItem[];
  section: Section;
  message: string;
}

export interface FieldConfig {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'file' | 'url';
  label: string;
  required?: boolean;
  placeholder?: string;
}