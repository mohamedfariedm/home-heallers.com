'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import {
  RESERVATION_STATUS_OPTIONS,
  ReservationStatus,
} from '@/utils/reservation-payment';
import { useUpdateReservationStatus } from '@/framework/reservations';

interface ConfirmCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
  onSuccess?: (updatedReservation: any) => void;
}

export default function ConfirmCashPaymentModal({
  isOpen,
  onClose,
  reservationId,
  onSuccess,
}: ConfirmCashPaymentModalProps) {
  const [status, setStatus] = useState<number>(ReservationStatus.Confirmed);
  const [notes, setNotes] = useState('');
  const { mutate: updateStatus, isPending } = useUpdateReservationStatus();

  const handleClose = () => {
    if (isPending) return;
    setStatus(ReservationStatus.Confirmed);
    setNotes('');
    onClose();
  };

  const handleSubmit = () => {
    updateStatus(
      {
        reservation_id: reservationId,
        status,
        paid: true,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (updatedReservation) => {
          onSuccess?.(updatedReservation);
          setStatus(ReservationStatus.Confirmed);
          setNotes('');
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <Title as="h4" className="text-lg font-semibold text-gray-900">
          Confirm & mark paid
        </Title>
        <Text as="p" className="mt-1 text-sm text-gray-500">
          Mark cash as collected and update reservation #{reservationId}.
        </Text>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(Number(event.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {RESERVATION_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Cash collected at patient home"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isPending}>
            Confirm & mark paid
          </Button>
        </div>
      </div>
    </Modal>
  );
}
