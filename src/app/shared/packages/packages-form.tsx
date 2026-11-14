'use client';

import { useMemo, useState } from 'react';
import {
  PiXBold,
  PiPackage,
  PiCurrencyCircleDollar,
  PiFolders,
} from 'react-icons/pi';
import {
  Controller,
  SubmitHandler,
  type FieldErrors,
} from 'react-hook-form';
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
  packageFormSchema,
  PackageFormInput,
} from '@/utils/validators/package-form.schema';
import Spinner from '@/components/ui/spinner';
import { useCreatePackages, useUpdatePackages } from '@/framework/packages';
import { useCategories } from '@/framework/categories';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Upload from '@/components/ui/upload';

type PackageTabId = 'package' | 'pricing' | 'details';

const PACKAGE_TABS: {
  id: PackageTabId;
  label: string;
  icon: typeof PiPackage;
}[] = [
  { id: 'package', label: 'Package', icon: PiPackage },
  { id: 'pricing', label: 'Pricing', icon: PiCurrencyCircleDollar },
  { id: 'details', label: 'Details', icon: PiFolders },
];

const PACKAGE_ERROR_KEYS = ['name', 'description', 'type'];
const PRICING_ERROR_KEYS = ['price', 'discount', 'sessions_count'];
const DETAILS_ERROR_KEYS = ['category_ids', 'doctors'];

function packageTabHasErrors(
  tabId: PackageTabId,
  errors: FieldErrors<PackageFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'package':
      return has(PACKAGE_ERROR_KEYS);
    case 'pricing':
      return has(PRICING_ERROR_KEYS);
    case 'details':
      return has(DETAILS_ERROR_KEYS);
    default:
      return false;
  }
}

export default function CreateOrUpdatePackages({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createPackage, isPending: isCreating } = useCreatePackages();
  const { mutate: updatePackage, isPending: isUpdating } = useUpdatePackages();
  const [lang] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState(0);
  const { data: categories, isLoading: isLoadingCategories } = useCategories('');

  const [loading, setLoading] = useState(false);
  const [isLoading, setImageLoading] = useState(false);
  const [isImageData, setImage] = useState(initValues?.image || null);
  const [imageError, setImageError] = useState(0);

  const handleFileUpload = (event: any, type: 'Image' | 'File') => {
    setImageLoading(true);
    const file = event.target.files?.[0];
    const formData = new FormData();
    formData.append('attachment[]', file);

    axios
      .post(process.env.NEXT_PUBLIC_ATTACHMENT_URL as string, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
        },
      })
      .then((response) => {
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch(() => toast.error('Please Try Again'))
      .finally(() => setImageLoading(false));
  };

  const categoryOptions: SelectOption[] = useMemo(() => {
    const list = (categories?.data ?? []).filter((c: any) => {
      if (c.active === false || c.active === 0) return false;
      if (c.is_active === 0) return false;
      return true;
    });
    return list.map((c: any) => ({
      value: String(c.id),
      name: (c?.name?.[lang] ?? c?.name?.en ?? `Category ${c.id}`) as string,
      label: (c?.name?.[lang] ?? c?.name?.en ?? `Category ${c.id}`) as string,
    }));
  }, [categories?.data, lang]);

  const onSubmit: SubmitHandler<PackageFormInput> = (data) => {
    const imageToUse = isImageData || initValues?.image;
    if (!imageToUse) {
      setImageError(1);
      toast.error('Image is required');
      setActiveTab(0);
      return;
    }

    setImageError(0);

    const requestBody = {
      name: data.name,
      description: data.description,
      image: imageToUse,
      discount: data.discount,
      price: data.price,
      sessions_count: data.sessions_count,
      type: data.type,
      category_ids: (data.category_ids || []).map((id) => Number(id)),
    };

    if (initValues) {
      updatePackage({ coupon_id: initValues.id, ...requestBody });
    } else {
      createPackage(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<PackageFormInput>) => {
    const tabIndex = PACKAGE_TABS.findIndex((tab) =>
      packageTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(PACKAGE_TABS.length - 1, index)));
  };

  return (
    <Form<PackageFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={packageFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          description: {
            en: initValues?.description?.en || '',
            ar: initValues?.description?.ar || '',
          },
          discount: initValues?.discount || '',
          price: initValues?.price || '',
          type: initValues?.type || 'offer',
          sessions_count: initValues?.sessions_count || '',
          category_ids: Array.isArray(initValues?.category_ids)
            ? initValues.category_ids.map((id: number | string) => String(id))
            : Array.isArray(initValues?.categories)
              ? initValues.categories.map((c: { id: number }) => String(c.id))
              : [],
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors }, control }) => {
        const tabsWithErrors: ModalFormTabItem[] = PACKAGE_TABS.map((tab) => ({
          ...tab,
          hasError:
            packageTabHasErrors(tab.id, errors) ||
            (tab.id === 'package' && imageError > 0),
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
                    {initValues ? 'Update Package' : 'Create Package'}
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
                    title="Package info"
                    description="Name, description, and type"
                  >
                    <Input
                      key="name.en"
                      label="Package Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      key="name.ar"
                      label="Package Name (Arabic)"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                    <Input
                      key="description.en"
                      label="Description (English)"
                      {...register('description.en')}
                      error={errors.description?.en?.message}
                    />
                    <Input
                      key="description.ar"
                      label="Description (Arabic)"
                      {...register('description.ar')}
                      error={errors.description?.ar?.message}
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        {...register('type')}
                        className="w-full rounded-lg border border-gray-300 p-2"
                      >
                        <option value="offer">Offer</option>
                        <option value="package">Package</option>
                      </select>
                      {errors.type && (
                        <p className="text-sm text-red-500">
                          {errors.type.message}
                        </p>
                      )}
                    </div>
                  </ModalFormTabPanelCard>

                  <ModalFormTabPanelCard
                    title="Image"
                    description="Package image is required"
                    contentClassName="sm:grid-cols-1"
                  >
                    <div className="relative">
                      {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
                          <Spinner size="xl" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Upload
                          title="Image"
                          accept="img"
                          onChange={(e) => {
                            setImageError(0);
                            handleFileUpload(e, 'Image');
                          }}
                        />
                        {imageError > 0 && (
                          <p className="text-xs text-red-500">
                            Image is required.
                          </p>
                        )}
                        {(isImageData?.[0]?.thumbnail ||
                          isImageData?.[0]?.original) && (
                          <div className="relative mt-2 flex w-full items-center justify-center">
                            <img
                              src={
                                isImageData[0].thumbnail ||
                                isImageData[0].original
                              }
                              alt="Uploaded Preview"
                              className="h-auto w-48 rounded border border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 shadow hover:bg-red-50"
                              title="Remove Image"
                            >
                              <PiXBold className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Pricing"
                    description="Price, discount, and session count"
                  >
                    <Input
                      label="Price"
                      type="number"
                      {...register('price')}
                      error={errors.price?.message}
                    />
                    <Input
                      label="Discount"
                      type="number"
                      {...register('discount')}
                      error={errors.discount?.message}
                    />
                    <Input
                      label="Number of Sessions"
                      type="number"
                      {...register('sessions_count')}
                      error={errors.sessions_count?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Categories"
                    description="Optional category assignment"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Controller
                      name="category_ids"
                      control={control}
                      render={({ field: { value, onChange } }) => {
                        const selectedOptions = Array.isArray(value)
                          ? categoryOptions.filter((opt) =>
                              value.includes(String(opt.value))
                            )
                          : [];

                        return (
                          <SelectBox
                            multiple
                            options={categoryOptions}
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
                            disabled={isLoadingCategories}
                            label="Categories"
                            placeholder="Select categories (optional)"
                            error={
                              (errors.category_ids as { message?: string })
                                ?.message
                            }
                            displayValue={(
                              val: SelectOption | SelectOption[]
                            ) => {
                              if (Array.isArray(val)) {
                                if (val.length === 0) return '';
                                return val
                                  .map((o) => o?.label ?? o?.name ?? o?.value)
                                  .join(', ');
                              }
                              if (val?.label) return val.label;
                              if (val?.name) return val.name;
                              return String(val ?? '');
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
              tabCount={PACKAGE_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update Package' : 'Create Package'}
            />
          </>
        );
      }}
    </Form>
  );
}
