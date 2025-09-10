'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import {
    JourneyFormInput,
    JourneyFormSchema,
} from '@/utils/validators/journey-form.schema';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateJourney, useUpdateJourney, useAllUserStore } from '@/framework/journeys';
import Spinner from '@/components/ui/spinner';
import { DatePicker } from '@/components/ui/datepicker';
import { formatDate } from '@/utils/format-date';

// main category form component for create and update category
export default function UpdateCreateJourney({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: allUserStore, isLoading: isAllUserStoreLoading } = useAllUserStore()
  const { mutate: update } = useUpdateJourney();
  const { mutate: create, isPending } = useCreateJourney();

  const onSubmit: SubmitHandler<JourneyFormInput> = (data) => {
        
    if(initValues) {
    const formatedDate = formatDate(data?.date, 'YYYY-MM-DD')
        update({
            date: String(formatedDate) || initValues?.date,
            journey_id: initValues.id,
            user_id: data.user_id || initValues?.user?.id,
            store_id: data.store_id || initValues?.store?.id,
            priority: data.priority || initValues?.priority
        })
    } else {
        const formatedDateFrom = formatDate(data?.date_from, 'YYYY-MM-DD')
        const formatedDateTo = formatDate(data?.date_to, 'YYYY-MM-DD')
        create({
            date_from: formatedDateFrom,
            date_to: formatedDateTo,
            user_id: data.user_id,
            store_id: data.store_id,
            priority: data.priority
        })
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
    <>
    {isAllUserStoreLoading ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
    ) : (
        <Form<JourneyFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={JourneyFormSchema}
            useFormProps={{
                defaultValues: {
                user_id: String(initValues?.user_id) || 'Select User',
                store_id: String(initValues?.store_id) || 'Select Store',
                priority: initValues?.priority ? String(initValues?.priority) : '',
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, control , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Journey' : 'Add a new Journey'}
                        </Title>
                        <ActionIcon size="sm" variant="text" onClick={closeModal}>
                            <PiXBold className="h-auto w-5" />
                        </ActionIcon>
                    </div>

                    <FormGroup
                        title="User"
                        className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="user_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select User"
                                options={ allUserStore?.data?.users?.map((user: any) =>{ return {...user, value: user.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => String(option.id)}
                                displayValue={(selected) =>
                                    allUserStore?.data?.users?.find((r: any) => r.id == selected)?.name ?? 'Select User'
                                }
                                error={errors?.user_id?.message as string}
                            />
                            )}
                        />
                    </FormGroup>

                    <FormGroup
                        title="Store"
                        className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="store_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select Store"
                                options={ allUserStore?.data?.stores?.map((store: any) =>{ return {...store, value: store.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => String(option.id)}
                                displayValue={(selected) =>
                                    allUserStore?.data?.stores?.find((r: any) => r.id == selected)?.name ?? 'Select Store'
                                }
                                error={errors?.store_id?.message as string}
                            />
                            )}
                        />
                    </FormGroup>
                    
                    <Input
                    label="Priority"
                    placeholder="priority"
                    {...register('priority')}
                    error={errors.priority?.message}
                    />
                    
                    {initValues && 
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
                            <p className="text-red-600 text-xs cursor-default">
                            {errors.date.message as string}
                          </p>
                        )}
                    </div>}

                    {!initValues && (
                        <div className='flex gap-3'>
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
                                <p className="text-red-600 text-xs cursor-default">
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
                                <p className="text-red-600 text-xs cursor-default">
                                {errors.date.message as string}
                            </p>
                            )}
                        </div>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-end gap-4">
                    <Button
                        variant="outline"
                        onClick={closeModal}
                        className="w-full @xl:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full @xl:w-auto"
                    >
                        {initValues ? 'Update Journey' : 'Create Journey'}
                    </Button>
                    </div>
                </>
                );
            }}
        </Form>
    )}
    </>   
  );
}
