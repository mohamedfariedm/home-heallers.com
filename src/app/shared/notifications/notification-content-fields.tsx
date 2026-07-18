'use client';

import { useMemo } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SelectBox from '@/components/ui/select';
import { usePackages } from '@/framework/packages';
import { useDoctors } from '@/framework/doctors';
import { useCategories } from '@/framework/categories';
import { useCoupons } from '@/framework/coupons';
import {
  LANG_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
  deepLinkEntityLabel,
  deepLinkPathForType,
  isDeepLinkEntityType,
  type DeepLinkEntityType,
} from '@/app/shared/notifications/constants';

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
    return {
      value: id,
      label,
      name: label,
    };
  });
}

type NotificationContentFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
};

export default function NotificationContentFields<T extends FieldValues>({
  register,
  control,
  errors,
  watch,
  setValue,
}: NotificationContentFieldsProps<T>) {
  const selectedType = String(watch('type' as never) ?? '');
  const usesEntityPicker = isDeepLinkEntityType(selectedType);

  const listQuery = 'limit=1000';
  const { data: packagesData, isLoading: offersLoading } = usePackages(listQuery);
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors(listQuery);
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(listQuery);
  const { data: couponsData, isLoading: couponsLoading } = useCoupons(listQuery);

  const entityOptions = useMemo(() => {
    if (selectedType === 'offers') {
      return toEntityOptions(packagesData?.data as NamedEntity[] | undefined);
    }
    if (selectedType === 'doctors') {
      return toEntityOptions(doctorsData?.data as NamedEntity[] | undefined);
    }
    if (selectedType === 'categories') {
      return toEntityOptions(categoriesData?.data as NamedEntity[] | undefined);
    }
    if (selectedType === 'coupon') {
      return toEntityOptions(couponsData?.data as NamedEntity[] | undefined);
    }
    return [];
  }, [
    selectedType,
    packagesData?.data,
    doctorsData?.data,
    categoriesData?.data,
    couponsData?.data,
  ]);

  const entityLoading =
    (selectedType === 'offers' && offersLoading) ||
    (selectedType === 'doctors' && doctorsLoading) ||
    (selectedType === 'categories' && categoriesLoading) ||
    (selectedType === 'coupon' && couponsLoading);

  // Only clear when the user changes type (see handleTypeChange).
  // Do not auto-clear deep_link when the current id is missing from the loaded list
  // (edit mode / pagination / deleted entities).

  const handleTypeChange = (nextType: string, onChange: (value: string) => void) => {
    onChange(nextType);
    setValue('deep_link' as never, '' as never, { shouldDirty: true });
    setValue('url' as never, '' as never, { shouldDirty: true });
  };

  const handleDeepLinkSelect = (id: string, onChange: (value: string) => void) => {
    onChange(id);
    if (id && isDeepLinkEntityType(selectedType)) {
      setValue('url' as never, deepLinkPathForType(selectedType, id) as never, {
        shouldDirty: true,
      });
    } else {
      setValue('url' as never, '' as never, { shouldDirty: true });
    }
  };

  const deepLinkLabel = usesEntityPicker
    ? `${deepLinkEntityLabel(selectedType)} (optional)`
    : 'Deep link (optional)';

  const externalUrlLabel = usesEntityPicker
    ? 'App path / External URL (optional)'
    : 'External URL (optional)';

  return (
    <>
      <Input
        label="Title"
        placeholder="Notification title"
        {...register('title' as never)}
        error={errors.title?.message as string}
      />

      <Textarea
        label="Message"
        placeholder="Notification body"
        {...register('body' as never)}
        error={errors.body?.message as string}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 w-full space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Language</label>
          <Controller
            control={control}
            name={'lang' as never}
            render={({ field: { value, onChange } }) => (
              <SelectBox
                className="w-full"
                placeholder="Language"
                options={LANG_OPTIONS.map((option) => ({
                  ...option,
                  name: option.value,
                }))}
                value={value}
                onChange={onChange}
                getOptionValue={(option) => option.value}
                displayValue={(selected) =>
                  LANG_OPTIONS.find((option) => option.value === selected)?.label ??
                  String(selected)
                }
                error={errors.lang?.message as string}
              />
            )}
          />
        </div>

        <div className="min-w-0 w-full space-y-1.5">
          <label className="text-sm font-medium text-gray-900">Type (optional)</label>
          <Controller
            control={control}
            name={'type' as never}
            render={({ field: { value, onChange } }) => {
              const current = String(value ?? '');
              const typeOptions: Array<{ value: string; label: string }> = [
                ...NOTIFICATION_TYPE_OPTIONS,
              ];
              if (
                current &&
                !NOTIFICATION_TYPE_OPTIONS.some((option) => option.value === current)
              ) {
                typeOptions.push({ value: current, label: current });
              }

              return (
                <SelectBox
                  className="w-full"
                  placeholder="Select type"
                  options={typeOptions.map((option) => ({
                    ...option,
                    name: option.value || 'none',
                  }))}
                  value={current}
                  onChange={(next) => handleTypeChange(String(next ?? ''), onChange)}
                  getOptionValue={(option) => option.value}
                  displayValue={(selected) =>
                    typeOptions.find((option) => option.value === selected)?.label ??
                    'None'
                  }
                  error={errors.type?.message as string}
                />
              );
            }}
          />
        </div>
      </div>

      {selectedType ? (
        <div className="grid gap-4 @xl:grid-cols-2">
          {usesEntityPicker ? (
            <div className="min-w-0 w-full space-y-1.5">
              <label className="text-sm font-medium text-gray-900">{deepLinkLabel}</label>
              <Controller
                control={control}
                name={'deep_link' as never}
                render={({ field: { value, onChange } }) => {
                  const current = String(value ?? '');
                  const options =
                    current && !entityOptions.some((option) => option.value === current)
                      ? [
                          ...entityOptions,
                          {
                            value: current,
                            label: `${deepLinkEntityLabel(selectedType)} #${current}`,
                            name: `${deepLinkEntityLabel(selectedType)} #${current}`,
                          },
                        ]
                      : entityOptions;

                  return (
                    <SelectBox
                      className="w-full"
                      placeholder={
                        entityLoading
                          ? 'Loading…'
                          : `Select ${deepLinkEntityLabel(selectedType).toLowerCase()}`
                      }
                      options={options}
                      value={current}
                      onChange={(next) =>
                        handleDeepLinkSelect(String(next ?? ''), onChange)
                      }
                      getOptionValue={(option) => option.value}
                      displayValue={(selected) =>
                        options.find((option) => option.value === selected)?.label ??
                        (selected ? String(selected) : '')
                      }
                      error={errors.deep_link?.message as string}
                      clearable
                      onClear={() => handleDeepLinkSelect('', onChange)}
                    />
                  );
                }}
              />
            </div>
          ) : (
            <Input
              label={deepLinkLabel}
              placeholder="offers/summer-sale"
              {...register('deep_link' as never)}
              error={errors.deep_link?.message as string}
            />
          )}

          <Input
            label={externalUrlLabel}
            placeholder={
              usesEntityPicker
                ? deepLinkPathForType(selectedType as DeepLinkEntityType, '{id}')
                : 'https://home-healers.com/offers/summer-sale'
            }
            {...register('url' as never)}
            error={errors.url?.message as string}
          />
        </div>
      ) : null}
    </>
  );
}
