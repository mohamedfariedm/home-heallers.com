'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { useUpdateSection } from '@/framework/attachmentsService';
import {
  passwordFormSchema,
  PasswordFormTypes,
} from '@/utils/validators/attachment.schema';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Input } from 'rizzui';
import { Textarea } from "rizzui";
import FormGroup from '../form-group';
import { passwordFormSchemaValidty } from '@/utils/validators/attachmentsService.schema';

export default function PasswordSettingsView({
  settings,
  formData,
}: {
  settings?: PasswordFormTypes;
  formData: any;
}) {
  const { mutate: update } = useUpdateSection();

  const [isLoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState(formData?.children?.map((child:any)=>child.attachment)||[]);
  const [isPArentImageData, setParentImage] = useState([settings?.sliders]);
  const [reset, setReset] = useState({});

  const onSubmit: SubmitHandler<PasswordFormTypes> = (data) => {
    const hasApiTitle = settings?.title?.en || settings?.title?.ar;
    const hasApiDescription = settings?.description?.en || settings?.description?.ar;
  
    const isTitleEmpty = hasApiTitle && (!data.title?.en?.trim() && !data.title?.ar?.trim());
    const isDescriptionEmpty = hasApiDescription && (!data.description?.en?.trim() && !data.description?.ar?.trim());
  
    if (isTitleEmpty || isDescriptionEmpty) {
      toast.error("العنوان والوصف لا يمكن أن يكونا فارغين!");
      return;
    }
  
  

    
    data?.children?.forEach((child: any, index: number) => {
      child.attachment = isImageData[index] ? [].concat(isImageData[index]) : [];
    });
    const normalizedAttachments = Array.isArray(isPArentImageData[0])
    ? isPArentImageData[0]
    : isPArentImageData;
  
    update({
      title: data.title,
      description: data.description,
      attachment: normalizedAttachments,
      id: formData.id,
      section_id: formData.section_id,
      additional: data.additional,
      children: data.children
    });
  };

  const handleFileUpload = (event: any, index?: number) => {
    setLoading(true);
    const files = event.target.files;  // This will be an array if multiple files are selected.
    const formData = new FormData();
  
    // Loop through all the files and append each one
    for (let i = 0; i < files.length; i++) {
      formData.append('attachment[]', files[i]);
    }
  
    // Make the API request to upload the files
    axios
      .post(process.env.NEXT_PUBLIC_ATTACHMENT_URL as string, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
        },
      })
      .then((response) => {
        const uploadedFiles = response.data.data;
  
        // If an index is provided, update the corresponding child's image data
        if (index !== undefined) {
          setImage((prevImages:any) => {
            const updatedImages = [...prevImages];
            updatedImages[index] = [].concat(uploadedFiles); 
            return updatedImages;
          });
        } else {
          // Otherwise, update the main sliders image data
          setParentImage([].concat(uploadedFiles));
        }
  
        setLoading(false);
        toast.success('Image uploaded successfully');
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        toast.error('Please Try Again');
      });
  };

  return (
    <>
      <Form<PasswordFormTypes>
        validationSchema={!settings?.title?.en||!settings?.description?.en?passwordFormSchemaValidty:passwordFormSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        className="@container"
        useFormProps={{
          mode: 'onChange',
          defaultValues: {
            ...settings,
            additional: formData?.additional || {},
            children: formData?.children,
            // value: formData?.value,
          },
        }}
      >
        {({ register, control, formState: { errors }, getValues }) => {
          console.log(errors);
          console.log("ssss",settings);

          return (
            <>
              <div className="mx-auto w-full max-w-screen-2xl">
             
                {settings?.title?.en && (
                  <>
                 

                    <FormGroup
                      title="Title EN"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Input
                        type="text"
                        className="col-span-full"
                        placeholder="Title EN"
                        {...register('title.en')}
                        error={errors.title?.en?.message}
                      />
                    </FormGroup>
                    <FormGroup
                      title="Title AR"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Input
                        type="text"
                        className="col-span-full"
                        placeholder="Title AR"
                        {...register('title.ar')}
                        error={errors.title?.ar?.message}
                      />
                    </FormGroup>
                   
                  </>
                  // :
                  // <>
                  //   <Input
                  //     type="text"
                  //     className="col-span-full hidden"
                  //     placeholder="Title EN"
                  //     {...register('title.en')}
                  //     value={""}

                  //     error={errors.title?.en?.message}
                  //   />
                  //   <Input
                  //     type="text"
                  //     className="col-span-full hidden"
                  //     placeholder="Title AR"
                  //     {...register('title.ar')}
                  //     value={""}
                  //     error={errors.title?.ar?.message}
                  //   />

                  // </>
                )}

              {settings?.title.value?
                <>
                  <FormGroup
                  title="Value"
                  className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                  <Input
                    type="number"
                    className="col-span-full"
                    placeholder="Value"
                    {...register('title.value')}
                    // error={errors.value?.message}
                  />
                  </FormGroup>
                  </>:<>
                
                  </>
                }
             
                {/* {settings?.description?.en?
                  <>
                    <FormGroup
                      title="Discription EN"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Textarea
                        // type="text"
                        className="col-span-full"
                        placeholder="Discription EN"
                        {...register('description.en')}
                        error={errors.description?.ar?.message}
                      />
                    </FormGroup>

                    <FormGroup
                      title="Discription AR"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Textarea
                        // type="text"
                        className="col-span-full"
                        placeholder="Discription AR"
                        {...register('description.ar')}
                        error={errors.description?.ar?.message}
                      />
                    </FormGroup>

                  </> : <>
                    <Input
                      type="text"
                      className="col-span-full hidden"
                      placeholder="Discription EN"
                      {...register('description.en')}
                      value={" "}
                      error={errors.description?.ar?.message}
                    />

                    <Textarea
                      // type="text"
                      className="col-span-full hidden"
                      placeholder="Discription AR"
                      {...register('description.ar')}
                      value={" "}
                      error={errors.description?.ar?.message}
                    />



                  </>

                } */}

{settings?.description?.en && (
  <>
    <FormGroup title="Description EN" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
      <Textarea
        className="col-span-full"
        placeholder="Description EN"
        {...register('description.en', { required: "هذا الحقل مطلوب" })}
        error={errors.description?.en?.message}
      />
    </FormGroup>

    <FormGroup title="Description AR" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
      <Textarea
        className="col-span-full"
        placeholder="Description AR"
        {...register('description.ar', { required: "هذا الحقل مطلوب" })}
        error={errors.description?.ar?.message}
      />
    </FormGroup>
  </>
)}

               

                {formData?.additional?.link ? (
                  <FormGroup
                    title="Link"
                    className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    <Input
                      type="text"
                      className="col-span-full"
                      placeholder="Link"
                      {...register('additional.link')}
                    />
                  </FormGroup>
                ) : (
                  ''
                )}
                {formData?.additional?.date ? (
                  <>
                    <FormGroup
                      title="Date EN"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Input
                        type="text"
                        className="col-span-full"
                        placeholder="Date EN"
                        {...register('additional.date.en')}
                      />
                    </FormGroup>
                    <FormGroup
                      title="Date AR"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Input
                        type="text"
                        className="col-span-full"
                        placeholder="Date AR"
                        {...register('additional.date.ar')}
                      />
                    </FormGroup>
                  </>
                ) : (
                  ''
                )}

                {/* {settings?.sliders ? (
                  <FormGroup
                    title="Image"
                    className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                  >
                    {isLoading ? (
                      <div className="absolute z-10 m-auto flex h-[100%] w-[100%] items-center justify-center ">
                        <Spinner size="xl" />
                      </div>
                    ) : (
                      ''
                    )}
                    <Upload
                      accept="img"
                      {...register('sliders')}
                      onChange={handleFileUpload}
                    />
                  </FormGroup>
                ) : (
                  ''
                )} */}

                {formData?.children && formData.children.map((child: any, index: number) => {
                  return (
                    <div key={child.id}>
                      <br />
                      <hr />
                      <br />
                      <FormGroup
                        title="Title EN"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                      >
                        <Input
                          type="text"
                          className="col-span-full"
                          placeholder="Title EN"
                          {...register(`children.${index}.title.en`)}
                          error={errors.title?.en?.message}
                        />
                      </FormGroup>
                      <FormGroup
                        title="Title AR"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                      >
                        <Input
                          type="text"
                          className="col-span-full"
                          placeholder="Title AR"
                          {...register(`children.${index}.title.ar`)}
                          error={errors.title?.ar?.message}
                        />
                        
                      </FormGroup>
                      <FormGroup
                        title="Discription EN"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                      >
                        <Textarea
                          // type="text"
                          className="col-span-full"
                          placeholder="Discription EN"
                          {...register(`children.${index}.description.en`)}
                          error={errors.description?.ar?.message}
                        />
                      </FormGroup>

                      <FormGroup
                        title="Discription AR"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                      >
                        <Textarea
                          // type="text"
                          className="col-span-full"
                          placeholder="Discription AR"
                          {...register(`children.${index}.description.ar`)}
                          error={errors.description?.ar?.message}
                        />
                      </FormGroup>

                      {formData?.additional?.link ? (
                        <FormGroup
                          title="Link"
                          className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                          <Input
                            type="text"
                            className="col-span-full"
                            placeholder="Link"
                            {...register(`children.${index}.additional.link`)}
                          />
                        </FormGroup>
                      ) : (
                        ''
                      )}
                      {formData?.additional?.date ? (
                        <>
                          <FormGroup
                            title="Date EN"
                            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                          >
                            <Input
                              type="text"
                              className="col-span-full"
                              placeholder="Date EN"
                              {...register(`children.${index}.additional.date.en`)}
                            />
                          </FormGroup>
                          
                          <FormGroup
                            title="Date AR"
                            className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                          >
                            <Input
                              type="text"
                              className="col-span-full"
                              placeholder="Date AR"
                              {...register(`children.${index}.additional.date.ar`)}
                            />
                          </FormGroup>
                        </>
                      ) : (
                        ''
                      )}

                      {/* {settings?.sliders ? (
                        <FormGroup
                          title="Image"
                          className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                          {isLoading ? (
                            <div className="absolute z-10 m-auto flex h-[100%] w-[100%] items-center justify-center ">
                              <Spinner size="xl" />
                            </div>
                          ) : (
                            ''
                          )}
                          <Upload
                            accept="img"
                            {...register(`children.${index}.sliders`)}
                            onChange={(e) => handleFileUpload(e, index)}  // Pass the index of the child here
                          />
                        </FormGroup>
                      ) : (
                        ''
                      )} */}


                    </div>
                  );
                })}

                <div className="mt-6 flex w-auto items-center justify-end gap-3">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="solid"
                    className="dark:bg-gray-100 dark:text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </>
          );
        }}
      </Form>
    </>
  );
}

// Logged devices
