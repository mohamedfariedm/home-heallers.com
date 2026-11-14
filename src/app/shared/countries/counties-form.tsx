'use client';

import { useEffect, useState } from 'react';
import { PiGlobe, PiCurrencyDollar, PiXBold } from 'react-icons/pi';
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
import {
  useCreatecountries,
  useUpdatecountries,
} from '@/framework/countrues';
import {
  countryFormSchema,
  CountryFormInput,
} from '@/utils/validators/country-form.schema';

type CountryTabId = 'general' | 'details';

const COUNTRY_TABS: {
  id: CountryTabId;
  label: string;
  icon: typeof PiGlobe;
}[] = [
  { id: 'general', label: 'General', icon: PiGlobe },
  { id: 'details', label: 'Details', icon: PiCurrencyDollar },
];

function countryTabHasErrors(
  tabId: CountryTabId,
  errors: FieldErrors<CountryFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(['name']);
    case 'details':
      return has(['currency', 'status']);
    default:
      return false;
  }
}

export default function CreateOrUpdateCountry({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createCountry, isPending: isCreating } =
    useCreatecountries();
  const { mutate: updateCountry, isPending: isUpdating } =
    useUpdatecountries();

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<CountryFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      currency: data.currency,
      status: data.status,
    };

    if (initValues) {
      updateCountry({ country_id: initValues.id, ...requestBody });
    } else {
      createCountry(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<CountryFormInput>) => {
    const tabIndex = COUNTRY_TABS.findIndex((tab) =>
      countryTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(COUNTRY_TABS.length - 1, index)));
  };

  return (
    <Form<CountryFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={countryFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          currency: {
            en: initValues?.currency?.en || '',
            ar: initValues?.currency?.ar || '',
          },
          status: initValues?.status || 'Published',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = COUNTRY_TABS.map((tab) => ({
          ...tab,
          hasError: countryTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiGlobe className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Country' : 'Create Country'}
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
                    title="Country name"
                    description="Localized country names"
                  >
                    <Input
                      key="name.en"
                      label="Country Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      key="name.ar"
                      label="Country Name (Arabic)"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Currency & status"
                    description="Currency labels and publish status"
                  >
                    <Input
                      key="currency.en"
                      label="Currency (English)"
                      {...register('currency.en')}
                      error={errors.currency?.en?.message}
                    />
                    <Input
                      key="currency.ar"
                      label="Currency (Arabic)"
                      {...register('currency.ar')}
                      error={errors.currency?.ar?.message}
                    />
                    <div className="sm:col-span-2">
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
              tabCount={COUNTRY_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              disabled={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update Country' : 'Create Country'}
            />
          </>
        );
      }}
    </Form>
  );
}
