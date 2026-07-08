'use client';

import { useMemo, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
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
import FormGroup from '../form-group';
import Upload from '@/components/ui/upload';

export default function CreateOrUpdatePackages({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createPackage, isPending: isCreating } = useCreatePackages();
  const { mutate: updatePackage, isPending: isUpdating } = useUpdatePackages();
  const [lang] = useState<'en' | 'ar'>('en');
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
    // Validate image is required
    const imageToUse = isImageData || initValues?.image;
    if (!imageToUse) {
      setImageError(1);
      toast.error('Image is required');
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

  if (isCreating || isUpdating) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<PackageFormInput>
      onSubmit={onSubmit}
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
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors }, control }) => (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Package' : 'Create Package'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          {/* Multilingual Name Field */}
          <Input
            key={'name.en'}
            label="Package Name (English)"
            {...register('name.en')}
            error={errors.name?.en?.message}
          />
          <Input
            key={'name.ar'}
            label="Package Name (Arabic)"
            {...register('name.ar')}
            error={errors.name?.ar?.message}
          />

          {/* Multilingual Description Field */}
          <Input
            key={'description.en'}
            label="Description (English)"
            {...register('description.en')}
            error={errors.description?.en?.message}
          />
          <Input
            key={'description.ar'}
            label="Description (Arabic)"
            {...register('description.ar')}
            error={errors.description?.ar?.message}
          />

          {/* Type Field */}
          <div>
            <label>Type</label>
            <select
              {...register('type')}
              className="w-full rounded-lg border border-gray-300 p-2"
            >
              <option value="offer">Offer</option>
              <option value="package">Package</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Price Field */}
          <Input
            label="Price"
            type="number"
            {...register('price')}
            error={errors.price?.message}
          />

          {/* Discount Field */}
          <Input
            label="Discount"
            type="number"
            {...register('discount')}
            error={errors.discount?.message}
          />

          {/* Sessions Count Field */}
          <Input
            label="Number of Sessions"
            type="number"
            {...register('sessions_count')}
            error={errors.sessions_count?.message}
          />

          <FormGroup
            title="Image *"
            className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
          >
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

          <div>
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
                    onChange={(opts: SelectOption[] | SelectOption) => {
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
                    error={(errors.category_ids as { message?: string })?.message}
                    displayValue={(val: SelectOption | SelectOption[]) => {
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
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading || isCreating || isUpdating}
            >
              {initValues ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
