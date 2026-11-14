'use client';

import { useEffect, useState } from 'react';
import { PiMapPin, PiHouse, PiXBold } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  AddressFormInput,
  addressFormSchema,
} from '@/utils/validators/addresses-form.schema';
import { useCreateAddress, useUpdateAddress } from '@/framework/addresses';
import { useCountries } from '@/framework/countrues';
import { useCities } from '@/framework/cities';
import { useStates } from '@/framework/states';
import Select from 'react-select';
import { Textarea } from 'rizzui';
import { HiOutlineMapPin } from 'react-icons/hi2';

type AddressTabId = 'location' | 'details';

const ADDRESS_TABS: {
  id: AddressTabId;
  label: string;
  icon: typeof PiMapPin;
}[] = [
  { id: 'location', label: 'Location', icon: PiMapPin },
  { id: 'details', label: 'Details', icon: PiHouse },
];

function addressTabHasErrors(
  tabId: AddressTabId,
  errors: FieldErrors<AddressFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'location':
      return has([
        'addressable_type',
        'addressable_id',
        'country_id',
        'state_id',
        'city_id',
      ]);
    case 'details':
      return has([
        'street',
        'building',
        'apartment',
        'zip_code',
        'notes',
        'is_default',
      ]);
    default:
      return false;
  }
}

export default function AddressForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const { data: countriesData } = useCountries('');
  const { data: citiesData } = useCities('');
  const { data: statesData } = useStates('');

  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initValues) {
      if (initValues?.location?.lat && initValues?.location?.long) {
        const url = `https://www.google.com/maps/search/?api=1&query=${initValues.location.lat},${initValues.location.long}`;
        setGoogleMapsUrl(url);
      }

      if (initValues?.country?.id) {
        setSelectedCountry({
          value: initValues.country.id,
          label: initValues.country.name?.en ?? '',
        });
      }
      if (initValues?.state?.id) {
        setSelectedState({
          value: initValues.state.id,
          label: initValues.state.name?.en ?? '',
        });
      }
      if (initValues?.city?.id) {
        setSelectedCity({
          value: initValues.city.id,
          label: initValues.city.name?.en ?? '',
        });
      }
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<AddressFormInput> = (data) => {
    const requestBody = {
      ...data,
      country_id: selectedCountry?.value,
      state_id: selectedState?.value,
      city_id: selectedCity?.value,
      is_default: Boolean(data.is_default),
    };

    if (initValues) {
      updateAddress({ id: initValues.id, ...requestBody });
    } else {
      createAddress(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<AddressFormInput>) => {
    const tabIndex = ADDRESS_TABS.findIndex((tab) =>
      addressTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(ADDRESS_TABS.length - 1, index)));
  };

  return (
    <Form<AddressFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={addressFormSchema}
      useFormProps={{
        defaultValues: {
          addressable_type:
            initValues?.addressable_type ?? 'App\\Models\\Client',
          addressable_id: initValues?.addressable_id ?? 1,
          country_id: initValues?.country?.id ?? '',
          state_id: initValues?.state?.id ?? '',
          city_id: initValues?.city?.id ?? '',
          street: initValues?.street ?? '',
          building: initValues?.building ?? '',
          apartment: initValues?.apartment ?? '',
          zip_code: initValues?.zip_code ?? '',
          notes: initValues?.notes ?? '',
          is_default: initValues?.is_default ?? false,
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, setValue, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = ADDRESS_TABS.map((tab) => ({
          ...tab,
          hasError: addressTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiMapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Address' : 'Create Address'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {googleMapsUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <HiOutlineMapPin className="h-4 w-4" />
                    View on Google Maps
                  </Button>
                )}
                <ActionIcon
                  size="sm"
                  variant="outline"
                  onClick={closeModal}
                  className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
                >
                  <PiXBold className="h-4 w-4" />
                </ActionIcon>
              </div>
            </div>

            {isGeocoding && (
              <div className="shrink-0 border-b border-blue-100 bg-blue-50 px-6 py-2 text-sm text-blue-600">
                Retrieving location data from coordinates...
              </div>
            )}

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Location"
                    description="Owner type and geographic region"
                  >
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Addressable Type
                      </label>
                      <select
                        {...register('addressable_type')}
                        className="w-full rounded-md border border-gray-300 p-2"
                      >
                        <option
                          selected={initValues ? false : true}
                          value="App\\Models\\Client"
                        >
                          Client
                        </option>
                        <option value="App\\Models\\Doctor">Doctor</option>
                      </select>
                      {errors.addressable_type && (
                        <p className="text-sm text-red-500">
                          {errors.addressable_type.message}
                        </p>
                      )}
                    </div>
                    <Input
                      className="hidden"
                      label="Addressable ID"
                      type="number"
                      {...register('addressable_id')}
                      error={errors.addressable_id?.message}
                    />
                    <div>
                      <label className="text-sm text-gray-700">Country</label>
                      <Select
                        options={countriesData?.data?.map((c: any) => ({
                          value: c.id,
                          label: c.name.en,
                        }))}
                        value={selectedCountry}
                        onChange={(selected) => {
                          setSelectedCountry(selected);
                          setValue('country_id', selected?.value);
                        }}
                        placeholder="Select Country"
                      />
                      {errors.country_id && (
                        <p className="text-sm text-red-500">
                          {errors.country_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">State</label>
                      <Select
                        options={statesData?.data?.map((s: any) => ({
                          value: s.id,
                          label: s.name.en,
                        }))}
                        value={selectedState}
                        onChange={(selected) => {
                          setSelectedState(selected);
                          setValue('state_id', selected?.value);
                        }}
                        placeholder="Select State"
                      />
                      {errors.state_id && (
                        <p className="text-sm text-red-500">
                          {errors.state_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">City</label>
                      <Select
                        options={citiesData?.data?.map((s: any) => ({
                          value: s.id,
                          label: s.name.en,
                        }))}
                        value={selectedCity}
                        onChange={(selected) => {
                          setSelectedCity(selected);
                          setValue('city_id', selected?.value);
                        }}
                        placeholder="Select City"
                      />
                      {errors.city_id && (
                        <p className="text-sm text-red-500">
                          {errors.city_id.message}
                        </p>
                      )}
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Address details"
                    description="Street address and notes"
                  >
                    <Input
                      label="Street"
                      {...register('street')}
                      error={errors.street?.message}
                    />
                    <Input
                      label="Building"
                      {...register('building')}
                      error={errors.building?.message}
                    />
                    <Input
                      label="Apartment"
                      {...register('apartment')}
                      error={errors.apartment?.message}
                    />
                    <Input
                      label="ZIP Code"
                      {...register('zip_code')}
                      error={errors.zip_code?.message}
                    />
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Notes"
                        {...register('notes')}
                        error={errors.notes?.message}
                      />
                    </div>
                    <label className="mt-2 flex items-center gap-2 sm:col-span-2">
                      <input type="checkbox" {...register('is_default')} />
                      Default Address
                    </label>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={ADDRESS_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              disabled={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update' : 'Create'}
            />
          </>
        );
      }}
    </Form>
  );
}
