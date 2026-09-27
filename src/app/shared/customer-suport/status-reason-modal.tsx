'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { ActionIcon } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  LEAD_STATUS_REASONS,
  type LeadStatusReason,
} from '@/config/dashboard-enums';

interface StatusReasonModalProps {
  itemName?: string | null;
  targetStatus: 'failed' | 'closed';
  onConfirm: (payload: { status_reason: LeadStatusReason; notes?: string }) => void;
  onCancel: () => void;
}

export default function StatusReasonModal({
  itemName,
  targetStatus,
  onConfirm,
  onCancel,
}: StatusReasonModalProps) {
  const { closeModal } = useModal();
  const [statusReason, setStatusReason] = useState<LeadStatusReason | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    onCancel();
    closeModal();
  };

  const handleSubmit = () => {
    if (!statusReason) {
      setError('Status reason is required');
      return;
    }
    if (statusReason === 'other' && !notes.trim()) {
      setError('Notes are required when reason is Other');
      return;
    }
    onConfirm({
      status_reason: statusReason,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    closeModal();
  };

  return (
    <div className="m-auto px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7">
      <div className="mb-6 flex items-center justify-between">
        <Title as="h3" className="text-lg font-semibold">
          Reason for {targetStatus === 'failed' ? 'Failed' : 'Closed'}
          {itemName ? ` — ${itemName}` : ''}
        </Title>
        <ActionIcon size="sm" variant="text" onClick={handleClose}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Status reason</label>
          <select
            className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600"
            value={statusReason}
            onChange={(e) => {
              setStatusReason(e.target.value as LeadStatusReason);
              setError('');
            }}
          >
            <option value="">Select reason</option>
            {LEAD_STATUS_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {statusReason === 'other' && (
          <div>
            <label className="mb-1 block text-sm font-medium">Notes (required)</label>
            <textarea
              className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError('');
              }}
              placeholder="Explain the reason"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm status change</Button>
        </div>
      </div>
    </div>
  );
}
