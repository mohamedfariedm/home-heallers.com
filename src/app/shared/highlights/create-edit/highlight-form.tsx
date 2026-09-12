'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Title, Text } from '@/components/ui/text';
import { useCreateHighlight, useUpdateHighlight } from '@/framework/highlights';
import { useCountries } from '@/framework/countrues';
import { Highlight } from '@/types/highlights';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';
import { PiUploadCloudBold } from 'react-icons/pi';

interface HighlightFormProps {
  initialValues?: Highlight;
  onSuccessCallback?: (data?: any) => void;
}

export default function HighlightForm({
  initialValues,
  onSuccessCallback,
}: HighlightFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const { data: countriesData } = useCountries('limit=100');
  const countries = Array.isArray(countriesData?.data) ? countriesData.data : [];
  const countryOptions = countries.map((c: any) => ({
    value: Number(c.id || c.country_id),
    label: c.name || c.en_name || c.ar_name || `Country #${c.id}`,
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
  const [order, setOrder] = useState<number>(initialValues?.order ?? 0);
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
        toast.error('Cover image must be 5MB or less');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleAr.trim() || !titleEn.trim()) {
      toast.error('Both Arabic and English titles are required');
      return;
    }

    if (!isEdit && !coverFile) {
      toast.error('Cover image is required when creating a highlight');
      return;
    }

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
        const res = await createHighlight.mutateAsync(formData);
        const createdItem = Array.isArray(res?.data) ? res.data[0] : res?.data;
        const newId = createdItem?.id;

        if (newId) {
          toast.success('Highlight created! Now add slide elements.');
          router.push(routes.highlights.edit(newId));
        } else {
          router.push(routes.highlights.index);
        }
      }
    } catch {
      // Error handled by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <Title as="h3" className="mb-4 text-base font-semibold text-gray-900">
          {isEdit ? 'Edit Highlight Info' : 'Create Highlight'}
        </Title>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title (Arabic) <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="مثال: عروض الأسبوع"
              dir="rtl"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title (English) <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Weekly Offers"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Visibility Type <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: 'always', label: 'Always (Never Expires)' },
                { value: 'daily', label: 'Daily (Expires 24h per element)' },
              ]}
              value={visibilityType}
              onChange={(opt: any) => setVisibilityType(opt.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Order Priority
            </label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Cover Image {!isEdit && <span className="text-red-500">*</span>} (JPEG, PNG, WEBP ≤ 5MB)
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {coverPreview && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border border-gray-300 bg-gray-50">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 p-4 text-sm font-medium text-gray-600 hover:border-gray-900 hover:text-gray-900">
                  <PiUploadCloudBold className="h-5 w-5 text-gray-500" />
                  <span>
                    {coverFile ? coverFile.name : 'Choose cover image file...'}
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

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Target Countries (Leave empty for ALL countries)
            </label>
            <div className="flex flex-wrap gap-2">
              {countryOptions.map((c) => {
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
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c.label} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
              {countryOptions.length === 0 && (
                <Text className="text-xs text-gray-500">
                  All countries selected by default.
                </Text>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 md:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={isPinned}
                onChange={() => setIsPinned(!isPinned)}
              />
              <div>
                <Text className="text-sm font-semibold text-gray-900">
                  Pin Highlight
                </Text>
                <Text className="text-xs text-gray-500">
                  Max 3 pinned highlights total system-wide.
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
                  Active
                </Text>
                <Text className="text-xs text-gray-500">
                  Show or hide in client app strip.
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(routes.highlights.index)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Create & Continue'}
          </Button>
        </div>
      </div>
    </form>
  );
}
