import { Contract, ContractFormInput, ContractOwnerType, ContractType } from '@/types';

export const OWNER_TYPE_LABELS: Record<ContractOwnerType, string> = {
  doctor: 'Doctor',
  company: 'Company',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  offline: 'Offline',
  online: 'Online',
};

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

export function normalizeContractForForm(contract: Contract): ContractFormInput {
  return {
    contract_owner_type: contract.contract_owner_type ?? undefined,
    contract_type: contract.contract_type ?? 'offline',
    visit_date: formatContractDate(contract.visit_date),
    visit_time: formatContractTime(contract.visit_time),
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
  };
}
