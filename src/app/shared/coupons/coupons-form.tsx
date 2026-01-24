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
import {
  couponFormSchema,
  CouponFormInput,
} from '@/utils/validators/coupon-form.schema'; // schema for validation
import { Checkbox } from 'rizzui'; // Language toggle
import Spinner from '@/components/ui/spinner';
import { useCreateCoupons, useUpdateCoupons } from '@/framework/coupons';
import { useDoctors } from '@/framework/doctors';
import toast from 'react-hot-toast';

export default function CreateOrUpdateCoupon({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createCoupon, isPending: isCreating } = useCreateCoupons();
  const { mutate: updateCoupon, isPending: isUpdating } = useUpdateCoupons();
  const { data: doctorsData, isLoading: isDoctorsLoading } = useDoctors('');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedDoctors, setSelectedDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize selected doctors when editing
  useEffect(() => {
    if (initValues?.doctors && initValues.doctors.length > 0) {
      if (doctorsData?.data && doctorsData.data.length > 0) {
        // Doctors data is loaded, map with proper labels
        const mapped = initValues.doctors
          .map((doctor: any) => {
            // Handle both object format (from API) and direct ID format
            const doctorId = typeof doctor === 'object' ? doctor.id : doctor;
            const foundDoctor = doctorsData.data.find(
              (d: any) => d.id === doctorId
            );
            // Handle name as string or object
            let doctorName = '';
            if (foundDoctor?.name) {
              doctorName =
                typeof foundDoctor.name === 'object'
                  ? foundDoctor.name.en || foundDoctor.name.ar
                  : foundDoctor.name;
            } else if (doctor?.name) {
              doctorName =
                typeof doctor.name === 'object'
                  ? doctor.name.en || doctor.name.ar
                  : doctor.name;
            }
            return {
              value: doctorId,
              label: doctorName || `Doctor ${doctorId}`,
            };
          })
          .filter((item: any) => item.value); // Filter out any invalid entries
        setSelectedDoctors(mapped);
      } else {
        // Doctors data not loaded yet, use initValues data directly
        const mapped = initValues.doctors
          .map((doctor: any) => {
            const doctorId = typeof doctor === 'object' ? doctor.id : doctor;
            let doctorName = '';
            if (doctor?.name) {
              doctorName =
                typeof doctor.name === 'object'
                  ? doctor.name.en || doctor.name.ar
                  : doctor.name;
            }
            return {
              value: doctorId,
              label: doctorName || `Doctor ${doctorId}`,
            };
          })
          .filter((item: any) => item.value);
        setSelectedDoctors(mapped);
      }
    } else if (!initValues) {
      // Reset when creating new coupon
      setSelectedDoctors([]);
    }
  }, [initValues, doctorsData]);

  const onSubmit: SubmitHandler<CouponFormInput> = (data) => {
    // Validate that at least one doctor is selected
    if (selectedDoctors.length === 0) {
      toast.error('Please select at least one doctor');
      return;
    }

    const requestBody = {
      name: data.name,
      code: data.code,
      discount: data.discount,
      type: data.type,
      doctors: selectedDoctors.map((doctor) => doctor.value), // Extract doctor IDs
    };

    if (initValues) {
      updateCoupon({ coupon_id: initValues.id, ...requestBody });
    } else {
      createCoupon(requestBody);
    }
  };

  if (isCreating || isUpdating) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<CouponFormInput>
      onSubmit={onSubmit}
      validationSchema={couponFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          code: initValues?.code || '',
          discount: initValues?.discount || '',
          type: initValues?.type || 'نسبه مئويه', // Default to 'نسبه مئويه' (percentage)
          doctors: [],
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, setValue, formState: { errors } }) => {
        return (
          <>
            <div className="flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                {initValues ? 'Update Coupon' : 'Create Coupon'}
              </Title>
              <Button onClick={closeModal}>
                <PiXBold className="h-4 w-4" />
              </Button>
            </div>

            <Input
              key={'name.en'}
              label="Coupon Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />

            <Input
              key={'name.ar'}
              label="Coupon Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />

            {/* Code Field */}
            <Input
              label="Coupon Code"
              {...register('code')}
              error={errors.code?.message}
              placeholder="Enter coupon code"
            />

            {/* Type Field */}
            <div>
              <label>Type</label>
              <select
                {...register('type')}
                className="w-full rounded-lg border border-gray-300"
              >
                <option value="نسبه مئويه">نسبه مئويه (Percentage)</option>
                <option value="عريضه">عريضه (Flat)</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>
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
              {isDoctorsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Spinner size="sm" />
                  Loading doctors...
                </div>
              ) : (
                <Select
                  isMulti
                  options={
                    doctorsData?.data?.map((doctor: any) => ({
                      value: doctor.id,
                      label:
                        doctor.name?.en ||
                        doctor.name?.ar ||
                        `Doctor ${doctor.id}`,
                    })) || []
                  }
                  value={selectedDoctors}
                  onChange={(selected) => {
                    const value = selected
                      ? Array.isArray(selected)
                        ? [...selected]
                        : [selected]
                      : [];
                    setSelectedDoctors(value as any[]);
                    // Sync with form state for validation
                    setValue('doctors', value, { shouldValidate: true });
                  }}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  placeholder="Select doctors"
                  isDisabled={isDoctorsLoading}
                />
              )}
              {errors.doctors && (
                <p className="text-sm text-red-500">{errors.doctors.message}</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={loading || isCreating || isUpdating}
              >
                {initValues ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
