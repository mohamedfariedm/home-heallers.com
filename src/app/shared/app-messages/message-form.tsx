'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Title, Text } from '@/components/ui/text';
import { useCreateAppMessage, useUpdateAppMessage } from '@/framework/app-messages';
import { AppMessage, AppMessageInput, AppMessageLang } from '@/types/app-messages';
import { routes } from '@/config/routes';

export const TITLE_MAX = 150;
export const DESCRIPTION_MAX = 1000;

const LANGS: { key: AppMessageLang; label: string }[] = [
  { key: 'ar', label: 'العربية' },
  { key: 'en', label: 'English' },
];

type Field = 'title' | 'description';
// Keys match the backend's validation keys, e.g. "title.ar".
type FieldErrors = Partial<Record<`${Field}.${AppMessageLang}`, string>>;

const FIELD_ERROR_KEYS = ['title.ar', 'title.en', 'description.ar', 'description.en'];

interface MessageFormProps {
  initialValues?: AppMessage;
}

export default function MessageForm({ initialValues }: MessageFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [values, setValues] = useState<Record<Field, Record<AppMessageLang, string>>>({
    title: {
      ar: initialValues?.title?.ar ?? '',
      en: initialValues?.title?.en ?? '',
    },
    description: {
      ar: initialValues?.description?.ar ?? '',
      en: initialValues?.description?.en ?? '',
    },
  });
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [previewLang, setPreviewLang] = useState<AppMessageLang>('ar');

  const createMessage = useCreateAppMessage();
  const updateMessage = useUpdateAppMessage();
  const isLoading = createMessage.isPending || updateMessage.isPending;

  const setField = (field: Field, lang: AppMessageLang, value: string) => {
    setValues((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));
    setErrors((prev) => ({ ...prev, [`${field}.${lang}`]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    LANGS.forEach(({ key, label }) => {
      const title = values.title[key].trim();
      const description = values.description[key].trim();
      if (!title) next[`title.${key}`] = `Title (${label}) is required`;
      else if (title.length > TITLE_MAX)
        next[`title.${key}`] = `Max ${TITLE_MAX} characters`;
      if (!description) next[`description.${key}`] = `Description (${label}) is required`;
      else if (description.length > DESCRIPTION_MAX)
        next[`description.${key}`] = `Max ${DESCRIPTION_MAX} characters`;
    });
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: AppMessageInput = {
      title: { ar: values.title.ar.trim(), en: values.title.en.trim() },
      description: {
        ar: values.description.ar.trim(),
        en: values.description.en.trim(),
      },
      is_active: isActive,
    };

    try {
      if (isEdit && initialValues?.id) {
        await updateMessage.mutateAsync({ id: initialValues.id, data: payload });
      } else {
        await createMessage.mutateAsync(payload);
      }
      router.push(routes.appMessages.index);
    } catch (err: any) {
      // Toast is shown by the mutation hook; also pin 422 errors to their inputs.
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const mapped: FieldErrors = {};
        Object.entries(serverErrors as Record<string, string[]>).forEach(([key, messages]) => {
          if (FIELD_ERROR_KEYS.includes(key) && Array.isArray(messages) && messages[0]) {
            mapped[key as keyof FieldErrors] = messages[0];
          }
        });
        setErrors(mapped);
      }
    }
  };

  const previewTitle = values.title[previewLang].trim();
  const previewDescription = values.description[previewLang].trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:col-span-8">
          {LANGS.map(({ key, label }) => {
            const isAr = key === 'ar';
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
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    dir={isAr ? 'rtl' : 'ltr'}
                    placeholder={isAr ? 'يوم موفق' : 'Have a great day'}
                    value={values.title[key]}
                    maxLength={TITLE_MAX}
                    error={errors[`title.${key}`]}
                    onChange={(e) => setField('title', key, e.target.value)}
                  />
                  <Text className="mt-1 text-end text-xs text-gray-400">
                    {values.title[key].length}/{TITLE_MAX}
                  </Text>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    dir={isAr ? 'rtl' : 'ltr'}
                    rows={5}
                    placeholder={
                      isAr
                        ? 'مرضاك بانتظارك، استمر في عملك الرائع…'
                        : 'Your patients are waiting, keep up the great work…'
                    }
                    value={values.description[key]}
                    maxLength={DESCRIPTION_MAX}
                    error={errors[`description.${key}`]}
                    onChange={(e) => setField('description', key, e.target.value)}
                  />
                  <Text className="mt-1 text-end text-xs text-gray-400">
                    {values.description[key].length}/{DESCRIPTION_MAX}
                  </Text>
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
            <Switch checked={isActive} onChange={() => setIsActive(!isActive)} />
            <div>
              <Text className="text-sm font-semibold text-gray-900">Active</Text>
              <Text className="text-xs text-gray-500">
                Only active messages can be shown in the doctor app.
              </Text>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <Title as="h3" className="text-base font-semibold text-gray-900">
              Preview
            </Title>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
              {LANGS.map(({ key }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreviewLang(key)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition ${
                    previewLang === key
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <div
            dir={previewLang === 'ar' ? 'rtl' : 'ltr'}
            className="rounded-xl bg-gray-50 p-4"
          >
            <p className="font-semibold text-gray-900">
              {previewTitle || (previewLang === 'ar' ? 'العنوان' : 'Title')}
            </p>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-600">
              {previewDescription ||
                (previewLang === 'ar' ? 'نص الرسالة يظهر هنا' : 'Message text appears here')}
            </p>
          </div>
          <Text className="mt-3 text-xs text-gray-500">
            The doctor app receives only the language it requests.
          </Text>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(routes.appMessages.index)}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Save Changes' : 'Create Message'}
        </Button>
      </div>
    </form>
  );
}
