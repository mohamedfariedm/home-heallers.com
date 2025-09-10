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
    TargetFormInput,
    TargetFormSchema,
} from '@/utils/validators/targets-form.schema';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAllTargets, useCreateTarget, useUpdateTarget } from '@/framework/targets';
import { DatePicker } from '@/components/ui/datepicker';
import { formatDate } from '@/utils/format-date';
import Spinner from '@/components/ui/spinner';

// main category form component for create and update category
export default function UpdateCreateTarget({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: AllTargets, isLoading: isDataLoading } = useAllTargets()
  const { mutate: update } = useUpdateTarget();
  const { mutate: create, isPending } = useCreateTarget();

  const onSubmit: SubmitHandler<TargetFormInput> = (data) => {
    if(initValues) {
            update({
                ...data,
                target_id: initValues?.id,
                date: data?.date ? formatDate(data?.date, 'YYYY-MM-DD') : initValues?.date
            })
    } else {
        create({
            ...data,
            date: formatDate(data?.date, 'YYYY-MM-DD') 
        })
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
  };

  return (
    <>
    {isDataLoading ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
    ) : (
        <Form<TargetFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={TargetFormSchema}
            useFormProps={{
                defaultValues: {
                //@ts-ignore
                user_id: initValues?.user_id || '',
                store_id: initValues?.store_id || '',
                product_id: initValues?.product_id || '',
                tgt_quentity: initValues?.tgt_quentity??"" ,
                tgt_value:initValues?.tgt_value??""
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, control , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Target' : 'Add a new Target'}
                        </Title>
                        <ActionIcon size="sm" variant="text" onClick={closeModal}>
                            <PiXBold className="h-auto w-5" />
                        </ActionIcon>
                    </div>
                    <FormGroup
                        title="User"
                        className="pt-2 @2xl:pt-2 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="user_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select User"
                                options={ AllTargets?.data?.users?.map((user: any) =>{ return {...user, value: user.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                    AllTargets?.data?.users?.find((r: any) => r.id == selected)?.name ?? ''
                                }
                                error={errors?.user_id?.message as string}
                            />
                            )}
                        />
                    </FormGroup>
                    <FormGroup
                        title="Store"
                        className="pt-2 @2xl:pt-2 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="store_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select Store"
                                options={ AllTargets?.data?.stores?.map((store: any) =>{ return {...store, value: store.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                    AllTargets?.data?.stores?.find((r: any) => r.id == selected)?.name ?? ''
                                }
                                error={errors?.store_id?.message as string}
                            />
                            )}
                        />
                    </FormGroup>
                    <FormGroup
                        title="Product"
                        className="pt-2 @2xl:pt-2 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                        <Controller
                            control={control}
                            name="product_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select Product"
                                options={ AllTargets?.data?.products?.map((product: any) =>{ return {name: product.sku_code, value: product.id}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => option.value}
                                displayValue={(selected) =>
                                    AllTargets?.data?.products?.find((r: any) => r.id == selected)?.sku_code ?? ''
                                }
                                error={errors?.product_id?.message as string}
                            />
                            )}
                        />
                    </FormGroup>
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
                        {initValues ? 'Update Target' : 'Create Target'}
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
