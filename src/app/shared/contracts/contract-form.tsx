'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { useCreateContract, useUpdateContract } from '@/framework/contracts';
import { ContractFormInput } from '@/types';
import { useModal } from '@/app/shared/modal-views/use-modal';

const contractSchema = z.object({
  visit_date: z.string().min(1, 'Visit date is required'),
  last_date: z.string().min(1, 'Last date is required'),
  visit_time: z.string().min(1, 'Visit time is required'),
  last_time: z.string().min(1, 'Last time is required'),
  service_manager_name: z.string().min(1, 'Service manager name is required'),
  last_service_manager: z.string().min(1, 'Last service manager is required'),
  company_activity: z.string().min(1, 'Company activity is required'),
  company_location: z.string().min(1, 'Company location is required'),
  company_name: z.string().min(1, 'Company name is required'),
  manager_mobile: z.string().min(1, 'Manager mobile is required'),
  manager_email: z.string().email('Invalid email address'),
  visit_summary: z.string().min(1, 'Visit summary is required'),
});

export default function ContractForm({ initValues }: {
  initValues?: any
}) {
  const { closeModal } = useModal();
  const { mutate: create, isPending: isCreating } = useCreateContract();
  const { mutate: update, isPending: isUpdating } = useUpdateContract();
  
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContractFormInput>({
    resolver: zodResolver(contractSchema),
    defaultValues: initValues || {
      visit_date: '',
      last_date: '',
      visit_time: '',
      last_time: '',
      service_manager_name: '',
      last_service_manager: '',
      company_activity: '',
      company_location: '',
      company_name: '',
      manager_mobile: '',
      manager_email: '',
      visit_summary: '',
    },
  });

  const onSubmit: SubmitHandler<ContractFormInput> = (data) => {
    console.log('submit: ', data);
    
    if (initValues) {
      update({
        ...data,
        id: initValues?.id,
      });
    } else {
      create(data);
    }
    
    setLoading(isCreating || isUpdating);
    reset();
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Company Name <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('company_name')}
              placeholder="Enter company name"
              error={errors.company_name?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Company Activity <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('company_activity')}
              placeholder="Enter company activity"
              error={errors.company_activity?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Company Location <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('company_location')}
              placeholder="Enter company location"
              error={errors.company_location?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Service Manager Name <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('service_manager_name')}
              placeholder="Enter service manager name"
              error={errors.service_manager_name?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Last Service Manager <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('last_service_manager')}
              placeholder="Enter last service manager"
              error={errors.last_service_manager?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Manager Mobile <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('manager_mobile')}
              placeholder="Enter manager mobile"
              error={errors.manager_mobile?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Manager Email <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('manager_email')}
              type="email"
              placeholder="Enter manager email"
              error={errors.manager_email?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Visit Date <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('visit_date')}
              type="date"
              error={errors.visit_date?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Last Date <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('last_date')}
              type="date"
              error={errors.last_date?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Visit Time <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('visit_time')}
              type="time"
              error={errors.visit_time?.message}
            />
          </div>

          <div>
            <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Last Time <span className="text-red-500">*</span>
            </Text>
            <Input
              {...register('last_time')}
              type="time"
              error={errors.last_time?.message}
            />
          </div>
        </div>

        <div>
          <Text className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Visit Summary <span className="text-red-500">*</span>
          </Text>
          <Textarea
            {...register('visit_summary')}
            placeholder="Enter visit summary"
            rows={4}
            error={errors.visit_summary?.message}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="dark:bg-gray-100 dark:text-white dark:hover:bg-gray-200"
          >
            {loading ? 'Saving...' : initValues ? 'Update Contract' : 'Create Contract'}
          </Button>
        </div>
      </Form>
    </div>
  );
}

