export type OtpActorType = 'client' | 'doctor';

export interface TranslatableName {
  en?: string;
  ar?: string;
}

export interface OtpCodeRow {
  id: number;
  type: OtpActorType;
  name: TranslatableName | null;
  email: string | null;
  mobile: string | null;
  national_id: string | null;
  status: boolean | null;
  otp: string | null;
  otp_expires_at: string | null;
  is_expired: boolean;
  created_at: string;
}

/** Table row with composite key so client/doctor ids never collide in rc-table. */
export interface OtpCodeTableRow extends Omit<OtpCodeRow, 'id'> {
  id: string;
  entity_id: number;
}

export interface OtpCodesListResponse {
  data: OtpCodeRow[];
  message: string;
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface OtpCodeMutationResponse {
  data: OtpCodeRow;
  message: string;
}

export interface UpdateOtpCodePayload {
  otp?: string | null;
  otp_expires_at?: string | null;
}
