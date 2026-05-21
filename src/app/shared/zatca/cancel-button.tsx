'use client';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCancelInvoice } from '@/framework/zatca';
import type { ZatcaInvoice } from '@/types/zatca';

export default function CancelButton({
  invoice,
  onSuccess,
}: {
  invoice: ZatcaInvoice;
  onSuccess?: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { mutate: cancel, isPending } = useCancelInvoice();

  const canCancel =
    invoice.business_status === 'DRAFT' &&
    (!invoice.zatca_status || invoice.zatca_status === 'NOT_SUBMITTED');

  if (!canCancel) return null;

  return (
    <Button
      variant="outline"
      className="border-red-300 text-red-700"
      onClick={() =>
        openModal({
          view: (
            <div className="p-6">
              <Text className="mb-4 text-lg font-semibold">Cancel invoice</Text>
              <Text className="mb-4 text-gray-600">
                Cancel this invoice? This cannot be undone.
              </Text>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeModal}>
                  Back
                </Button>
                <Button
                  color="danger"
                  isLoading={isPending}
                  onClick={() =>
                    cancel(invoice.id, {
                      onSuccess: () => {
                        closeModal();
                        onSuccess?.();
                      },
                    })
                  }
                >
                  Cancel invoice
                </Button>
              </div>
            </div>
          ),
        })
      }
    >
      Cancel
    </Button>
  );
}
