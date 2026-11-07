'use client';

import {
  ModalFormHeader,
  ModalFormFooter,
  modalFormClassName,
} from '@/components/ui/modal-form-shell';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { SubmitHandler } from 'react-hook-form';
import { IoHelpCircle } from 'react-icons/io5';

import { useCreateFaqs, useUpdateFaqs } from '@/framework/faqs';

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
  const [isImageData, setImage] = useState(
    initValues ? initValues?.image : null
  );

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
        toast.success(
          t('faqs_uploaded', {
            type: t(type === 'Image' ? 'faqs_type_image' : 'faqs_type_file'),
          })
        );
      })
      .catch(() => {
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
      create({ ...data, image: isImageData });
    }
    setReset({
      roleName: '',
    });

    closeModal();
  };

  return (
    <Form<FaqFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      validationSchema={FaqFormSchema}
      useFormProps={{
        defaultValues: initValues,
      }}
      className={modalFormClassName}
    >
      {({ register, control, formState: { errors, isLoading } }) => (
        <>
          <ModalFormHeader
            title={initValues ? t('faqs_update') : t('faqs_add')}
            description={
              initValues
                ? 'Update this FAQ entry'
                : 'Create a new frequently asked question'
            }
            icon={<IoHelpCircle />}
          />

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
            labelClassName="mb-1.5 font-medium text-gray-700 dark:text-gray-600"
          />

          <QuillEditor
            error={errors.answer?.ar?.message}
            control={control}
            name="answer.ar"
            label={t('faqs_answer_ar')}
            className="col-span-full [&_.ql-editor]:min-h-[100px]"
            labelClassName="mb-1.5 font-medium text-gray-700 dark:text-gray-600"
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
              <p className="rizzui-input-error-text mt-0.5 text-xs text-red">
                {t('faqs_image_required')}
              </p>
            ) : (
              ''
            )}
          </FormGroup>

          <ModalFormFooter
            cancelLabel={t('faqs_cancel')}
            isLoading={isLoading || isPending}
            submitLabel={initValues ? t('faqs_update') : t('faqs_create')}
          />
        </>
      )}
    </Form>
  );
}
