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

import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {  useUpdateInquerie } from '@/framework/inqueries';
import Spinner from '@/components/ui/spinner';
import { DatePicker } from '@/components/ui/datepicker';
import { InquerieFormInput, InquerieFormSchema } from '@/utils/validators/inqueries-form.schema';
import { log } from 'console';
import { Checkbox, Textarea } from 'rizzui';

// main category form component for create and update category
export default function UpdateCreateInquerie({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateInquerie();
  const [seen, setseen] = useState<number>(1)

  const onSubmit: SubmitHandler<InquerieFormInput> = (data) => {

    if(initValues) {
        update({
            ...data,
            inquiry_id: initValues.id,
            response:data.response||initValues?.response,
            seen:String(seen),
        })
    }
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
    <>
 (
        <Form<InquerieFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={InquerieFormSchema}
            useFormProps={{
                defaultValues: {
                    inquiry_id:String(initValues.id) ,
                    response:initValues?.response,
                    seen:String(seen),
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, control , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Inquerie' : 'Add a new Inquerie'}
                        </Title>
                        <ActionIcon size="sm" variant="text" onClick={closeModal}>
                            <PiXBold className="h-auto w-5" />
                        </ActionIcon>
                    </div>

                    
                    <Textarea
                    label="Feed Back"
                    labelClassName='font-semibold'
                    placeholder="response"
                    {...register('response')}
                    error={errors.response?.message}
                    />
                    <Checkbox
                            key={1} 
                            label={'Seen'}
                            labelClassName='font-semibold'
                            checked={seen == 1}
                            // value={permission.id}
                            onChange={ () => setseen(seen ? 0 : 1) }
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
                        {initValues ? 'Update Inquerie' : 'Create Inquerie'}
                    </Button>
                    </div>
                </>
                );
            }}
        </Form>
    )
    </>   
  );
}
