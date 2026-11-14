'use client';

import { useMemo, useState } from 'react';
import { PiUsersThree, PiUserList, PiXBold } from 'react-icons/pi';
import type { SubmitHandler, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
  groupFormSchema,
  type GroupFormInput,
} from '@/utils/validators/groups-form-schema';
import { useCreateGroup, useUpdateGroup } from '@/framework/groups';
import { useDoctors } from '@/framework/doctors';
import SelectBox, { type SelectOption } from '@/components/ui/select';

type GroupTabId = 'general' | 'doctors';

const GROUP_TABS: {
  id: GroupTabId;
  label: string;
  icon: typeof PiUsersThree;
}[] = [
  { id: 'general', label: 'General', icon: PiUsersThree },
  { id: 'doctors', label: 'Doctors', icon: PiUserList },
];

function groupTabHasErrors(
  tabId: GroupTabId,
  errors: FieldErrors<GroupFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(['name']);
    case 'doctors':
      return has(['doctor_ids']);
    default:
      return false;
  }
}

export default function GroupsForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();
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

  const onSubmit: SubmitHandler<GroupFormInput> = (data) => {
    const doctor_ids = (data.doctor_ids || []).map((id) => Number(id));
    if (initValues?.id) {
      updateGroup({
        group_id: initValues.id,
        name: data.name,
        doctor_ids,
      });
    } else {
      createGroup({
        name: data.name,
        doctor_ids,
      });
    }
  };

  const onInvalid = (formErrors: FieldErrors<GroupFormInput>) => {
    const tabIndex = GROUP_TABS.findIndex((tab) =>
      groupTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(GROUP_TABS.length - 1, index)));
  };

  return (
    <Form<GroupFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={groupFormSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name ?? '',
          doctor_ids: Array.isArray(initValues?.doctor_ids)
            ? initValues.doctor_ids.map(String)
            : Array.isArray(initValues?.doctors)
              ? initValues.doctors.map((d: { id: number }) => String(d.id))
              : [],
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, control }) => {
        const tabsWithErrors: ModalFormTabItem[] = GROUP_TABS.map((tab) => ({
          ...tab,
          hasError: groupTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiUsersThree className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update group' : 'Create group'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
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
                    title="Group details"
                    description="Basic group information"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Input
                      label="Group name"
                      placeholder="e.g. Night shift"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Assigned doctors"
                    description="Optionally assign doctors to this group"
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
                            onChange={(opts: SelectOption[] | SelectOption) => {
                              const ids = Array.isArray(opts)
                                ? opts.map((o) => String(o.value))
                                : opts
                                  ? [String((opts as SelectOption).value)]
                                  : [];
                              onChange(ids);
                            }}
                            disabled={doctorsLoading}
                            label="Doctors (optional)"
                            placeholder="Assign doctors"
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
                              if (val?.label) return val.label;
                              if (val?.name) return val.name;
                              return val ?? '';
                            }}
                          />
                        );
                      }}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={GROUP_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isCreating || isUpdating}
              disabled={isCreating || isUpdating}
              submitLabel={initValues ? 'Update group' : 'Create group'}
            />
          </>
        );
      }}
    </Form>
  );
}
