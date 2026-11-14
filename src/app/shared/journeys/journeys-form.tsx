'use client';

import { useState } from 'react';
import { PiXBold, PiUser, PiCalendarBlank } from 'react-icons/pi';
import { SubmitHandler, Controller, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  JourneyFormInput,
  JourneyFormSchema,
} from '@/utils/validators/journey-form.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useCreateJourney,
  useUpdateJourney,
  useAllUserStore,
} from '@/framework/journeys';
import Spinner from '@/components/ui/spinner';
import { DatePicker } from '@/components/ui/datepicker';
import { formatDate } from '@/utils/format-date';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type JourneyTabId = 'assignment' | 'schedule';

const JOURNEY_TABS: {
  id: JourneyTabId;
  label: string;
  icon: typeof PiUser;
}[] = [
  { id: 'assignment', label: 'Assignment', icon: PiUser },
  { id: 'schedule', label: 'Schedule', icon: PiCalendarBlank },
];

function journeyTabHasErrors(
  tabId: JourneyTabId,
  errors: FieldErrors<JourneyFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'assignment':
      return Boolean(err?.user_id || err?.store_id);
    case 'schedule':
      return Boolean(err?.priority || err?.date || err?.date_from || err?.date_to);
    default:
      return false;
  }
}

export default function UpdateCreateJourney({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { data: allUserStore, isLoading: isAllUserStoreLoading } =
    useAllUserStore();
  const { mutate: update } = useUpdateJourney();
  const { mutate: create, isPending } = useCreateJourney();

  const onSubmit: SubmitHandler<JourneyFormInput> = (data) => {
    if (initValues) {
      const formatedDate = formatDate(data?.date, 'YYYY-MM-DD');
      update({
        date: String(formatedDate) || initValues?.date,
        journey_id: initValues.id,
        user_id: data.user_id || initValues?.user?.id,
        store_id: data.store_id || initValues?.store?.id,
        priority: data.priority || initValues?.priority,
      });
    } else {
      const formatedDateFrom = formatDate(data?.date_from, 'YYYY-MM-DD');
      const formatedDateTo = formatDate(data?.date_to, 'YYYY-MM-DD');
      create({
        date_from: formatedDateFrom,
        date_to: formatedDateTo,
        user_id: data.user_id,
        store_id: data.store_id,
        priority: data.priority,
      });
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<JourneyFormInput>) => {
    const tabIndex = JOURNEY_TABS.findIndex((tab) =>
      journeyTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(JOURNEY_TABS.length - 1, index)));
  };

  if (isAllUserStoreLoading) {
    return (
      <div className="m-auto flex items-center justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<JourneyFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={JourneyFormSchema}
      useFormProps={{
        defaultValues: {
          user_id: String(initValues?.user_id) || 'Select User',
          store_id: String(initValues?.store_id) || 'Select Store',
          priority: initValues?.priority ? String(initValues?.priority) : '',
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = JOURNEY_TABS.map((tab) => ({
          ...tab,
          hasError: journeyTabHasErrors(tab.id, errors),
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
                    {initValues ? 'Update Journey' : 'Add a new Journey'}
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
                    description="User and store"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup title="User" className="pt-0">
                      <Controller
                        control={control}
                        name="user_id"
                        render={({ field: { value, onChange } }) => (
                          <SelectBox
                            placeholder="Select User"
                            options={allUserStore?.data?.users?.map(
                              (user: any) => {
                                return { ...user, value: user.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => String(option.id)}
                            displayValue={(selected) =>
                              allUserStore?.data?.users?.find(
                                (r: any) => r.id == selected
                              )?.name ?? 'Select User'
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
                            options={allUserStore?.data?.stores?.map(
                              (store: any) => {
                                return { ...store, value: store.name };
                              }
                            )}
                            onChange={onChange}
                            value={value}
                            className="col-span-full"
                            getOptionValue={(option) => String(option.id)}
                            displayValue={(selected) =>
                              allUserStore?.data?.stores?.find(
                                (r: any) => r.id == selected
                              )?.name ?? 'Select Store'
                            }
                            error={errors?.store_id?.message as string}
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
                    title="Schedule"
                    description="Priority and dates"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <Input
                      label="Priority"
                      placeholder="priority"
                      {...register('priority')}
                      error={errors.priority?.message}
                    />

                    {initValues && (
                      <div className="[&>.react-datepicker-wrapper]:w-full">
                        <Controller
                          name="date"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <DatePicker
                              inputProps={{ label: 'Date' }}
                              placeholderText="Select Date"
                              dateFormat="yyyy MM dd"
                              selected={value}
                              minDate={new Date()}
                              onChange={onChange}
                              showDisabledMonthNavigation
                            />
                          )}
                        />
                        {errors.date && (
                          <p className="cursor-default text-xs text-red-600">
                            {errors.date.message as string}
                          </p>
                        )}
                      </div>
                    )}

                    {!initValues && (
                      <div className="flex gap-3">
                        <div className="[&>.react-datepicker-wrapper]:w-full">
                          <Controller
                            name="date_from"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <DatePicker
                                inputProps={{ label: 'Date From' }}
                                placeholderText="Select Date"
                                dateFormat="yyyy MM dd"
                                selected={value}
                                minDate={new Date()}
                                onChange={onChange}
                                showDisabledMonthNavigation
                              />
                            )}
                          />
                          {errors.date && (
                            <p className="cursor-default text-xs text-red-600">
                              {errors.date.message as string}
                            </p>
                          )}
                        </div>
                        <div className="[&>.react-datepicker-wrapper]:w-full">
                          <Controller
                            name="date_to"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <DatePicker
                                inputProps={{ label: 'Date To' }}
                                placeholderText="Select Date"
                                dateFormat="yyyy MM dd"
                                selected={value}
                                minDate={new Date()}
                                onChange={onChange}
                                showDisabledMonthNavigation
                              />
                            )}
                          />
                          {errors.date && (
                            <p className="cursor-default text-xs text-red-600">
                              {errors.date.message as string}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={JOURNEY_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? 'Update Journey' : 'Create Journey'}
            />
          </>
        );
      }}
    </Form>
  );
}
