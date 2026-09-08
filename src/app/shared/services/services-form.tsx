'use client';

import { useEffect, useRef, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Title } from '@/components/ui/text';
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
  seoFormDefaults,
} from '@/utils/seo-fields';
import type { SeoLocale } from '@/types/seo-locale';

type CategoryOption = {
  value: number | null;
  label: string;
  slug?: { en: string | null; ar: string | null };
};

export default function CreateOrUpdateServices({ initValues }: { initValues?: any }) {
  const id = initValues?.id;
  const { data: record, isLoading: isDetailLoading } = useServiceDetail(id);
  const values = record ?? initValues;

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
      toast.error('Image is required');
      return;
    }

    setImageError(0);

    const requestBody: Record<string, unknown> = {
      name: data.name,
      category_id: selectedCategory?.value ?? null,
      image: imageValue,
      icon: iconValue,
      description: data.description,
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
      if (nextLocale) setLocale(nextLocale);
    }
    setLoading(true);
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
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {(methods) => {
        methodsRef.current = methods;
        const { register, formState: { errors }, setValue, control, watch } = methods;

        return (
          <>
            <div className="flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                {initValues ? 'Update Service' : 'Create Service'}
              </Title>
              <Button onClick={closeModal}>
                <PiXBold className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 mb-4">English Fields</h5>
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
              </div>

              <div className="space-y-4">
                <h5 className="font-semibold text-gray-900 mb-4">Arabic Fields</h5>
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
              </div>
            </div>

            <div>
              <label>Category</label>
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

            <FormGroup
              title="Image *"
              className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              {isoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-md">
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
                  <div className="relative flex justify-center items-center w-full mt-2">
                    <img
                      src={isImageData[0].thumbnail || isImageData[0].original}
                      alt="Uploaded Preview"
                      className="w-48 h-auto rounded border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50"
                      title="Remove Image"
                    >
                      <PiXBold className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </FormGroup>

            <FormGroup
              title="Icon"
              className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              {isoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-md">
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
                  <div className="relative flex justify-center items-center w-full mt-2">
                    <img
                      src={isIconData[0].thumbnail || isIconData[0].original}
                      alt="Uploaded Icon Preview"
                      className="w-24 h-auto rounded border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setIcon(null)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50"
                      title="Remove Icon"
                    >
                      <PiXBold className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </FormGroup>

            <div className="flex flex-wrap px-1 gap-3">
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

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading || isCreating || isUpdating}>
                {initValues ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
