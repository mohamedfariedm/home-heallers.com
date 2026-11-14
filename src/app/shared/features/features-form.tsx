'use client';

import { useState } from 'react';
import { PiXBold, PiSparkle, PiGearSix } from 'react-icons/pi';
import { Controller, SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from 'rizzui';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  FeaturesFormInput,
  FeaturesFormSchema,
} from '@/utils/validators/features-form.schema';
import FormGroup from '../form-group';
import SelectBox from '@/components/ui/select';
import {
  useCreateFeature,
  useUpdateFeature,
  useCategories,
} from '@/framework/features';
import Spinner from '@/components/ui/spinner';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type FeatureTabId = 'general' | 'settings';

const FEATURE_TABS: {
  id: FeatureTabId;
  label: string;
  icon: typeof PiSparkle;
}[] = [
  { id: 'general', label: 'General', icon: PiSparkle },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

function featureTabHasErrors(
  tabId: FeatureTabId,
  errors: FieldErrors<FeaturesFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'general':
      return Boolean(err?.name);
    case 'settings':
      return Boolean(err?.category_id);
    default:
      return false;
  }
}

export default function UpdateCreateCategory({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { mutate: update } = useUpdateFeature();
  const { mutate: create, isPending } = useCreateFeature();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const [isActive, setIsActive] = useState<number>(
    initValues ? initValues?.is_active : 1
  );
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '');
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '');

  const onSubmit: SubmitHandler<FeaturesFormInput> = (data) => {
    const formatedName = JSON.stringify({
      en: lang == 'en' ? data.name : nameEn,
      ar: lang == 'en' ? nameAr : data.name,
    });

    if (initValues) {
      update({
        //@ts-ignore
        feature_id: initValues?.id,
        is_active: isActive,
        name: formatedName,
        category_id: data?.category_id || initValues?.category_id,
      });
    } else {
      create({
        name: formatedName,
        is_active: isActive,
        //@ts-ignore
        category_id: data?.category_id,
      });
    }

    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<FeaturesFormInput>) => {
    const tabIndex = FEATURE_TABS.findIndex((tab) =>
      featureTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FEATURE_TABS.length - 1, index)));
  };

  if (isCategoriesLoading) {
    return (
      <div className="m-auto flex items-center justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<FeaturesFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={FeaturesFormSchema}
      useFormProps={{
        defaultValues: {
          //@ts-ignore
          name: initValues?.name || '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({
        register,
        getValues,
        control,
        setValue,
        formState: { errors },
      }) => {
        const tabsWithErrors: ModalFormTabItem[] = FEATURE_TABS.map((tab) => ({
          ...tab,
          hasError: featureTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiSparkle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Feature' : 'Add a new Feature'}
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
                    description="Feature name and language"
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
                      label="Feature Name"
                      placeholder="feature name"
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
                    description="Category and status"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup title="Category" className="pt-0">
                      <Controller
                        control={control}
                        name="category_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select Category"
                            options={categories?.data?.map((role: any) => {
                              return { ...role, value: role.name };
                            })}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              categories?.data?.find(
                                (r: any) => r.id === selected
                              )?.name ?? ''
                            }
                          />
                        )}
                      />
                    </FormGroup>
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
              tabCount={FEATURE_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Feature' : 'Create Feature'}
            />
          </>
        );
      }}
    </Form>
  );
}
