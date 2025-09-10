'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { useUpdatePages, useUpdateSection } from '@/framework/attachments';
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
import FormGroup from '../form-group';
import { passwordFormSchemaValidty } from '@/utils/validators/attachmentsecValidty.schema';

export default function PasswordSettingsView({
  settings,
  formData,
}: {
  settings?: PasswordFormTypes;
  formData: any;
}) {
  const { mutate: update } = useUpdatePages();

  const [isLoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState([settings?.sliders]);
  const [reset, setReset] = useState({});
  console.log(settings?.description);
  console.log(formData?.additional);

  const onSubmit: SubmitHandler<PasswordFormTypes> = (data) => {
    update({
      title: data.title,
      description: data.description,
      attachment: isImageData,
      id: formData.id,
      section_id: formData.section_id,
      additional: data.additional,
      children: data.children,
    });
  };

  const handleFileUpload = (event: any) => {
    setLoading(true);
    // get the selected file from the input
    const file = event.target.files[0];
    // create a new FormData object and append the file to it
    const formData = new FormData();
    formData.append('attachment[]', file);
    // make a POST request to the File Upload API with the FormData object and Rapid API headers
    axios
      .post(process.env.NEXT_PUBLIC_ATTACHMENT_URL as string, formData, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token')}`,
        },
      })
      .then((response) => {
        // handle the response
        console.log(response.data.data);
        setImage(response.data.data);
        setLoading(false);
        toast.success('Image Uploaded successfuly');
      })
      .catch((error) => {
        // handle errors
        console.log(error);
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
            children: formData?.children
          },
        }}
      >
        {({ register, control, formState: { errors }, getValues }) => {
          console.log(errors);
          console.log(settings);

          return (
            <>
              <div className="mx-auto w-full max-w-screen-2xl">
                {settings?.title?.en?
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
                  :
                  <>
                    <Input
                      type="text"
                      className="col-span-full hidden"
                      placeholder="Title EN"
                      {...register('title.en')}
                      value={""}

                      error={errors.title?.en?.message}
                    />
                    <Input
                      type="text"
                      className="col-span-full hidden"
                      placeholder="Title AR"
                      {...register('title.ar')}
                      value={""}
                      error={errors.title?.ar?.message}
                    />

                  </>


                }
                {settings?.description?.en?
                  <>
                    <FormGroup
                      title="Discription EN"
                      className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                    >
                      <Input
                        type="text"
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
                      <Input
                        type="text"
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

                    <Input
                      type="text"
                      className="col-span-full hidden"
                      placeholder="Discription AR"
                      {...register('description.ar')}
                      value={" "}
                      error={errors.description?.ar?.message}
                    />



                  </>

                }


                {/* </>
                
                :""

} */}

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

                {settings?.sliders ? (
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
                      accept="all"
                      {...register('sliders')}
                      onChange={handleFileUpload}
                    />
                  </FormGroup>
                ) : (
                  ''
                )}

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
                        <Input
                          type="text"
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
                        <Input
                          type="text"
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

                      {settings?.sliders ? (
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
                            onChange={handleFileUpload}
                          />
                        </FormGroup>
                      ) : (
                        ''
                      )}


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
