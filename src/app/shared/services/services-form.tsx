'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PiXBold,
  PiPackage,
  PiTextAlignLeft,
  PiImage,
} from 'react-icons/pi';
import {
  SubmitHandler,
  UseFormReturn,
  type FieldErrors,
} from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from 'rizzui';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Select from 'react-select';
import { ServiceFormInput, ServiceFormSchema } from '@/utils/validators/service-form.schema';
import Spinner from '@/components/ui/spinner';
import { useCreateServices, useServiceDetail, useUpdateServices } from '@/framework/services';
import { useCategories } from '@/framework/categories';
import QuillEditor from '@/components/ui/quill-editor';
import FormGroup from '../form-group';
import Upload from '@/components/ui/upload';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import EntitySeoSection from '@/app/shared/seo/entity-seo-section';
import {
  applySeoValidationErrors,
  asLocaleTextMap,
  buildEntitySeoPayload,
  mergeAdminFormRecord,
  preserveRichLocaleHtml,
  seoFormDefaults,
} from '@/utils/seo-fields';
import type { SeoLocale } from '@/types/seo-locale';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type CategoryOption = {
  value: number | null;
  label: string;
  slug?: { en: string | null; ar: string | null };
};

type ServiceTabId = 'general' | 'details' | 'media';

const SERVICE_TABS: {
  id: ServiceTabId;
  label: string;
  icon: typeof PiPackage;
}[] = [
  { id: 'general', label: 'General', icon: PiPackage },
  { id: 'details', label: 'Pricing / details', icon: PiTextAlignLeft },
  { id: 'media', label: 'Media / status', icon: PiImage },
];

const GENERAL_ERROR_KEYS = ['name', 'description', 'category_id'];
const DETAILS_ERROR_KEYS = [
  'slug',
  'meta_title',
  'meta_description',
  'og_title',
  'og_description',
];

function serviceTabHasErrors(
  tabId: ServiceTabId,
  errors: FieldErrors<ServiceFormInput> | Record<string, unknown>,
  mediaError = false
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'details':
      return has(DETAILS_ERROR_KEYS);
    case 'media':
      return mediaError;
    default:
      return false;
  }
}

export default function CreateOrUpdateServices({ initValues }: { initValues?: any }) {
  const id = initValues?.id;
  const { data: record, isLoading: isDetailLoading } = useServiceDetail(id);
  const values = mergeAdminFormRecord(initValues, record);

  if (id && isDetailLoading) {
    return (
      <div className="m-auto p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return <ServiceForm initValues={values} />;
}

function ServiceForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const methodsRef = useRef<UseFormReturn<ServiceFormInput> | null>(null);
  const { mutateAsync: createService, isPending: isCreating } = useCreateServices();
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateServices();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories('');

  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [isoading, setoading] = useState(false);
  const [imageError, setImageError] = useState(0);
  const [isImageData, setImage] = useState(initValues?.image || null);
  const [isIconData, setIcon] = useState(initValues?.icon || null);
  const [active, setActive] = useState<number>(initValues?.active !== undefined ? initValues.active : 1);
  const [locale, setLocale] = useState<SeoLocale>('en');
  const [activeTab, setActiveTab] = useState(0);
  const loadedSlug = initValues ? asLocaleTextMap(initValues.slug) : null;

  const handleFileUpload = (event: any, type: 'Image' | 'Icon' | 'File') => {
    setoading(true);
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
        if (type === 'Icon') {
          setIcon(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch(() => {
        toast.error('Please Try Again');
      })
      .finally(() => {
        setoading(false);
      });
  };

  const categoryOptions: CategoryOption[] = [
    { value: null, label: 'None' },
    ...(categoriesData?.data?.map((category: any) => ({
      value: category.id,
      label: resolveLocalizedName(category.name, 'en') || 'Unnamed',
      slug: asLocaleTextMap(category.slug),
    })) ?? []),
  ];

  useEffect(() => {
    if (initValues && categoriesData?.data) {
      if (initValues?.category?.id) {
        const category = categoriesData.data.find((cat: any) => cat.id === initValues?.category?.id);
        setSelectedCategory({
          value: initValues?.category?.id,
          label: resolveLocalizedName(category?.name, 'en') || '',
          slug: asLocaleTextMap(category?.slug ?? initValues?.category?.slug),
        });
      } else {
        setSelectedCategory({ value: null, label: 'None' });
      }
    }
  }, [initValues, categoriesData]);

  const onSubmit: SubmitHandler<ServiceFormInput> = async (data) => {
    const imageValue = isImageData === null ? null : (isImageData || initValues?.image);
    const iconValue = isIconData === null ? null : (isIconData || initValues?.icon);

    const hasImage = imageValue && (
      (Array.isArray(imageValue) && imageValue.length > 0) ||
      (!Array.isArray(imageValue) && imageValue)
    );

    if (!hasImage) {
      setImageError(1);
      setActiveTab(SERVICE_TABS.findIndex((tab) => tab.id === 'media'));
      toast.error('Image is required');
      return;
    }

    setImageError(0);

    const requestBody: Record<string, unknown> = {
      name: data.name,
      category_id: selectedCategory?.value ?? null,
      image: imageValue,
      icon: iconValue,
      description: preserveRichLocaleHtml(initValues?.description, data.description),
      active,
      ...buildEntitySeoPayload(data, loadedSlug, !initValues),
    };

    try {
      if (initValues) {
        await updateService({ service_id: initValues.id, id: initValues.id, ...requestBody });
      } else {
        await createService(requestBody);
      }
    } catch (error) {
      const nextLocale = applySeoValidationErrors(error, methodsRef.current!.setError);
      if (nextLocale) {
        setLocale(nextLocale);
        setActiveTab(SERVICE_TABS.findIndex((tab) => tab.id === 'details'));
      }
    }
    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<ServiceFormInput>) => {
    const tabIndex = SERVICE_TABS.findIndex((tab) =>
      serviceTabHasErrors(tab.id, formErrors, imageError > 0)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(SERVICE_TABS.length - 1, index)));
  };

  if (isCategoriesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ServiceFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={ServiceFormSchema}
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
          category_id: initValues?.category?.id ?? null,
          ...seoFormDefaults(initValues),
        },
      }}
      className={modalFormTabsClassName}
    >
      {(methods) => {
        methodsRef.current = methods;
        const { register, formState: { errors }, setValue, control, watch } = methods;

        const tabsWithErrors: ModalFormTabItem[] = SERVICE_TABS.map((tab) => ({
          ...tab,
          hasError: serviceTabHasErrors(tab.id, errors, imageError > 0),
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
                    {initValues ? 'Update Service' : 'Create Service'}
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
              {/* ── General ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="English fields"
                    description="Name and description in English"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Input
                      key="name.en"
                      label="Service Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <QuillEditor
                      name="description.en"
                      error={errors.description?.en?.message}
                      control={control}
                      label="Description (English)"
                      key="Description EN"
                      className="col-span-full [&_.ql-editor]:min-h-[100px]"
                      labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                    />
                  </ModalFormTabPanelCard>

                  <ModalFormTabPanelCard
                    title="Arabic fields"
                    description="Name and description in Arabic"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Input
                      key="name.ar"
                      label="Service Name (Arabic)"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                    <QuillEditor
                      name="description.ar"
                      error={errors.description?.ar?.message}
                      control={control}
                      label="Description (Arabic)"
                      key="Description AR"
                      className="col-span-full [&_.ql-editor]:min-h-[100px]"
                      labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                    />
                  </ModalFormTabPanelCard>

                  <ModalFormTabPanelCard
                    title="Category"
                    description="Optional parent category"
                    contentClassName="sm:grid-cols-1"
                  >
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-900">
                        Category
                      </label>
                      <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={(selected) => {
                          setValue('category_id', selected?.value ?? null);
                          setSelectedCategory(selected as CategoryOption | null);
                        }}
                        menuPortalTarget={document.body}
                        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        placeholder="Select category"
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              {/* ── Pricing / details (SEO) ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="SEO & details"
                    description="Slug, meta, and open-graph fields"
                    contentClassName="sm:grid-cols-1"
                  >
                    <EntitySeoSection
                      locale={locale}
                      onLocaleChange={setLocale}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                      module="service"
                      categorySlug={selectedCategory?.slug}
                      names={watch('name')}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              {/* ── Media / status ── */}
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Media"
                    description="Service image and icon"
                    contentClassName="sm:grid-cols-1"
                  >
                    <FormGroup
                      title="Image *"
                      className="relative pt-2 @3xl:grid-cols-12"
                    >
                      {isoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
                          <Spinner size="xl" />
                        </div>
                      )}
                      <div className="col-span-2 flex w-full flex-col gap-2">
                        <Upload
                          title="Image"
                          accept="img"
                          className="w-full"
                          wrapperClassName="w-full"
                          onChange={(e) => {
                            setImageError(0);
                            handleFileUpload(e, 'Image');
                          }}
                        />
                        {imageError > 0 && (
                          <p className="text-xs text-red-500">Image is required.</p>
                        )}
                        {(isImageData?.[0]?.thumbnail || isImageData?.[0]?.original) && (
                          <div className="relative mt-2 flex w-full items-center justify-center">
                            <img
                              src={isImageData[0].thumbnail || isImageData[0].original}
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
                    </FormGroup>

                    <FormGroup
                      title="Icon"
                      className="relative pt-2 @3xl:grid-cols-12"
                    >
                      {isoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
                          <Spinner size="xl" />
                        </div>
                      )}
                      <div className="col-span-2 flex w-full flex-col gap-2">
                        <Upload
                          title="Icon"
                          accept="img"
                          className="w-full"
                          wrapperClassName="w-full"
                          onChange={(e) => {
                            handleFileUpload(e, 'Icon');
                          }}
                        />
                        {(isIconData?.[0]?.thumbnail || isIconData?.[0]?.original) && (
                          <div className="relative mt-2 flex w-full items-center justify-center">
                            <img
                              src={isIconData[0].thumbnail || isIconData[0].original}
                              alt="Uploaded Icon Preview"
                              className="h-auto w-24 rounded border border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setIcon(null)}
                              className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 shadow hover:bg-red-50"
                              title="Remove Icon"
                            >
                              <PiXBold className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormGroup>
                  </ModalFormTabPanelCard>

                  <ModalFormTabPanelCard
                    title="Status"
                    description="Active or inactive"
                    contentClassName="sm:grid-cols-1"
                  >
                    <div className="flex flex-wrap gap-3 px-1">
                      <Checkbox
                        key={1}
                        label={'Active'}
                        checked={active == 1}
                        onChange={() => setActive(active ? 0 : 1)}
                      />
                      <Checkbox
                        key={0}
                        label={'Inactive'}
                        checked={active == 0}
                        onChange={() => setActive(active ? 0 : 1)}
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={SERVICE_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update Service' : 'Create Service'}
            />
          </>
        );
      }}
    </Form>
  );
}
