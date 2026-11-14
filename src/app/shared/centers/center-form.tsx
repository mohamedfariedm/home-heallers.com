'use client';

import { useState } from 'react';
import { PiXBold, PiBuildings, PiGearSix } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ActionIcon } from 'rizzui';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateCenter, useUpdateCenter } from '@/framework/centers';
import { z } from 'zod';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

const centerFormSchema = z.object({
  name: z.object({
    en: z
      .string()
      .min(1, 'English name is required')
      .max(255, 'English name must be less than 255 characters'),
    ar: z
      .string()
      .min(1, 'Arabic name is required')
      .max(255, 'Arabic name must be less than 255 characters'),
  }),
  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

type CenterFormInput = z.infer<typeof centerFormSchema>;

type CenterTabId = 'general' | 'settings';

const CENTER_TABS: {
  id: CenterTabId;
  label: string;
  icon: typeof PiBuildings;
}[] = [
  { id: 'general', label: 'General', icon: PiBuildings },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

function centerTabHasErrors(
  tabId: CenterTabId,
  errors: FieldErrors<CenterFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'general':
      return Boolean(err?.name);
    case 'settings':
      return Boolean(err?.phone || err?.email || err?.status);
    default:
      return false;
  }
}

export default function CenterForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCenter, isPending: isCreating } = useCreateCenter();
  const { mutate: updateCenter, isPending: isUpdating } = useUpdateCenter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<CenterFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      status: data.status || 'active',
    };

    if (initValues) {
      updateCenter({ id: initValues.id, ...requestBody });
    } else {
      createCenter(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<CenterFormInput>) => {
    const tabIndex = CENTER_TABS.findIndex((tab) =>
      centerTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(CENTER_TABS.length - 1, index)));
  };

  const isBusy = isCreating || isUpdating || loading;

  return (
    <Form<CenterFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={centerFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          phone: initValues?.phone || '',
          email: initValues?.email || '',
          status: initValues?.status || 'active',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = CENTER_TABS.map((tab) => ({
          ...tab,
          hasError: centerTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiBuildings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Edit Center' : 'Create Center'}
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
                    title="General"
                    description="Center name in both languages"
                  >
                    <Input
                      label="Name (English) *"
                      placeholder="Enter center name in English"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      label="Name (Arabic) *"
                      placeholder="أدخل اسم المركز بالعربية"
                      dir="rtl"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Settings"
                    description="Contact details and status"
                  >
                    <Input
                      label="Phone"
                      placeholder="+966501234567"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="info@center.com"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        {...register('status')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#143087]/20"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      {errors.status && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.status.message}
                        </p>
                      )}
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={CENTER_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isBusy}
              disabled={isBusy}
              submitLabel={initValues ? 'Update Center' : 'Create Center'}
            />
          </>
        );
      }}
    </Form>
  );
}
