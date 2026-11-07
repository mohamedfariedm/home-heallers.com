'use client';

import { useState } from 'react';
import { PiHammerDuotone } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  type CreateNationalityInput,
  createNationalitySchema,
} from '@/utils/validators/create-nationality.schema';
import {
  useCreateNationality,
  useUpdateNationality,
} from '@/framework/nationality';
import {
  ModalFormHeader,
  ModalFormFooter,
  modalFormClassName,
} from '@/components/ui/modal-form-shell';

export default function CreateNationality({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const [isLoading, setLoading] = useState(false);
  const { mutate, isPending } = useCreateNationality();
  const { mutate: update } = useUpdateNationality();

  const onSubmit: SubmitHandler<CreateNationalityInput> = (data) => {
    if (initValues) {
      update({
        role_id: initValues?.id,
        name: data.name,
      });
    } else {
      mutate({
        name: data.name,
      });
    }

    setLoading(isPending);
  };

  return (
    <Form<CreateNationalityInput>
      onSubmit={onSubmit}
      validationSchema={createNationalitySchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
        },
      }}
      className={modalFormClassName}
    >
      {({ register, formState: { errors } }) => (
        <>
          <ModalFormHeader
            title={
              initValues ? 'Update Nationality' : 'Add a new Nationality'
            }
            description="Manage nationality master data"
            icon={<PiHammerDuotone />}
          />

          <Input
            key={'name.en'}
            label="Nationality Name (English)"
            placeholder="Enter English name"
            {...register('name.en')}
            error={errors.name?.en?.message}
          />
          <Input
            key={'name.ar'}
            label="Nationality Name (Arabic)"
            placeholder="أدخل الاسم بالعربية"
            {...register('name.ar')}
            error={errors.name?.ar?.message}
          />

          <ModalFormFooter
            cancelLabel="Cancel"
            isLoading={isLoading}
            submitLabel={
              initValues ? 'Update Nationality' : 'Create Nationality'
            }
          />
        </>
      )}
    </Form>
  );
}
