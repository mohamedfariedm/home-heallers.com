'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler} from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { BrandFormInput, BrandFormSchema } from '@/utils/validators/Brand-form.schema copy';
import { useCreateBrand, useUpdateBrand } from '@/framework/brand';
import UploadAndDisplayImage from "./UploadAndDisplayImage"
import Image from 'next/image';
// main category form component for create and update category
let imageFile:any="faried";

export default function UpdateCreateBrand({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const { mutate: update} = useUpdateBrand();
  const { mutate: create, isPending } = useCreateBrand();
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '')
  const [selectedImage, setSelectedImage] = useState(null);
  const onSubmit: SubmitHandler<BrandFormInput> = (data) => {
        
    const formatedName = JSON.stringify({
            en: lang == 'en' ? data.name : nameEn,
            ar: lang == 'en' ? nameAr : data.name
    })
    if(initValues) {
            // lang == 'en' ? setNameEn(data.name) : setNameAr(data.name)
            update({
                ...data,
                name: formatedName,
                brand_id:initValues?.id,
                image:imageFile,
            })
    } else {
        create({
            ...data,
            name: formatedName,
            image:imageFile,
        })
    }
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
    <>
        <Form<BrandFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={BrandFormSchema}
            useFormProps={{
                defaultValues: {
                name: initValues?.name || '',
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, getValues,control, setValue , formState: { errors,isLoading } }) => {
                
                
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Brand' : 'Add a new Brand'}
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
                    label="Brand Name"
                    placeholder="Brand name"
                    {...register('name')}
                    error={errors.name?.message}
                    />
                    {/* image upload */}

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
                        {initValues ? 'Update brand' : 'Create brand'}
                    </Button>
                    </div>
                </>
                );
            }}
        </Form>
    </>   
  );
}
