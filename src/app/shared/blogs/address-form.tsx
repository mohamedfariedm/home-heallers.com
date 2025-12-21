'use client';

import { useEffect, useState } from 'react';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { ActionIcon, Switch, Textarea } from 'rizzui';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable'; // Import CreatableSelect for tags
import { useBlogs, useCreateBlog, useUpdateBlog } from '@/framework/blog';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { PiXBold } from 'react-icons/pi';
import FormGroup from '../form-group';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import { BlogFormInput, BlogFormSchema } from '@/utils/validators/blog-form.schema';
import QuillEditor from '@/components/ui/quill-editor';

export default function BlogsForm({ initValues }: { initValues?: any }) {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const { mutate: update } = useUpdateBlog();
  const { mutate: create, isPending } = useCreateBlog();
  const { data, isLoading: isBlogsLoading } = useBlogs('');

  const [isLoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState(initValues?.image || null);
  const [imageError, setImageError] = useState(0);

  // Sample predefined tags (you can fetch these from an API if needed)
  const predefinedTags = [
    { value: 'test1', label: 'Test 1' },
    { value: 'test2', label: 'Test 2' },
    { value: 'test3', label: 'Test 3' },
  ];

  const handleFileUpload = (event: any, type: 'Image' | 'File') => {
    setLoading(true);
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
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(`${type} Uploaded successfully`);
      })
      .catch(() => toast.error('Please Try Again'))
      .finally(() => setLoading(false));
  };

  const onSubmit: SubmitHandler<BlogFormInput> = (data) => {
    console.log('data ->', data);
    const payload = {
      name: {
        en: data.nameEN,
        ar: data.nameAR,
      },
      description: {
        en: data.descriptionEN,
        ar: data.descriptionAR,
      },
      image: isImageData || initValues?.image,
      show_in_home_page: data.show_in_home_page,
      date: data.date,
      meta_title: { en: data.metaTitleEN, ar: data.metaTitleAR }, // Use English as per JSON structure
      meta_description: { en: data.metaDescriptionEN, ar: data.metaDescriptionAR }, // Use English as per JSON structure
      tags: data.tags || [], // Include tags
      blogs_ids: data.relatedBlogs
    };

    initValues ? update({ ...payload, id: initValues.id }) : create(payload);
  };

  return (
    <Form<BlogFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      validationSchema={BlogFormSchema}
      useFormProps={{
        defaultValues: {
          nameEN: initValues?.name?.en || '',
          nameAR: initValues?.name?.ar || '',
          descriptionEN: initValues?.description?.en || '',
          descriptionAR: initValues?.description?.ar || '',
          date: initValues?.date || '',
          show_in_home_page: !!initValues?.show_in_home_page,
          metaTitleEN: initValues?.meta_title.en || '',
          metaTitleAR: initValues?.meta_title.ar || '',
          metaDescriptionEN: initValues?.meta_description.en || '',
          metaDescriptionAR: initValues?.meta_description.ar || '',
          relatedBlogs: initValues?.related_blogs?.map((blog: any) => blog.id) || [],
          tags: initValues?.tags || [], // Initialize tags
        },
      }}
      className="flex flex-col gap-6 p-6 overflow-y-auto @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, setValue, watch, control, formState: { errors } }) => {
        console.log(errors);
        return isBlogsLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="xl" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                {initValues ? 'Update Blog' : 'Add a New Blog'}
              </Title>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="w-5 h-auto" />
              </ActionIcon>
            </div>

            <Input label="Name (EN)" {...register('nameEN')} error={errors.nameEN?.message} />
            <Input label="Name (AR)" {...register('nameAR')} error={errors.nameAR?.message} />
            <QuillEditor
              name="descriptionEN"
              label="Description (EN)"
              error={errors.descriptionEN?.message}
              control={control}
            />
            
            <QuillEditor
              name="descriptionAR"
              label="Description (AR)"
              error={errors.descriptionAR?.message}
              control={control}
            />
            <Input label="Date" type="date" {...register('date')} error={errors.date?.message} />
            <Input
              label="Meta Title (EN)"
              {...register('metaTitleEN')}
              error={errors.metaTitleEN?.message}
            />
            <Input
              label="Meta Title (AR)"
              {...register('metaTitleAR')}
              error={errors.metaTitleAR?.message}
            />
            <Textarea
              label="Meta Description (EN)"
              {...register('metaDescriptionEN')}
              error={errors.metaDescriptionEN?.message}
            />
            <Textarea
              label="Meta Description (AR)"
              {...register('metaDescriptionAR')}
              error={errors.metaDescriptionAR?.message}
            />

            <FormGroup title="Tags" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <CreatableSelect
                    isMulti
                    options={predefinedTags}
                    value={field.value?.map((tag: string) => ({
                      value: tag,
                      label: tag,
                    }))}
                    onChange={(selected) => field.onChange(selected ? selected.map((s: any) => s.value) : [])}
                    placeholder="Select or create tags"
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: errors.tags ? 'red' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
              {errors.tags?.message && (
                <p className="text-xs text-red-500">{errors.tags.message}</p>
              )}
            </FormGroup>

            <FormGroup title="Related Blogs" className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11">
              <Controller
                name="relatedBlogs"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={data?.data?.map((blog: any) => ({
                      value: blog.id,
                      label: blog.name.en,
                    }))}
                    value={field.value?.map((id: string) => ({
                      value: id,
                      label: data?.data?.find((b: any) => b.id === id)?.name?.en || '',
                    }))}
                    onChange={(selected) => field.onChange(selected ? selected.map((s: any) => s.value) : [])}
                    placeholder="Select related blogs"
                    isLoading={isBlogsLoading}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: errors.relatedBlogs ? 'red' : base.borderColor,
                      }),
                    }}
                  />
                )}
              />
              {errors.relatedBlogs?.message && (
                <p className="text-xs text-red-500">{errors.relatedBlogs.message}</p>
              )}
            </FormGroup>

            <div className="flex items-center gap-2">
              <Switch
                checked={watch('show_in_home_page')}
                onChange={(e) => setValue('show_in_home_page', e.target.checked)}
              />
              <label className="text-sm text-gray-900">Show in Home Page</label>
            </div>

            <FormGroup
              title="Image"
              className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
            >
              {isLoading && (
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

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={closeModal} className="w-full @xl:w-auto">
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending} className="w-full @xl:w-auto">
                {initValues ? 'Update Blog' : 'Create Blog'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}