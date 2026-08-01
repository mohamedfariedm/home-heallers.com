'use client';

import { useMemo, useState } from 'react';
import { Controller, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Switch, Textarea } from 'rizzui';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import Upload from '@/components/ui/upload';
import FormGroup from '@/app/shared/form-group';
import {
  useCreateExercise,
  useExercisesFilterOptions,
  useUpdateExercise,
} from '@/framework/exercises';
import { useCategories } from '@/framework/categories';
import {
  exerciseFormSchema,
  type ExerciseFormInput,
} from '@/utils/validators/exercise-form.schema';
import type {
  Exercise,
  ExerciseFilterOptions,
} from '@/types/admin-exercises';

const MEDIA_TYPE_OPTIONS = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'other', label: 'Other' },
] as const;

function parseSecondaryMuscles(value?: string | null) {
  if (!value?.trim()) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function appendIfPresent(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, String(value));
}

function toSelectOptions(values: string[] = [], noneLabel = 'None') {
  return [
    { value: '', name: 'none', label: noneLabel },
    ...values.map((value) => ({
      value,
      name: value,
      label: value,
    })),
  ];
}

function ensureOption(
  options: SelectOption[],
  value?: string | null
): SelectOption[] {
  if (!value) return options;
  if (options.some((option) => String(option.value) === String(value))) {
    return options;
  }
  return [...options, { value, name: value, label: value }];
}

function buildExerciseBody(
  data: ExerciseFormInput,
  file: File | null,
  thumbnail: File | null
) {
  const secondaryMuscles = parseSecondaryMuscles(data.secondary_muscles);
  const hasFiles = Boolean(file || thumbnail);

  if (hasFiles) {
    const formData = new FormData();
    appendIfPresent(formData, 'title_en', data.title.en?.trim());
    appendIfPresent(formData, 'title_ar', data.title.ar?.trim());
    appendIfPresent(formData, 'description_en', data.description?.en?.trim());
    appendIfPresent(formData, 'description_ar', data.description?.ar?.trim());
    appendIfPresent(formData, 'instructions_en', data.instructions?.en?.trim());
    appendIfPresent(formData, 'instructions_ar', data.instructions?.ar?.trim());
    appendIfPresent(formData, 'category_id', data.category_id);
    appendIfPresent(formData, 'body_part', data.body_part);
    appendIfPresent(formData, 'equipment', data.equipment);
    appendIfPresent(formData, 'target', data.target);
    appendIfPresent(formData, 'muscle_group', data.muscle_group);
    appendIfPresent(formData, 'media_type', data.media_type);
    formData.append('is_active', data.is_active ? '1' : '0');
    secondaryMuscles.forEach((muscle) => {
      formData.append('secondary_muscles[]', muscle);
    });
    if (file) formData.append('file', file);
    if (thumbnail) formData.append('thumbnail', thumbnail);
    return formData;
  }

  return {
    title: {
      en: data.title.en?.trim() || '',
      ar: data.title.ar?.trim() || '',
    },
    description: {
      en: data.description?.en?.trim() || '',
      ar: data.description?.ar?.trim() || '',
    },
    instructions: {
      en: data.instructions?.en?.trim() || '',
      ar: data.instructions?.ar?.trim() || '',
    },
    category_id: data.category_id ? Number(data.category_id) : null,
    body_part: data.body_part || null,
    equipment: data.equipment || null,
    target: data.target || null,
    muscle_group: data.muscle_group || null,
    secondary_muscles: secondaryMuscles,
    media_type: data.media_type || null,
    is_active: data.is_active ?? true,
  };
}

function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
  error,
}: {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const selected =
    options.find((option) => String(option.value) === String(value ?? '')) ??
    options[0];

  return (
    <SelectBox
      options={options}
      value={selected}
      onChange={(option: SelectOption) =>
        onChange(option?.value ? String(option.value) : '')
      }
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      error={error}
      displayValue={(option: SelectOption) =>
        option?.label ?? option?.name ?? ''
      }
    />
  );
}

export default function CreateOrUpdateExercise({
  initValues,
}: {
  initValues?: Exercise;
}) {
  const { closeModal } = useModal();
  const { mutate: createExercise, isPending: isCreating } = useCreateExercise();
  const { mutate: updateExercise, isPending: isUpdating } = useUpdateExercise();
  const { data: categories, isLoading: isLoadingCategories } = useCategories(
    'page=1&limit=100'
  );
  const { data: filterOptionsData, isLoading: isLoadingFilterOptions } =
    useExercisesFilterOptions();
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    initValues?.media_url || null
  );
  const [thumbPreview, setThumbPreview] = useState<string | null>(
    initValues?.thumbnail_url || null
  );

  const filterOptions = (
    filterOptionsData as { data?: ExerciseFilterOptions } | undefined
  )?.data;

  const categoryOptions: SelectOption[] = useMemo(() => {
    const list = (categories?.data ?? []).filter((category: any) => {
      if (category.active === false || category.active === 0) return false;
      if (category.is_active === 0 || category.is_active === false) return false;
      return true;
    });

    return [
      { value: '', name: 'None', label: 'None' },
      ...list.map((category: any) => ({
        value: String(category.id),
        name: (category?.name?.en ??
          category?.name?.ar ??
          `Category ${category.id}`) as string,
        label: (category?.name?.en ??
          category?.name?.ar ??
          `Category ${category.id}`) as string,
      })),
    ];
  }, [categories?.data]);

  const bodyPartOptions = useMemo(
    () =>
      ensureOption(
        toSelectOptions(filterOptions?.body_parts, 'Select body part'),
        initValues?.body_part
      ),
    [filterOptions?.body_parts, initValues?.body_part]
  );
  const equipmentOptions = useMemo(
    () =>
      ensureOption(
        toSelectOptions(filterOptions?.equipment, 'Select equipment'),
        initValues?.equipment
      ),
    [filterOptions?.equipment, initValues?.equipment]
  );
  const targetOptions = useMemo(
    () =>
      ensureOption(
        toSelectOptions(filterOptions?.targets, 'Select target'),
        initValues?.target
      ),
    [filterOptions?.targets, initValues?.target]
  );
  const muscleGroupOptions = useMemo(
    () =>
      ensureOption(
        toSelectOptions(filterOptions?.muscle_groups, 'Select muscle group'),
        initValues?.muscle_group
      ),
    [filterOptions?.muscle_groups, initValues?.muscle_group]
  );

  const onSubmit: SubmitHandler<ExerciseFormInput> = (data) => {
    const body = buildExerciseBody(data, file, thumbnail);
    if (initValues) {
      updateExercise({ id: initValues.id, body });
    } else {
      createExercise(body);
    }
  };

  if (isCreating || isUpdating) {
    return (
      <div className="m-auto p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ExerciseFormInput>
      onSubmit={onSubmit}
      validationSchema={exerciseFormSchema}
      useFormProps={{
        defaultValues: {
          title: {
            en: initValues?.title?.en || '',
            ar: initValues?.title?.ar || '',
          },
          description: {
            en: initValues?.description?.en || '',
            ar: initValues?.description?.ar || '',
          },
          instructions: {
            en: initValues?.instructions?.en || '',
            ar: initValues?.instructions?.ar || '',
          },
          category_id: initValues?.category_id
            ? String(initValues.category_id)
            : '',
          body_part: initValues?.body_part || '',
          equipment: initValues?.equipment || '',
          target: initValues?.target || '',
          muscle_group: initValues?.muscle_group || '',
          secondary_muscles: Array.isArray(initValues?.secondary_muscles)
            ? initValues.secondary_muscles.join(', ')
            : '',
          media_type: initValues?.media_type || 'image',
          is_active: initValues?.is_active ?? true,
        },
      }}
      className="flex flex-grow flex-col gap-5 p-6"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              {initValues ? 'Update Exercise' : 'Create Exercise'}
            </Title>
            <Button variant="text" onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Title (English)"
              {...register('title.en')}
              error={errors.title?.en?.message}
            />
            <Input
              label="Title (Arabic)"
              {...register('title.ar')}
              error={errors.title?.ar?.message}
            />
          </div>

          <Textarea
            label="Description (English)"
            {...register('description.en')}
            error={errors.description?.en?.message}
            rows={3}
          />
          <Textarea
            label="Description (Arabic)"
            {...register('description.ar')}
            error={errors.description?.ar?.message}
            rows={3}
          />
          <Textarea
            label="Instructions (English)"
            {...register('instructions.en')}
            error={errors.instructions?.en?.message}
            rows={3}
          />
          <Textarea
            label="Instructions (Arabic)"
            {...register('instructions.ar')}
            error={errors.instructions?.ar?.message}
            rows={3}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Controller
              name="body_part"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Body part"
                  placeholder="Select body part"
                  options={bodyPartOptions}
                  value={value}
                  onChange={onChange}
                  disabled={isLoadingFilterOptions}
                  error={errors.body_part?.message}
                />
              )}
            />
            <Controller
              name="equipment"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Equipment"
                  placeholder="Select equipment"
                  options={equipmentOptions}
                  value={value}
                  onChange={onChange}
                  disabled={isLoadingFilterOptions}
                  error={errors.equipment?.message}
                />
              )}
            />
            <Controller
              name="target"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Target"
                  placeholder="Select target"
                  options={targetOptions}
                  value={value}
                  onChange={onChange}
                  disabled={isLoadingFilterOptions}
                  error={errors.target?.message}
                />
              )}
            />
            <Controller
              name="muscle_group"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Muscle group"
                  placeholder="Select muscle group"
                  options={muscleGroupOptions}
                  value={value}
                  onChange={onChange}
                  disabled={isLoadingFilterOptions}
                  error={errors.muscle_group?.message}
                />
              )}
            />
            <Controller
              name="category_id"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectField
                  label="Category"
                  placeholder="Select category (optional)"
                  options={categoryOptions}
                  value={value}
                  onChange={onChange}
                  disabled={isLoadingCategories}
                  error={errors.category_id?.message}
                />
              )}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Media type
              </label>
              <select
                {...register('media_type')}
                className="w-full rounded-lg border border-gray-300 p-2"
              >
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Secondary muscles"
            placeholder="Comma-separated, e.g. hip flexors, lower back"
            {...register('secondary_muscles')}
          />

          <Controller
            name="is_active"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Active"
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          <FormGroup title="Media file" className="pt-2">
            <Upload
              title="Animation / media (max 20MB)"
              accept="img"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                if (selected) {
                  setFilePreview(URL.createObjectURL(selected));
                }
              }}
            />
            {filePreview ? (
              <div className="relative mt-2 inline-block">
                <img
                  src={filePreview}
                  alt="Media preview"
                  className="h-auto max-h-40 w-48 rounded border border-gray-200 object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(initValues?.media_url || null);
                  }}
                  className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 shadow"
                >
                  <PiXBold className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            ) : (
              <Text className="mt-1 text-xs text-gray-500">No media selected</Text>
            )}
          </FormGroup>

          <FormGroup title="Thumbnail" className="pt-2">
            <Upload
              title="Thumbnail image (max 5MB)"
              accept="img"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setThumbnail(selected);
                if (selected) {
                  setThumbPreview(URL.createObjectURL(selected));
                }
              }}
            />
            {thumbPreview ? (
              <div className="relative mt-2 inline-block">
                <img
                  src={thumbPreview}
                  alt="Thumbnail preview"
                  className="h-auto max-h-32 w-36 rounded border border-gray-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbnail(null);
                    setThumbPreview(initValues?.thumbnail_url || null);
                  }}
                  className="absolute -right-2 -top-2 rounded-full border border-gray-300 bg-white p-1 shadow"
                >
                  <PiXBold className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            ) : (
              <Text className="mt-1 text-xs text-gray-500">
                No thumbnail selected
              </Text>
            )}
          </FormGroup>

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {initValues ? 'Update Exercise' : 'Create Exercise'}
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
