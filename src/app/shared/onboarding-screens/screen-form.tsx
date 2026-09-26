'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PiCloudArrowUpBold } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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

interface ScreenFormProps {
  initialValues?: OnboardingScreen;
}

interface LangState {
  title: string;
  description: string;
  file: File | null;
  preview: string | null;
}

const LANGS: { key: OnboardingLang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
];

const RECOMMENDED_SIZE_HINT =
  'Any image type. Recommended: portrait, 1080 × 1920 px.';

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
  const isEdit = Boolean(initialValues?.id);

  const [langs, setLangs] = useState<Record<OnboardingLang, LangState>>({
    ar: initialLangState(initialValues, 'ar'),
    en: initialLangState(initialValues, 'en'),
  });
  const [sameImage, setSameImage] = useState(false);
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);

  const createScreen = useCreateOnboardingScreen();
  const updateScreen = useUpdateOnboardingScreen();
  const isLoading = createScreen.isPending || updateScreen.isPending;

  // Free blob URLs created for local previews.
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
      toast.error('Please choose an image file');
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
    for (const { key, label } of LANGS) {
      const l = langs[key];
      if (!l.title.trim()) {
        toast.error(`Title (${label}) is required`);
        return false;
      }
      if (!l.description.trim()) {
        toast.error(`Description (${label}) is required`);
        return false;
      }
      if (!isEdit && !l.file) {
        toast.error(`Image (${label}) is required`);
        return false;
      }
    }
    return true;
  };

  const buildFormData = (): FormData => {
    const formData = new FormData();

    LANGS.forEach(({ key }) => {
      const l = langs[key];
      const title = l.title.trim();
      const description = l.description.trim();
      // On edit, send only what changed.
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
          toast('Nothing to update');
          return;
        }
        await updateScreen.mutateAsync({ id: initialValues.id, data: formData });
      } else {
        await createScreen.mutateAsync(formData);
      }
      router.push(routes.onboardingScreens.index);
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-8">
          {LANGS.map(({ key, label }) => {
            const l = langs[key];
            const isAr = key === 'ar';
            const imageLockedToAr = !isAr && sameImage;

            return (
              <div
                key={key}
                className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <Title as="h3" className="text-base font-semibold text-gray-900">
                  {label}
                </Title>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Image {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                  <label
                    className={`flex h-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-gray-300 text-sm text-gray-600 hover:border-gray-900 ${
                      imageLockedToAr ? 'pointer-events-none opacity-60' : ''
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
                        <span>Choose image…</span>
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
                        ? 'Upload a new image to replace the current one.'
                        : RECOMMENDED_SIZE_HINT}
                  </Text>
                  {isAr && (
                    <Checkbox
                      className="mt-2"
                      size="sm"
                      label="Use the same image for English"
                      checked={sameImage}
                      onChange={(e) => handleSameImageChange(e.target.checked)}
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    dir={isAr ? 'rtl' : 'ltr'}
                    placeholder={isAr ? 'احجز جلستك بسهولة' : 'Book your session easily'}
                    value={l.title}
                    onChange={(e) => setField(key, 'title', e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
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
                    onChange={(e) => setField(key, 'description', e.target.value)}
                  />
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
            <Switch checked={isActive} onChange={() => setIsActive(!isActive)} />
            <div>
              <Text className="text-sm font-semibold text-gray-900">Active</Text>
              <Text className="text-xs text-gray-500">
                Only active screens are shown in the mobile app.
              </Text>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:col-span-4">
          <Title as="h3" className="mb-4 text-base font-semibold text-gray-900">
            Preview
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
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(routes.onboardingScreens.index)}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Save Changes' : 'Create Screen'}
        </Button>
      </div>
    </form>
  );
}
