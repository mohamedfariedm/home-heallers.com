/** Canonical values of the backend `App\Enums\SourceCampaign`. */
export const SOURCE_CAMPAIGN_OPTIONS = [
  { value: 'google', label: 'Google' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' },
  { value: 'website', label: 'Website' },
  { value: 'mobile_application', label: 'Mobile Application' },
  { value: 'referral', label: 'Referral' },
  { value: 'center', label: 'Center' },
  { value: 'other', label: 'Other' },
];

export const NOT_SPECIFIED_LABEL = 'Not Specified';

/** Statistics filter value the backend reads as "no source campaign". */
export const SOURCE_CAMPAIGN_NOT_SPECIFIED_VALUE = 'null';

export const formatSourceCampaign = (value?: string | null) => value || NOT_SPECIFIED_LABEL;
