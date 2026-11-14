'use client';

import { useMemo, useState } from 'react';
import { Controller, SubmitHandler, type FieldErrors } from 'react-hook-form';
import {
  PiXBold,
  PiCloudArrowUp,
  PiSlidersHorizontal,
} from 'react-icons/pi';
import { Switch } from 'rizzui';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ActionIcon } from '@/components/ui/action-icon';
import { Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import {
  useExercisesFilterOptions,
  useImportExercises,
} from '@/framework/exercises';
import {
  exerciseImportSchema,
  type ExerciseImportFormInput,
} from '@/utils/validators/exercise-form.schema';
import type { ExerciseFilterOptions } from '@/types/admin-exercises';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type ImportTabId = 'source' | 'options';

const IMPORT_TABS: {
  id: ImportTabId;
  label: string;
  icon: typeof PiCloudArrowUp;
}[] = [
  { id: 'source', label: 'Source', icon: PiCloudArrowUp },
  { id: 'options', label: 'Options', icon: PiSlidersHorizontal },
];

function importTabHasErrors(
  tabId: ImportTabId,
  errors: FieldErrors<ExerciseImportFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'source':
      return Boolean(err?.source || err?.body_part || err?.limit);
    case 'options':
      return Boolean(err?.skip_media || err?.fresh || err?.rehabilitation_only);
    default:
      return false;
  }
}

export default function ImportExerciseForm() {
  const { closeModal } = useModal();
  const [activeTab, setActiveTab] = useState(0);
  const { mutate: importExercises, isPending } = useImportExercises();
  const { data: filterOptionsData, isLoading: isLoadingFilterOptions } =
    useExercisesFilterOptions();

  const bodyPartOptions: SelectOption[] = useMemo(() => {
    const filterOptions = (
      filterOptionsData as { data?: ExerciseFilterOptions } | undefined
    )?.data;

    return [
      { value: '', name: 'all', label: 'All body parts' },
      ...(filterOptions?.body_parts ?? []).map((value) => ({
        value,
        name: value,
        label: value,
      })),
    ];
  }, [filterOptionsData]);

  const onSubmit: SubmitHandler<ExerciseImportFormInput> = (data) => {
    importExercises({
      source: data.source?.trim() || null,
      body_part: data.body_part?.trim() || null,
      limit: data.limit ? Number(data.limit) : null,
      skip_media: data.skip_media ?? false,
      fresh: data.fresh ?? false,
      rehabilitation_only: data.rehabilitation_only ?? false,
    });
  };

  const onInvalid = (formErrors: FieldErrors<ExerciseImportFormInput>) => {
    const tabIndex = IMPORT_TABS.findIndex((tab) =>
      importTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(IMPORT_TABS.length - 1, index)));
  };

  if (isPending) {
    return (
      <div className="m-auto p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ExerciseImportFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={exerciseImportSchema}
      useFormProps={{
        defaultValues: {
          source: '',
          body_part: '',
          limit: '50',
          skip_media: false,
          fresh: false,
          rehabilitation_only: false,
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = IMPORT_TABS.map((tab) => ({
          ...tab,
          hasError: importTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiCloudArrowUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Import Exercise Dataset
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Queues an async import — results appear after the worker finishes
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
                    title="Source"
                    description="Dataset source and filters"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Input
                      label="Source (optional)"
                      placeholder="Local path or URL to exercises.json"
                      {...register('source')}
                      error={errors.source?.message}
                    />

                    <Controller
                      name="body_part"
                      control={control}
                      render={({ field: { value, onChange } }) => {
                        const selected =
                          bodyPartOptions.find(
                            (option) =>
                              String(option.value) === String(value ?? '')
                          ) ?? bodyPartOptions[0];

                        return (
                          <SelectBox
                            options={bodyPartOptions}
                            value={selected}
                            onChange={(option: SelectOption) =>
                              onChange(
                                option?.value ? String(option.value) : ''
                              )
                            }
                            disabled={isLoadingFilterOptions}
                            label="Body part filter (optional)"
                            placeholder="Select body part"
                            error={errors.body_part?.message}
                            displayValue={(option: SelectOption) =>
                              option?.label ?? option?.name ?? ''
                            }
                          />
                        );
                      }}
                    />

                    <Input
                      label="Limit"
                      type="number"
                      {...register('limit')}
                      error={errors.limit?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Options"
                    description="Import behavior flags"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Controller
                      name="skip_media"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          label="Skip media download"
                          checked={Boolean(value)}
                          onChange={onChange}
                        />
                      )}
                    />

                    <Controller
                      name="fresh"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Switch
                          label="Fresh import (soft-delete existing public rows)"
                          checked={Boolean(value)}
                          onChange={onChange}
                        />
                      )}
                    />

                    <Controller
                      name="rehabilitation_only"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <div>
                          <Switch
                            label="Import rehabilitation candidates only"
                            checked={Boolean(value)}
                            onChange={onChange}
                          />
                          <Text className="mt-1 text-xs text-gray-500">
                            Matching exercises are marked pending for clinical
                            review; they are not auto-approved.
                          </Text>
                        </div>
                      )}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={IMPORT_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isPending}
              disabled={isPending}
              submitLabel="Queue Import"
            />
          </>
        );
      }}
    </Form>
  );
}
