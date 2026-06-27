/** Shared leads summary (aggregates endpoint) */
export interface LeadsSummary {
  total_leads: number;
  qualified_leads: number;
  /** Percentage 0–100 scale with 2 decimals (e.g. 0.26 = 0.26%) */
  lead_quality_rate: number;
}

/** Customer supports — lead quality per campaign */
export interface LeadQualityBySourceCampaign {
  source_campaign: string;
  total_leads: number;
  qualified_leads: number;
  lead_quality_rate: number;
  link: string;
}

/** Customer supports — qualification answer bucket */
export interface LeadsQualificationAnswerBucket {
  answer: 'yes' | 'no';
  count: number;
  link: string;
}

/** Customer supports — per-question qualification stats */
export interface LeadsQualificationStatItem {
  key: string;
  label: string;
  by_answer: LeadsQualificationAnswerBucket[];
}

/** Customer supports — statistics block */
export interface CustomerSupportStatistics {
  total: number;
  by_status: Array<{ status: string | null; count: number; link: string }>;
  clients_with_mobile_and_reservation: number;
  clients_with_mobile_and_multiple_reservations?: number;
  by_source_campaign?: Array<{
    source_campaign: string;
    count: number;
    link: string;
  }>;
  lead_quality_by_source_campaign?: LeadQualityBySourceCampaign[];
  by_leads_qualification?: LeadsQualificationStatItem[];
  by_communication_channel?: Array<{
    communication_channel: string;
    count: number;
    link: string;
  }>;
  by_offer?: Array<{ offer: string; count: number; link: string }>;
  by_city?: Array<{ city: string; count: number; link: string }>;
  by_state?: Array<{ state: string; count: number; link: string }>;
  leads?: LeadsSummary;
}
