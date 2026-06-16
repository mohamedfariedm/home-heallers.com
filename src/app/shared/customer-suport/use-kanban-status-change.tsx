'use client';

import { useCallback } from 'react';
import { useModal } from '@/app/shared/modal-views/use-modal';
import client from '@/framework/utils';
import {
  extractQualificationRecord,
  isQualificationComplete,
} from '@/app/shared/customer-suport/leads-qualification-utils';
import LeadsQualificationModal from '@/app/shared/customer-suport/leads-qualification-modal';
import { LeadsQualification } from '@/app/shared/customer-suport/leads-qualification-constants';
import toast from 'react-hot-toast';

interface UseKanbanStatusChangeOptions {
  allItems: any[];
  canMoveStatus: boolean;
  updateCustomerSupport: (data: any) => void;
}

export function useKanbanStatusChange({
  allItems,
  canMoveStatus,
  updateCustomerSupport,
}: UseKanbanStatusChangeOptions) {
  const { openModal, closeModal } = useModal();

  const handleStatusChange = useCallback(
    async (
      itemId: number,
      newStatus: string,
      oldStatus: string
    ): Promise<boolean> => {
      if (!canMoveStatus) return false;
      if (newStatus.toLowerCase() === oldStatus.toLowerCase()) return true;

      const item = allItems.find((entry: any) => entry.id === itemId);
      if (!item) return false;

      let qualification = null;

      try {
        const response =
          await client.leadsQualifications.getByCustomerSupport(itemId);
        qualification = extractQualificationRecord(
          response as { data?: LeadsQualification[] }
        );
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          toast.error(error?.message || 'Failed to check lead qualification');
          return false;
        }
      }

      if (isQualificationComplete(qualification)) {
        updateCustomerSupport({
          lead_id: itemId,
          ...item,
          status: newStatus,
        });
        return true;
      }

      return new Promise<boolean>((resolve) => {
        openModal({
          view: (
            <LeadsQualificationModal
              customerSupportId={itemId}
              itemName={item.name}
              requireAllAnswers
              onSaved={() => {
                closeModal();
                updateCustomerSupport({
                  lead_id: itemId,
                  ...item,
                  status: newStatus,
                });
                resolve(true);
              }}
              onCancel={() => {
                closeModal();
                toast.error(
                  'Status was not changed. Please complete the qualification first.'
                );
                resolve(false);
              }}
            />
          ),
          customSize: '760px',
        });
      });
    },
    [allItems, canMoveStatus, closeModal, openModal, updateCustomerSupport]
  );

  return { handleStatusChange };
}
