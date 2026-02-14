'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateCenter, useUpdateCenter } from '@/framework/centers';
import Spinner from '@/components/ui/spinner';
import { z } from 'zod';

const centerFormSchema = z.object({
  name: z.object({
    en: z.string().min(1, 'English name is required').max(255, 'English name must be less than 255 characters'),
    ar: z.string().min(1, 'Arabic name is required').max(255, 'Arabic name must be less than 255 characters'),
  }),
  phone: z.string().max(50, 'Phone must be less than 50 characters').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).optional(),
});

type CenterFormInput = z.infer<typeof centerFormSchema>;

export default function CenterForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createCenter, isPending: isCreating } = useCreateCenter();
  const { mutate: updateCenter, isPending: isUpdating } = useUpdateCenter();
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<CenterFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      phone: data.phone || undefined,
      email: data.email || undefined,
      status: data.status || 'active',
    };

    if (initValues) {
      updateCenter({ id: initValues.id, ...requestBody });
    } else {
      createCenter(requestBody);
    }

    setLoading(true);
  };

  return (
    <Form<CenterFormInput>
      onSubmit={onSubmit}
      validationSchema={centerFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          phone: initValues?.phone || '',
          email: initValues?.email || '',
          status: initValues?.status || 'active',
        },
      }}
      className="space-y-6"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between px-6 py-4">
            <Title as="h4" className="text-xl">
              {initValues ? 'Edit Center' : 'Create Center'}
            </Title>
            <Button
              variant="text"
              onClick={closeModal}
              className="h-auto p-1"
            >
              <PiXBold className="h-5 w-5" />
            </Button>
          </div>

          <div className="px-6 space-y-5">
            {/* English Name */}
            <div>
              <Input
                label="Name (English) *"
                placeholder="Enter center name in English"
                {...register('name.en')}
                error={errors.name?.en?.message}
              />
            </div>

            {/* Arabic Name */}
            <div>
              <Input
                label="Name (Arabic) *"
                placeholder="أدخل اسم المركز بالعربية"
                dir="rtl"
                {...register('name.ar')}
                error={errors.name?.ar?.message}
              />
            </div>

            {/* Phone */}
            <div>
              <Input
                label="Phone"
                placeholder="+966501234567"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="info@center.com"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isCreating || isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating || loading}
            >
              {isCreating || isUpdating || loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {initValues ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initValues ? 'Update Center' : 'Create Center'
              )}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
