'use client';

import { useState } from 'react';
import uniqueId from 'lodash/uniqueId';
import {
  PiXBold,
  PiCalendarBlank,
  PiMapPin,
} from 'react-icons/pi';
import { Controller, SubmitHandler, type FieldErrors } from 'react-hook-form';
import { Input, Text, Textarea } from 'rizzui';
import { ActionIcon } from '@/components/ui/action-icon';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Form } from '@/components/ui/form';
import toast from 'react-hot-toast';
import { DatePicker } from '@/components/ui/datepicker';
import { CalendarEvent } from '@/types';
import useEventCalendar from '@/hooks/use-event-calendar';
import {
  EventFormInput,
  eventFormSchema,
} from '@/utils/validators/create-event.schema';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

interface CreateEventProps {
  startDate?: Date;
  endDate?: Date;
  event?: CalendarEvent;
}

type EventTabId = 'details' | 'schedule';

const EVENT_TABS: {
  id: EventTabId;
  label: string;
  icon: typeof PiCalendarBlank;
}[] = [
  { id: 'details', label: 'Details', icon: PiMapPin },
  { id: 'schedule', label: 'Schedule', icon: PiCalendarBlank },
];

function eventTabHasErrors(
  tabId: EventTabId,
  errors: FieldErrors<EventFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'details':
      return Boolean(err?.title || err?.description || err?.location);
    case 'schedule':
      return Boolean(err?.startDate || err?.endDate);
    default:
      return false;
  }
}

export default function EventForm({
  startDate,
  endDate,
  event,
}: CreateEventProps) {
  const { closeModal } = useModal();
  const { createEvent, updateEvent } = useEventCalendar();
  const [activeTab, setActiveTab] = useState(0);

  const isUpdateEvent = event !== undefined;

  const onSubmit: SubmitHandler<EventFormInput> = (data) => {
    const isNewEvent = data.id === '' || data.id === undefined;

    console.log('event_data', data);

    toast.success(
      <Text as="b">
        Event {isNewEvent ? 'Created' : 'Updated'} Successfully
      </Text>
    );

    if (isNewEvent) {
      createEvent({
        id: uniqueId(),
        start: data.startDate ?? startDate,
        end: data.endDate ?? endDate,
        title: data.title,
        description: data.description,
        location: data.location,
      });
    } else {
      updateEvent({
        ...data,
        start: data.startDate,
        end: data.endDate,
      });
    }
    closeModal();
  };

  const onInvalid = (formErrors: FieldErrors<EventFormInput>) => {
    const tabIndex = EVENT_TABS.findIndex((tab) =>
      eventTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(EVENT_TABS.length - 1, index)));
  };

  return (
    <Form<EventFormInput>
      validationSchema={eventFormSchema}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      useFormProps={{
        defaultValues: {
          title: event?.title ?? '',
          description: event?.description ?? '',
          location: event?.location ?? '',
          startDate: startDate ?? event?.start,
          endDate: endDate ?? event?.end,
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, watch, formState: { errors } }) => {
        const watchedStartDate = watch('startDate');
        const watchedEndDate = watch('endDate');
        const tabsWithErrors: ModalFormTabItem[] = EVENT_TABS.map((tab) => ({
          ...tab,
          hasError: eventTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiCalendarBlank className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {isUpdateEvent ? 'Update Event' : 'Create a new event'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() => closeModal()}
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
                    title="Details"
                    description="Name, description, and location"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <input type="hidden" {...register('id')} value={event?.id} />
                    <Input
                      label="Event Name"
                      placeholder="Enter a name of event"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                    <Textarea
                      label="Event Description"
                      placeholder="Enter your event description"
                      {...register('description')}
                      error={errors.description?.message}
                      textareaClassName="h-20"
                    />
                    <Input
                      label="Event Location"
                      placeholder="Enter your location"
                      {...register('location')}
                      error={errors.location?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Schedule"
                    description="Start and end date & time"
                  >
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          selected={value}
                          onChange={onChange}
                          selectsStart
                          startDate={value}
                          endDate={watchedEndDate}
                          minDate={new Date()}
                          showTimeSelect
                          dateFormat="MMMM d, yyyy h:mm aa"
                        />
                      )}
                    />
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <DatePicker
                          selected={value}
                          onChange={onChange}
                          selectsEnd
                          minDate={watchedStartDate}
                          startDate={watchedStartDate}
                          endDate={value}
                          showTimeSelect
                          dateFormat="MMMM d, yyyy h:mm aa"
                        />
                      )}
                    />
                    {(errors.startDate || errors.endDate) && (
                      <p className="sm:col-span-2 text-sm text-red-600">
                        {errors.startDate?.message || errors.endDate?.message}
                      </p>
                    )}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={EVENT_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              submitLabel="Save"
            />
          </>
        );
      }}
    </Form>
  );
}
