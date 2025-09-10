'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import {
    RegionFormInput,
    RegionFormSchema,
} from '@/utils/validators/region-form.schema';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useCreateRegion, useUpdateRegion } from '@/framework/regions';
import toast from 'react-hot-toast';

// main category form component for create and update category
export default function UpdateCreateRegion({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateRegion();
  const { mutate: create, isPending } = useCreateRegion();
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '')

  const onSubmit: SubmitHandler<RegionFormInput> = (data) => {
      const formatedName = JSON.stringify({
              en: lang == 'en' ? data.name : nameEn,
              ar: lang == 'en' ? nameAr : data.name
      })
        if(initValues) {
            update({
                region_id: initValues?.id,
                is_active: isActive,
                name: formatedName
            })
    } else {
        create({
            name: formatedName,
            is_active: isActive,
        })
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
         <Form<RegionFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={RegionFormSchema}
            useFormProps={{
                defaultValues: {
                //@ts-ignore
                name: initValues?.name || '',
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, getValues, setValue , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Region' : 'Add a new Region'}
                        </Title>
                        <ActionIcon size="sm" variant="text" onClick={closeModal}>
                            <PiXBold className="h-auto w-5" />
                        </ActionIcon>
                    </div>
                    <div className='flex flex-wrap px-1 gap-3'>
                        <Checkbox
                            key={0} 
                            label={'English'}
                            checked={lang == 'en'}
                            onChange={ function() {
                                if(lang == 'en') return
                                const currentName = getValues('name')
                                setNameAr(currentName)
                                setValue('name', nameEn == '' ? '' : nameEn)
                                setLang(lang == 'en' ? 'ar' : 'en')
                            } }
                        />
                        <Checkbox
                            key={1} 
                            label={'Arabic'}
                            checked={lang == 'ar'}
                            onChange={ function() {
                                if(lang == 'ar') return
                                const currentName = getValues('name')
                                setNameEn(currentName)
                                setValue('name', nameAr == '' ? '' : nameAr)
                                setLang(lang == 'en' ? 'ar' : 'en')
                            } }
                        />
                    </div>
                    <Input
                    label="Region Name"
                    placeholder="Region name"
                    {...register('name')}
                    error={errors.name?.message}
                    />
                    <div className='flex flex-wrap px-1 gap-3'>
                        <Checkbox
                            key={1} 
                            label={'Active'}
                            checked={isActive == 1}
                            // value={permission.id}
                            onChange={ () => setIsActive(isActive ? 0 : 1) }
                        />
                        <Checkbox
                            key={0} 
                            label={'Inactive'}
                            checked={isActive == 0}
                            // value={permission.id}
                            onChange={ () => setIsActive(isActive ? 0 : 1) }
                        />
                    </div>
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
                        {initValues ? 'Update Region' : 'Create Region'}
                    </Button>
                    </div>
                </>
                );
            }}
            </Form>   
  );
}
