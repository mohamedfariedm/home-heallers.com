'use client';

import { useEffect, useState } from 'react';
import { PiPackageDuotone } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateRoles, useUpdateRole } from '@/framework/roles';
import { usePermissions } from '@/framework/permitions';
import Select from 'react-select';
import { createRoleSchema, CreateRoleInput } from '@/utils/validators/create-role.schema';
import {
  ModalFormHeader,
  ModalFormFooter,
  modalFormClassName,
} from '@/components/ui/modal-form-shell';

/** Width for create/update role modals (header button + row edit). */
export const ROLE_MODAL_CUSTOM_SIZE = 'min(92vw, 820px)';

/** Max height (px) for the permissions field (chips + input); extra selections scroll inside the control. */
const PERMISSIONS_SELECT_INPUT_MAX_HEIGHT_PX = 140;

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
      className={modalFormClassName}
    >
      {({ register, formState: { errors } }) => (
        <>
          <ModalFormHeader
            title={initValues ? 'Update Role' : 'Add a new Role'}
            description="Assign permissions to this role"
            icon={<PiPackageDuotone />}
          />

          <Input
            key={'name'}
            label="Role Name (English)"
            placeholder="Enter English name"
            {...register('name')}
            error={errors.name?.message}
          />

          <div className="flex flex-col gap-4">
            <Title as="h5" className="font-semibold">
              Select Permissions
            </Title>
            {isPermissionsLoading ? (
              <div>Loading...</div>
            ) : (
              <Select
                key={'permissionsSelect'}
                isMulti
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({
                    ...base,
                    alignItems: 'flex-start',
                    borderRadius: 12,
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    maxHeight: PERMISSIONS_SELECT_INPUT_MAX_HEIGHT_PX,
                    overflowY: 'auto',
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: 'auto',
                    alignSelf: 'center',
                  }),
                }}
                options={permissions?.data?.map((permission: any) => ({
                  value: permission.id,
                  label: permission.name || permission.name || 'Unnamed',
                }))}
                value={selectedPermissions}
                onChange={handlePermissionChange}
                placeholder="Select permissions"
              />
            )}
          </div>

          <ModalFormFooter
            cancelLabel="Cancel"
            isLoading={isLoading}
            submitLabel={initValues ? 'Update Role' : 'Create Role'}
          />
        </>
      )}
    </Form>
  );
}
