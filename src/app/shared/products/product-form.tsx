'use client';

import { useEffect, useState } from 'react';
import { PiInfo, PiNotePencil, PiPackage, PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import SelectBox from '@/components/ui/select';
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
  ProductFormInput,
  ProductFormSchema,
} from '@/utils/validators/product-form.schema';
import { RadioGroup } from '@/components/ui/radio-group';
import { Radio } from '@/components/ui/radio';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useAllProductData,
  useUpdateProduct,
  useCreateProduct,
  useSpacificBU,
} from '@/framework/products';
import Spinner from '@/components/ui/spinner';
import Image from 'next/image';

let imageFile = 'faried';

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
  'category_id',
  'sub_category_id',
  'sub_sub_category_id',
  'brand_id',
  'model',
  'sku_code',
];
const DETAILS_ERROR_KEYS = ['description', 'barcode'];

function tabHasErrors(
  tabId: FormTabId,
  errors: FieldErrors<ProductFormInput> | Record<string, unknown>
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

export default function UpdateCreateProduct({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateProduct();
  const { mutate: create, isPending } = useCreateProduct();
  const { data: allProdCreate, isLoading: isAllProdLoading } =
    useAllProductData();
  const [selectedFeatures, setSelectedFeatures] = useState({});
  const [BUid, setBUid] = useState(1);
  const { data: spacificBU } = useSpacificBU(BUid);
  useEffect(() => {}, [BUid]);
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(
    initValues ? initValues?.en_model_name : ''
  );
  const [nameAr, setNameAr] = useState(
    initValues ? initValues?.ar_model_name : ''
  );
  const [discriptionEn, setdiscriptionEn] = useState(
    initValues ? initValues?.en_description : ''
  );
  const [discriptionAr, setdiscriptionAr] = useState(
    initValues ? initValues?.ar_description : ''
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<ProductFormInput> = (data) => {
    const formatedModelName = JSON.stringify({
      en: lang == 'en' ? data.model : nameEn,
      ar: lang == 'en' ? nameAr : data.model,
    });
    const formatedDiscName = JSON.stringify({
      en: lang == 'en' ? data.description : discriptionEn,
      ar: lang == 'en' ? discriptionAr : data.description,
    });
    if (initValues) {
      update({
        ...data,
        product_id: initValues?.id,
        image: imageFile,
        model: formatedModelName,
        description: formatedDiscName,
        features: Object.values(selectedFeatures),
      });
    } else {
      create({
        ...data,
        model: formatedModelName,
        description: formatedDiscName,
        features: Object.values(selectedFeatures),
        image: imageFile,
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<ProductFormInput>) => {
    const tabIndex = FORM_TABS.findIndex((tab) =>
      tabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  if (isAllProdLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ProductFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={ProductFormSchema}
      useFormProps={{
        defaultValues: {
          //@ts-ignore
          modal: initValues?.modal || '',
          barcode: initValues?.barcode || '',
          sku_code: initValues?.sku_code || '',
          description: initValues?.description || '',
          model: initValues?.model || '',
          category_id: initValues?.category_id || '',
          sub_category_id: initValues?.sub_category_id || '',
          sub_sub_category_id: initValues?.sub_sub_category_id || '',
          brand_id: initValues?.brand_id || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({
        register,
        getValues,
        setValue,
        watch,
        control,
        formState: { errors },
      }) => {
        const SelectedCategory = watch('category_id');
        const SelectedSubCategory = watch('sub_category_id');
        const tabsWithErrors: ModalFormTabItem[] = FORM_TABS.map((tab) => ({
          ...tab,
          hasError: tabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiPackage className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Product' : 'Add a new Product'}
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
                    title="Product identity"
                    description="Categories, brand, and model"
                  >
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <Checkbox
                        key={0}
                        label={'English'}
                        checked={lang == 'en'}
                        onChange={function () {
                          if (lang == 'en') return;
                          const currentModelName = getValues('model');
                          const currentDiscName = getValues('description');
                          setNameAr(currentModelName);
                          setdiscriptionAr(currentDiscName);
                          setValue('model', nameEn == '' ? '' : nameEn);
                          setValue(
                            'description',
                            discriptionEn == '' ? '' : discriptionEn
                          );
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                      <Checkbox
                        key={1}
                        label={'Arabic'}
                        checked={lang == 'ar'}
                        onChange={function () {
                          if (lang == 'ar') return;
                          const currentModelName = getValues('model');
                          const currentDiscName = getValues('description');
                          setNameEn(currentModelName);
                          setdiscriptionEn(currentDiscName);
                          setValue('model', nameAr == '' ? '' : nameAr);
                          setValue(
                            'description',
                            discriptionAr == '' ? '' : discriptionAr
                          );
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        BG
                      </label>
                      <Controller
                        control={control}
                        name="category_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select BG"
                            options={allProdCreate?.data?.categories?.map(
                              (cat: any) => {
                                return { ...cat, value: cat.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full truncate"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              allProdCreate?.data?.categories?.find(
                                (r: any) => r.id === selected
                              )?.name ?? selected
                            }
                            error={errors?.category_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        VCP
                      </label>
                      <Controller
                        control={control}
                        name="sub_category_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select VCP"
                            options={allProdCreate?.data?.categories
                              ?.find((item: any) => item?.id == SelectedCategory)
                              ?.children?.map((cat: any) => {
                                return { ...cat, value: cat.name };
                              })}
                            onChange={onChange}
                            value={value}
                            className="col-span-full truncate"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              allProdCreate?.data?.categories
                                ?.find(
                                  (cat: any) => cat?.id == SelectedCategory
                                )
                                ?.children?.find((r: any) => r.id == selected)
                                ?.name ?? selected
                            }
                            error={errors?.category_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        BU
                      </label>
                      <Controller
                        control={control}
                        name="sub_sub_category_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select BU"
                            options={allProdCreate?.data?.categories
                              ?.find((item: any) => item?.id == SelectedCategory)
                              ?.children?.find(
                                (item: any) => item?.id == SelectedSubCategory
                              )
                              ?.children?.map((cat: any) => {
                                return { ...cat, value: cat.name };
                              })}
                            onChange={onChange}
                            value={value}
                            className="col-span-full truncate"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) => {
                              setBUid(Number(selected));
                              return (
                                allProdCreate?.data?.categories
                                  ?.find(
                                    (cat: any) => cat?.id == SelectedCategory
                                  )
                                  ?.children?.find(
                                    (item: any) =>
                                      item?.id == SelectedSubCategory
                                  )
                                  ?.children?.find((r: any) => r.id == selected)
                                  ?.name ?? selected
                              );
                            }}
                            error={errors?.category_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        Brand
                      </label>
                      <Controller
                        control={control}
                        name="brand_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select brand"
                            options={allProdCreate?.data?.brands?.map(
                              (brand: any) => {
                                return { ...brand, value: brand.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              allProdCreate?.data?.brands?.find(
                                (r: any) => r.id === selected
                              )?.name ?? selected
                            }
                            error={errors?.brand_id?.message as string}
                          />
                        )}
                      />
                    </div>
                    <Input
                      label="Model"
                      placeholder="Model"
                      {...register('model')}
                      error={errors.model?.message}
                    />
                    <Input
                      label="sku_code"
                      placeholder="sku_code"
                      {...register('sku_code')}
                      error={errors.sku_code?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Details & features"
                    description="Description, barcode, image, and features"
                  >
                    <Input
                      label="Description"
                      placeholder="description"
                      {...register('description')}
                      error={errors.description?.message}
                    />
                    <Input
                      label="Barcode"
                      placeholder="barcode"
                      {...register('barcode')}
                      error={errors.barcode?.message}
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
                    {spacificBU?.data && spacificBU?.data?.length > 0
                      ? spacificBU?.data?.map((featureCate: any) => (
                          <div
                            key={featureCate?.id}
                            className="sm:col-span-2 space-y-2"
                          >
                            <label className="block text-sm font-medium text-gray-900">
                              {featureCate?.name}
                            </label>
                            <RadioGroup
                              value={featureCate?.features}
                              setValue={(val) =>
                                setSelectedFeatures({
                                  ...selectedFeatures,
                                  [featureCate.name]: val,
                                })
                              }
                              className="justify-center space-x-4 space-y-4"
                            >
                              <div className="flex w-full gap-3 divide-slate-300 md:w-[500px]">
                                {featureCate?.features &&
                                featureCate?.features.length > 0
                                  ? featureCate?.features?.map((fc: any) => (
                                      <Radio
                                        key={fc?.id}
                                        name={featureCate?.name}
                                        label={fc?.name}
                                        value={fc?.id}
                                        className="mb-5"
                                        labelClassName="pl-2 text-sm font-medium text-gray-900"
                                      />
                                    ))
                                  : null}
                              </div>
                            </RadioGroup>
                          </div>
                        ))
                      : null}
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
              submitLabel={initValues ? 'Update Product' : 'Create Product'}
            />
          </>
        );
      }}
    </Form>
  );
}
