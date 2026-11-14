'use client';

import { useEffect, useState } from 'react';
import { PiBuildings, PiMapPin, PiXBold } from 'react-icons/pi';
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
import { useCreateCity, useUpdateCity } from '@/framework/cities';
import Select from 'react-select';
import {
  cityFormSchema,
  CityFormInput,
} from '@/utils/validators/city-form.schema';
import Spinner from '@/components/ui/spinner';
import { useCountries } from '@/framework/countrues';

type CityTabId = 'general' | 'details';

const CITY_TABS: {
  id: CityTabId;
  label: string;
  icon: typeof PiBuildings;
}[] = [
  { id: 'general', label: 'General', icon: PiBuildings },
  { id: 'details', label: 'Details', icon: PiMapPin },
];

function cityTabHasErrors(
  tabId: CityTabId,
  errors: FieldErrors<CityFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(['name']);
    case 'details':
      return has(['country_id', 'status']);
    default:
      return false;
  }
}

export default function CreateOrUpdateCity({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createCity, isPending: isCreating } = useCreateCity();
  const { mutate: updateCity, isPending: isUpdating } = useUpdateCity();
  const { data: countriesData, isLoading: isCountriesLoading } =
    useCountries('');

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initValues) {
      setSelectedCountry({
        value: initValues?.country.id,
        label:
          countriesData?.data?.find(
            (country: any) => country.id === initValues?.country.id
          )?.name?.[lang] || '',
      });
    }
  }, [initValues, lang, countriesData]);

  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<CityFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      country_id: selectedCountry?.value,
      status: data.status,
    };

    if (initValues) {
      updateCity({ city_id: initValues.id, ...requestBody });
    } else {
      createCity(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<CityFormInput>) => {
    const tabIndex = CITY_TABS.findIndex((tab) =>
      cityTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(CITY_TABS.length - 1, index)));
  };

  if (isCountriesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<CityFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={cityFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          country_id: initValues?.country.id || 1,
          status: initValues?.status || 'Published',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, setValue }) => {
        const tabsWithErrors: ModalFormTabItem[] = CITY_TABS.map((tab) => ({
          ...tab,
          hasError: cityTabHasErrors(tab.id, errors),
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
                    {initValues ? 'Update City' : 'Create City'}
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
                    title="City name"
                    description="Localized city names"
                  >
                    <Input
                      key="name.en"
                      label="City Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      key="name.ar"
                      label="City Name (Arabic)"
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
                    description="Country assignment and publish status"
                  >
                    <div>
                      <label className="text-sm text-gray-700">Countries</label>
                      <Select
                        options={countriesData?.data?.map((country: any) => ({
                          value: country.id,
                          label: country.name?.[lang] ?? country.name?.en,
                        }))}
                        value={selectedCountry}
                        onChange={(selected) => {
                          setValue('country_id', selected?.value);
                          setSelectedCountry(selected);
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        placeholder="Select countries"
                      />
                      {errors.country_id && (
                        <p className="text-sm text-red-500">
                          {errors.country_id.message}
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
              tabCount={CITY_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              disabled={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update City' : 'Create City'}
            />
          </>
        );
      }}
    </Form>
  );
}
