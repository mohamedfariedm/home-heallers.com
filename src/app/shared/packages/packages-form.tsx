'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Select from 'react-select'; // Multi-select for doctors
import { packageFormSchema, PackageFormInput } from '@/utils/validators/package-form.schema'; // schema for validation
import { Checkbox } from 'rizzui'; // Language toggle
import Spinner from '@/components/ui/spinner';
import { useCreateCoupons, useUpdateCoupons } from '@/framework/coupons';
import { useCreatePackages, useUpdatePackages } from '@/framework/packages';
import { describe } from 'node:test';

export default function CreateOrUpdatePackages({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCoupon, isPending: isCreating } = useCreatePackages();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdatePackages();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedDoctors, setSelectedDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Language change handler
  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
      setSelectedDoctors(initValues?.doctors || []);
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<PackageFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      description: data.description,
      discount: data.discount,
      price: data.price,
      type: data.type,  // Handle type as part of the request body
      doctors: selectedDoctors.map((doctor) => doctor.value), // Extract doctor IDs
    };

    if (initValues) {
      updateCoupon({ coupon_id: initValues.id, ...requestBody });
    } else {
      createCoupon(requestBody);
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
          type: initValues?.type || 'offer', // Default to 'نسبه مئويه' (percentage)
          doctors: initValues?.doctors || [],
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Coupon' : 'Create Coupon'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          {/* Language Switch */}
          <div className="flex gap-3">
            <Checkbox label="English" checked={lang === 'en'} onChange={() => setLang('en')} />
            <Checkbox label="Arabic" checked={lang === 'ar'} onChange={() => setLang('ar')} />
          </div>

          {/* Multilingual Name Field */}
          {lang === 'en' ? (
            <Input
            key={"name.en"}
              label="Coupon Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="Coupon Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />
          )}
          {lang === 'en' ? (
            <Input
            key={"description.en"}
              label="Description (English)"
              {...register('description.en')}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"description.ar"}
              label="Description (Arabic)"
              {...register('description.ar')}
              error={errors.name?.ar?.message}
            />
          )}
          {/* Type Field */}
          <div>
            <label>Type</label>
            <select {...register('type')} className="w-full border border-gray-300 rounded-lg">
              <option value="offer">Offer</option>
              <option value="package">Package</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>
          {/* Discount Field */}
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

          {/* Doctors Multi-Select */}
          <div>
            <label>Doctors</label>
            <Select
              isMulti
              options={initValues?.doctors?.map((doctor: any) => ({
                value: doctor.id,
                label: doctor.name?.[lang] ?? doctor.name?.en,
              }))}
              value={selectedDoctors}
              onChange={(selected) => setSelectedDoctors(selected || [])}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              placeholder="Select doctors"
            />
            {errors.doctors && (
              <p className="text-sm text-red-500">{errors.doctors.message}</p>
            )}
          </div>



          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
