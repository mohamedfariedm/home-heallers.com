'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import SelectBox from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateCreditNote } from '@/framework/zatca';
import { useRouter } from 'next/navigation';
import type { ZatcaInvoice, ZatcaMode } from '@/types/zatca';

export default function CreateCreditNoteButton({ invoice }: { invoice: ZatcaInvoice }) {
  const { openModal, closeModal } = useModal();
  const router = useRouter();
  const { mutate, isPending } = useCreateCreditNote();
  const [amount, setAmount] = useState(String(invoice.grand_total ?? ''));
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<ZatcaMode>('reporting');
  const [amountError, setAmountError] = useState('');

  const visible =
    invoice.document_type === 'INVOICE' &&
    invoice.zatca_status &&
    ['REPORTED', 'REPORTED_WITH_WARNINGS', 'CLEARED'].includes(invoice.zatca_status);

  if (!visible) return null;

  const submit = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setAmountError('Amount must be greater than 0');
      return;
    }
    if (num > invoice.grand_total) {
      setAmountError('Amount cannot exceed original grand total');
      return;
    }
    if (!reason.trim()) return;
    mutate(
      { id: invoice.id, amount: num, adjustment_reason: reason.trim(), mode },
      {
        onSuccess: (res) => {
          closeModal();
          const newId = res.data?.data?.invoice_id;
          if (newId) router.push(`/invoices/${newId}`);
        },
        onError: (err: any) => {
          if (err?.response?.status === 422) setAmountError(err.message);
        },
      }
    );
  };

  return (
    <Button
      variant="outline"
      onClick={() =>
        openModal({
          customSize: '520px',
          view: (
            <div className="p-6">
              <Text className="mb-4 text-lg font-semibold">Create credit note</Text>
              <Input
                label="Amount (SAR)"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                error={amountError}
                className="mb-3"
              />
              <Textarea
                label="Reason"
                placeholder="Customer return, service not delivered…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mb-3"
              />
              <SelectBox
                label="Mode"
                options={[
                  { value: 'reporting', label: 'Reporting' },
                  { value: 'clearance', label: 'Clearance' },
                ]}
                value={mode}
                onChange={(v: ZatcaMode) => setMode(v)}
                className="mb-3"
              />
              <Text className="mb-4 text-sm text-gray-600">
                This will refund {amount} SAR (incl. {invoice.tax_total ?? 0} SAR VAT) to{' '}
                {invoice.customer_name}
              </Text>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button isLoading={isPending} onClick={submit}>
                  Issue credit note
                </Button>
              </div>
            </div>
          ),
        })
      }
    >
      Create credit note
    </Button>
  );
}
