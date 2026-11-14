'use client';

import { useRef, useState } from 'react';
import {
  SubmitHandler,
  Controller,
  UseFormReturn,
  type FieldErrors,
} from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ActionIcon, Switch } from 'rizzui';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import {
  useBlogDetail,
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
} from '@/framework/blog';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  PiXBold,
  PiArticle,
  PiTextT,
  PiImage,
} from 'react-icons/pi';
import FormGroup from '../form-group';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import {
  BlogFormInput,
  BlogFormSchema,
} from '@/utils/validators/blog-form.schema';
import QuillEditor from '@/components/ui/quill-editor';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import EntitySeoSection from '@/app/shared/seo/entity-seo-section';
import {
  applySeoValidationErrors,
  asLocaleTextMap,
  buildEntitySeoPayload,
  mergeAdminFormRecord,
  preserveRichLocaleHtml,
  seoFormDefaults,
} from '@/utils/seo-fields';
import type { SeoLocale } from '@/types/seo-locale';
import { useTranslation } from 'react-i18next';
import { useModal } from '../modal-views/use-modal';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

type BlogTabId = 'general' | 'content' | 'media';

const BLOG_TABS: {
  id: BlogTabId;
  label: string;
  icon: typeof PiArticle;
}[] = [
  { id: 'general', label: 'General', icon: PiArticle },
  { id: 'content', label: 'Content', icon: PiTextT },
  { id: 'media', label: 'Media', icon: PiImage },
];

const GENERAL_ERROR_KEYS = ['nameEN', 'nameAR', 'date', 'show_in_home_page'];
const CONTENT_ERROR_KEYS = [
  'descriptionEN',
  'descriptionAR',
  'tags',
  'relatedBlogs',
  'slug',
  'meta_title',
  'meta_description',
  'og_title',
  'og_description',
];

function blogTabHasErrors(
  tabId: BlogTabId,
  errors: FieldErrors<BlogFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'general':
      return has(GENERAL_ERROR_KEYS);
    case 'content':
      return has(CONTENT_ERROR_KEYS);
    case 'media':
      return false;
    default:
      return false;
  }
}

export default function BlogsForm({ initValues }: { initValues?: any }) {
  const id = initValues?.id;
  const { data: record, isLoading: isDetailLoading } = useBlogDetail(id);
  const values = mergeAdminFormRecord(initValues, record);

  if (id && isDetailLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner size="xl" />
      </div>
    );
  }

  return <BlogFormFields initValues={values} />;
}

function BlogFormFields({ initValues }: { initValues?: any }) {
  const { t, i18n } = useTranslation('blogs');
  const uiLang = i18n.language === 'ar' ? 'ar' : 'en';
  const methodsRef = useRef<UseFormReturn<BlogFormInput> | null>(null);
  const { closeModal } = useModal();
  const { mutateAsync: update } = useUpdateBlog();
  const { mutateAsync: create, isPending } = useCreateBlog();
  const { data, isLoading: isBlogsLoading } = useBlogs('');
  const [locale, setLocale] = useState<SeoLocale>('en');
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [isImageData, setImage] = useState(initValues?.image || null);
  const [imageError, setImageError] = useState(0);
  const loadedSlug = initValues ? asLocaleTextMap(initValues.slug) : null;

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
        toast.success(
          t('blogs_uploaded', {
            type: t(type === 'Image' ? 'blogs_type_image' : 'blogs_type_file'),
          })
        );
      })
      .catch(() => toast.error(t('blogs_upload_retry')))
      .finally(() => setLoading(false));
  };

  const onSubmit: SubmitHandler<BlogFormInput> = async (data) => {
    const payload = {
      name: {
        en: data.nameEN,
        ar: data.nameAR,
      },
      description: preserveRichLocaleHtml(initValues?.description, {
        en: data.descriptionEN,
        ar: data.descriptionAR,
      }),
      image: isImageData || initValues?.image,
      show_in_home_page: data.show_in_home_page,
      date: data.date,
      tags: data.tags || [],
      blogs_ids: data.relatedBlogs,
      ...buildEntitySeoPayload(data, loadedSlug, !initValues),
    };

    try {
      if (initValues) {
        await update({ ...payload, id: initValues.id });
      } else {
        await create(payload);
      }
    } catch (error) {
      const nextLocale = applySeoValidationErrors(
        error,
        methodsRef.current!.setError
      );
      if (nextLocale) {
        setLocale(nextLocale);
        setActiveTab(1);
      }
    }
  };

  const onInvalid = (formErrors: FieldErrors<BlogFormInput>) => {
    const tabIndex = BLOG_TABS.findIndex((tab) =>
      blogTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(BLOG_TABS.length - 1, index)));
  };

  return (
    <Form<BlogFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={BlogFormSchema}
      useFormProps={{
        defaultValues: {
          nameEN:
            initValues?.name?.en ||
            (typeof initValues?.name === 'string' ? initValues.name : '') ||
            '',
          nameAR: initValues?.name?.ar || '',
          descriptionEN:
            initValues?.description?.en ||
            (typeof initValues?.description === 'string'
              ? initValues.description
              : '') ||
            '',
          descriptionAR: initValues?.description?.ar || '',
          date: initValues?.date || '',
          show_in_home_page: !!initValues?.show_in_home_page,
          relatedBlogs:
            initValues?.related_blogs?.map((blog: any) => blog.id) || [],
          tags: initValues?.tags || [],
          ...seoFormDefaults(initValues),
        },
      }}
      className={modalFormTabsClassName}
    >
      {(methods) => {
        methodsRef.current = methods;
        const {
          register,
          setValue,
          watch,
          control,
          formState: { errors },
        } = methods;

        if (isBlogsLoading) {
          return (
            <div className="flex h-full items-center justify-center">
              <Spinner size="xl" />
            </div>
          );
        }

        const tabsWithErrors: ModalFormTabItem[] = BLOG_TABS.map((tab) => ({
          ...tab,
          hasError: blogTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiArticle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues ? t('blogs_update') : t('blogs_add')}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
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
                    description="Title, date, and homepage visibility"
                  >
                    <Input
                      label={t('blogs_name_en')}
                      {...register('nameEN')}
                      error={errors.nameEN?.message}
                    />
                    <Input
                      label={t('blogs_name_ar')}
                      {...register('nameAR')}
                      error={errors.nameAR?.message}
                    />
                    <Input
                      label={t('blogs_date')}
                      type="date"
                      {...register('date')}
                      error={errors.date?.message}
                    />
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Switch
                        checked={watch('show_in_home_page')}
                        onChange={(e) =>
                          setValue('show_in_home_page', e.target.checked)
                        }
                      />
                      <label className="text-sm text-gray-900">
                        {t('blogs_show_in_home')}
                      </label>
                    </div>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Content"
                    description="Descriptions, tags, related posts, and SEO"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <QuillEditor
                      name="descriptionEN"
                      label={t('blogs_desc_en')}
                      error={errors.descriptionEN?.message}
                      control={control}
                    />
                    <QuillEditor
                      name="descriptionAR"
                      label={t('blogs_desc_ar')}
                      error={errors.descriptionAR?.message}
                      control={control}
                    />
                    <FormGroup
                      title={t('blogs_tags')}
                      className="pt-2 @3xl:grid-cols-12"
                    >
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
                            onChange={(selected) =>
                              field.onChange(
                                selected
                                  ? selected.map((s: any) => s.value)
                                  : []
                              )
                            }
                            placeholder={t('blogs_tags_placeholder')}
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: errors.tags
                                  ? 'red'
                                  : base.borderColor,
                              }),
                            }}
                          />
                        )}
                      />
                      {errors.tags?.message && (
                        <p className="text-xs text-red-500">
                          {errors.tags.message}
                        </p>
                      )}
                    </FormGroup>
                    <FormGroup
                      title={t('blogs_related')}
                      className="pt-2 @3xl:grid-cols-12"
                    >
                      <Controller
                        name="relatedBlogs"
                        control={control}
                        render={({ field }) => (
                          <Select
                            isMulti
                            options={data?.data?.map((blog: any) => ({
                              value: blog.id,
                              label:
                                resolveLocalizedName(blog.name, uiLang) ||
                                t('blogs_blog_fallback', { id: blog.id }),
                            }))}
                            value={field.value?.map((id: string) => ({
                              value: id,
                              label:
                                resolveLocalizedName(
                                  data?.data?.find((b: any) => b.id === id)
                                    ?.name,
                                  uiLang
                                ) || '',
                            }))}
                            onChange={(selected) =>
                              field.onChange(
                                selected
                                  ? selected.map((s: any) => s.value)
                                  : []
                              )
                            }
                            placeholder={t('blogs_related_placeholder')}
                            isLoading={isBlogsLoading}
                            styles={{
                              control: (base) => ({
                                ...base,
                                borderColor: errors.relatedBlogs
                                  ? 'red'
                                  : base.borderColor,
                              }),
                            }}
                          />
                        )}
                      />
                      {errors.relatedBlogs?.message && (
                        <p className="text-xs text-red-500">
                          {errors.relatedBlogs.message}
                        </p>
                      )}
                    </FormGroup>
                    <EntitySeoSection
                      locale={locale}
                      onLocaleChange={setLocale}
                      register={register}
                      watch={watch}
                      setValue={setValue}
                      errors={errors}
                      module="blog"
                      names={{ en: watch('nameEN'), ar: watch('nameAR') }}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Media"
                    description="Blog cover image"
                    contentClassName="grid gap-4 sm:grid-cols-1"
                  >
                    <FormGroup
                      title={t('blogs_image')}
                      className="relative pt-2 @3xl:grid-cols-12"
                    >
                      {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/80">
                          <Spinner size="xl" />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Upload
                          title={t('blogs_image')}
                          accept="img"
                          onChange={(e) => {
                            setImageError(0);
                            handleFileUpload(e, 'Image');
                          }}
                        />
                        {imageError > 0 && (
                          <p className="text-xs text-red-500">
                            {t('blogs_image_required')}
                          </p>
                        )}
                        {(isImageData?.[0]?.thumbnail ||
                          isImageData?.[0]?.original) && (
                          <div className="relative mt-2 flex w-full items-center justify-center">
                            <img
                              src={
                                isImageData[0].thumbnail ||
                                isImageData[0].original
                              }
                              alt={t('blogs_preview_alt')}
                              className="h-auto w-48 rounded border border-gray-200 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setImage(null)}
                              className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 shadow hover:bg-red-50"
                              title={t('blogs_remove_image')}
                            >
                              <PiXBold className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </FormGroup>
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={BLOG_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              cancelLabel={t('blogs_cancel')}
              isLoading={isPending}
              disabled={isPending}
              submitLabel={
                initValues ? t('blogs_update') : t('blogs_create')
              }
            />
          </>
        );
      }}
    </Form>
  );
}
