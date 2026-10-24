'use client';

import { useModal } from '@/app/shared/modal-views/use-modal';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Title } from '@/components/ui/text';
import {
  FaqFormInput,
  FaqFormSchema,
} from '@/utils/validators/faq-form.schema';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

import { useState } from 'react';
import { Controller, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';

import { useCreateFaqs, useUpdateFaqs } from '@/framework/faqs';
import DOMPurify from 'isomorphic-dompurify';

import QuillLoader from '@/components/loader/quill-loader';
import dynamic from 'next/dynamic';
import FormGroup from '../form-group';
import { useTranslation } from 'react-i18next';

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

export default function UpdateCreateBrand({
  initValues,
}: {
  initValues?: any;
}) {
  const { t } = useTranslation('faqs');
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const { mutate: update } = useUpdateFaqs();
  const { mutate: create, isPending } = useCreateFaqs();
  const [isoading, setLoading] = useState(false);
  let [imageError, setImageError] = useState(0);
  const [isImageData, setImage] = useState(initValues ? initValues?.image : null);

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
        console.log(response.data.data);
        if (type === 'Image') {
          setImage(response.data.data);
        }
        toast.success(
          t('faqs_uploaded', {
            type: t(type === 'Image' ? 'faqs_type_image' : 'faqs_type_file'),
          })
        );
      })
      .catch((error) => {
        console.log(error);
        toast.error(t('faqs_upload_retry'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit: SubmitHandler<FaqFormInput> = (data) => {
    if (initValues) {
      update({
        ...data,
        image: isImageData || initValues.image,
        id: initValues.id,
      });
    } else {
      create({...data,image: isImageData});
    }
    setReset({
      roleName: '',
    });

    closeModal();
  };

  return (
    <>
      <Form<FaqFormInput>
        resetValues={reset}
        onSubmit={onSubmit}
        validationSchema={FaqFormSchema}
        useFormProps={{
          defaultValues: initValues,
        }}
        className="flex flex-grow flex-col gap-6 overflow-y-auto p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
      >
        {({
          register,
          getValues,
          control,
          setValue,
          formState: { errors, isLoading },
        }) => {
          console.log(errors);
          
          return (
            <>
              <div className="flex items-center justify-between">
                <Title as="h4" className="font-semibold">
                  {initValues ? t('faqs_update') : t('faqs_add')}
                </Title>
                <ActionIcon size="sm" variant="text" onClick={closeModal}>
                  <PiXBold className="h-auto w-5" />
                </ActionIcon>
              </div>

              <Input
                label={t('faqs_question_en')}
                placeholder={t('faqs_question_en')}
                {...register('title_question.en')}
                error={errors.title_question?.en?.message}
              />
              <Input
                label={t('faqs_question_ar')}
                placeholder={t('faqs_question_ar')}
                {...register('title_question.ar')}
                error={errors.title_question?.ar?.message}
              />

              <QuillEditor
                    name="answer.en"
                    error={errors.answer?.en?.message}
                    control={control}
                    label={t('faqs_answer_en')}
                    className="col-span-full [&_.ql-editor]:min-h-[100px]"
                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                  />
              
                  <QuillEditor
                    error={errors.answer?.ar?.message }
                    control={control}
                    name="answer.ar"
                    label={t('faqs_answer_ar')}
                    className="col-span-full [&_.ql-editor]:min-h-[100px]"
                    labelClassName="font-medium text-gray-700 dark:text-gray-600 mb-1.5"
                  />
              

              <FormGroup
                title={t('faqs_image')}
                className="relative pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
              >
                {isoading && (
                  <div className="absolute z-10 m-auto flex h-[100%] w-[100%] items-center justify-center ">
                    <Spinner size="xl" />
                  </div>
                )}
                <Upload
                  title={t('faqs_image')}
                  accept="img"
                  onChange={(e) => {
                    setImageError(0);
                    handleFileUpload(e, 'Image');
                  }}
                />
                {imageError ? (
                  // "faried Error"
                  <p className="rizzui-input-error-text mt-0.5 text-xs text-red">
                    {t('faqs_image_required')}
                  </p>
                ) : (
                  ''
                )}
              </FormGroup>

              <div className="flex items-center justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="w-full @xl:w-auto"
                >
                  {t('faqs_cancel')}
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full @xl:w-auto"
                >
                  {initValues ? t('faqs_update') : t('faqs_create')}
                </Button>
              </div>
            </>
          );
        }}
      </Form>
    </>
  );
}
