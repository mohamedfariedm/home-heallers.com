'use client';

import { useState } from 'react';
import { PiInfo, PiNotePencil, PiTreeStructure, PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import SelectBox from '@/components/ui/select';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import {
  CategoryFormInput,
  CategoryFormSchema,
} from '@/utils/validators/category-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateMainCategory,
  useUpdateMainCategory,
  useParentMainCategories,
  useSupSupCategories,
} from '@/framework/maincategories ';
import Spinner from '@/components/ui/spinner';

type FormTabId = 'general' | 'details';

const FORM_TABS: {
  id: FormTabId;
  label: string;
  icon: typeof PiInfo;
}[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

const GENERAL_ERROR_KEYS = ['name', 'priority'];
const DETAILS_ERROR_KEYS = ['grand_parent_category', 'parent_category'];

function tabHasErrors(
  tabId: FormTabId,
  errors: FieldErrors<CategoryFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));
  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'details':
      return has(DETAILS_ERROR_KEYS);
    default:
      return false;
  }
}

export default function UpdateCreateRegion({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: ParentCategories, isLoading: isCategoriesLoading } =
    useSupSupCategories('');
  const { mutate: update } = useUpdateMainCategory();
  const { mutate: create, isPending } = useCreateMainCategory();
  const [isActive, setIsActive] = useState<number>(
    initValues ? initValues?.is_active : 1
  );
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '');
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '');
  const [id, setId] = useState(0);
  const { data: supCategories } = useParentMainCategories(Number(id));
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<CategoryFormInput> = (data) => {
    const formatedName = JSON.stringify({
      en: lang == 'en' ? data.name : nameEn,
      ar: lang == 'en' ? nameAr : data.name,
    });
    if (initValues) {
      update({
        ...data,
        category_id: initValues?.id,
        priority: initValues?.priority,
        is_active: isActive,
        name: formatedName,
        parent_category:
          Number(data.parent_category) == 0
            ? null
            : data.parent_category?.toString(),
      });
    } else {
      create({
        ...data,
        name: formatedName,
        is_active: isActive,
        priority: data.priority,
        type: 'BU',
        parent_category:
          Number(data.parent_category) == 0
            ? null
            : data.parent_category?.toString(),
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<CategoryFormInput>) => {
    const tabIndex = FORM_TABS.findIndex((tab) =>
      tabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  if (isCategoriesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<CategoryFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={CategoryFormSchema}
      useFormProps={{
        defaultValues: {
          //@ts-ignore
          name: initValues?.name || '',
          priority: initValues?.priority ? `${initValues?.priority}` : '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({
        register,
        getValues,
        setValue,
        control,
        watch,
        formState: { errors },
      }) => {
        const SelectedCategory: any = watch('grand_parent_category');
        setId(SelectedCategory);

        const tabsWithErrors: ModalFormTabItem[] = FORM_TABS.map((tab) => ({
          ...tab,
          hasError: tabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiTreeStructure className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update BU' : 'Add a new BU'}
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
                    title="BU details"
                    description="Name, language, and priority"
                  >
                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <Checkbox
                        key={0}
                        label={'English'}
                        checked={lang == 'en'}
                        onChange={function () {
                          if (lang == 'en') return;
                          const currentName = getValues('name');
                          setNameAr(currentName);
                          setValue('name', nameEn == '' ? '' : nameEn);
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                      <Checkbox
                        key={1}
                        label={'Arabic'}
                        checked={lang == 'ar'}
                        onChange={function () {
                          if (lang == 'ar') return;
                          const currentName = getValues('name');
                          setNameEn(currentName);
                          setValue('name', nameAr == '' ? '' : nameAr);
                          setLang(lang == 'en' ? 'ar' : 'en');
                        }}
                      />
                    </div>
                    <Input
                      label="BU Name"
                      placeholder="BU name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Priority"
                      placeholder="priority"
                      {...register('priority')}
                      error={errors.priority?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Hierarchy & status"
                    description="Parent categories and publication"
                    contentClassName="sm:grid-cols-1"
                  >
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        BG Categories
                      </label>
                      <Controller
                        control={control}
                        name="grand_parent_category"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="BG Category"
                            options={ParentCategories?.data.categories?.map(
                              (role: any) => {
                                return { ...role, value: role.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => {
                              return String(option.id);
                            }}
                            displayValue={(selected) =>
                              ParentCategories?.data.categories?.find(
                                (r: any) => r.id == selected
                              )?.name ?? ''
                            }
                            error={errors?.parent_category?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        VCP Categories
                      </label>
                      <Controller
                        control={control}
                        name="parent_category"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="VCP Category"
                            options={supCategories?.data?.map((role: any) => {
                              return { ...role, value: role.name };
                            })}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => {
                              return String(option.id);
                            }}
                            displayValue={(selected) =>
                              supCategories?.data.find(
                                (r: any) => r.id == selected
                              )?.name ?? ''
                            }
                            error={errors?.parent_category?.message as string}
                          />
                        )}
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Checkbox
                        key={1}
                        label={'Active'}
                        checked={isActive == 1}
                        onChange={() => setIsActive(isActive ? 0 : 1)}
                      />
                      <Checkbox
                        key={0}
                        label={'Inactive'}
                        checked={isActive == 0}
                        onChange={() => setIsActive(isActive ? 0 : 1)}
                      />
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={FORM_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update BU' : 'Create BU'}
            />
          </>
        );
      }}
    </Form>
  );
}
