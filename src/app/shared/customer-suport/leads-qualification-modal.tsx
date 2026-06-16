'use client';

import { useEffect, useMemo, useState } from 'react';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import { Radio, RadioGroup } from '@/components/ui/radio';
import Spinner from '@/components/ui/spinner';
import { PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  LEADS_QUALIFICATION_FIELDS,
  LeadsQualificationAnswer,
  LeadsQualificationFieldKey,
} from './leads-qualification-constants';
import {
  getInitialAnswers,
  isQualificationComplete,
} from './leads-qualification-utils';
import {
  useLeadsQualificationByCustomerSupport,
  useSaveLeadsQualification,
} from '@/framework/leads-qualifications';
import toast from 'react-hot-toast';

interface LeadsQualificationModalProps {
  customerSupportId: number;
  itemName?: string;
  requireAllAnswers?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function LeadsQualificationModal({
  customerSupportId,
  itemName,
  requireAllAnswers = false,
  onSaved,
  onCancel,
}: LeadsQualificationModalProps) {
  const { closeModal } = useModal();
  const { data: qualification, isLoading } =
    useLeadsQualificationByCustomerSupport(customerSupportId);
  const [answers, setAnswers] = useState(
    getInitialAnswers(qualification ?? null)
  );

  const { mutate: saveQualification, isPending } = useSaveLeadsQualification({
    onSuccess: () => {
      onSaved?.();
      if (!onSaved) {
        closeModal();
      }
    },
  });

  useEffect(() => {
    setAnswers(getInitialAnswers(qualification ?? null));
  }, [qualification]);

  const yesCount = useMemo(
    () =>
      LEADS_QUALIFICATION_FIELDS.filter((field) => answers[field.key] === 'yes')
        .length,
    [answers]
  );

  const isComplete = useMemo(
    () =>
      LEADS_QUALIFICATION_FIELDS.every(
        (field) => answers[field.key] === 'yes' || answers[field.key] === 'no'
      ),
    [answers]
  );

  const isQualified =
    qualification?.qualified ?? yesCount >= 5;

  const handleAnswerChange = (
    key: LeadsQualificationFieldKey,
    value: LeadsQualificationAnswer
  ) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    closeModal();
  };

  const handleSubmit = () => {
    if (!isComplete) {
      toast.error('Please answer all qualification questions before continuing');
      return;
    }

    const payload = LEADS_QUALIFICATION_FIELDS.reduce(
      (acc, field) => {
        const answer = answers[field.key];
        if (answer === 'yes' || answer === 'no') {
          acc[field.key] = answer;
        }
        return acc;
      },
      {} as Partial<Record<LeadsQualificationFieldKey, 'yes' | 'no'>>
    );

    saveQualification({
      customer_support_id: customerSupportId,
      id: qualification?.id,
      ...payload,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex max-h-[85vh] flex-col gap-5 overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Title as="h4" className="font-semibold">
            Lead Qualification
          </Title>
          {itemName && (
            <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {itemName}
            </Text>
          )}
        </div>
        <ActionIcon size="sm" variant="text" onClick={handleCancel}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="flat"
          color={isQualified ? 'success' : 'warning'}
          className="font-medium"
        >
          {isQualified ? 'Qualified' : 'Not Qualified'} ({yesCount}/8 yes, need
          5+)
        </Badge>
        {qualification && isQualificationComplete(qualification) && (
          <Badge variant="flat" color="info">
            Previously saved
          </Badge>
        )}
      </div>

      {requireAllAnswers && !isComplete && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Complete all questions to change the lead status.
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pe-1">
        {LEADS_QUALIFICATION_FIELDS.map((field) => (
          <div
            key={field.key}
            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
          >
            <Text className="mb-3 font-medium text-gray-900 dark:text-gray-100">
              {field.question}
            </Text>
            <RadioGroup
              value={answers[field.key] ?? ''}
              setValue={(value) =>
                handleAnswerChange(
                  field.key,
                  (typeof value === 'function'
                    ? value(answers[field.key] ?? '')
                    : value) as 'yes' | 'no'
                )
              }
              className="flex gap-6"
            >
              <Radio label="Yes" value="yes" />
              <Radio label="No" value="no" />
            </RadioGroup>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button variant="outline" onClick={handleCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} isLoading={isPending}>
          Save Qualification
        </Button>
      </div>
    </div>
  );
}
