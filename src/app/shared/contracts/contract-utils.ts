import {
  Contract,
  ContractAttachmentType,
  ContractFormInput,
  ContractOwnerType,
  ContractType,
} from '@/types';

export const OWNER_TYPE_LABELS: Record<ContractOwnerType, string> = {
  doctor: 'Doctor',
  company: 'Company',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  offline: 'Offline',
  online: 'Online',
};

export const ATTACHMENT_TYPE_LABELS: Record<ContractAttachmentType, string> = {
  signed_contract: 'Signed Contract',
  manager_id: 'Manager ID',
  commercial_registration: 'Commercial Registration',
  national_address: 'National Address',
  bank_iban: 'Bank IBAN',
  vat_certificate: 'VAT Certificate',
  national_id: 'National ID',
  other: 'Other',
};

export const ATTACHMENT_TYPE_OPTIONS = (
  Object.keys(ATTACHMENT_TYPE_LABELS) as ContractAttachmentType[]
).map((value) => ({
  value,
  label: ATTACHMENT_TYPE_LABELS[value],
  name: value,
}));

/** Users / API often return name as `{ en, ar }` instead of a plain string. */
export function resolveLocalizedName(
  name?: string | { en?: string; ar?: string } | null
): string {
  if (!name) return '';
  if (typeof name === 'string') return name;
  return name.en || name.ar || '';
}

export function formatContractDate(value?: string | null) {
  if (!value) return '—';
  return value.split('T')[0];
}

export function formatContractTime(value?: string | null) {
  if (!value) return '—';
  if (value.includes('T')) {
    return value.split('T')[1]?.slice(0, 5) ?? value;
  }
  return value.slice(0, 5);
}

export function socialLinksToText(links?: string[] | null) {
  if (!links?.length) return '';
  return links.filter(Boolean).join('\n');
}

export function textToSocialLinks(value?: string | null) {
  if (!value?.trim()) return undefined;
  const links = value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return links.length ? links : undefined;
}

export function normalizeContractForForm(contract: Contract): ContractFormInput {
  return {
    contract_owner_type: contract.contract_owner_type ?? undefined,
    contract_type: contract.contract_type ?? undefined,
    visit_date:
      contract.visit_date && contract.visit_date !== '—'
        ? formatContractDate(contract.visit_date)
        : '',
    visit_time:
      contract.visit_time && contract.visit_time !== '—'
        ? formatContractTime(contract.visit_time)
        : '',
    visit_type: contract.visit_type ?? '',
    visit_summary: contract.visit_summary ?? '',
    company_location: contract.company_location ?? '',
    center_interest_level: contract.center_interest_level ?? undefined,
    company_name: contract.company_name ?? '',
    company_activity: contract.company_activity ?? '',
    company_activity_custom: contract.company_activity_custom ?? '',
    manager_name: contract.manager_name ?? '',
    manager_mobile: contract.manager_mobile ?? '',
    manager_email: contract.manager_email ?? '',
    requirements: contract.requirements ?? '',
    sales_rep_notes: contract.sales_rep_notes ?? '',
    communication_date: contract.communication_date
      ? formatContractDate(contract.communication_date)
      : null,
    communication_times_count: contract.communication_times_count ?? null,
    website: contract.website ?? '',
    social_media_links: socialLinksToText(contract.social_media_links),
    assigned_to: contract.assigned_to ?? null,
  };
}
