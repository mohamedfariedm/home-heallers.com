'use client';

import { useState } from 'react';
import { PiXBold, PiUser, PiTarget } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  TargetFormInput,
  TargetFormSchema,
} from '@/utils/validators/targets-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useAllTargets,
  useCreateTarget,
  useUpdateTarget,
} from '@/framework/targets';
import { DatePicker } from '@/components/ui/datepicker';
import { formatDate } from '@/utils/format-date';
import Spinner from '@/components/ui/spinner';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type TargetTabId = 'assignment' | 'targets';

const TARGET_TABS: {
  id: TargetTabId;
  label: string;
  icon: typeof PiUser;
}[] = [
  { id: 'assignment', label: 'Assignment', icon: PiUser },
  { id: 'targets', label: 'Targets', icon: PiTarget },
];

function targetTabHasErrors(
  tabId: TargetTabId,
  errors: FieldErrors<TargetFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'assignment':
      return Boolean(err?.user_id || err?.store_id || err?.product_id);
    case 'targets':
      return Boolean(err?.tgt_quentity || err?.tgt_value || err?.date);
    default:
      return false;
  }
}

export default function UpdateCreateTarget({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { data: AllTargets, isLoading: isDataLoading } = useAllTargets();
  const { mutate: update } = useUpdateTarget();
  const { mutate: create, isPending } = useCreateTarget();

  const onSubmit: SubmitHandler<TargetFormInput> = (data) => {
    if (initValues) {
      update({
        ...data,
        target_id: initValues?.id,
        date: data?.date
          ? formatDate(data?.date, 'YYYY-MM-DD')
          : initValues?.date,
      });
    } else {
      create({
        ...data,
        date: formatDate(data?.date, 'YYYY-MM-DD'),
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<TargetFormInput>) => {
    const tabIndex = TARGET_TABS.findIndex((tab) =>
      targetTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(TARGET_TABS.length - 1, index)));
  };

  if (isDataLoading) {
    return (
      <div className="m-auto flex items-center justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<TargetFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={TargetFormSchema}
      useFormProps={{
        defaultValues: {
          //@ts-ignore
          user_id: initValues?.user_id || '',
          store_id: initValues?.store_id || '',
          product_id: initValues?.product_id || '',
          tgt_quentity: initValues?.tgt_quentity ?? '',
          tgt_value: initValues?.tgt_value ?? '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = TARGET_TABS.map((tab) => ({
          ...tab,
          hasError: targetTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiTarget className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Target' : 'Add a new Target'}
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
                    title="Assignment"
                    description="User, store and product"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup title="User" className="pt-0">
                      <Controller
                        control={control}
                        name="user_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select User"
                            options={AllTargets?.data?.users?.map(
                              (user: any) => {
                                return { ...user, value: user.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              AllTargets?.data?.users?.find(
                                (r: any) => r.id == selected
                              )?.name ?? ''
                            }
                            error={errors?.user_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>
                    <FormGroup title="Store" className="pt-0">
                      <Controller
                        control={control}
                        name="store_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select Store"
                            options={AllTargets?.data?.stores?.map(
                              (store: any) => {
                                return { ...store, value: store.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.id}
                            displayValue={(selected) =>
                              AllTargets?.data?.stores?.find(
                                (r: any) => r.id == selected
                              )?.name ?? ''
                            }
                            error={errors?.store_id?.message as string}
                          />
                        )}
                      />
                    </FormGroup>
                    <FormGroup title="Product" className="pt-0">
                      <Controller
                        control={control}
                        name="product_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select Product"
                            options={AllTargets?.data?.products?.map(
                              (product: any) => {
                                return {
                                  name: product.sku_code,
                                  value: product.id,
                                };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => option.value}
                            displayValue={(selected) =>
                              AllTargets?.data?.products?.find(
                                (r: any) => r.id == selected
                              )?.sku_code ?? ''
                            }
                            error={errors?.product_id?.message as string}
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
                    title="Targets"
                    description="Quantity, value and date"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Input
                      label="Target Quantity"
                      placeholder="Target Quantity"
                      {...register('tgt_quentity')}
                      error={errors.tgt_quentity?.message}
                    />
                    <Input
                      label="Target Value"
                      placeholder="Target Value"
                      {...register('tgt_value')}
                      error={errors.tgt_value?.message}
                    />
                    <Controller
                      name="date"
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <DatePicker
                          inputProps={{ label: 'Target Date' }}
                          placeholderText="Select Date"
                          dateFormat="dd/MM/yyyy"
                          onChange={onChange}
                          onBlur={onBlur}
                          wrapperClassName="w-full"
                          //@ts-ignore
                          selected={value}
                        />
                      )}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={TARGET_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Target' : 'Create Target'}
            />
          </>
        );
      }}
    </Form>
  );
}
