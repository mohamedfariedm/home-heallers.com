'use client';

import { useCallback } from 'react';
import { useModal } from '@/app/shared/modal-views/use-modal';
import client from '@/framework/utils';
import {
  extractQualificationRecord,
  isQualificationComplete,
} from '@/app/shared/customer-suport/leads-qualification-utils';
import LeadsQualificationModal from '@/app/shared/customer-suport/leads-qualification-modal';
import StatusReasonModal from '@/app/shared/customer-suport/status-reason-modal';
import { LeadsQualification } from '@/app/shared/customer-suport/leads-qualification-constants';
import { isTerminalLeadStatus } from '@/config/dashboard-enums';
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

  const applyStatusChange = useCallback(
    (
      item: any,
      itemId: number,
      newStatus: string,
      extra?: { status_reason?: string; notes?: string }
    ) => {
      updateCustomerSupport({
        lead_id: itemId,
        ...item,
        status: newStatus,
        ...(extra?.status_reason ? { status_reason: extra.status_reason } : {}),
        ...(extra?.notes ? { notes: extra.notes } : {}),
      });
    },
    [updateCustomerSupport]
  );

  const promptStatusReasonThenApply = useCallback(
    (item: any, itemId: number, newStatus: 'failed' | 'closed') =>
      new Promise<boolean>((resolve) => {
        openModal({
          view: (
            <StatusReasonModal
              itemName={item.name}
              targetStatus={newStatus}
              onConfirm={(payload) => {
                applyStatusChange(item, itemId, newStatus, payload);
                resolve(true);
              }}
              onCancel={() => {
                toast.error('Status was not changed. A reason is required.');
                resolve(false);
              }}
            />
          ),
          customSize: '520px',
        });
      }),
    [applyStatusChange, openModal]
  );

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

      const normalizedStatus = newStatus.toLowerCase();

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

      const afterQualification = async () => {
        if (isTerminalLeadStatus(normalizedStatus)) {
          return promptStatusReasonThenApply(
            item,
            itemId,
            normalizedStatus as 'failed' | 'closed'
          );
        }
        applyStatusChange(item, itemId, normalizedStatus);
        return true;
      };

      if (isQualificationComplete(qualification)) {
        return afterQualification();
      }

      return new Promise<boolean>((resolve) => {
        openModal({
          view: (
            <LeadsQualificationModal
              customerSupportId={itemId}
              itemName={item.name}
              requireAllAnswers
              onSaved={async () => {
                closeModal();
                const ok = await afterQualification();
                resolve(ok);
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
    [
      allItems,
      applyStatusChange,
      canMoveStatus,
      closeModal,
      openModal,
      promptStatusReasonThenApply,
    ]
  );

  return { handleStatusChange };
}
