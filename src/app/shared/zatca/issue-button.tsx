'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SelectBox from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useIssueInvoice } from '@/framework/zatca';
import { useZatcaPolling } from '@/app/shared/zatca/use-zatca-polling';
import type { ZatcaInvoice, ZatcaMode } from '@/types/zatca';

export default function IssueButton({
  invoice,
  onRefetch,
}: {
  invoice: ZatcaInvoice;
  onRefetch?: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { mutate: issue, isPending } = useIssueInvoice();
  const [mode, setMode] = useState<ZatcaMode>('reporting');
  const [pollStatus, setPollStatus] = useState(invoice.zatca_status);

  useZatcaPolling(invoice.id, pollStatus, {
    enabled: isPending || pollStatus === 'QUEUED' || pollStatus === 'SUBMITTING',
    onTerminal: () => {
      onRefetch?.();
      closeModal();
    },
  });

  if (invoice.business_status !== 'DRAFT' || invoice.is_locked) return null;

  const confirmIssue = () => {
    issue(
      { id: invoice.id, mode },
      {
        onSuccess: (res) => {
          const status = res.data?.data?.zatca_status ?? 'QUEUED';
          setPollStatus(status);
        },
      }
    );
  };

  return (
    <Button
      isLoading={isPending}
      onClick={() =>
        openModal({
          view: (
            <div className="p-6">
              <Text className="mb-4 text-lg font-semibold">Issue & submit to ZATCA</Text>
              <Text className="mb-4 text-gray-600">
                Once issued, this invoice cannot be edited. Continue?
              </Text>
              <SelectBox
                label="Submission mode"
                options={[
                  { value: 'reporting', label: 'Reporting' },
                  { value: 'clearance', label: 'Clearance' },
                ]}
                value={mode}
                onChange={(v: ZatcaMode) => setMode(v)}
                className="mb-4"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button isLoading={isPending} onClick={confirmIssue}>
                  {isPending ? 'Queueing…' : 'Issue & submit'}
                </Button>
              </div>
            </div>
          ),
        })
      }
    >
      Issue & submit to ZATCA
    </Button>
  );
}
