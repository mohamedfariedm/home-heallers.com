'use client';

import { useState, useEffect } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Title } from '@/components/ui/text';
import { useCreateUser, useUpdateUser } from '@/framework/users';
import { useRoles } from '@/framework/roles';
import Select from 'react-select';
import Spinner from '@/components/ui/spinner';
import { userFormSchema, UserFormInput } from '@/utils/validators/user-form.schema';

export default function CreateOrUpdateUser({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { data: rolesData, isLoading: isRolesLoading } = useRoles('');

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fill initial roles on update
  useEffect(() => {
    if (initValues?.Roles && rolesData?.data) {
      const mapped = initValues.Roles.map((r: any) => {
        const role = rolesData.data.find((item: any) => item.id === r.id)
        return {
          value: r.id,
          label: role?.name ?? role?.name?? 'Unnamed',
        }
      })
      setSelectedRoles(mapped)
    }
  }, [initValues, lang, rolesData])

  console.log(initValues, 'initValues');
  
  const onSubmit: SubmitHandler<UserFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      roles: selectedRoles.map((r) => r.value),
    };
console.log(data);

    if (initValues) {
      updateUser({ user_id: initValues.id, ...requestBody });
    } else {
      createUser(requestBody);
    }

    setLoading(true);
  };

  if (isRolesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<UserFormInput>
      onSubmit={onSubmit}
      validationSchema={userFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          email: initValues?.email || '',
          password: '',
          password_confirmation: '',
          roles: initValues?.Roles?.map((r: any) => r.id) || [],
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, setValue, watch, formState: { errors } }) => {
console.log(errors, 'errors');

        return<>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update User' : 'Create User'}
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
              label="Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
          ) : (
            <Input
            key={"name.ar"}
              label="Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />
          )}

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            {...register('password_confirmation')}
            error={errors.password_confirmation?.message}
          />

          {/* Role Selection */}
          <div className="flex flex-col gap-2">
  <label className="text-sm font-medium">Select Roles</label>
  <Select
    isMulti
    options={rolesData?.data?.map((role: any) => ({
      value: role.id,
      label: role.name ?? role.name,
    }))}
    value={selectedRoles}
    onChange={(selected) => {
      const value = selected || [];
      setSelectedRoles(value);
      setValue('roles', value.map((r) => r.value)); // 👈 Important to sync with form state
    }}
    menuPortalTarget={document.body}
    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
    placeholder="Select roles"
  />
  {errors?.roles?.message && (
    <p className="text-sm text-red-500">{errors.roles.message}</p>
  )}
</div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </>

      }
      }
    </Form>
  );
}
