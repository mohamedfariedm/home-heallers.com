'use client';

import { useEffect, useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Select from 'react-select'; // multi-select for categories
import {  ServiceFormInput, ServiceFormSchema } from '@/utils/validators/service-form.schema'; // schema for validation
import { Checkbox, Textarea } from 'rizzui'; // Checkbox component for language switch
import Spinner from '@/components/ui/spinner';
import { useCreateServices, useUpdateServices } from '@/framework/services';
import { useCategories } from '@/framework/categories';
import QuillEditor from '@/components/ui/quill-editor';
import FormGroup from '../form-group';
import Upload from '@/components/ui/upload';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';


export default function CreateOrUpdateServices({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const { mutate: createService, isPending: isCreating } = useCreateServices();
  const { mutate: updateService, isPending: isUpdating } = useUpdateServices();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories(""); // Get categories for dropdown

  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [selectedCategory, setSelectedCategory] = useState<any>(null); // To store the selected category
  const [categoryErroes, setCategoryErrors] = useState<any>(false); // To store the selected category
  const [loading, setLoading] = useState(false);
  const [isoading, setoading] = useState(false);
  let [imageError, setImageError] = useState(0);
  const [isImageData, setImage] = useState(initValues ? initValues?.image : null);

  const handleFileUpload = (event: any, type: 'Image' | 'File') => {
    setoading(true);
    const file = event.target.files?.[0];
    const formData = new FormData();
    formData.append('attachment[]', file);
    axios
      .post(process.env.NEXT_PUBLIC_ATTACHMENT_URL as string, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
        },
      })
      .then((response) => {
        console.log(response.data.data);
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch((error) => {
        console.log(error);
        toast.error('Please Try Again');
      })
      .finally(() => {
        setoading(false);
      });
  };
  // Language change handler
  useEffect(() => {
    if (initValues) {
      setSelectedCategory({
        value: initValues?.category.id, // Set the category based on initial values
        label: categoriesData?.data?.find((category: any) => category.id === initValues?.category.id)?.name?.[lang] || '',
      });
    }
  }, [initValues, lang, categoriesData]);
  useEffect(() => {
    if (initValues) {
      setLang(initValues?.lang || 'en');
    }
  }, [initValues]);

  const onSubmit: SubmitHandler<ServiceFormInput> = (data) => {
    const requestBody = {
      name: data.name,
      slug: data.slug,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      category_id: selectedCategory?.value, // Use selected category ID
      image: isImageData || initValues.image,
      description: data.description,
    };
console.log(selectedCategory?.value, 'selectedCategory?.value');
if (!selectedCategory?.value) {
  setCategoryErrors(true)
    }else{
      setCategoryErrors(false)
      if (initValues) {
        updateService({ service_id: initValues.id, ...requestBody });
      } else {
        createService(requestBody);
      }
      setLoading(true);
    }

  };

  if (isCategoriesLoading) {
    return (
      <div className="m-auto">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ServiceFormInput>
      onSubmit={onSubmit}
      validationSchema={ServiceFormSchema}
      useFormProps={{
        defaultValues: {
          name: {
            en: initValues?.name?.en || '',
            ar: initValues?.name?.ar || '',
          },
          meta_description: {
            en: initValues?.meta_description?.en || '',
            ar: initValues?.meta_description?.ar || '',
          },
          meta_title: {
            en: initValues?.meta_title?.en || '',
            ar: initValues?.meta_title?.ar || '',
          },
          slug: {
            en: initValues?.slug?.en || '',
            ar: initValues?.slug?.ar || '',
          },
          description: {
            en: initValues?.description?.en || '',
            ar: initValues?.description?.ar || '',
          },
          category_id: initValues?.category.id || 1,
        },
      }}
      
      className="flex flex-grow flex-col gap-6 p-6"
    >
      {({ register, formState: { errors }, setValue, control }) => {

console.log(errors, 'errors');

       return <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Service' : 'Create Service'}
            </Title>
            <Button onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          {/* Language Switch */}
          <div className="flex gap-3">
            <Checkbox label="English" checked={lang === 'en'} onChange={() => setLang('en')} />
            <Checkbox label="Arabic" checked={lang === 'ar'} onChange={() => setLang('ar')} />
          </div>

          {/* Multilingual Name Field */}
          {lang === 'en' ? (
            <>
            
            <Input
              key={"name.en"}
              label="Service Name (English)"
              {...register('name.en')}
              error={errors.name?.en?.message}
            />
            <Input
              key={"slug.en"}
              label="Service Slug (English)"
              {...register('slug.en')}
              error={errors.slug?.en?.message}
            />
            <QuillEditor
                    name="description.en"
                    error={errors.description?.en?.message}
                    control={control}
                    label="Description EN"
                    key="Description EN"
                    className="col-span-full [&_.ql-editor]:min-h-[100px]"
                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                  />

                  <Input
              key={"meta_title.en"}
              label="Meta Title (English)"
              {...register('meta_title.en')}
              placeholder='Enter Meta Title'
              error={errors.meta_title?.en?.message}
            />
                  <Textarea
                  key={"meta_description.en"}
                                label="Meta Description (EN)"
                                placeholder='Enter Meta Description'
                                {...register('meta_description.en')}
                                error={errors?.meta_description?.en?.message||""}
                              />
            
            </>
          ) : (
            <>
            <Input
              key={"name.ar"}
              label="Service Name (Arabic)"
              {...register('name.ar')}
              error={errors.name?.ar?.message}
            />
            <Input
              key={"slug.ar"}
              label="Service Slug (Arabic)"
              {...register('slug.ar')}
              error={errors.slug?.ar?.message}
            />
             <QuillEditor
                    name="description.ar"
                    error={errors.description?.ar?.message}
                    control={control}
                    label="Description AR"
                    key="Description AR"
                    className="col-span-full [&_.ql-editor]:min-h-[100px]"
                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                  />
                  <Input
              key={"meta_title.ar"}
              label="Meta Title (Arabic)"
              placeholder='Enter Meta Title'
              {...register('meta_title.ar')}
              error={errors.meta_title?.ar?.message}
            />
                  <Textarea
                  key={"meta_description.ar"}
                                label="Meta Description (AR)"
                                placeholder='Enter Meta Description'
                                {...register('meta_description.ar')}
                                error={errors?.meta_description?.ar?.message}
                              />
            </>
          )}

                       <FormGroup
                                               title="Image"
                                               className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                                             >
                                               {isoading && (
                                                 <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 rounded-md">
                                                   <Spinner size="xl" />
                                                 </div>
                                               )}
                                               <div className="flex flex-col gap-2">
                                                 <Upload
                                                   title="Image"
                                                   accept="img"
                                                   onChange={(e) => {
                                                     setImageError(0);
                                                     handleFileUpload(e, 'Image');
                                                   }}
                                                 />
                                                 {imageError > 0 && (
                                                   <p className="text-xs text-red-500">Image is required.</p>
                                                 )}
                                                 {(isImageData?.[0]?.thumbnail || isImageData?.[0]?.original) && (
                                                   <div className="relative flex justify-center items-center w-full mt-2">
                                                     <img
                                                       src={isImageData[0].thumbnail || isImageData[0].original}
                                                       alt="Uploaded Preview"
                                                       className="w-48 h-auto rounded border border-gray-200 shadow-sm"
                                                     />
                                                     <button
                                                       type="button"
                                                       onClick={() => setImage(null)}
                                                       className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-50"
                                                       title="Remove Image"
                                                     >
                                                       <PiXBold className="w-4 h-4 text-red-500" />
                                                     </button>
                                                   </div>
                                                 )}
                                               </div>
                                             </FormGroup>

          {/* Categories Select */}
          <div>
            <label>Category</label>
            <Select
              options={categoriesData?.data?.map((category: any) => ({
                value: category.id,
                label: category.name?.[lang] ?? category.name?.en,
              }))}
              value={selectedCategory} // Bind selected category
              onChange={(selected) => {
                setValue('category_id', selected?.value);
                setSelectedCategory(selected); // Update selected category
              }}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              placeholder="Select category"
            />
            {categoryErroes && (
              <p className="text-sm text-red-500">{"Category must be a valid category"}</p>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading || isCreating || isUpdating}>
              {initValues ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </>
      }
      
      }
    </Form>
  );
}
