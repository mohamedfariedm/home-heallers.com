'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  PiCloudArrowUpBold,
  PiTextT,
  PiImage,
  PiGearSix,
} from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Title, Text } from '@/components/ui/text';
import {
  useCreateOnboardingScreen,
  useUpdateOnboardingScreen,
} from '@/framework/onboarding-screens';
import { OnboardingLang, OnboardingScreen } from '@/types/onboarding-screens';
import { routes } from '@/config/routes';
import PhonePreview from './phone-preview';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

interface ScreenFormProps {
  initialValues?: OnboardingScreen;
}

interface LangState {
  title: string;
  description: string;
  file: File | null;
  preview: string | null;
}

type ScreenTabId = 'general' | 'content' | 'media';

const SCREEN_TABS: {
  id: ScreenTabId;
  label: string;
  icon: typeof PiTextT;
}[] = [
  { id: 'general', label: 'General', icon: PiGearSix },
  { id: 'content', label: 'Content', icon: PiTextT },
  { id: 'media', label: 'Media', icon: PiImage },
];

const LANGS: { key: OnboardingLang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
];

function initialLangState(
  screen: OnboardingScreen | undefined,
  lang: OnboardingLang
): LangState {
  return {
    title: screen?.title?.[lang] ?? '',
    description: screen?.description?.[lang] ?? '',
    file: null,
    preview: screen?.image?.[lang] ?? null,
  };
}

export default function ScreenForm({ initialValues }: ScreenFormProps) {
  const router = useRouter();
  const { t } = useTranslation('onboarding-screens');
  const isEdit = Boolean(initialValues?.id);
  const [activeTab, setActiveTab] = useState(0);
  const [tabErrors, setTabErrors] = useState<
    Record<ScreenTabId, boolean>
  >({
    general: false,
    content: false,
    media: false,
  });

  const [langs, setLangs] = useState<Record<OnboardingLang, LangState>>({
    ar: initialLangState(initialValues, 'ar'),
    en: initialLangState(initialValues, 'en'),
  });
  const [sameImage, setSameImage] = useState(false);
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);

  const createScreen = useCreateOnboardingScreen();
  const updateScreen = useUpdateOnboardingScreen();
  const isLoading = createScreen.isPending || updateScreen.isPending;

  useEffect(() => {
    return () => {
      Object.values(langs).forEach((l) => {
        if (l.preview?.startsWith('blob:')) URL.revokeObjectURL(l.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (
    lang: OnboardingLang,
    field: 'title' | 'description',
    value: string
  ) => {
    setLangs((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  };

  const setImage = (lang: OnboardingLang, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(
        t('tutorial_choose_image_error', 'Please choose an image file')
      );
      return;
    }
    const preview = URL.createObjectURL(file);
    setLangs((prev) => {
      const next = { ...prev, [lang]: { ...prev[lang], file, preview } };
      if (sameImage && lang === 'ar') {
        next.en = { ...prev.en, file, preview };
      }
      return next;
    });
  };

  const handleSameImageChange = (checked: boolean) => {
    setSameImage(checked);
    if (checked && langs.ar.file) {
      setLangs((prev) => ({
        ...prev,
        en: { ...prev.en, file: prev.ar.file, preview: prev.ar.preview },
      }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<ScreenTabId, boolean> = {
      general: false,
      content: false,
      media: false,
    };

    for (const { key, label } of LANGS) {
      const l = langs[key];
      if (!l.title.trim()) {
        nextErrors.general = true;
        toast.error(
          t('tutorial_title_required', {
            defaultValue: 'Title ({{lang}}) is required',
            lang: label,
          })
        );
        setTabErrors(nextErrors);
        setActiveTab(0);
        return false;
      }
      if (!l.description.trim()) {
        nextErrors.content = true;
        toast.error(
          t('tutorial_description_required', {
            defaultValue: 'Description ({{lang}}) is required',
            lang: label,
          })
        );
        setTabErrors(nextErrors);
        setActiveTab(1);
        return false;
      }
      if (!isEdit && !l.file) {
        nextErrors.media = true;
        toast.error(
          t('tutorial_image_required', {
            defaultValue: 'Image ({{lang}}) is required',
            lang: label,
          })
        );
        setTabErrors(nextErrors);
        setActiveTab(2);
        return false;
      }
    }

    setTabErrors(nextErrors);
    return true;
  };

  const buildFormData = (): FormData => {
    const formData = new FormData();

    LANGS.forEach(({ key }) => {
      const l = langs[key];
      const title = l.title.trim();
      const description = l.description.trim();
      if (!isEdit || title !== initialValues?.title?.[key]) {
        formData.append(`title_${key}`, title);
      }
      if (!isEdit || description !== initialValues?.description?.[key]) {
        formData.append(`description_${key}`, description);
      }
      if (l.file) formData.append(`image_${key}`, l.file);
    });

    if (!isEdit || isActive !== initialValues?.is_active) {
      formData.append('is_active', isActive ? '1' : '0');
    }

    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = buildFormData();

    try {
      if (isEdit && initialValues?.id) {
        if (Array.from(formData.keys()).length === 0) {
          toast(t('tutorial_nothing_to_update', 'Nothing to update'));
          return;
        }
        await updateScreen.mutateAsync({
          id: initialValues.id,
          data: formData,
        });
      } else {
        await createScreen.mutateAsync(formData);
      }
      router.push(routes.onboardingScreens.index);
    } catch {
      // Error handled by mutation hook
    }
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(SCREEN_TABS.length - 1, index)));
  };

  const tabsWithErrors: ModalFormTabItem[] = SCREEN_TABS.map((tab) => ({
    ...tab,
    hasError: tabErrors[tab.id],
  }));

  return (
    <form onSubmit={handleSubmit} className={modalFormTabsClassName}>
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <PiTextT className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">
              {isEdit
                ? t('tutorial_edit', 'Edit Tutorial')
                : t('tutorial_create', 'Create Tutorial')}
            </h4>
            <p className="mt-0.5 text-xs text-gray-400">
              Fill each tab — save stays available on every step
            </p>
          </div>
        </div>
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
              description="Titles and active status"
            >
              {LANGS.map(({ key, label }) => {
                const l = langs[key];
                const isAr = key === 'ar';
                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('tutorial_field_title', 'Title')} ({label}){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      dir={isAr ? 'rtl' : 'ltr'}
                      placeholder={
                        isAr ? 'احجز جلستك بسهولة' : 'Book your session easily'
                      }
                      value={l.title}
                      onChange={(e) => setField(key, 'title', e.target.value)}
                    />
                  </div>
                );
              })}
              <div className="flex items-center gap-3 sm:col-span-2">
                <Switch
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <div>
                  <Text className="text-sm font-semibold text-gray-900">
                    {t('tutorial_active', 'Active')}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {t(
                      'tutorial_active_hint',
                      'Only active tutorials are shown in the mobile app.'
                    )}
                  </Text>
                </div>
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Content"
              description="Descriptions in both languages"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              {LANGS.map(({ key, label }) => {
                const l = langs[key];
                const isAr = key === 'ar';
                return (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('tutorial_field_description', 'Description')} ({label}){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      dir={isAr ? 'rtl' : 'ltr'}
                      rows={4}
                      placeholder={
                        isAr
                          ? 'اختر الخدمة والموعد المناسب لك…'
                          : 'Pick the service and time that suit you…'
                      }
                      value={l.description}
                      onChange={(e) =>
                        setField(key, 'description', e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Media"
              description="Images and live preview"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {LANGS.map(({ key, label }) => {
                  const l = langs[key];
                  const isAr = key === 'ar';
                  const imageLockedToAr = !isAr && sameImage;

                  return (
                    <div key={key} className="space-y-2">
                      <Title
                        as="h3"
                        className="text-sm font-semibold text-gray-900"
                      >
                        {label}
                      </Title>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        {t('tutorial_image', 'Image')}{' '}
                        {!isEdit && <span className="text-red-500">*</span>}
                      </label>
                      <label
                        className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-gray-300 text-sm text-gray-600 hover:border-gray-900 ${
                          imageLockedToAr
                            ? 'pointer-events-none opacity-60'
                            : ''
                        }`}
                      >
                        {l.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={l.preview}
                            alt={`${label} preview`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <>
                            <PiCloudArrowUpBold className="h-6 w-6 text-gray-500" />
                            <span>
                              {t('tutorial_choose_image', 'Choose image…')}
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={imageLockedToAr}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImage(key, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <Text className="mt-1 text-xs text-gray-500">
                        {l.file
                          ? l.file.name
                          : isEdit
                            ? t(
                                'tutorial_image_replace_hint',
                                'Upload a new image to replace the current one.'
                              )
                            : t(
                                'tutorial_image_hint',
                                'Any image type. Recommended: portrait, 1080 × 1920 px.'
                              )}
                      </Text>
                      {isAr && (
                        <Checkbox
                          className="mt-2"
                          size="sm"
                          label={t(
                            'tutorial_same_image',
                            'Use the same image for English'
                          )}
                          checked={sameImage}
                          onChange={(e) =>
                            handleSameImageChange(e.target.checked)
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <Title
                  as="h3"
                  className="mb-4 text-base font-semibold text-gray-900"
                >
                  {t('tutorial_preview', 'Preview')}
                </Title>
                <div className="flex flex-wrap justify-center gap-4">
                  {LANGS.map(({ key }) => (
                    <PhonePreview
                      key={key}
                      lang={key}
                      image={langs[key].preview}
                      title={langs[key].title}
                      description={langs[key].description}
                    />
                  ))}
                </div>
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={SCREEN_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={() => router.push(routes.onboardingScreens.index)}
        cancelLabel={t('tutorial_cancel', 'Cancel')}
        isLoading={isLoading}
        disabled={isLoading}
        submitLabel={
          isEdit
            ? t('tutorial_save', 'Save Changes')
            : t('tutorial_create_btn', 'Create Tutorial')
        }
      />
    </form>
  );
}
