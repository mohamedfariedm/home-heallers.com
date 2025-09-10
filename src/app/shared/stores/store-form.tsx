'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormGroup from '@/app/shared/form-group';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import {
    StoreFormInput,
    StoreFormSchema,
} from '@/utils/validators/store-form.schema';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {  useCities } from '@/framework/cities';
import { useRetailers } from '@/framework/retailers';
import { useCreateStore, useUpdateStore } from '@/framework/stores';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/spinner';
import { PhoneNumber } from '@/components/ui/phone-input';
import { City } from '@/types';
import Image from 'next/image';
let imageFile:any="faried";

// main category form component for create and update category
export default function UpdateCreateStore({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: cities, isLoading: isCitiesLoading } = useCities('')
  const { data: retailers, isLoading: isRetailersLoading } = useRetailers('')
  const { mutate: update } = useUpdateStore();
  const { mutate: create, isPending } = useCreateStore();
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '')
  const [selectedImage, setSelectedImage] = useState(null);


  const onSubmit: SubmitHandler<StoreFormInput> = (data) => {
        
    const formatedName = JSON.stringify({
            en: lang == 'en' ? data.name : nameEn,
            ar: lang == 'en' ? nameAr : data.name
    })
    if(initValues) {
            // lang == 'en' ? setNameEn(data.name) : setNameAr(data.name)
            update({
                ...data,
                store_id: initValues?.id,
                city_id: data?.city_id || initValues?.city_id,
                region_id: cities?.data?.cities?.find((city: City) => city?.id == data.city_id)?.region_id || initValues?.region_id,
                is_active: isActive,
                store_code:data.store_code,
                image:imageFile,
                name: formatedName
            })
    } else {
        create({
            ...data,
            name: formatedName,
            is_active: isActive,
            city_id: data.city_id,
            region_id: cities?.data?.cities?.find((city: City) => city?.id == data.city_id)?.region_id,
            store_code:data.store_code,
            image:imageFile,
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
    {isCitiesLoading || isRetailersLoading ? (
        <div className="m-auto min-h-24">
            <Spinner size="lg" />
        </div>
    ) : (
        <Form<StoreFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={StoreFormSchema}
            useFormProps={{
                defaultValues: {
                name: initValues?.name || '',
                contact_number: initValues?.contact_number || '',
                contact_email: initValues?.contact_email || '',
                type: initValues?.type || '',
                store_code: initValues?.store_code || '',
                address: initValues?.address || '',
                city_id: initValues?.city_id || '',
                // region_id: initValues?.region_id || '',
                retailer_id: initValues?.retailer_id || '',
                lat: initValues?.lat || '',
                lng: initValues?.lng || ''
                }
            }}
            className="flex flex-grow flex-col gap-3 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, control, getValues, setValue , formState: { errors } }) => {
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Store' : 'Add a new Store'}
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
                    label="Store Name"
                    placeholder="Store name"
                    {...register('name')}
                    error={errors.name?.message}
                    />
                    <div className='flex gap-3 flex-1 justify-between w-full'>
                        <FormGroup
                            title="City"
                            className="w-full pt-1 @2xl:pt-1 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="city_id"
                                render={({ field: { value, onChange } }) => (
                                <SelectBox
                                    placeholder="Select City"
                                    options={ cities?.data?.cities?.map((city: any) =>{ return {...city, value: city.name}})}
                                    onChange={onChange}
                                    value={value}
                                    className="col-span-full"
                                    getOptionValue={(option) => option.id}
                                    displayValue={(selected) =>
                                    cities?.data?.cities?.find((r: any) => r.id === selected)?.name ?? ''
                                    }
                                    error={errors?.city_id?.message as string}
                                />
                                )}
                            />
                        </FormGroup>
                        <FormGroup
                            title="Retailer"
                            className="w-full pt-1 @2xl:pt-1 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="retailer_id"
                                render={({ field: { value, onChange } }) => (
                                <SelectBox
                                    placeholder="Select Retailer"
                                    options={ retailers?.data?.retailers?.map((retailer: any) =>{ return {...retailer, value: retailer.name}})}
                                    onChange={onChange}
                                    value={value}
                                    className="col-span-full"
                                    getOptionValue={(option) => option.id}
                                    displayValue={(selected) =>
                                    retailers?.data?.retailers?.find((r: any) => r.id === selected)?.name ?? ''
                                    }
                                    error={errors?.retailer_id?.message as string}
                                />
                                )}
                            />
                        </FormGroup>
                    </div>
                    <div className='flex gap-3 justify-between w-full'>
                        <Input
                        className='w-full'
                        label="Store Code"
                        placeholder="Store Code"
                        {...register('store_code')}
                        error={errors.store_code?.message}
                        />
                        <Input
                        className='w-full'
                        label="Type"
                        placeholder="Type"
                        {...register('type')}
                        error={errors.type?.message}
                        />
                    </div>
                    <div className='flex justify-between w-full gap-3'>
                    <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="05xxxxxxxx"
                    className='w-full'
                    {...register('contact_number')}
                    error={errors.contact_number?.message}
                    />
                        <Input
                        className='w-full'
                        label="Contact Email"
                        placeholder="Contact Email"
                        {...register('contact_email')}
                        error={errors.contact_email?.message}
                        />
                    </div>
                        {/* <Input
                        className='w-full'
                        label="Store Code"
                        placeholder="Store Code"
                        {...register('store_code')}
                        error={errors.contact_email?.message}
                        /> */}
                        <Input
                        className='w-full'
                        label="Address"
                        placeholder="Address"
                        {...register('address')}
                        error={errors.address?.message}
                        />
                    
                    <div className='flex justify-between w-full gap-3'>
                        <Input
                        className='w-full'
                        label="lat"
                        placeholder="lat"
                        {...register('lat')}
                        error={errors.lat?.message}
                        />
                        <Input
                        className='w-full'
                        label="lng"
                        placeholder="lng"
                        {...register('lng')}
                        error={errors.lng?.message}
                        />
                    </div>

                    <div>
                                {selectedImage && (
                                    <div>
                                    <Image
                                        alt="not found"
                                        width={250}
                                        height={250}
                                        src={URL.createObjectURL(selectedImage)}
                                    />
                                    <br />
                                    </div>
                                )}      
                                <input
                                    type="file"
                                    name="myImage"
                                    onChange={(event) => {
                                    const reader:any=new FileReader();
                                    //@ts-ignore
                                    const file:any=event.target.files[0];
                                    setSelectedImage(file);
                                    reader.addEventListener("load",()=>{
                                        imageFile=reader.result.replace("data:image/jpeg;base64,", '')                                                                                
                                    })
                                    reader.readAsDataURL(file);
                                    }}
                                />
                                        <br />

                         </div>
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
                        {initValues ? 'Update Store' : 'Create Store'}
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
