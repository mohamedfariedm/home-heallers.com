'use client';

import { useEffect, useState } from 'react';
import {
  PiXBold,
  PiListChecks,
  PiTreeStructure,
  PiGearSix,
} from 'react-icons/pi';
import { Controller, SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionIcon } from 'rizzui';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/framework/features-categories';
import {
  FeaturesFormInput,
  FeaturesFormSchema,
} from '@/utils/validators/featurescat-form.schema';
import { useAllFilter } from '@/framework/settings';
import FormGroup from '../form-group';
import SelectBox from '@/components/ui/select';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type FeatureCatTabId = 'general' | 'categories' | 'settings';

const FEATURE_CAT_TABS: {
  id: FeatureCatTabId;
  label: string;
  icon: typeof PiListChecks;
}[] = [
  { id: 'general', label: 'General', icon: PiListChecks },
  { id: 'categories', label: 'Categories', icon: PiTreeStructure },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

function featureCatTabHasErrors(
  tabId: FeatureCatTabId,
  errors: FieldErrors<FeaturesFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'general':
      return Boolean(err?.name);
    case 'categories':
      return Boolean(err?.BG_id || err?.VCP_id || err?.BU_id);
    case 'settings':
      return false;
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
  const { mutate: update } = useUpdateCategory();
  const { mutate: create, isPending } = useCreateCategory();
  const { data: allFilters } = useAllFilter();
  const [categoriesFilter, setCategoriesFilter] = useState<
    { id: number; name: string; children: any }[] | []
  >([]);
  const [isActive, setIsActive] = useState<number>(
    initValues ? initValues?.is_active : 1
  );
  const [lang, setLang] = useState('en');
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '');
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '');

  useEffect(() => {
    setCategoriesFilter(allFilters?.data.categories);
  }, [allFilters]);

  const onSubmit: SubmitHandler<FeaturesFormInput> = (data) => {
    const formatedName = JSON.stringify({
      en: lang == 'en' ? data.name : nameEn,
      ar: lang == 'en' ? nameAr : data.name,
    });
    if (initValues) {
      update({
        category_id: initValues?.id,
        is_active: isActive,
        name: formatedName,
        BG_id: data?.BG_id || initValues?.BG_id,
        VCP_id: data?.VCP_id || initValues?.VCP_id,
        BU_id: data?.BU_id || initValues?.BU_id,
      });
    } else {
      create({
        ...data,
        name: formatedName,
        is_active: isActive,
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<FeaturesFormInput>) => {
    const tabIndex = FEATURE_CAT_TABS.findIndex((tab) =>
      featureCatTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FEATURE_CAT_TABS.length - 1, index)));
  };

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
          BG_id: initValues?.category_id,
          VCP_id: initValues?.sub_category_id,
          BU_id: initValues?.sub_sub_category_id,
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
        const SelectedCategory: any = watch('BG_id');
        const SelectedSupCategory: any = watch('VCP_id');

        const tabsWithErrors: ModalFormTabItem[] = FEATURE_CAT_TABS.map(
          (tab) => ({
            ...tab,
            hasError: featureCatTabHasErrors(tab.id, errors),
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
                    {initValues ? 'Update Category' : 'Add a new Category'}
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
                    description="Category name and language"
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
                      label="Category Name"
                      placeholder="category name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Categories"
                    description="BG, VCP and BU"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup title="BG" className="pt-0">
                      <Controller
                        control={control}
                        name="BG_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="BG"
                            options={categoriesFilter?.map((cat: any) => ({
                              ...cat,
                              name: cat?.name,
                              value: String(cat?.id),
                            }))}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => String(option.id)}
                            displayValue={(selected: string) =>
                              categoriesFilter?.find(
                                (option: any) => String(option.id) == selected
                              )?.name ?? 'Select BG'
                            }
                            error={errors?.BG_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>
                    <FormGroup title="VCP" className="pt-0">
                      <Controller
                        control={control}
                        name="VCP_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="VCP"
                            options={categoriesFilter
                              ?.find(
                                (cat: any) => String(cat?.id) == SelectedCategory
                              )
                              ?.children?.map((cat: any) => ({
                                ...cat,
                                name: cat?.name,
                                value: String(cat?.id),
                              }))}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => String(option.id)}
                            displayValue={(selected: string) =>
                              categoriesFilter
                                ?.find(
                                  (cat: any) =>
                                    String(cat?.id) == SelectedCategory
                                )
                                ?.children?.find(
                                  (option: any) =>
                                    String(option.id) == selected
                                )?.name ?? 'Select VCP'
                            }
                            error={errors?.VCP_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>
                    <FormGroup title="BU" className="pt-0">
                      <Controller
                        control={control}
                        name="BU_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="BU"
                            options={categoriesFilter
                              ?.find(
                                (cat: any) => String(cat?.id) == SelectedCategory
                              )
                              ?.children?.find(
                                (cat: any) =>
                                  String(cat?.id) == SelectedSupCategory
                              )
                              ?.children?.map((cat: any) => ({
                                ...cat,
                                name: cat?.name,
                                value: String(cat?.id),
                              }))}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => String(option.id)}
                            displayValue={(selected: string) =>
                              categoriesFilter
                                ?.find(
                                  (cat: any) =>
                                    String(cat?.id) == SelectedCategory
                                )
                                ?.children?.find(
                                  (cat: any) =>
                                    String(cat?.id) == SelectedSupCategory
                                )
                                ?.children?.find(
                                  (option: any) =>
                                    String(option.id) == selected
                                )?.name ?? 'Select BU'
                            }
                            error={errors?.BU_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Settings"
                    description="Active status"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
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
              tabCount={FEATURE_CAT_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={
                initValues ? 'Update Category' : 'Create category'
              }
            />
          </>
        );
      }}
    </Form>
  );
}
