'use client';

import { useState } from 'react';
import { PiXBold, PiInfo, PiNotePencil } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Text, Title } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useAddContractCommunication } from '@/framework/contracts';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Contract } from '@/types';
import {
  CONTRACT_TYPE_LABELS,
  formatContractDate,
  OWNER_TYPE_LABELS,
} from '@/app/shared/contracts/contract-utils';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </div>
  );
}

const FORM_TABS: ModalFormTabItem[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

export default function CommunicationForm({ contract }: { contract: Contract }) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useAddContractCommunication();
  const [activeTab, setActiveTab] = useState(0);
  const [communicationDate, setCommunicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const ownerLabel = contract.contract_owner_type
    ? OWNER_TYPE_LABELS[contract.contract_owner_type]
    : 'Not set';
  const typeLabel = contract.contract_type
    ? CONTRACT_TYPE_LABELS[contract.contract_type]
    : 'Not set';
  const displayName = contract.company_name?.trim() || 'Unnamed contract';
  const currentCount = contract.communication_times_count ?? 0;
  const lastCommunication = contract.communication_date
    ? formatContractDate(contract.communication_date)
    : null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutate({ id: contract.id, communication_date: communicationDate });
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  return (
    <form onSubmit={handleSubmit} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiNotePencil className="h-5 w-5 text-white" />
          </div>
          <div>
            <Title as="h4" className="text-lg font-bold text-gray-900">
              Add Communication Date
            </Title>
            <Text className="mt-0.5 text-xs text-gray-400">
              Record a new communication and increment the contact count
            </Text>
          </div>
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={closeModal}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
          aria-label="Close"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>

      <ModalFormTabs
        tabs={FORM_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Contract summary"
              description="Context for this communication"
              contentClassName="sm:grid-cols-1"
            >
              <div className="flex items-start justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-300">
                <div className="min-w-0">
                  <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Contract
                  </Text>
                  <Text className="mt-1 truncate text-base font-semibold text-gray-900">
                    {displayName}
                  </Text>
                </div>
                <Badge variant="flat" className="shrink-0">
                  #{contract.id}
                </Badge>
              </div>
              <div className="space-y-3">
                <InfoRow label="Owner type" value={ownerLabel} />
                <InfoRow label="Contract type" value={typeLabel} />
                {contract.company_location && (
                  <InfoRow label="Location" value={contract.company_location} />
                )}
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="New communication"
              description="This will set the latest date and increase the count by 1"
              contentClassName="sm:grid-cols-1"
            >
              <InfoRow
                label="Times communicated"
                value={
                  <Badge variant="flat" color="info">
                    {currentCount}
                  </Badge>
                }
              />
              {lastCommunication && (
                <InfoRow label="Last communication" value={lastCommunication} />
              )}
              <Input
                label="Communication Date"
                type="date"
                value={communicationDate}
                onChange={(e) => setCommunicationDate(e.target.value)}
                required
              />
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={FORM_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={closeModal}
        isLoading={isPending}
        disabled={isPending}
        cancelLabel="Cancel"
        submitLabel={isPending ? 'Saving...' : 'Add Communication'}
      />
    </form>
  );
}
