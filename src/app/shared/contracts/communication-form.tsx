'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text, Title } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
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
      <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </div>
  );
}

export default function CommunicationForm({ contract }: { contract: Contract }) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useAddContractCommunication();
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

  return (
    <form onSubmit={handleSubmit} className="flex max-h-[min(90vh,560px)] flex-col">
      <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 pb-4 pt-6 dark:border-gray-300">
        <div>
          <Title as="h4" className="text-lg font-semibold">
            Add Communication Date
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Record a new communication and increment the contact count.
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal} aria-label="Close">
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-300 dark:bg-gray-100/40">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-200 pb-3 dark:border-gray-300">
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
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-300">
          <Text className="mb-1 text-sm font-semibold text-gray-900">New communication</Text>
          <Text className="mb-4 text-xs text-gray-500">
            This will set the latest communication date and increase the count by 1.
          </Text>
          <Input
            label="Communication Date"
            type="date"
            value={communicationDate}
            onChange={(e) => setCommunicationDate(e.target.value)}
            required
          />
        </section>
      </div>

      <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-300">
        <Button type="button" variant="outline" onClick={closeModal} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="min-w-[160px]">
          {isPending ? 'Saving...' : 'Add Communication'}
        </Button>
      </div>
    </form>
  );
}
