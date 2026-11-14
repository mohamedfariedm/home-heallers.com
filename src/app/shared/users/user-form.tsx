'use client';

import { useState, useEffect } from 'react';
import { PiUser, PiLockKey, PiXBold } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ActionIcon } from 'rizzui';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateUser, useUpdateUser } from '@/framework/users';
import { useRoles } from '@/framework/roles';
import Select from 'react-select';
import Spinner from '@/components/ui/spinner';
import {
  createUserFormSchema,
  updateUserFormSchema,
  UserFormInput,
} from '@/utils/validators/user-form.schema';

type UserTabId = 'general' | 'security';

const USER_TABS: {
  id: UserTabId;
  label: string;
  icon: typeof PiUser;
}[] = [
  { id: 'general', label: 'General', icon: PiUser },
  { id: 'security', label: 'Security', icon: PiLockKey },
];

const GENERAL_ERROR_KEYS = ['name', 'email', 'mobile'];
const SECURITY_ERROR_KEYS = ['password', 'password_confirmation', 'roles'];

function userTabHasErrors(
  tabId: UserTabId,
  errors: FieldErrors<UserFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'security':
      return has(SECURITY_ERROR_KEYS);
    default:
      return false;
  }
}

export default function CreateOrUpdateUser({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { data: rolesData, isLoading: isRolesLoading } = useRoles('');

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (initValues?.Roles && rolesData?.data) {
      const mapped = initValues.Roles.map((r: any) => {
        const role = rolesData.data.find((item: any) => item.id === r.id);
        return {
          value: r.id,
          label: role?.name ?? role?.name ?? 'Unnamed',
        };
      });
      setSelectedRoles(mapped);
    }
  }, [initValues, lang, rolesData]);

  const onSubmit: SubmitHandler<UserFormInput> = (data) => {
    const requestBody: any = {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      roles: selectedRoles.map((r) => r.value),
    };

    if (initValues) {
      if (data.password && data.password.trim().length > 0) {
        requestBody.password = data.password;
        requestBody.password_confirmation = data.password_confirmation;
      }
    } else {
      requestBody.password = data.password;
      requestBody.password_confirmation = data.password_confirmation;
    }

    if (initValues) {
      updateUser({ user_id: initValues.id, ...requestBody });
    } else {
      createUser(requestBody);
    }

    setLoading(true);
  };

  const onInvalid = (formErrors: FieldErrors<UserFormInput>) => {
    const tabIndex = USER_TABS.findIndex((tab) =>
      userTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(USER_TABS.length - 1, index)));
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
      onInvalid={onInvalid}
      validationSchema={
        initValues ? updateUserFormSchema : createUserFormSchema
      }
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          email: initValues?.email || '',
          mobile: initValues?.mobile || '',
          password: '',
          password_confirmation: '',
          roles: initValues?.Roles?.map((r: any) => r.id) || [],
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, setValue, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = USER_TABS.map((tab) => ({
          ...tab,
          hasError: userTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiUser className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update User' : 'Create User'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Account details"
                    description="Name and contact information"
                  >
                    <Input
                      key="name.en"
                      label="Name (English)"
                      {...register('name.en')}
                      error={errors.name?.en?.message}
                    />
                    <Input
                      key="name.ar"
                      label="Name (Arabic)"
                      {...register('name.ar')}
                      error={errors.name?.ar?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                    <Input
                      label="Mobile"
                      type="tel"
                      {...register('mobile')}
                      error={errors.mobile?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Security & roles"
                    description="Password and role assignment"
                  >
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
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-sm font-medium">Select Roles</label>
                      <Select
                        isMulti
                        options={rolesData?.data?.map((role: any) => ({
                          value: role.id,
                          label: role.name ?? role.name,
                        }))}
                        value={selectedRoles}
                        onChange={(selected) => {
                          const value = selected
                            ? Array.isArray(selected)
                              ? [...selected]
                              : [selected]
                            : [];
                          setSelectedRoles(value as any[]);
                          setValue(
                            'roles',
                            value.map((r: any) => r.value)
                          );
                        }}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        placeholder="Select roles"
                      />
                      {errors?.roles?.message && (
                        <p className="text-sm text-red-500">
                          {errors.roles.message}
                        </p>
                      )}
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={USER_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={loading || isCreating || isUpdating}
              disabled={loading || isCreating || isUpdating}
              submitLabel={initValues ? 'Update User' : 'Create User'}
            />
          </>
        );
      }}
    </Form>
  );
}
