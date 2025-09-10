'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import FormGroup from '@/app/shared/form-group';
import SelectBox from '@/components/ui/select';
import { ActionIcon } from '@/components/ui/action-icon';
import {
    ProductFormInput,
    ProductFormSchema,
} from '@/utils/validators/product-form.schema';
import { RadioGroup } from '@/components/ui/radio-group';
import { Radio } from '@/components/ui/radio';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAllProductData, useUpdateProduct, useCreateProduct, useSpacificBU } from '@/framework/products';
import Spinner from '@/components/ui/spinner';
import { log } from 'console';
import Image from 'next/image';
let imageFile="faried";

// main category form component for create and update category
export default function UpdateCreateProduct({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateProduct();
  const { mutate: create, isPending } = useCreateProduct();
  const { data: allProdCreate, isLoading: isAllProdLoading } = useAllProductData();
  const [selectedFeatures, setSelectedFeatures] = useState({})
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [BUid,setBUid]=useState(1);
  const { data: spacificBU, isLoading: BULoading } = useSpacificBU(BUid);
useEffect(()=>{
    
},[BUid])
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_model_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_model_name : '')
  const [discriptionEn, setdiscriptionEn] = useState(initValues ? initValues?.en_description : '')
  const [discriptionAr, setdiscriptionAr] = useState(initValues ? initValues?.ar_description : '')
  const [selectedImage, setSelectedImage] = useState(null);
  const onSubmit: SubmitHandler<ProductFormInput> = (data) => {
      const formatedModelName = JSON.stringify({
              en: lang == 'en' ? data.model : nameEn,
              ar: lang == 'en' ? nameAr : data.model
      })
      const formatedDiscName = JSON.stringify({
        en: lang == 'en' ? data.description : discriptionEn,
        ar: lang == 'en' ? discriptionAr : data.description
      })
    console.log('submit: ', data, formatedModelName, formatedDiscName, Object.values(selectedFeatures))
    if(initValues) {
            update({
                ...data,
                product_id: initValues?.id,
                image:imageFile,
                model: formatedModelName,
                description: formatedDiscName,
                features: Object.values(selectedFeatures)

            })
    } else {
        create({
            ...data,
            model: formatedModelName,
            description: formatedDiscName,
            features: Object.values(selectedFeatures),
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
        {
            isAllProdLoading ? (
                <div className="m-auto">
                    <Spinner size="lg" />
                </div>
            ) : (
                <Form<ProductFormInput>
                    resetValues={reset}
                    onSubmit={onSubmit}
                    validationSchema={ProductFormSchema}
                    useFormProps={{
                        defaultValues: {
                        //@ts-ignore
                        modal: initValues?.modal || '',
                        barcode: initValues?.barcode || '',
                        sku_code: initValues?.sku_code || '',
                        description: initValues?.description || '',
                        model: initValues?.model || '',
                        category_id:initValues?.category_id ||"",
                        sub_category_id:initValues?.sub_category_id||"",
                        sub_sub_category_id:initValues?.sub_sub_category_id||"",
                        brand_id:initValues?.brand_id||"",
                        }
                    }}
                    className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
                    >
                    {({ register, getValues, setValue, watch, control, formState: { errors } }) => {
                        const SelectedCategory = watch('category_id')
                        const SelectedSubCategory = watch('sub_category_id')
                        return (
                        <>
                            <div className="flex items-center justify-between">
                                <Title as="h4" className="font-semibold">
                                    {initValues ? 'Update Product' : 'Add a new Product'}
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
                                        const currentModelName = getValues('model')
                                        const currentDiscName = getValues('description')
                                        setNameAr(currentModelName)
                                        setdiscriptionAr(currentDiscName)
                                        setValue('model', nameEn == '' ? '' : nameEn)
                                        setValue('description', discriptionEn == '' ? '' : discriptionEn)
                                        setLang(lang == 'en' ? 'ar' : 'en')
                                    } }
                                />
                                <Checkbox
                                    key={1} 
                                    label={'Arabic'}
                                    checked={lang == 'ar'}
                                    onChange={ function() {
                                        if(lang == 'ar') return
                                        const currentModelName = getValues('model')
                                        const currentDiscName = getValues('description')
                                        setNameEn(currentModelName)
                                        setdiscriptionEn(currentDiscName)
                                        setValue('model', nameAr == '' ? '' : nameAr)
                                        setValue('description', discriptionAr == '' ? '' : discriptionAr)
                                        setLang(lang == 'en' ? 'ar' : 'en')
                                    } }
                                />
                            </div>
                            <div className='flex gap-14 '>
                            <FormGroup
                        title="BG"
                        className="pt-2 w-1/2"
                        >
                        <Controller
                            control={control}
                            name="category_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select BG"
                                options={ allProdCreate?.data?.categories?.map((cat: any) =>{ return {...cat, value: cat.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full truncate"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                    allProdCreate?.data?.categories?.find((r: any) => r.id === selected)?.name ?? selected
                                }
                                error={errors?.category_id?.message as string}
                            />
                            )}
                        />
                        </FormGroup>
                        
                        <FormGroup
                        title="VCP"
                        className="pt-2 w-1/2"
                        >
                        <Controller
                            control={control}
                            name="sub_category_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select VCP"
                                options={ allProdCreate?.data?.categories?.find((item: any) => item?.id == SelectedCategory)?.children?.map((cat: any) =>{return {...cat, value: cat.name}})}
                                    
                                onChange={onChange}
                                value={value}
                                className="col-span-full truncate"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                    allProdCreate?.data?.categories?.find((cat: any) => cat?.id == SelectedCategory)?.children?.find((r: any) => r.id == selected)?.name ?? selected
                                }
                                error={errors?.category_id?.message as string}
                            />
                            )}
                        />
                        </FormGroup>
                            </div>
                            <div className='flex gap-14  '>

                            <FormGroup
                        title="BU"
                        className="pt-2 w-1/2"
                        >
                        <Controller
                            control={control}
                            name="sub_sub_category_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select BU"
                                options={ allProdCreate?.data?.categories?.find((item: any) => item?.id == SelectedCategory)?.children?.find((item: any) => item?.id == SelectedSubCategory)?.children?.map((cat: any) =>{ return {...cat, value: cat.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full truncate"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>{        
                                    setBUid(Number(selected))
                                    return allProdCreate?.data?.categories?.find((cat: any) => cat?.id == SelectedCategory)?.children?.find((item: any) => item?.id == SelectedSubCategory)?.children?.find((r: any) => r.id == selected)?.name ?? selected
                                                            }          
                                            }
                                error={errors?.category_id?.message as string}
                            />
                            )}
                        />
                        </FormGroup>

                        <FormGroup
                        title="Brand"
                        className="pt-2 w-1/2"
                        >
                        <Controller
                            control={control}
                            name="brand_id"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Select brand"
                                options={ allProdCreate?.data?.brands?.map((brand: any) =>{ return {...brand, value: brand.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full"
                                getOptionValue={(option) => option.id}
                                displayValue={(selected) =>
                                    allProdCreate?.data?.brands?.find((r: any) => r.id === selected)?.name ?? selected
                                }
                                error={errors?.brand_id?.message as string}
                            />
                            )}
                        />
                        </FormGroup>

                            </div>
                            <div className='flex gap-14  '>
                            <Input
                            label="Model"
                            className="pt-2 w-1/2"
                            placeholder="Model"
                            {...register('model')}
                            error={errors.model?.message}
                            />

                            <Input
                            label="sku_code"
                            className="pt-2 w-1/2"
                            placeholder="sku_code"
                            {...register('sku_code')}
                            error={errors.sku_code?.message}
                            />
                            </div>
                            <div className='flex gap-14  '>
                            <Input
                            label="Description"
                            className="pt-2 w-1/2"
                            placeholder="description"
                            {...register('description')}
                            error={errors.description?.message}
                            />

                            <Input
                            label="Barcode"
                            className="pt-2 w-1/2"
                            placeholder="barcode"
                            {...register('barcode')}
                            error={errors.barcode?.message}
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





                        {spacificBU?.data && spacificBU?.data?.length > 0 ? 
                        spacificBU?.data?.map((featureCate: any) => (
                            <FormGroup
                            key={featureCate?.id}
                            title={featureCate?.name}
                            className="pt-2 @2xl:pt-2 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                                <RadioGroup
                                    value={featureCate?.features}
                                    setValue={(val) => setSelectedFeatures({...selectedFeatures, [featureCate.name]: val})}
                                    className="justify-center space-x-4 space-y-4"
                                >
                                    <div className="divide-slate-300 flex gap-3 w-full md:w-[500px]">
                                        {featureCate?.features && featureCate?.features.length > 0 ? 
                                        featureCate?.features?.map((fc: any) => (
                                            <Radio
                                                key={fc?.id}
                                                name={featureCate?.name}
                                                label={fc?.name}
                                                value={fc?.id}
                                                className="mb-5"
                                                labelClassName="pl-2 text-sm font-medium text-gray-900"
                                            />

                                        )) : null
                                        }
                                    
                                    </div>
                                </RadioGroup>
                            </FormGroup>
                        )) : null
                        }

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
                                {initValues ? 'Update Product' : 'Create Product'}
                            </Button>
                            </div>
                        </>
                        );
                    }}
                </Form>
            )
        }
    </>   
  );
}
