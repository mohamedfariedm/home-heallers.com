export const LEADS_QUALIFICATION_FIELDS = [
  { key: 'inside_ksa', question: 'Inside KSA' },
  {
    key: 'needs_home_healers_services',
    question: 'Need home healers services (All home healers services)',
  },
  { key: 'city_coverage_service', question: 'City coverage services' },
  {
    key: 'answered_by_call_or_whatsapp',
    question: 'Answered by call or WhatsApp message',
  },
  { key: 'reservation_interested', question: 'Reservation interested' },
  {
    key: 'serious_inquiry_interested',
    question: 'Serious inquiries interested',
  },
  {
    key: 'valid_reachable_phone',
    question: 'Correct phone number and can be communicated',
  },
  { key: 'price_accepted', question: 'Price accepted' },
] as const;

export type LeadsQualificationFieldKey =
  (typeof LEADS_QUALIFICATION_FIELDS)[number]['key'];

export type LeadsQualificationAnswer = 'yes' | 'no' | null;

export interface LeadsQualificationQuestion {
  key: LeadsQualificationFieldKey;
  question: string;
  answer: LeadsQualificationAnswer;
}

export interface LeadsQualification {
  id: number;
  customer_support_id: number;
  qualified: boolean;
  questions?: LeadsQualificationQuestion[];
  inside_ksa?: LeadsQualificationAnswer;
  needs_home_healers_services?: LeadsQualificationAnswer;
  city_coverage_service?: LeadsQualificationAnswer;
  answered_by_call_or_whatsapp?: LeadsQualificationAnswer;
  reservation_interested?: LeadsQualificationAnswer;
  serious_inquiry_interested?: LeadsQualificationAnswer;
  valid_reachable_phone?: LeadsQualificationAnswer;
  price_accepted?: LeadsQualificationAnswer;
  created_at?: string;
  updated_at?: string;
}
