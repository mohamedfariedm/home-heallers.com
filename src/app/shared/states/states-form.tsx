'use client';

import { useEffect, useState } from 'react';
import { PiMapTrifold, PiMapPin, PiXBold } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
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
import Select from 'react-select';
import Spinner from '@/components/ui/spinner';
import { useCreatState, useUpdateState } from '@/framework/states';
import {
  StatesFormInput,
  statesFormSchema,
} from '@/utils/validators/states-form.schema';
import { useCities } from '@/framework/cities';

type StateTabId = 'general' | 'details';

const STATE_TABS: {
  id: StateTabId;
  label: string;
  icon: typeof PiMapTrifold;
}[] = [
  { id: 'general', label: 'General', icon: PiMapTrifold },
  { id: 'details', label: 'Details', icon: PiMapPin },
];

function stateTabHasErrors(
  tabId: StateTabId,
  errors: FieldErrors<StatesFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(['name']);
    case 'details':
      return has(['city_id', 'status']);
    default:
      return false;
  }
}

export default function CreateOrUpdateState({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createCity, isPending: isCreating } = useCreatState();
  const { mutate: updateCity, isPending: isUpdating } = useUpdateState();
  const { data: cityData, isLoading: isCityLoading } = useCities('');

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initValues) {
      setSelectedCity({
        value: initValues?.city?.id,
        label:
          cityData?.data?.find(
            (city: any) => city.id === initValues?.city.id
          )?.name?.[lang] || '',
      });
    }
  }, [initValues, lang, cityData]);

  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<StatesFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      city_id: selectedCity?.value,
      status: data.status,
    };

    if (initValues) {
      updateCity({ id: initValues.id, ...requestBody });
    } else {
      createCity(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<StatesFormInput>) => {
    const tabIndex = STATE_TABS.findIndex((tab) =>
      stateTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(STATE_TABS.length - 1, index)));
  };

  if (isCityLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<StatesFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={statesFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          city_id: initValues?.city_id || 1,
          status: initValues?.status || 'Published',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, setValue }) => {
        const tabsWithErrors: ModalFormTabItem[] = STATE_TABS.map((tab) => ({
          ...tab,
          hasError: stateTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiMapTrifold className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update State' : 'Create State'}
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
                    title="State name"
                    description="Localized state names"
                  >
                    <Input
                      key="name.en"
                      label="State Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      key="name.ar"
                      label="State Name (Arabic)"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Location & status"
                    description="City assignment and publish status"
                  >
                    <div>
                      <label className="text-sm text-gray-700">City</label>
                      <Select
                        options={cityData?.data?.map((country: any) => ({
                          value: country.id,
                          label: country.name?.[lang] ?? country.name?.en,
                        }))}
                        value={selectedCity}
                        onChange={(selected) => {
                          setValue('city_id', selected?.value);
                          setSelectedCity(selected);
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        placeholder="Select city"
                      />
                      {errors.city_id && (
                        <p className="text-sm text-red-500">
                          {errors.city_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Status</label>
                      <select
                        {...register('status')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                      </select>
                      {errors.status && (
                        <p className="text-sm text-red-500">
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
              tabCount={STATE_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              disabled={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update State' : 'Create State'}
            />
          </>
        );
      }}
    </Form>
  );
}
