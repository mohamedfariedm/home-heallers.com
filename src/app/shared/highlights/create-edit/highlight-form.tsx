'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PiTextT, PiImage, PiGearSix } from 'react-icons/pi';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { useCreateHighlight, useUpdateHighlight } from '@/framework/highlights';
import { useCountries } from '@/framework/countrues';
import { Highlight } from '@/types/highlights';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';

// Country targeting is hidden for now. Existing `country_ids` are still sent
// on edit so saved targeting isn't wiped; new highlights target all countries.
const SHOW_COUNTRY_TARGETING = false;

type HighlightTabId = 'content' | 'media' | 'settings';

const HIGHLIGHT_TABS: {
  id: HighlightTabId;
  label: string;
  icon: typeof PiTextT;
}[] = [
  { id: 'content', label: 'Content', icon: PiTextT },
  { id: 'media', label: 'Media', icon: PiImage },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

interface HighlightFormProps {
  initialValues?: Highlight;
  onSuccessCallback?: (data?: any) => void;
}

export default function HighlightForm({
  initialValues,
  onSuccessCallback,
}: HighlightFormProps) {
  const { t } = useTranslation('highlights');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) === 'ar' ? 'ar' : 'en';
  const isEdit = Boolean(initialValues?.id);
  const [activeTab, setActiveTab] = useState(0);
  const [tabErrors, setTabErrors] = useState<Record<HighlightTabId, boolean>>({
    content: false,
    media: false,
    settings: false,
  });

  // Country `name` is returned bilingually as { ar, en }. Resolve it to a plain
  // string before using it as a label, otherwise React tries to render the
  // object directly and throws "Objects are not valid as a React child".
  const resolveName = (name: any): string => {
    if (name && typeof name === 'object') {
      return name[locale] || name.en || name.ar || '';
    }
    return name || '';
  };

  const { data: countriesData } = useCountries('limit=100');
  const countries = Array.isArray(countriesData?.data) ? countriesData.data : [];
  const countryOptions = countries.map((c: any) => ({
    value: Number(c.id || c.country_id),
    label:
      resolveName(c.name) ||
      c.en_name ||
      c.ar_name ||
      `Country #${c.id}`,
  }));

  const [titleAr, setTitleAr] = useState(initialValues?.title?.ar || '');
  const [titleEn, setTitleEn] = useState(initialValues?.title?.en || '');
  const [visibilityType, setVisibilityType] = useState<'always' | 'daily'>(
    initialValues?.visibility_type || 'always'
  );
  const [selectedCountries, setSelectedCountries] = useState<number[]>(
    initialValues?.country_ids || []
  );
  const [isPinned, setIsPinned] = useState(initialValues?.is_pinned || false);
  const [order] = useState<number>(initialValues?.order ?? 0);
  const [isActive, setIsActive] = useState(initialValues?.is_active ?? true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialValues?.cover || null
  );

  const createHighlight = useCreateHighlight();
  const updateHighlight = useUpdateHighlight();
  const isLoading = createHighlight.isPending || updateHighlight.isPending;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('highlights_form_cover_size_error'));
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<HighlightTabId, boolean> = {
      content: false,
      media: false,
      settings: false,
    };

    if (!titleAr.trim() || !titleEn.trim()) {
      nextErrors.content = true;
      toast.error(t('highlights_form_titles_required'));
      setTabErrors(nextErrors);
      setActiveTab(0);
      return false;
    }

    if (!isEdit && !coverFile) {
      nextErrors.media = true;
      toast.error(t('highlights_form_cover_required'));
      setTabErrors(nextErrors);
      setActiveTab(1);
      return false;
    }

    setTabErrors(nextErrors);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title_ar', titleAr.trim());
    formData.append('title_en', titleEn.trim());
    formData.append('visibility_type', visibilityType);
    formData.append('is_pinned', isPinned ? '1' : '0');
    formData.append('is_active', isActive ? '1' : '0');
    formData.append('order', String(order));

    selectedCountries.forEach((id) => {
      formData.append('country_ids[]', String(id));
    });

    if (coverFile) {
      formData.append('cover', coverFile);
    }

    try {
      if (isEdit && initialValues?.id) {
        formData.append('_method', 'PUT');
        const res = await updateHighlight.mutateAsync({
          id: initialValues.id,
          data: formData,
        });
        if (onSuccessCallback) onSuccessCallback(res);
      } else {
        const res: any = await createHighlight.mutateAsync(formData);
        // create() returns the raw axios response, so the API envelope
        // ({ message, data: [item] }) lives under res.data. Fall back to res
        // itself in case a caller ever returns the envelope directly.
        const envelope = res?.data ?? res;
        const createdItem = Array.isArray(envelope?.data)
          ? envelope.data[0]
          : envelope?.data ?? envelope;
        const newId = createdItem?.id;

        if (newId) {
          toast.success(t('highlights_form_created_add_elements'));
          router.push(routes.highlights.edit(newId));
        } else {
          router.push(routes.highlights.index);
        }
      }
    } catch {
      // Error handled by mutation hook
    }
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(HIGHLIGHT_TABS.length - 1, index)));
  };

  const tabsWithErrors: ModalFormTabItem[] = HIGHLIGHT_TABS.map((tab) => ({
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
                ? t('highlights_form_edit_info')
                : t('highlights_form_create')}
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
              title="Content"
              description="Titles and visibility"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('highlights_form_title_ar')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('highlights_form_title_ar_ph')}
                  dir="rtl"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('highlights_form_title_en')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder={t('highlights_form_title_en_ph')}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('highlights_form_visibility')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  options={[
                    {
                      value: 'always',
                      label: t('highlights_form_visibility_always'),
                      name: 'Always',
                    },
                    {
                      value: 'daily',
                      label: t('highlights_form_visibility_daily'),
                      name: 'Daily',
                    },
                  ]}
                  value={visibilityType}
                  getOptionValue={(opt: any) => opt.value}
                  onChange={(opt: any) => setVisibilityType(opt?.value ?? opt)}
                />
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Media"
              description="Cover image"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('highlights_form_cover')}{' '}
                  {!isEdit && <span className="text-red-500">*</span>}{' '}
                  {t('highlights_form_cover_hint')}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {coverPreview && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-gray-300 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 p-4 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900">
                      <span>
                        {coverFile
                          ? coverFile.name
                          : t('highlights_form_choose_cover')}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>

        <ModalFormTabPanel>
          <div className="space-y-5">
            <ModalFormTabPanelCard
              title="Settings"
              description="Pin, active status and targeting"
              contentClassName="grid gap-4 sm:grid-cols-1"
            >
              {SHOW_COUNTRY_TARGETING && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {t('highlights_form_countries')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {countryOptions.map((c: any) => {
                      const isSelected = selectedCountries.includes(c.value);
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setSelectedCountries((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== c.value)
                                : [...prev, c.value]
                            );
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                            isSelected
                              ? 'bg-[#143087] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {c.label} {isSelected ? '✓' : '+'}
                        </button>
                      );
                    })}
                    {countryOptions.length === 0 && (
                      <Text className="text-xs text-gray-500">
                        {t('highlights_form_all_countries')}
                      </Text>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPinned}
                    onChange={() => setIsPinned(!isPinned)}
                  />
                  <div>
                    <Text className="text-sm font-semibold text-gray-900">
                      {t('highlights_form_pin')}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {t('highlights_form_pin_hint')}
                    </Text>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                  <div>
                    <Text className="text-sm font-semibold text-gray-900">
                      {t('highlights_form_active')}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {t('highlights_form_active_hint')}
                    </Text>
                  </div>
                </div>
              </div>
            </ModalFormTabPanelCard>
          </div>
        </ModalFormTabPanel>
      </ModalFormTabs>

      <ModalFormTabsFooter
        activeTab={activeTab}
        tabCount={HIGHLIGHT_TABS.length}
        onPrev={() => goToTab(activeTab - 1)}
        onNext={() => goToTab(activeTab + 1)}
        onCancel={() => router.push(routes.highlights.index)}
        cancelLabel={t('highlights_cancel')}
        isLoading={isLoading}
        disabled={isLoading}
        submitLabel={
          isEdit
            ? t('highlights_form_save')
            : t('highlights_form_create_continue')
        }
      />
    </form>
  );
}
