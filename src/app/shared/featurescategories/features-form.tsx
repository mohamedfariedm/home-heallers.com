'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import toast from 'react-hot-toast';
import { useCreateCategory, useUpdateCategory } from '@/framework/features-categories';
import { FeaturesFormInput, FeaturesFormSchema } from '@/utils/validators/featurescat-form.schema';
import StatusField from '@/components/controlled-table/status-field';
import { useAllFilter } from '@/framework/settings';
import { useMedia } from 'react-use';
import FormGroup from '../form-group';
import SelectBox from '@/components/ui/select';
import { useMainCategories, useParentMainCategories, useSupSupCategories } from '@/framework/maincategories ';
import { string } from 'zod';

// main category form component for create and update category
export default function UpdateCreateCategory({ initValues }: {
    initValues?: any
}) {
    const isMediumScreen = useMedia('(max-width: 1860px)', false);
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { mutate: update } = useUpdateCategory();
  const { mutate: create, isPending } = useCreateCategory();
  const { data: allFilters } = useAllFilter()
  const [categoriesFilter, setCategoriesFilter] = useState<{id: number, name: string, children: any}[] | []>([])
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '')
  useEffect(()=>{
    setCategoriesFilter(allFilters?.data.categories)
  },[allFilters])

  const onSubmit: SubmitHandler<FeaturesFormInput> = (data) => {
    
      const formatedName = JSON.stringify({
              en: lang == 'en' ? data.name : nameEn,
              ar: lang == 'en' ? nameAr : data.name
      })
        if(initValues) {
            update({
                category_id: initValues?.id,
                is_active: isActive,
                name: formatedName,
                BG_id:data?.BG_id||initValues?.BG_id,
                VCP_id:data?.VCP_id||initValues?.VCP_id,
                BU_id:data?.BU_id||initValues?.BU_id,
            })
    } else {
        create({
            ...data,
            name: formatedName,
            is_active: isActive,
            // BG_id:initValues?.BG_id,
            // VCP_id:initValues?.VCP_id,
            // BU_id:initValues?.BU_id,

        })
    }
    setLoading(isPending);
    setReset({
      roleName: '',
    });
    // closeModal()
  };

  return (
         <Form<FeaturesFormInput>
            resetValues={reset}
            onSubmit={onSubmit}
            validationSchema={FeaturesFormSchema}
            useFormProps={{
                defaultValues: {
                //@ts-ignore
                name: initValues?.name || '',
                BG_id:initValues?.category_id,
                VCP_id:initValues?.sub_category_id,
                BU_id:initValues?.sub_sub_category_id,
                }
            }}
            className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
            >
            {({ register, getValues, setValue,control,watch , formState: { errors } }) => {
                                                            const SelectedCategory:any = watch('BG_id')
                                                            const SelectedSupCategory:any = watch('VCP_id')
                return (
                <>
                    <div className="flex items-center justify-between">
                        <Title as="h4" className="font-semibold">
                            {initValues ? 'Update Category' : 'Add a new Category'}
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
                    label="Category Name"
                    placeholder="category name"
                    {...register('name')}
                    error={errors.name?.message}
                    />

<FormGroup
                            title="BG"
                            className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="BG_id"
                                render={({ field: { value, onChange } }) => (
                                    <>
   
                                    <SelectBox
                                        placeholder="BG"
                                        options={ categoriesFilter?.map((cat:any) => ({...cat,name: cat?.name, value:String( cat?.id)}))}
                                        onChange={onChange}
                                        value={value}
                                        className="col-span-full"
                                        getOptionValue={(option) => String(option.id)}
                                        displayValue={(selected: string) =>
                                            categoriesFilter?.find((option: any) => String(option.id) == selected)?.name??
                                            "Select BG"
                                          }
                                        error={errors?.BG_id?.message as string}
                                    />
                                    </>
                                )}
                            />
                        </FormGroup>
                        <FormGroup
                            title="VCP "
                            className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="VCP_id"
                                render={({ field: { value, onChange } }) => (
                                    <>
   
                                    <SelectBox
                                        placeholder="VCP"
                                        options={categoriesFilter?.find((cat:any)=>String(cat?.id)==SelectedCategory)?.children?.map((cat:any) => ({...cat,name: cat?.name, value:String( cat?.id)}))}
                                        onChange={onChange}
                                        value={value}
                                        className="col-span-full"
                                        getOptionValue={(option) => String(option.id)}
                                        displayValue={(selected: string) =>
                                            categoriesFilter?.find((cat:any)=>String(cat?.id)==SelectedCategory)?.children?.find((option: any) => String(option.id) == selected)?.name ??
                                            "Select VCP"
                                          }
                                        error={errors?.VCP_id?.message as string}
                                    />
                                    </>
                                )}
                            />
                        </FormGroup>
                        <FormGroup
                            title="BU "
                            className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="BU_id"
                                render={({ field: { value, onChange } }) => (
                                    <>
   
                                    <SelectBox
                                        placeholder="BU"
                                        options={categoriesFilter?.find((cat:any)=>String(cat?.id)==SelectedCategory)?.children?.find((cat:any)=>String(cat?.id)==SelectedSupCategory)?.children?.map((cat:any) => ({...cat,name: cat?.name, value:String( cat?.id)}))}
                                        onChange={onChange}
                                        value={value}
                                        className="col-span-full"
                                        getOptionValue={(option) => String(option.id)}
                                        displayValue={(selected: string) =>
                                            categoriesFilter?.find((cat:any)=>String(cat?.id)==SelectedCategory)?.children?.find((cat:any)=>String(cat?.id)==SelectedSupCategory)?.children?.find((option: any) => String(option.id) == selected)?.name ??
                                            "Select BU"
                                          }
                                        error={errors?.BU_id?.message as string}
                                    />
                                    </>
                                )}
                            />
                        </FormGroup>
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
                        {initValues ? 'Update Category' : 'Create category'}
                    </Button>
                    </div>
                </>
                );
            }}
            </Form>   
  );
}
