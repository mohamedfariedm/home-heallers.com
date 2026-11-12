'use client';

import { useState } from 'react';
import { PiUserGearDuotone } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreatePermissions,
  useUpdatePermition,
} from '@/framework/permitions';
import {
  type CreatePermitionInput,
  createPermitionSchema,
} from '@/utils/validators/create-permition.schema';
import {
  ModalFormHeader,
  ModalFormFooter,
  modalFormClassName,
} from '@/components/ui/modal-form-shell';

export default function CreatePermition({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const [isLoading, setLoading] = useState(false);
  const { mutate, isPending } = useCreatePermissions();
  const { mutate: update } = useUpdatePermition();

  const onSubmit: SubmitHandler<CreatePermitionInput> = (data) => {
    if (initValues) {
      update({
        role_id: initValues?.id,
        name: data.name,
        guard_name: 'web',
      });
    } else {
      mutate({
        name: data.name,
        guard_name: 'web',
      });
    }

    setLoading(isPending);
  };

  return (
    <Form<CreatePermitionInput>
      onSubmit={onSubmit}
      validationSchema={createPermitionSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name || '',
        },
      }}
      className={modalFormClassName}
    >
      {({ register, formState: { errors } }) => (
        <>
          <ModalFormHeader
            title={initValues ? 'Update Permission' : 'Add a new Permission'}
            description="Define an access permission for roles"
            icon={<PiUserGearDuotone />}
          />

          <Input
            key={'name'}
            label="Permission Name (English)"
            placeholder="Enter English name"
            {...register('name')}
            error={errors.name?.message}
          />
          <ModalFormFooter
            cancelLabel="Cancel"
            isLoading={isLoading}
            submitLabel={
              initValues ? 'Update Permission' : 'Create Permission'
            }
          />
        </>
      )}
    </Form>
  );
}
