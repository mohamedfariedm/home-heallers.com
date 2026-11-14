'use client';

import { useState } from 'react';
import { PiChatCircleText, PiInfo, PiNotePencil, PiXBold } from 'react-icons/pi';
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ActionIcon } from '@/components/ui/action-icon';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useUpdateInquerie } from '@/framework/inqueries';
import {
  InquerieFormInput,
  InquerieFormSchema,
} from '@/utils/validators/inqueries-form.schema';
import { Checkbox, Textarea } from 'rizzui';

type FormTabId = 'general' | 'details';

const FORM_TABS: {
  id: FormTabId;
  label: string;
  icon: typeof PiInfo;
}[] = [
  { id: 'general', label: 'General', icon: PiInfo },
  { id: 'details', label: 'Details', icon: PiNotePencil },
];

const GENERAL_ERROR_KEYS = ['response'];
const DETAILS_ERROR_KEYS = ['seen'];

function tabHasErrors(
  tabId: FormTabId,
  errors: FieldErrors<InquerieFormInput> | Record<string, unknown>
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

export default function UpdateCreateInquerie({
  initValues,
}: {
  initValues?: any;
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading] = useState(false);
  const { mutate: update } = useUpdateInquerie();
  const [seen, setseen] = useState<number>(1);
  const [activeTab, setActiveTab] = useState(0);

  const onSubmit: SubmitHandler<InquerieFormInput> = (data) => {
    if (initValues) {
      update({
        ...data,
        inquiry_id: initValues.id,
        response: data.response || initValues?.response,
        seen: String(seen),
      });
    }
    setReset({
      roleName: '',
    });
  };

  const onInvalid = (formErrors: FieldErrors<InquerieFormInput>) => {
    const tabIndex = FORM_TABS.findIndex((tab) =>
      tabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FORM_TABS.length - 1, index)));
  };

  return (
    <Form<InquerieFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={InquerieFormSchema}
      useFormProps={{
        defaultValues: {
          inquiry_id: String(initValues.id),
          response: initValues?.response,
          seen: String(seen),
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = FORM_TABS.map((tab) => ({
          ...tab,
          hasError: tabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiChatCircleText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? 'Update Inquerie' : 'Add a new Inquerie'}
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
                    title="Feedback"
                    description="Response to the inquiry"
                    contentClassName="sm:grid-cols-1"
                  >
                    <Textarea
                      label="Feed Back"
                      labelClassName="font-semibold"
                      placeholder="response"
                      {...register('response')}
                      error={errors.response?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Status"
                    description="Mark inquiry as seen"
                  >
                    <div className="sm:col-span-2">
                      <Checkbox
                        key={1}
                        label={'Seen'}
                        labelClassName="font-semibold"
                        checked={seen == 1}
                        onChange={() => setseen(seen ? 0 : 1)}
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
              isLoading={isLoading}
              disabled={isLoading}
              submitLabel={initValues ? 'Update Inquerie' : 'Create Inquerie'}
            />
          </>
        );
      }}
    </Form>
  );
}
