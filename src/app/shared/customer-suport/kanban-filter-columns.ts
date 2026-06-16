import {
  LEADS_QUALIFICATION_FIELDS,
  type LeadsQualificationFieldKey,
} from './leads-qualification-constants';

export const KANBAN_STANDARD_FILTER_COLUMNS = [
  'name',
  'offer',
  'agent_name',
  'status',
  'reason',
  'age',
  'gender',
  'lead_source',
  'source_campaign',
  'mobile_phone',
  'booking_phone_number',
  'home_phone',
  'address_1',
  'city',
  'state',
  'description',
  'first_call_time',
  'last_call_result',
  'last_call_total_duration',
  'last_phone',
  'notes',
  'ads_name',
  'communication_channel',
  'specialtie_1',
  'specialtie_2',
  'specialtie_3',
] as const;

export const KANBAN_QUALIFICATION_FILTER_COLUMNS =
  LEADS_QUALIFICATION_FIELDS.map((field) => field.key);

export const KANBAN_FILTERABLE_COLUMNS = [
  ...KANBAN_STANDARD_FILTER_COLUMNS,
  ...KANBAN_QUALIFICATION_FILTER_COLUMNS,
] as const;

const qualificationKeySet = new Set<string>(
  KANBAN_QUALIFICATION_FILTER_COLUMNS
);

export function isLeadsQualificationFilterKey(
  key: string
): key is LeadsQualificationFieldKey {
  return qualificationKeySet.has(key);
}

export function getKanbanFilterColumnLabel(columnKey: string): string {
  const qualificationField = LEADS_QUALIFICATION_FIELDS.find(
    (field) => field.key === columnKey
  );
  if (qualificationField) return qualificationField.question;

  return columnKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
