'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ActionIcon } from '@/components/ui/action-icon';
import { Modal } from '@/components/ui/modal';
import DeletePopover from '@/app/shared/delete-popover';
import {
  useAddHighlightElement,
  useUpdateHighlightElement,
  useDeleteHighlightElement,
  useToggleHighlightElementActive,
} from '@/framework/highlights';
import { usePackages } from '@/framework/packages';
import { useDoctors } from '@/framework/doctors';
import { useCategories } from '@/framework/categories';
import { useCoupons } from '@/framework/coupons';
import {
  NOTIFICATION_TYPE_OPTIONS,
  deepLinkEntityLabel,
  deepLinkPathForType,
  isDeepLinkEntityType,
  type DeepLinkEntityType,
} from '@/app/shared/notifications/constants';
import { HighlightElement } from '@/types/highlights';
import toast from 'react-hot-toast';
import {
  PiPlusBold,
  PiTrashBold,
  PiPencilBold,
  PiVideoCameraBold,
  PiImageBold,
  PiCloudArrowUpBold,
  PiBellRingingBold,
} from 'react-icons/pi';

interface ElementsManagerProps {
  highlightId: number;
  elements?: HighlightElement[];
}

type NamedEntity = {
  id: number | string;
  name?: { en?: string; ar?: string } | string | null;
  code?: string | null;
};

function entityLabel(item: NamedEntity) {
  const code = String(item.code || '').trim();
  let name = '';
  if (typeof item.name === 'string' && item.name.trim()) {
    name = item.name.trim();
  } else if (item.name && typeof item.name === 'object') {
    const en = String(item.name.en || '').trim();
    const ar = String(item.name.ar || '').trim();
    name = en || ar;
  }
  if (name && code) return `${name} (${code})`;
  if (name) return name;
  if (code) return code;
  return `#${item.id}`;
}

function toEntityOptions(list: NamedEntity[] | undefined) {
  return (list ?? []).map((item) => {
    const id = String(item.id);
    const label = entityLabel(item);
    return { value: id, label, name: label };
  });
}

export default function ElementsManager({
  highlightId,
  elements = [],
}: ElementsManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<HighlightElement | null>(null);

  // Form states
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [ctaType, setCtaType] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [url, setUrl] = useState('');
  const [extraDataRows, setExtraDataRows] = useState<Array<{ key: string; value: string }>>([]);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const addElement = useAddHighlightElement();
  const updateElement = useUpdateHighlightElement();
  const deleteElement = useDeleteHighlightElement();
  const toggleActive = useToggleHighlightElementActive();

  const isSubmitting = addElement.isPending || updateElement.isPending;
  const isCapReached = elements.length >= 5;

  // CTA type -> entity picker (same behaviour as the notifications form).
  const usesEntityPicker = isDeepLinkEntityType(ctaType);
  const listQuery = 'limit=1000';
  const { data: packagesData, isLoading: offersLoading } = usePackages(listQuery);
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors(listQuery);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(listQuery);
  const { data: couponsData, isLoading: couponsLoading } = useCoupons(listQuery);

  const entityOptions = useMemo(() => {
    if (ctaType === 'offers') {
      return toEntityOptions(packagesData?.data as NamedEntity[] | undefined);
    }
    if (ctaType === 'doctors') {
      return toEntityOptions(doctorsData?.data as NamedEntity[] | undefined);
    }
    if (ctaType === 'categories') {
      return toEntityOptions(categoriesData?.data as NamedEntity[] | undefined);
    }
    if (ctaType === 'coupon') {
      return toEntityOptions(couponsData?.data as NamedEntity[] | undefined);
    }
    return [];
  }, [
    ctaType,
    packagesData?.data,
    doctorsData?.data,
    categoriesData?.data,
    couponsData?.data,
  ]);

  const entityLoading =
    (ctaType === 'offers' && offersLoading) ||
    (ctaType === 'doctors' && doctorsLoading) ||
    (ctaType === 'categories' && categoriesLoading) ||
    (ctaType === 'coupon' && couponsLoading);

  const handleCtaTypeChange = (nextType: string) => {
    setCtaType(nextType);
    // Reset the resolved deep link / url whenever the type changes.
    setDeepLink('');
    setUrl('');
  };

  const handleEntitySelect = (id: string) => {
    setDeepLink(id);
    if (id && isDeepLinkEntityType(ctaType)) {
      setUrl(deepLinkPathForType(ctaType as DeepLinkEntityType, id));
    } else {
      setUrl('');
    }
  };

  const ctaTypeOptions: Array<{ value: string; label: string }> = [
    ...NOTIFICATION_TYPE_OPTIONS,
  ];
  if (ctaType && !NOTIFICATION_TYPE_OPTIONS.some((o) => o.value === ctaType)) {
    // Preserve a custom/legacy cta_type coming from an existing element.
    ctaTypeOptions.push({ value: ctaType, label: ctaType });
  }

  const openAddModal = () => {
    if (isCapReached) {
      toast.error('Maximum cap of 5 elements per highlight reached');
      return;
    }
    setEditingElement(null);
    setMediaType('image');
    setMediaFile(null);
    setThumbnailFile(null);
    setCtaType('');
    setDeepLink('');
    setUrl('');
    setExtraDataRows([]);
    setOrder(elements.length);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (el: HighlightElement) => {
    setEditingElement(el);
    setMediaType(el.media_type || 'image');
    setMediaFile(null);
    setThumbnailFile(null);
    setCtaType(el.cta_type || '');
    setDeepLink(el.deep_link || '');
    setUrl(el.url || '');
    setOrder(el.order || 0);
    setIsActive(el.is_active ?? true);

    if (el.extra_data && typeof el.extra_data === 'object') {
      const rows = Object.entries(el.extra_data).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setExtraDataRows(rows);
    } else {
      setExtraDataRows([]);
    }

    setIsModalOpen(true);
  };

  const addExtraDataRow = () => {
    setExtraDataRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeExtraDataRow = (index: number) => {
    setExtraDataRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExtraDataRow = (
    index: number,
    field: 'key' | 'value',
    val: string
  ) => {
    setExtraDataRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingElement && !mediaFile) {
      toast.error('Media file is required when adding a new slide element');
      return;
    }

    const formData = new FormData();
    formData.append('media_type', mediaType);
    formData.append('is_active', isActive ? '1' : '0');
    formData.append('order', String(order));

    if (ctaType.trim()) formData.append('cta_type', ctaType.trim());
    if (deepLink.trim()) formData.append('deep_link', deepLink.trim());
    if (url.trim()) formData.append('url', url.trim());

    extraDataRows.forEach((row) => {
      if (row.key.trim()) {
        formData.append(`extra_data[${row.key.trim()}]`, row.value.trim());
      }
    });

    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    try {
      if (editingElement) {
        await updateElement.mutateAsync({
          highlightId,
          elementId: editingElement.id,
          data: formData,
        });
      } else {
        await addElement.mutateAsync({
          highlightId,
          data: formData,
        });
      }
      setIsModalOpen(false);
    } catch {
      // Handled by query hooks
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Title as="h3" className="text-base font-semibold text-gray-900">
              Slide Elements Manager
            </Title>
            <Badge
              variant="flat"
              color={isCapReached ? 'danger' : 'primary'}
            >
              {elements.length} / 5
            </Badge>
          </div>
          <Text className="mt-1 text-xs text-gray-500">
            Add 1 to 5 image or video slides. Updating media wipes client view history.
          </Text>
        </div>

        <Button
          type="button"
          onClick={openAddModal}
          disabled={isCapReached}
          className="flex items-center gap-2"
        >
          <PiPlusBold className="h-4 w-4" />
          <span>Add Slide Element</span>
        </Button>
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {elements.map((el) => (
          <div
            key={el.id}
            className="relative flex flex-col justify-between overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300"
          >
            <div>
              <div className="relative mb-3 h-36 w-full overflow-hidden rounded-md bg-gray-900">
                {el.media_type === 'video' ? (
                  <video
                    src={el.media_url}
                    poster={el.thumbnail_url || undefined}
                    className="h-full w-full object-cover"
                    controls
                  />
                ) : (
                  <Image
                    src={el.media_url}
                    alt="Slide media"
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                )}
                <div className="absolute left-2 top-2 flex items-center gap-1.5">
                  <Badge variant="flat" color="secondary" className="gap-1 bg-black/60 text-white backdrop-blur">
                    {el.media_type === 'video' ? (
                      <PiVideoCameraBold className="h-3 w-3" />
                    ) : (
                      <PiImageBold className="h-3 w-3" />
                    )}
                    <span className="capitalize">{el.media_type}</span>
                  </Badge>
                  {el.is_expired && (
                    <Badge variant="flat" color="danger">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Order: #{el.order}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Active:</span>
                    <Switch
                      size="sm"
                      checked={el.is_active}
                      onChange={() =>
                        toggleActive.mutate({
                          highlightId,
                          elementId: el.id,
                        })
                      }
                    />
                  </div>
                </div>

                {el.cta_type && (
                  <div className="flex items-center gap-1.5 rounded bg-white p-2 text-gray-700 border border-gray-200">
                    <PiBellRingingBold className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-purple-900">{el.cta_type}</span>
                      {el.deep_link && <p className="truncate text-[10px] text-gray-500">{el.deep_link}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-200 pt-3">
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={() => openEditModal(el)}
                className="hover:!border-gray-900"
              >
                <PiPencilBold className="h-3.5 w-3.5" />
              </ActionIcon>
              <DeletePopover
                title="Delete Slide Element"
                description={`Delete element #${el.id}?`}
                onDelete={() =>
                  deleteElement.mutate({
                    highlightId,
                    elementId: el.id,
                  })
                }
              >
                <ActionIcon
                  size="sm"
                  variant="outline"
                  className="hover:!border-gray-900 hover:text-red-600"
                >
                  <PiTrashBold className="h-3.5 w-3.5" />
                </ActionIcon>
              </DeletePopover>
            </div>
          </div>
        ))}

        {elements.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
            <PiImageBold className="mb-2 h-10 w-10 text-gray-400" />
            <Text className="font-medium text-gray-700">No slide elements added yet</Text>
            <Text className="mt-1 text-xs text-gray-500">
              Each highlight requires 1 to 5 elements (images or videos).
            </Text>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openAddModal}
              className="mt-4"
            >
              Add First Slide Element
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Element Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <Title as="h3" className="mb-4 text-lg font-semibold text-gray-900">
            {editingElement ? 'Edit Slide Element' : 'Add Slide Element'}
          </Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Media Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={[
                  { value: 'image', label: 'Image (JPEG, PNG, WEBP, GIF ≤ 5MB)', name: 'Image' },
                  { value: 'video', label: 'Video (MP4, MOV, WEBM ≤ 150MB)', name: 'Video' },
                ]}
                value={mediaType}
                getOptionValue={(opt: any) => opt.value}
                onChange={(opt: any) => setMediaType(opt?.value ?? opt)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Media File {!editingElement && <span className="text-red-500">*</span>}{' '}
                {editingElement && '(Upload to replace media & reset views)'}
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 hover:border-gray-900">
                <PiCloudArrowUpBold className="h-5 w-5 text-gray-500" />
                <span className="truncate">
                  {mediaFile ? mediaFile.name : 'Choose media file...'}
                </span>
                <input
                  type="file"
                  accept={
                    mediaType === 'video'
                      ? 'video/mp4,video/quicktime,video/webm,video/x-matroska'
                      : 'image/jpeg,image/png,image/webp,image/gif'
                  }
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setMediaFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {mediaType === 'video' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Video Poster Thumbnail (Optional image ≤ 5MB)
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-600 hover:border-gray-900">
                  <PiCloudArrowUpBold className="h-5 w-5 text-gray-500" />
                  <span className="truncate">
                    {thumbnailFile ? thumbnailFile.name : 'Choose poster image...'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setThumbnailFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {/* CTA Section */}
            <div className="rounded-md border border-purple-100 bg-purple-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PiBellRingingBold className="h-4 w-4 text-purple-700" />
                <Text className="font-semibold text-sm text-purple-900">
                  CTA Action (Push Notification Shaped)
                </Text>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    CTA Type
                  </label>
                  <Select
                    placeholder="Select type"
                    options={ctaTypeOptions.map((o) => ({
                      ...o,
                      name: o.value || 'none',
                    }))}
                    value={ctaType}
                    getOptionValue={(opt: any) => opt.value}
                    displayValue={(selected: any) =>
                      ctaTypeOptions.find((o) => o.value === selected)?.label ??
                      'None'
                    }
                    onChange={(opt: any) =>
                      handleCtaTypeChange(String(opt?.value ?? opt ?? ''))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    {usesEntityPicker ? deepLinkEntityLabel(ctaType) : 'Deep Link'}
                  </label>
                  {usesEntityPicker ? (
                    (() => {
                      const options =
                        deepLink &&
                        !entityOptions.some((o) => o.value === deepLink)
                          ? [
                              ...entityOptions,
                              {
                                value: deepLink,
                                label: `${deepLinkEntityLabel(ctaType)} #${deepLink}`,
                                name: `${deepLinkEntityLabel(ctaType)} #${deepLink}`,
                              },
                            ]
                          : entityOptions;
                      return (
                        <Select
                          placeholder={
                            entityLoading
                              ? 'Loading…'
                              : `Select ${deepLinkEntityLabel(ctaType).toLowerCase()}`
                          }
                          options={options}
                          value={deepLink}
                          getOptionValue={(opt: any) => opt.value}
                          displayValue={(selected: any) =>
                            options.find((o) => o.value === selected)?.label ??
                            (selected ? String(selected) : '')
                          }
                          onChange={(opt: any) =>
                            handleEntitySelect(String(opt?.value ?? opt ?? ''))
                          }
                          clearable
                          onClear={() => handleEntitySelect('')}
                        />
                      );
                    })()
                  ) : (
                    <Input
                      placeholder="e.g. homehealers://doctors/55"
                      value={deepLink}
                      onChange={(e) => setDeepLink(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  External URL{' '}
                  {usesEntityPicker && (
                    <span className="font-normal text-gray-400">
                      (auto-filled from selection)
                    </span>
                  )}
                </label>
                <Input
                  placeholder={
                    usesEntityPicker
                      ? deepLinkPathForType(ctaType as DeepLinkEntityType, '{id}')
                      : 'https://...'
                  }
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">
                    Extra Data (Key/Value pairs)
                  </label>
                  <button
                    type="button"
                    onClick={addExtraDataRow}
                    className="text-xs font-semibold text-purple-700 hover:underline"
                  >
                    + Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {extraDataRows.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Key (e.g. reservation_id)"
                        size="sm"
                        value={row.key}
                        onChange={(e) => updateExtraDataRow(idx, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Value (e.g. 9)"
                        size="sm"
                        value={row.value}
                        onChange={(e) => updateExtraDataRow(idx, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraDataRow(idx)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Order Index
                </label>
                <Input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <Text className="text-sm font-medium text-gray-700">Active</Text>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingElement ? 'Save Changes' : 'Add Element'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
