'use client';

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
import { SubmitHandler, type FieldErrors } from 'react-hook-form';
import { ActionIcon } from 'rizzui';
import {
  PiXBold,
  PiQuestion,
  PiTextT,
  PiImage,
} from 'react-icons/pi';
import { useCreateFaqs, useUpdateFaqs } from '@/framework/faqs';
import QuillLoader from '@/components/loader/quill-loader';
import dynamic from 'next/dynamic';
import FormGroup from '../form-group';
import { useTranslation } from 'react-i18next';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => <QuillLoader className="col-span-full h-[143px]" />,
});

type FaqTabId = 'general' | 'content' | 'media';

const FAQ_TABS: {
  id: FaqTabId;
  label: string;
  icon: typeof PiQuestion;
}[] = [
  { id: 'general', label: 'General', icon: PiQuestion },
  { id: 'content', label: 'Content', icon: PiTextT },
  { id: 'media', label: 'Media', icon: PiImage },
];

function faqTabHasErrors(
  tabId: FaqTabId,
  errors: FieldErrors<FaqFormInput> | Record<string, unknown>
): boolean {
  const err = errors as Record<string, unknown>;
  switch (tabId) {
    case 'general':
      return Boolean(err?.title_question);
    case 'content':
      return Boolean(err?.answer);
    case 'media':
      return false;
    default:
      return false;
  }
}

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
  const [activeTab, setActiveTab] = useState(0);
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

  const onInvalid = (formErrors: FieldErrors<FaqFormInput>) => {
    const tabIndex = FAQ_TABS.findIndex((tab) =>
      faqTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(FAQ_TABS.length - 1, index)));
  };

  return (
    <Form<FaqFormInput>
      resetValues={reset}
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={FaqFormSchema}
      useFormProps={{
        defaultValues: initValues,
      }}
      className={modalFormTabsClassName}
    >
      {({ register, control, formState: { errors, isLoading } }) => {
        const tabsWithErrors: ModalFormTabItem[] = FAQ_TABS.map((tab) => ({
          ...tab,
          hasError: faqTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiQuestion className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? t('faqs_update') : t('faqs_add')}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {initValues
                      ? 'Update this FAQ entry'
                      : 'Create a new frequently asked question'}
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="General"
                    description="Question in both languages"
                  >
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
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Content"
                    description="Answer in both languages"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
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
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Media"
                    description="Optional FAQ image"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup
                      title={t('faqs_image')}
                      className="relative pt-2 @3xl:grid-cols-12"
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
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={FAQ_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              cancelLabel={t('faqs_cancel')}
              isLoading={isLoading || isPending}
              disabled={isLoading || isPending}
              submitLabel={initValues ? t('faqs_update') : t('faqs_create')}
            />
          </>
        );
      }}
    </Form>
  );
}
