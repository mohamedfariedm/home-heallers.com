'use client';

import { useState } from 'react';
import { PiCalendarBlank, PiTarget, PiXBold } from 'react-icons/pi';
import type { SubmitHandler, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Title, Text } from '@/components/ui/text';
import { ActionIcon } from 'rizzui';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  doctorTargetEditSchema,
  type DoctorTargetEditInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useUpdateDoctorTarget } from '@/framework/doctor-targets';
import { isFrozenStatus } from './permissions';
import { doctorDisplayName } from './status-badge';
import DateInput from './date-input';

type EditTabId = 'schedule' | 'details';

const EDIT_TABS: {
  id: EditTabId;
  label: string;
  icon: typeof PiCalendarBlank;
}[] = [
  { id: 'schedule', label: 'Schedule', icon: PiCalendarBlank },
  { id: 'details', label: 'Details', icon: PiTarget },
];

function editTabHasErrors(
  tabId: EditTabId,
  errors: FieldErrors<DoctorTargetEditInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'schedule':
      return has(['start_date', 'end_date']);
    case 'details':
      return has(['required_sessions', 'incentive_amount', 'notes']);
    default:
      return false;
  }
}

export default function EditDoctorTargetForm({
  initValues,
}: {
  initValues: any;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useUpdateDoctorTarget();
  const [activeTab, setActiveTab] = useState(0);

  if (isFrozenStatus(initValues?.status)) {
    return (
      <div className="p-6">
        <Title as="h4" className="font-semibold">
          Editing locked
        </Title>
        <Text className="mt-2 text-sm text-gray-600">
          Approved / paid targets cannot change required sessions, dates,
          incentive, or progress fields.
        </Text>
        <Button className="mt-4" variant="outline" onClick={closeModal}>
          Close
        </Button>
      </div>
    );
  }

  const onSubmit: SubmitHandler<DoctorTargetEditInput> = (data) => {
    mutate({
      id: initValues.id,
      start_date: data.start_date,
      end_date: data.end_date,
      required_sessions: Number(data.required_sessions),
      incentive_amount: Number(data.incentive_amount),
      notes: data.notes || null,
    });
  };

  const onInvalid = (formErrors: FieldErrors<DoctorTargetEditInput>) => {
    const tabIndex = EDIT_TABS.findIndex((tab) =>
      editTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(EDIT_TABS.length - 1, index)));
  };

  return (
    <Form<DoctorTargetEditInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={doctorTargetEditSchema}
      useFormProps={{
        defaultValues: {
          start_date: initValues?.start_date?.slice?.(0, 10) || '',
          end_date: initValues?.end_date?.slice?.(0, 10) || '',
          required_sessions: initValues?.required_sessions ?? 1,
          incentive_amount: initValues?.incentive_amount ?? 0,
          notes: initValues?.notes ?? '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, control }) => {
        const tabsWithErrors: ModalFormTabItem[] = EDIT_TABS.map((tab) => ({
          ...tab,
          hasError: editTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiTarget className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Edit target #{initValues?.id}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {doctorDisplayName(
                      initValues?.doctor,
                      initValues?.doctor_id
                    )}
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
                    title="Schedule"
                    description="Target start and end dates"
                  >
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <DateInput
                          label="Start date"
                          value={value}
                          onChange={onChange}
                          error={errors.start_date?.message}
                        />
                      )}
                    />
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <DateInput
                          label="End date"
                          value={value}
                          onChange={onChange}
                          error={errors.end_date?.message}
                        />
                      )}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Target details"
                    description="Sessions, incentive, and notes"
                  >
                    <Input
                      type="number"
                      label="Required sessions"
                      {...register('required_sessions')}
                      error={errors.required_sessions?.message}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      label="Incentive amount"
                      {...register('incentive_amount')}
                      error={errors.incentive_amount?.message}
                    />
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Notes (optional)"
                        {...register('notes')}
                        error={errors.notes?.message}
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={EDIT_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isPending}
              disabled={isPending}
              submitLabel="Save changes"
            />
          </>
        );
      }}
    </Form>
  );
}
