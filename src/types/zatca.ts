export type BusinessStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED';
export type ZatcaStatus =
  | 'NOT_SUBMITTED'
  | 'QUEUED'
  | 'SUBMITTING'
  | 'REPORTED'
  | 'CLEARED'
  | 'REPORTED_WITH_WARNINGS'
  | 'REJECTED'
  | 'FAILED'
  | null;
export type ValidationStatus = 'VALID' | 'WARNING' | 'ERROR' | null;
export type DocumentType = 'INVOICE' | 'CREDIT_NOTE' | 'DEBIT_NOTE';
export type ZatcaMode = 'reporting' | 'clearance';
export type XmlKind = 'original' | 'signed' | 'cleared';

export interface ZatcaAdjustment {
  id: number;
  invoice_number: string;
  document_type: DocumentType;
  adjustment_reason?: string;
  grand_total: number;
  zatca_status: ZatcaStatus;
  created_at: string;
}

export interface ZatcaParent {
  id: number;
  invoice_number: string;
  uuid?: string;
  grand_total: number;
  zatca_status: ZatcaStatus;
}

export interface ZatcaSubmission {
  id: number;
  invoice_id: number;
  attempt_number: number;
  mode: ZatcaMode;
  status: ZatcaStatus;
  validation_status: ValidationStatus;
  warning_count: number;
  error_count: number;
  warnings: Array<{ code: string; category: string; message: string }> | null;
  errors: Array<{ code: string; category: string; message: string }> | null;
  invoice_hash?: string;
  zatca_uuid?: string;
  chain_position?: number;
  submitted_at?: string;
  response_received_at?: string;
  has_signed_xml?: boolean;
  has_original_xml?: boolean;
  has_cleared_xml?: boolean;
  has_qr?: boolean;
  device?: { id: number; name: string; environment: string };
  triggered_by_user?: { id: number; name: string };
}

export interface ZatcaInvoice {
  id: number;
  invoice_number: string;
  uuid?: string;
  invoice_date: string;
  customer_name: string;
  client_id?: number;
  national_id?: string | null;
  doctor_id?: number;
  category_id?: number;
  category_code?: string;
  service_name?: string;
  session_price?: number;
  session_count?: number;
  discount?: number;
  total_before_tax?: number;
  tax_total?: number;
  grand_total: number;
  tax_percentage?: string;
  balance_due?: number;
  status?: string | null;
  is_paid?: boolean;
  business_status: BusinessStatus;
  zatca_status: ZatcaStatus;
  validation_status: ValidationStatus;
  zatca_invoice_hash?: string;
  zatca_submitted_at?: string;
  submission_attempts?: number;
  warning_count?: number;
  error_count?: number;
  is_locked: boolean;
  locked_at?: string;
  document_type: DocumentType;
  parent_invoice_id?: number | null;
  adjustment_reason?: string | null;
  parent?: ZatcaParent | null;
  adjustments?: ZatcaAdjustment[];
  client?: { id: number; name: string; national_id?: string };
  doctor?: { id: number; name: string };
  category?: { id: number; name: string; code?: string };
  last_submission?: ZatcaSubmission | null;
  creator?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface ZatcaPaginatedResponse<T> {
  data: T[];
  links?: Record<string, string | null>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    path?: string;
  };
}

export interface ZatcaQrResponse {
  base64: string;
  decoded: Array<{ tag: number; name: string; value: string }>;
}

export interface ZatcaXmlResponse {
  kind: XmlKind;
  xml: string;
  invoice_number: string;
  attempt_number: number;
}

export interface ZatcaRevalidateResponse {
  success: boolean;
  message: string;
  errors: Array<{ code: string; category: string; message: string }>;
  warnings: Array<{ code: string; category: string; message: string }>;
  data?: { xml_hash: string | null };
}

export const TERMINAL_ZATCA_STATUSES: ZatcaStatus[] = [
  'REPORTED',
  'CLEARED',
  'REPORTED_WITH_WARNINGS',
  'REJECTED',
  'FAILED',
];

export const ACTIVE_ZATCA_STATUSES: ZatcaStatus[] = ['QUEUED', 'SUBMITTING'];

export function isTerminalZatcaStatus(status: ZatcaStatus): boolean {
  return status != null && TERMINAL_ZATCA_STATUSES.includes(status);
}

export function isActiveZatcaStatus(status: ZatcaStatus): boolean {
  return status != null && ACTIVE_ZATCA_STATUSES.includes(status);
}
