'use client';

import { useState } from 'react';
import { PiInfo, PiNotePencil, PiStorefront, PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import {
  StoreFormInput,
  StoreFormSchema,
} from '@/utils/validators/store-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCities } from '@/framework/cities';
import { useRetailers } from '@/framework/retailers';
import { useCreateStore, useUpdateStore } from '@/framework/stores';
import Spinner from '@/components/ui/spinner';
import { City } from '@/types';
import Image from 'next/image';

let imageFile: any = 'faried';

type FormTabId = 'general' | 'details';

const FORM_TABS: {
  id: FormTabId;
  label: string;
  icon: typeof PiInfo;
}[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

const GENERAL_ERROR_KEYS = [
  'name',
  'city_id',
  'retailer_id',
  'store_code',
  'type',
];
const DETAILS_ERROR_KEYS = [
  'contact_number',
  'contact_email',
  'address',
  'lat',
  'lng',
];

function tabHasErrors(
  tabId: FormTabId,
  errors: FieldErrors<StoreFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));
  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'details':
      return has(DETAILS_ERROR_KEYS);
    default:
      return false;
  }
}

export default function UpdateCreateStore({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: cities, isLoading: isCitiesLoading } = useCities('');
  const { data: retailers, isLoading: isRetailersLoading } = useRetailers('');
  const { mutate: update } = useUpdateStore();
  const { mutate: create, isPending } = useCreateStore();
  const [isActive, setIsActive] = useState<number>(
    initValues ? initValues?.is_active : 1
  );
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '');
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<StoreFormInput> = (data) => {
    const formatedName = JSON.stringify({
      en: lang == 'en' ? data.name : nameEn,
      ar: lang == 'en' ? nameAr : data.name,
    });
    if (initValues) {
      update({
        ...data,
        store_id: initValues?.id,
        city_id: data?.city_id || initValues?.city_id,
        region_id:
          cities?.data?.cities?.find((city: City) => city?.id == data.city_id)
            ?.region_id || initValues?.region_id,
        is_active: isActive,
        store_code: data.store_code,
        image: imageFile,
        name: formatedName,
      });
    } else {
      create({
        ...data,
        name: formatedName,
        is_active: isActive,
        city_id: data.city_id,
        region_id: cities?.data?.cities?.find(
          (city: City) => city?.id == data.city_id
        )?.region_id,
        store_code: data.store_code,
        image: imageFile,
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<StoreFormInput>) => {
    const tabIndex = FORM_TABS.findIndex((tab) =>
      tabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  if (isCitiesLoading || isRetailersLoading) {
    return (
      <div className="m-auto min-h-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<StoreFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={StoreFormSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name || '',
          contact_number: initValues?.contact_number || '',
          contact_email: initValues?.contact_email || '',
          type: initValues?.type || '',
          store_code: initValues?.store_code || '',
          address: initValues?.address || '',
          city_id: initValues?.city_id || '',
          retailer_id: initValues?.retailer_id || '',
          lat: initValues?.lat || '',
          lng: initValues?.lng || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, getValues, setValue, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = FORM_TABS.map((tab) => ({
          ...tab,
          hasError: tabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiStorefront className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Store' : 'Add a new Store'}
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
                    title="Store identity"
                    description="Name, location, and codes"
                  >
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <Checkbox
                        key={0}
                        label={'English'}
                        checked={lang == 'en'}
                        onChange={function () {
                          if (lang == 'en') return;
                          const currentName = getValues('name');
                          setNameAr(currentName);
                          setValue('name', nameEn == '' ? '' : nameEn);
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                      <Checkbox
                        key={1}
                        label={'Arabic'}
                        checked={lang == 'ar'}
                        onChange={function () {
                          if (lang == 'ar') return;
                          const currentName = getValues('name');
                          setNameEn(currentName);
                          setValue('name', nameAr == '' ? '' : nameAr);
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Store Name"
                        placeholder="Store name"
                        {...register('name')}
                        error={errors.name?.message}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        City
                      </label>
                      <Controller
                        control={control}
                        name="city_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select City"
                            options={cities?.data?.cities?.map((city: any) => {
                              return { ...city, value: city.name };
                            })}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              cities?.data?.cities?.find(
                                (r: any) => r.id === selected
                              )?.name ?? ''
                            }
                            error={errors?.city_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Retailer
                      </label>
                      <Controller
                        control={control}
                        name="retailer_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select Retailer"
                            options={retailers?.data?.retailers?.map(
                              (retailer: any) => {
                                return { ...retailer, value: retailer.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              retailers?.data?.retailers?.find(
                                (r: any) => r.id === selected
                              )?.name ?? ''
                            }
                            error={errors?.retailer_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <Input
                      label="Store Code"
                      placeholder="Store Code"
                      {...register('store_code')}
                      error={errors.store_code?.message}
                    />
                    <Input
                      label="Type"
                      placeholder="Type"
                      {...register('type')}
                      error={errors.type?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Contact & media"
                    description="Contact info, map, image, and status"
                  >
                    <Input
                      type="tel"
                      label="Phone Number"
                      placeholder="05xxxxxxxx"
                      {...register('contact_number')}
                      error={errors.contact_number?.message}
                    />
                    <Input
                      label="Contact Email"
                      placeholder="Contact Email"
                      {...register('contact_email')}
                      error={errors.contact_email?.message}
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Address"
                        placeholder="Address"
                        {...register('address')}
                        error={errors.address?.message}
                      />
                    </div>
                    <Input
                      label="lat"
                      placeholder="lat"
                      {...register('lat')}
                      error={errors.lat?.message}
                    />
                    <Input
                      label="lng"
                      placeholder="lng"
                      {...register('lng')}
                      error={errors.lng?.message}
                    />
                    <div className="sm:col-span-2">
                      {selectedImage && (
                        <div>
                          <Image
                            alt="not found"
                            width={250}
                            height={250}
                            src={URL.createObjectURL(selectedImage)}
                          />
                          <br />
                        </div>
                      )}
                      <input
                        type="file"
                        name="myImage"
                        onChange={(event) => {
                          const reader: any = new FileReader();
                          //@ts-ignore
                          const file: any = event.target.files[0];
                          setSelectedImage(file);
                          reader.addEventListener('load', () => {
                            imageFile = reader.result.replace(
                              'data:image/jpeg;base64,',
                              ''
                            );
                          });
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <Checkbox
                        key={1}
                        label={'Active'}
                        checked={isActive == 1}
                        onChange={() => setIsActive(isActive ? 0 : 1)}
                      />
                      <Checkbox
                        key={0}
                        label={'Inactive'}
                        checked={isActive == 0}
                        onChange={() => setIsActive(isActive ? 0 : 1)}
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={FORM_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Store' : 'Create Store'}
            />
          </>
        );
      }}
    </Form>
  );
}
