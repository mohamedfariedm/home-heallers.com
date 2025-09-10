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
import { useCreateRoles, useUpdateRole } from '@/framework/roles';
import { usePermissions } from '@/framework/permitions';
import Select from 'react-select';
import { createRoleSchema, CreateRoleInput } from '@/utils/validators/create-role.schema';
import { Checkbox } from 'rizzui';

export default function CreateRole({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const [lang, setLang] = useState<"en" | "ar">("en");

  const [isLoading, setLoading] = useState(false);
  const { mutate, isPending } = useCreateRoles();
  const { mutate: update } = useUpdateRole();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions("");

  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (initValues?.permissions) {
      setSelectedPermissions(initValues.permissions.map((permission: any) => ({
        value: permission.id,
        label: permission.name || permission.name || "Unnamed",
      })));
    }
  }, [initValues, lang]);

  const onSubmit: SubmitHandler<CreateRoleInput> = (data) => {
    const requestBody = {
      name: data.name,
      permissions: selectedPermissions.map((p) => p.value),
    };

    if (initValues) {
      update({ role_id: initValues.id, ...requestBody });
    } else {
      mutate(requestBody);
    }

    setLoading(isPending);
    // closeModal();
  };

  const handlePermissionChange = (selected: any) => {
    setSelectedPermissions(selected || []);
  };

  return (
    <Form<CreateRoleInput>
      onSubmit={onSubmit}
      validationSchema={createRoleSchema}
      useFormProps={{
        defaultValues: {
          name: initValues?.name || "",
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Role' : 'Add a new Role'}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>



          <Input
          key={"name"}
            label="Role Name (English)"
            placeholder="Enter English name"
            {...register("name")}
            error={errors.name?.message}
          />
          

          {/* Permissions Multi-Select */}
          <div className="flex flex-col gap-4">
            <Title as="h5" className="font-semibold">Select Permissions</Title>
            {isPermissionsLoading ? (
              <div>Loading...</div>
            ) : (
              <Select
              key={"permissionsSelect"}
                isMulti
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                options={permissions?.data?.map((permission: any) => ({
                  value: permission.id,
                  label: permission.name || permission.name || "Unnamed",
                }))}
                value={selectedPermissions}
                onChange={handlePermissionChange}
                placeholder="Select permissions"
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full @xl:w-auto"
            >
              {initValues ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
