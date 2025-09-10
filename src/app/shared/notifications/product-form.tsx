'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import FormGroup from '@/app/shared/form-group';
import SelectBox from '@/components/ui/select';
import { ActionIcon } from '@/components/ui/action-icon';
import { RadioGroup } from '@/components/ui/radio-group';
import { Radio } from '@/components/ui/radio';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useAllProductData, useUpdateProduct, useCreateProduct } from '@/framework/products';
import Spinner from '@/components/ui/spinner';
import { useAllNotifications, useCreateNotifcation } from '@/framework/notifications';
import { NotificationFormInput, NotificationFormSchema } from '@/utils/validators/notification-form.schema';
import { useMedia } from 'react-use';
import { Textarea } from 'rizzui';
import CreatableSelect from 'react-select'
import Image from 'next/image';

let imageFile="";
let usersarray:any=[]
//custom - all - marchindaizers - promoters - supervisors
const statusOptions = [
  {
    value: 'custom',
    name: 'custom',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Custom</Text>
      </div>
    ),
  },
  {
    value: 'all',
    name: 'all',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">All</Text>
      </div>
    ),
  },
  {
    value: 'marchindaizers',
    name: 'marchindaizers',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Marchindaizers</Text>
      </div>
    ),
  },
  {
    value: 'promoters',
    name: 'promoters',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Promoters</Text>
      </div>
    ),
  },
  {
    value: 'supervisors',
    name: 'supervisors',
    label: (
      <div className="flex items-center">
        <Text className="ms-2 font-medium ">Supervisors</Text>
      </div>
    ),
  },

];


// main category form component for create and update category
export default function CreateNotification({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: create, isPending } = useCreateNotifcation();
  const { data: allNotifications, isLoading: isAllProdLoading } = useAllNotifications();
  const [selectedFeatures, setSelectedFeatures] = useState({})
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_model_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_model_name : '')
  const [discriptionEn, setdiscriptionEn] = useState(initValues ? initValues?.en_description : '')
  const [discriptionAr, setdiscriptionAr] = useState(initValues ? initValues?.ar_description : '')
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState("");

  const onSubmit: SubmitHandler<NotificationFormInput> = (data) => {

    //   const formatedModelName = JSON.stringify({
    //           en: lang == 'en' ? data.model : nameEn,
    //           ar: lang == 'en' ? nameAr : data.model
    //   })
    //   const formatedDiscName = JSON.stringify({
    //     en: lang == 'en' ? data.description : discriptionEn,
    //     ar: lang == 'en' ? discriptionAr : data.description
    //   })
    // console.log('submit: ', data, formatedModelName, formatedDiscName, Object.values(selectedFeatures))
        create({
            users_type:data.users_type||"",
            title:data?.title||"",
            body:data?.body||"",
            image:imageFile||"",
            users:usersarray||"",
        })
        console.log(data);

    setLoading(isPending);
    setReset({
      roleName: '',
    });
    // closeModal()
  };
  const isMediumScreen = useMedia('(max-width: 1860px)', false);

  return (
    <>
        {
            isAllProdLoading ? (
                <div className="m-auto">
                    <Spinner size="lg" />
                </div>
            ) : (
                <Form<NotificationFormInput>
                    resetValues={reset}
                    onSubmit={onSubmit}
                    validationSchema={NotificationFormSchema}
                    useFormProps={{
                        defaultValues: {
                        //@ts-ignore
                        // modal: initValues?.modal || '',
                        // barcode: initValues?.barcode || '',
                        // sku_code: initValues?.sku_code || '',
                        // description: initValues?.description || '',
                        // model: initValues?.model || '',
                        // category_id:initValues?.category_id ||"",
                        // sub_category_id:initValues?.sub_category_id||"",
                        // sub_sub_category_id:initValues?.sub_sub_category_id||"",
                        // brand_id:initValues?.brand_id||"",
                        }
                    }}
                    className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
                    >
                    {({ register, getValues, setValue, watch, control, formState: { errors } }) => {
                        
                        return (
                        <>
                            <div className="flex items-center justify-between">
                                <Title as="h4" className="font-semibold">
                                    {initValues ? 'Update Notification' : 'Add a new Notification'}
                                </Title>
                                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                                    <PiXBold className="h-auto w-5" />
                                </ActionIcon>
                            </div>
                                  {/* <StatusField
                                    placeholder='User Type'
                                    // multiple
                                        options={statusOptions}
                                        
                                        value={selectedUserType}
                                        onChange={(value: string)=>{
                                            console.log(value)
                                            setSelectedUserType(value)
                                        }}
                                        getOptionValue={(option) => option.value}
                                        displayValue={(selected: string) =>
                                          statusOptions.find((option) => option.value === selected)?.label ??
                                          selected
                                        }
                                        {...(isMediumScreen && {
                                        label: 'User Type',
                                        labelClassName: 'font-medium text-gray-700',
                                        })}
                                        
                                    /> */}
                        <FormGroup
                        title="Users Type"
                        className="pt-2 w-full"
                        >
                        <Controller
                            control={control}
                            name="users_type"
                            render={({ field: { value, onChange } }) => (
                            <SelectBox
                                placeholder="Users Type"
                                options={ statusOptions.map((cat: any) =>{ return {...cat, value: cat.name}})}
                                onChange={onChange}
                                value={value}
                                className="col-span-full truncate"
                                getOptionValue={(option) => option.value }
                                displayValue={(selected:string) =>{
                                    setSelectedUserType(selected)
                                    
                                    return statusOptions.find((option) => option.value === selected)?.label ??
                                    selected
                                }
                                    
                                }
                                error={errors?.users_type?.message as string}
                            />
                            )}
                        />
                            {selectedUserType==="custom"? 
                                <CreatableSelect
                                styles={{
                                    control: (baseStyles, state) => ({
                                      ...baseStyles,
                                      boxShadow:"",
                                      borderColor:"black",
                                    }),
                                  }}
                                placeholder="Users"
                                className="pt-2 w-full"
                                closeMenuOnSelect={false}
                                options={ allNotifications?.data?.users.map((cat: any) =>{ 
                                    return {label:cat.name, value: cat.id}})} 
                                    isMulti
                                onChange={(value:any)=>{
                                    let far=[...value]
                                    let catc:any=[]
                                    far.map((fa)=>catc.push(fa.value))
                                    usersarray=[...catc]
                                }}
                                />:""}


                        </FormGroup>
                                    
                            <Input
                            label="Title"
                            className="pt-2 w-full"
                            placeholder="title"
                            {...register('title')}
                            error={errors.title?.message}
                            />
                            <Textarea
                            label="Message"
                            className="pt-2 w-full"
                            placeholder="Message"
                            {...register('body')}
                            error={errors.body?.message}
                            />
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
                                    
                            {/* <div className='flex flex-wrap px-1 gap-3'>
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
                            </div> */}




                            {/* <div className='flex gap-14 '>
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
                                displayValue={(selected) =>
                                    allProdCreate?.data?.categories?.find((cat: any) => cat?.id == SelectedCategory)?.children?.find((item: any) => item?.id == SelectedSubCategory)?.children?.find((r: any) => r.id == selected)?.name ?? selected
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
                            </div> */}



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
                                {initValues ? 'Update Notification' : 'Create Notification'}
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
