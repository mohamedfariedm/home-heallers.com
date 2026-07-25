'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useApproveDoctorTarget,
  useDoctorTargetPreview,
} from '@/framework/doctor-targets';
import { formatAchievement, formatMoney } from './status-badge';

export default function ApprovePreviewModal({
  targetId,
}: {
  targetId: number | string;
}) {
  const { closeModal } = useModal();
  const [step, setStep] = useState<'preview' | 'confirm'>('preview');
  const [approvalNote, setApprovalNote] = useState('');
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDoctorTargetPreview(targetId, true);
  const { mutate, isPending } = useApproveDoctorTarget();

  const preview = data?.data ?? data;

  const handleApprove = () => {
    mutate({
      id: targetId,
      approval_note: approvalNote.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Title as="h4" className="font-semibold">
            {step === 'preview'
              ? 'Preview approval (dry-run)'
              : 'Confirm approve & credit wallet'}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Approval credits the doctor wallet (ledger). No bank transfer.
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      {isLoading || isFetching ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="space-y-3">
          <Text className="text-sm text-red-600">
            {(error as Error)?.message || 'Failed to load preview'}
          </Text>
          <Button variant="outline" onClick={() => refetch()}>
            Retry preview
          </Button>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-3 rounded-md border border-gray-200 p-4 text-sm">
            <div>
              <dt className="text-gray-500">Required sessions</dt>
              <dd className="font-medium">{preview?.required_sessions ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Completed sessions</dt>
              <dd className="font-medium">{preview?.completed_sessions ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Achievement</dt>
              <dd className="font-medium">
                {formatAchievement(preview?.achievement_percentage)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Incentive (ledger credit)</dt>
              <dd className="font-medium">
                {formatMoney(preview?.incentive_amount)}
              </dd>
            </div>
          </dl>

          {step === 'confirm' && (
            <Textarea
              label="Approval note (optional)"
              value={approvalNote}
              onChange={(e) => setApprovalNote(e.target.value)}
              placeholder="Stored on the immutable snapshot"
            />
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            {step === 'preview' ? (
              <Button onClick={() => setStep('confirm')}>
                Continue to confirm
              </Button>
            ) : (
              <Button isLoading={isPending} onClick={handleApprove}>
                Approve & credit wallet
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
