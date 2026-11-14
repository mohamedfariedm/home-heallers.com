'use client';

import { useMemo, useState } from 'react';
import { PiUserList, PiTarget, PiXBold } from 'react-icons/pi';
import type { SubmitHandler, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  doctorTargetCreateSchema,
  type DoctorTargetCreateInput,
} from '@/utils/validators/doctor-targets-form.schema';
import { useCreateDoctorTargets } from '@/framework/doctor-targets';
import { useDoctors } from '@/framework/doctors';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import DateInput from './date-input';

type CreateTabId = 'doctors' | 'target';

const CREATE_TABS: {
  id: CreateTabId;
  label: string;
  icon: typeof PiUserList;
}[] = [
  { id: 'doctors', label: 'Doctors', icon: PiUserList },
  { id: 'target', label: 'Target', icon: PiTarget },
];

function createTabHasErrors(
  tabId: CreateTabId,
  errors: FieldErrors<DoctorTargetCreateInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'doctors':
      return has(['doctor_ids']);
    case 'target':
      return has([
        'start_date',
        'end_date',
        'required_sessions',
        'incentive_amount',
        'notes',
      ]);
    default:
      return false;
  }
}

export default function CreateDoctorTargetsForm() {
  const { closeModal } = useModal();
  const { mutate, isPending } = useCreateDoctorTargets();
  const { data: doctorsRes, isLoading: doctorsLoading } = useDoctors(
    'page=1&limit=500'
  );
  const [activeTab, setActiveTab] = useState(0);

  const doctorOptions: SelectOption[] = useMemo(() => {
    const list = doctorsRes?.data;
    if (!Array.isArray(list)) return [];
    return list.map((d: any) => {
      const label =
        d?.name?.en || d?.name?.ar || d?.email || `Doctor #${d.id}`;
      return { value: String(d.id), name: label, label };
    });
  }, [doctorsRes?.data]);

  const onSubmit: SubmitHandler<DoctorTargetCreateInput> = (data) => {
    mutate({
      doctor_ids: data.doctor_ids.map(Number),
      start_date: data.start_date,
      end_date: data.end_date,
      required_sessions: Number(data.required_sessions),
      incentive_amount: Number(data.incentive_amount),
      notes: data.notes || null,
    });
  };

  const onInvalid = (formErrors: FieldErrors<DoctorTargetCreateInput>) => {
    const tabIndex = CREATE_TABS.findIndex((tab) =>
      createTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(CREATE_TABS.length - 1, index)));
  };

  return (
    <Form<DoctorTargetCreateInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={doctorTargetCreateSchema}
      useFormProps={{
        defaultValues: {
          doctor_ids: [],
          start_date: '',
          end_date: '',
          required_sessions: 20,
          incentive_amount: 0,
          notes: '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, control }) => {
        const tabsWithErrors: ModalFormTabItem[] = CREATE_TABS.map((tab) => ({
          ...tab,
          hasError: createTabHasErrors(tab.id, errors),
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
                    Create doctor target(s)
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    One Draft row is created per selected doctor
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
                    title="Doctors"
                    description="Select one or more doctors"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Controller
                      name="doctor_ids"
                      control={control}
                      render={({ field: { value, onChange } }) => {
                        const selectedOptions = Array.isArray(value)
                          ? doctorOptions.filter((opt) =>
                              value.includes(String(opt.value))
                            )
                          : [];

                        return (
                          <SelectBox
                            multiple
                            options={doctorOptions}
                            value={selectedOptions}
                            onChange={(
                              opts: SelectOption[] | SelectOption
                            ) => {
                              const ids = Array.isArray(opts)
                                ? opts.map((o) => String(o.value))
                                : opts
                                  ? [String((opts as SelectOption).value)]
                                  : [];
                              onChange(ids);
                            }}
                            disabled={doctorsLoading}
                            label="Doctors"
                            placeholder="Select doctors"
                            error={(errors.doctor_ids as any)?.message}
                            displayValue={(val: any) => {
                              if (Array.isArray(val)) {
                                if (val.length === 0) return '';
                                return val
                                  .map(
                                    (o: any) =>
                                      o?.label ?? o?.name ?? o?.value
                                  )
                                  .join(', ');
                              }
                              return val?.label ?? val?.name ?? val ?? '';
                            }}
                          />
                        );
                      }}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Target details"
                    description="Dates, sessions, and incentive"
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
              tabCount={CREATE_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isPending}
              disabled={isPending}
              submitLabel="Create Draft target(s)"
            />
          </>
        );
      }}
    </Form>
  );
}
