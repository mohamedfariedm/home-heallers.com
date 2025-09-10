'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import SelectBox from '@/components/ui/select';
import FormGroup from '@/app/shared/form-group';
import { ActionIcon } from '@/components/ui/action-icon';
import {
    CategoryFormInput,
    CategoryFormSchema,
} from '@/utils/validators/category-form.schema';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useMainCategories, useCreateMainCategory, useUpdateMainCategory } from '@/framework/maincategories ';
import toast from 'react-hot-toast';
import Spinner from '@/components/ui/spinner';

// main category form component for create and update category
export default function UpdateCreateRegion({ initValues }: {
    initValues?: any
}) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const { data: ParentCategories, isLoading: isCategoriesLoading} = useMainCategories("")
  const { mutate: update } = useUpdateMainCategory();
  const { mutate: create, isPending } = useCreateMainCategory();
  const [isActive, setIsActive] = useState<number>(initValues ? initValues?.is_active : 1)
  const [lang, setLang] = useState('en')
  const [nameEn, setNameEn] = useState(initValues ? initValues?.en_name : '')
  const [nameAr, setNameAr] = useState(initValues ? initValues?.ar_name : '')

  const onSubmit: SubmitHandler<CategoryFormInput> = (data) => {
      const formatedName = JSON.stringify({
              en: lang == 'en' ? data.name : nameEn,
              ar: lang == 'en' ? nameAr : data.name
      })
        if(initValues) {
            update({
                ...data,
                category_id: initValues?.id,
                priority: initValues?.priority,
                is_active: isActive,
                name: formatedName,
                // parent_category: Number(data.parent_category) == 0 ? null : data.parent_category?.toString()
            })
    } else {
        create({
            ...data,
            name: formatedName,
            is_active: isActive,
            priority: data.priority,
            type:"BG"
            // parent_category: Number(data.parent_category) == 0 ? null : data.parent_category?.toString()
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
        {isCategoriesLoading ? (
            <div className="m-auto">
                <Spinner size="lg" />
            </div>
        ) : (

            <Form<CategoryFormInput>
                resetValues={reset}
                onSubmit={onSubmit}
                validationSchema={CategoryFormSchema}
                useFormProps={{
                    defaultValues: {
                    //@ts-ignore
                    name: initValues?.name || '',
                    priority: initValues?.priority ? `${initValues?.priority}` : ''
                    }
                }}
                className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
                >
                {({ register, getValues, setValue, control , formState: { errors } }) => {
                    return (
                    <>
                        <div className="flex items-center justify-between">
                            <Title as="h4" className="font-semibold">
                                {initValues ? 'Update BG' : 'Add a new BG'}
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
                        label="BG Name"
                        placeholder="BG name"
                        {...register('name')}
                        error={errors.name?.message}
                        />
                        <Input
                        label="Priority"
                        placeholder="priority"
                        {...register('priority')}
                        error={errors.priority?.message}
                        />
                        {/* <FormGroup
                            title="Categories"
                            className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
                            >
                            <Controller
                                control={control}
                                name="parent_BG"
                                render={({ field: { value, onChange } }) => (
                                <SelectBox
                                    placeholder="Parent BG"
                                    options={ [{id: 0, name: 'blank'}].concat(ParentCategories?.data)?.map((role: any) =>{ return {...role, value: role.name}})}
                                    onChange={onChange}
                                    value={value}
                                    className="col-span-full"
                                    getOptionValue={(option) => String(option.id)}
                                    displayValue={(selected) =>
                                        [{id: 0, name: 'blank'}].concat(ParentCategories?.data)?.find((r: any) => r.id == selected)?.name ?? ''
                                    }
                                    error={errors?.parent_BG?.message as string}
                                />
                                )}
                            />
                        </FormGroup> */}
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
                            {initValues ? 'Update BG' : 'Create BG'}
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



//? last categorie configration if we need it ??

// return (
//     <>
//         {isCategoriesLoading ? (
//             <div className="m-auto">
//                 <Spinner size="lg" />
//             </div>
//         ) : (

//             <Form<CategoryFormInput>
//                 resetValues={reset}
//                 onSubmit={onSubmit}
//                 validationSchema={CategoryFormSchema}
//                 useFormProps={{
//                     defaultValues: {
//                     //@ts-ignore
//                     name: initValues?.name || '',
//                     priority: initValues?.priority ? `${initValues?.priority}` : 'priority'
//                     }
//                 }}
//                 className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
//                 >
//                 {({ register, getValues, setValue, control , formState: { errors } }) => {
//                     return (
//                     <>
//                         <div className="flex items-center justify-between">
//                             <Title as="h4" className="font-semibold">
//                                 {initValues ? 'Update Region' : 'Add a new Region'}
//                             </Title>
//                             <ActionIcon size="sm" variant="text" onClick={closeModal}>
//                                 <PiXBold className="h-auto w-5" />
//                             </ActionIcon>
//                         </div>
//                         <div className='flex flex-wrap px-1 gap-3'>
//                             <Checkbox
//                                 key={0} 
//                                 label={'English'}
//                                 checked={lang == 'en'}
//                                 onChange={ function() {
//                                     if(lang == 'en') return
//                                     const currentName = getValues('name')
//                                     setNameAr(currentName)
//                                     setValue('name', nameEn == '' ? '' : nameEn)
//                                     setLang(lang == 'en' ? 'ar' : 'en')
//                                 } }
//                             />
//                             <Checkbox
//                                 key={1} 
//                                 label={'Arabic'}
//                                 checked={lang == 'ar'}
//                                 onChange={ function() {
//                                     if(lang == 'ar') return
//                                     const currentName = getValues('name')
//                                     setNameEn(currentName)
//                                     setValue('name', nameAr == '' ? '' : nameAr)
//                                     setLang(lang == 'en' ? 'ar' : 'en')
//                                 } }
//                             />
//                         </div>
//                         <Input
//                         label="Category Name"
//                         placeholder="Category name"
//                         {...register('name')}
//                         error={errors.name?.message}
//                         />
//                         <Input
//                         label="Priority"
//                         placeholder="priority"
//                         {...register('priority')}
//                         error={errors.priority?.message}
//                         />
//                         <FormGroup
//                             title="Categories"
//                             className="pt-7 @2xl:pt-7 @3xl:grid-cols-12 @3xl:pt-11"
//                             >
//                             <Controller
//                                 control={control}
//                                 name="parent_category"
//                                 render={({ field: { value, onChange } }) => (
//                                 <SelectBox
//                                     placeholder="Parent Category"
//                                     options={ [{id: 0, name: 'blank'}].concat(ParentCategories?.data)?.map((role: any) =>{ return {...role, value: role.name}})}
//                                     onChange={onChange}
//                                     value={value}
//                                     className="col-span-full"
//                                     getOptionValue={(option) => String(option.id)}
//                                     displayValue={(selected) =>
//                                         [{id: 0, name: 'blank'}].concat(ParentCategories?.data)?.find((r: any) => r.id == selected)?.name ?? ''
//                                     }
//                                     error={errors?.parent_category?.message as string}
//                                 />
//                                 )}
//                             />
//                         </FormGroup>
//                         <div className='flex flex-wrap px-1 gap-3'>
//                             <Checkbox
//                                 key={1} 
//                                 label={'Active'}
//                                 checked={isActive == 1}
//                                 // value={permission.id}
//                                 onChange={ () => setIsActive(isActive ? 0 : 1) }
//                             />
//                             <Checkbox
//                                 key={0} 
//                                 label={'Inactive'}
//                                 checked={isActive == 0}
//                                 // value={permission.id}
//                                 onChange={ () => setIsActive(isActive ? 0 : 1) }
//                             />
//                         </div>
//                         <div className="flex items-center justify-end gap-4">
//                         <Button
//                             variant="outline"
//                             onClick={closeModal}
//                             className="w-full @xl:w-auto"
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             type="submit"
//                             isLoading={isLoading}
//                             className="w-full @xl:w-auto"
//                         >
//                             {initValues ? 'Update Category' : 'Create Category'}
//                         </Button>
//                         </div>
//                     </>
//                     );
//                 }}
//             </Form>   
//         )}
//     </>
//   );