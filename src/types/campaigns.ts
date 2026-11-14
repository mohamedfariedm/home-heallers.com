export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed'] as const;
export const CAMPAIGN_PLATFORMS = [
  'meta',
  'google',
  'tiktok',
  'website',
  'application',
  'other',
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type CampaignPlatform = (typeof CAMPAIGN_PLATFORMS)[number];

export interface Campaign {
  id: number;
  name: string;
  source_campaign: string;
  platform: CampaignPlatform | null;
  start_date: string | null;
  end_date: string | null;
  budget: string | null;
  currency: string;
  status: CampaignStatus;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CampaignPayload {
  name: string;
  source_campaign: string;
  platform: CampaignPlatform | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: CampaignStatus;
  description: string | null;
  confirm_source_campaign_change?: boolean;
}
