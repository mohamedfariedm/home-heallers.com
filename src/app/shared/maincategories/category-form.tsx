'use client';

import { useState } from 'react';
import { PiXBold, PiListChecks, PiGearSix } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from 'rizzui';
import {
  CategoryFormInput,
  CategoryFormSchema,
} from '@/utils/validators/category-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useMainCategories,
  useCreateMainCategory,
  useUpdateMainCategory,
} from '@/framework/maincategories ';
import Spinner from '@/components/ui/spinner';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type CategoryTabId = 'general' | 'settings';

const CATEGORY_TABS: {
  id: CategoryTabId;
  label: string;
  icon: typeof PiListChecks;
}[] = [
  { id: 'general', label: 'General', icon: PiListChecks },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

function categoryTabHasErrors(
  tabId: CategoryTabId,
  errors: FieldErrors<CategoryFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'general':
      return Boolean(err?.name);
    case 'settings':
      return Boolean(err?.priority || err?.is_active);
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
  const [activeTab, setActiveTab] = useState(0);
  const { isLoading: isCategoriesLoading } = useMainCategories('');
  const { mutate: update } = useUpdateMainCategory();
  const { mutate: create, isPending } = useCreateMainCategory();
  const [isActive, setIsActive] = useState<number>(
    initValues ? initValues?.is_active : 1
  );
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '');
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '');

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
      });
    } else {
      create({
        ...data,
        name: formatedName,
        is_active: isActive,
        priority: data.priority,
        type: 'BG',
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<CategoryFormInput>) => {
    const tabIndex = CATEGORY_TABS.findIndex((tab) =>
      categoryTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(CATEGORY_TABS.length - 1, index)));
  };

  if (isCategoriesLoading) {
    return (
      <div className="m-auto flex items-center justify-center p-10">
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
      {({ register, getValues, setValue, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = CATEGORY_TABS.map(
          (tab) => ({
            ...tab,
            hasError: categoryTabHasErrors(tab.id, errors),
          })
        );

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiListChecks className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update BG' : 'Add a new BG'}
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
                    title="General"
                    description="BG name and language"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <div className="flex flex-wrap gap-3 px-1">
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
                      label="BG Name"
                      placeholder="BG name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Settings"
                    description="Priority and active status"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Input
                      label="Priority"
                      placeholder="priority"
                      {...register('priority')}
                      error={errors.priority?.message}
                    />
                    <div className="flex flex-wrap gap-3 px-1">
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
              tabCount={CATEGORY_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update BG' : 'Create BG'}
            />
          </>
        );
      }}
    </Form>
  );
}
