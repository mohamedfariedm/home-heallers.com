'use client';

import { useState } from 'react';
import { Controller, SubmitHandler, type FieldErrors } from 'react-hook-form';
import {
  PiXBold,
  PiCheckCircle,
  PiNotePencil,
} from 'react-icons/pi';
import { Textarea } from 'rizzui';
import { Form } from '@/components/ui/form';
import { ActionIcon } from '@/components/ui/action-icon';
import { Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useRehabilitationCategories,
  useReviewExerciseRehabilitation,
} from '@/framework/exercises';
import {
  rehabilitationReviewSchema,
  type RehabilitationReviewFormInput,
} from '@/utils/validators/exercise-form.schema';
import type { Exercise } from '@/types/admin-exercises';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'approved', name: 'approved', label: 'Approve' },
  { value: 'rejected', name: 'rejected', label: 'Reject' },
];

const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: '', name: 'none', label: 'Not specified' },
  { value: 'beginner', name: 'beginner', label: 'Beginner' },
  { value: 'intermediate', name: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', name: 'advanced', label: 'Advanced' },
];

type ReviewTabId = 'decision' | 'clinical';

const REVIEW_TABS: {
  id: ReviewTabId;
  label: string;
  icon: typeof PiCheckCircle;
}[] = [
  { id: 'decision', label: 'Decision', icon: PiCheckCircle },
  { id: 'clinical', label: 'Clinical', icon: PiNotePencil },
];

function reviewTabHasErrors(
  tabId: ReviewTabId,
  errors: FieldErrors<RehabilitationReviewFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'decision':
      return Boolean(err?.status);
    case 'clinical':
      return Boolean(
        err?.rehab_category_id ||
          err?.difficulty ||
          err?.clinical_notes ||
          err?.contraindications
      );
    default:
      return false;
  }
}

function selectedOption(options: SelectOption[], value?: string | null) {
  return (
    options.find((option) => String(option.value) === String(value ?? '')) ??
    options[0]
  );
}

export default function RehabilitationReviewForm({
  exercise,
}: {
  exercise: Exercise;
}) {
  const { closeModal } = useModal();
  const [activeTab, setActiveTab] = useState(0);
  const { data, isLoading: categoriesLoading } =
    useRehabilitationCategories();
  const { mutate: reviewExercise, isPending } =
    useReviewExerciseRehabilitation();

  const categoryOptions: SelectOption[] = [
    { value: '', name: 'none', label: 'Select rehabilitation category' },
    ...(data?.data ?? []).map((category) => ({
      value: String(category.id),
      name: String(category.id),
      label: category.name_en || category.name_ar,
    })),
  ];

  const onSubmit: SubmitHandler<RehabilitationReviewFormInput> = (values) => {
    reviewExercise({
      id: exercise.id,
      status: values.status,
      rehab_category_id: values.rehab_category_id
        ? Number(values.rehab_category_id)
        : null,
      difficulty: values.difficulty || null,
      clinical_notes: values.clinical_notes?.trim() || null,
      contraindications: values.contraindications?.trim() || null,
    });
  };

  const onInvalid = (
    formErrors: FieldErrors<RehabilitationReviewFormInput>
  ) => {
    const tabIndex = REVIEW_TABS.findIndex((tab) =>
      reviewTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(REVIEW_TABS.length - 1, index)));
  };

  if (isPending) {
    return (
      <div className="m-auto p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<RehabilitationReviewFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={rehabilitationReviewSchema}
      useFormProps={{
        defaultValues: {
          status:
            exercise.rehabilitation_review_status === 'rejected'
              ? 'rejected'
              : 'approved',
          rehab_category_id: exercise.rehab_category_id
            ? String(exercise.rehab_category_id)
            : '',
          difficulty: exercise.difficulty || 'beginner',
          clinical_notes: exercise.clinical_notes || '',
          contraindications: exercise.contraindications || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, watch, formState: { errors } }) => {
        const status = watch('status');
        const tabsWithErrors: ModalFormTabItem[] = REVIEW_TABS.map((tab) => ({
          ...tab,
          hasError: reviewTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiCheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Rehabilitation Review
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {exercise.title?.en ||
                      exercise.title?.ar ||
                      `Exercise #${exercise.id}`}
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Decision"
                    description="Approve or reject this exercise"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Controller
                      name="status"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          label="Decision"
                          options={STATUS_OPTIONS}
                          value={selectedOption(STATUS_OPTIONS, value)}
                          onChange={(option: SelectOption) =>
                            onChange(String(option.value))
                          }
                          error={errors.status?.message}
                          displayValue={(option: SelectOption) =>
                            option?.label ?? option?.name ?? ''
                          }
                        />
                      )}
                    />
                    {status === 'rejected' ? (
                      <Text className="text-xs text-gray-500">
                        Rejecting skips clinical fields and marks the exercise
                        as not suitable for rehabilitation.
                      </Text>
                    ) : null}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Clinical"
                    description="Category, difficulty, and clinical notes"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    {status === 'approved' ? (
                      <>
                        <Controller
                          name="rehab_category_id"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <SelectBox
                              label="Rehabilitation category"
                              options={categoryOptions}
                              value={selectedOption(categoryOptions, value)}
                              onChange={(option: SelectOption) =>
                                onChange(
                                  option?.value ? String(option.value) : ''
                                )
                              }
                              disabled={categoriesLoading}
                              error={errors.rehab_category_id?.message}
                              displayValue={(option: SelectOption) =>
                                option?.label ?? option?.name ?? ''
                              }
                            />
                          )}
                        />

                        <Controller
                          name="difficulty"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <SelectBox
                              label="Difficulty"
                              options={DIFFICULTY_OPTIONS}
                              value={selectedOption(DIFFICULTY_OPTIONS, value)}
                              onChange={(option: SelectOption) =>
                                onChange(
                                  option?.value ? String(option.value) : ''
                                )
                              }
                              error={errors.difficulty?.message}
                              displayValue={(option: SelectOption) =>
                                option?.label ?? option?.name ?? ''
                              }
                            />
                          )}
                        />

                        <Textarea
                          label="Clinical notes"
                          rows={3}
                          {...register('clinical_notes')}
                          error={errors.clinical_notes?.message}
                        />
                        <Textarea
                          label="Contraindications"
                          rows={3}
                          {...register('contraindications')}
                          error={errors.contraindications?.message}
                        />
                      </>
                    ) : (
                      <Text className="text-sm text-gray-500">
                        Switch Decision to Approve to fill clinical details.
                      </Text>
                    )}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={REVIEW_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isPending}
              disabled={isPending}
              submitLabel={
                status === 'rejected' ? 'Reject Exercise' : 'Approve Exercise'
              }
            />
          </>
        );
      }}
    </Form>
  );
}
