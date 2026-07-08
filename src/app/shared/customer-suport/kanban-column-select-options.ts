/** Options aligned with `suport-form.tsx` selects — used for kanban column filters. */

import { isLeadsQualificationFilterKey } from './kanban-filter-columns';

export const kanbanStatusOptions = [

  { label: 'New', value: 'new' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Success', value: 'success' },
  { label: 'Possible', value: 'possible' },
  { label: 'Failed', value: 'failed' },
];

export const kanbanSourceCampaignOptions = [
  { label: 'Google', value: 'google' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Snapchat', value: 'snapchat' },
  { label: 'Telegram', value: 'telegram' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Mobile Application', value: 'mobile_application' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Website', value: 'website' },
  { label: 'Referral', value: 'referral' },
  { label: 'Center', value: 'center' },
  { label: 'Other', value: 'other' },
];

export const kanbanGenderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

export const kanbanCommunicationChannelOptions = [
  { label: 'Call', value: 'Call' },
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Lead Form', value: 'Lead Form' },
];

export const kanbanSpecialtyOptions = [
  { label: 'Physiotherapy', value: 'Physiotherapy' },
  { label: 'Nursing visits', value: 'Nursing visits' },
  { label: 'Doctors visits', value: 'Doctors visits' },
  { label: 'Caregivers', value: 'Caregivers' },
  { label: 'Extendcare', value: 'Extendcare' },
];

export const kanbanYesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

/** No separate list in the lead form; same channel set as Source for consistent filtering. */
export const kanbanLeadSourceOptions = kanbanSourceCampaignOptions;

const specialtyKeys = new Set(['specialtie_1', 'specialtie_2', 'specialtie_3']);

export function getKanbanColumnSelectPlaceholder(columnKey: string): string {
  if (columnKey === 'status') return 'Select status';
  if (columnKey === 'offer') return 'Select offer';
  if (columnKey === 'gender') return 'Select gender';
  if (columnKey === 'lead_source') return 'Select lead source';
  if (columnKey === 'source_campaign') return 'Select source';
  if (columnKey === 'communication_channel') return 'Select channel';
  if (columnKey === 'nationality_name') return 'Select nationality';
  if (columnKey === 'country_name') return 'Select country';
  if (columnKey === 'city_name') return 'Select city';
  if (specialtyKeys.has(columnKey)) return 'Select specialty';
  if (isLeadsQualificationFilterKey(columnKey)) return 'Select answer';
  return 'Select';
}

export function getKanbanStaticSelectOptions(
  columnKey: string
): { label: string; value: string }[] | null {
  switch (columnKey) {
    case 'status':
      return kanbanStatusOptions;
    case 'gender':
      return kanbanGenderOptions;
    case 'lead_source':
      return kanbanLeadSourceOptions;
    case 'source_campaign':
      return kanbanSourceCampaignOptions;
    case 'communication_channel':
      return kanbanCommunicationChannelOptions;
    case 'specialtie_1':
    case 'specialtie_2':
    case 'specialtie_3':
      return kanbanSpecialtyOptions;
    default:
      if (isLeadsQualificationFilterKey(columnKey)) {
        return kanbanYesNoOptions;
      }
      return null;
  }
}
