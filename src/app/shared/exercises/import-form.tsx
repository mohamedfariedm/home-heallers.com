'use client';

import { useMemo } from 'react';
import { Controller, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Switch } from 'rizzui';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import {
  useExercisesFilterOptions,
  useImportExercises,
} from '@/framework/exercises';
import {
  exerciseImportSchema,
  type ExerciseImportFormInput,
} from '@/utils/validators/exercise-form.schema';
import type { ExerciseFilterOptions } from '@/types/admin-exercises';

export default function ImportExerciseForm() {
  const { closeModal } = useModal();
  const { mutate: importExercises, isPending } = useImportExercises();
  const { data: filterOptionsData, isLoading: isLoadingFilterOptions } =
    useExercisesFilterOptions();

  const bodyPartOptions: SelectOption[] = useMemo(() => {
    const filterOptions = (
      filterOptionsData as { data?: ExerciseFilterOptions } | undefined
    )?.data;

    return [
      { value: '', name: 'all', label: 'All body parts' },
      ...(filterOptions?.body_parts ?? []).map((value) => ({
        value,
        name: value,
        label: value,
      })),
    ];
  }, [filterOptionsData]);

  const onSubmit: SubmitHandler<ExerciseImportFormInput> = (data) => {
    importExercises({
      source: data.source?.trim() || null,
      body_part: data.body_part?.trim() || null,
      limit: data.limit ? Number(data.limit) : null,
      skip_media: data.skip_media ?? false,
      fresh: data.fresh ?? false,
      rehabilitation_only: data.rehabilitation_only ?? false,
    });
  };

  if (isPending) {
    return (
      <div className="m-auto p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Form<ExerciseImportFormInput>
      onSubmit={onSubmit}
      validationSchema={exerciseImportSchema}
      useFormProps={{
        defaultValues: {
          source: '',
          body_part: '',
          limit: '50',
          skip_media: false,
          fresh: false,
          rehabilitation_only: false,
        },
      }}
      className="flex flex-grow flex-col gap-5 p-6"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              Import Exercise Dataset
            </Title>
            <Button variant="text" onClick={closeModal}>
              <PiXBold className="h-4 w-4" />
            </Button>
          </div>

          <Text className="text-sm text-gray-600">
            Queues an async import from the exercises dataset. Results appear
            after the queue worker finishes.
          </Text>

          <Input
            label="Source (optional)"
            placeholder="Local path or URL to exercises.json"
            {...register('source')}
            error={errors.source?.message}
          />

          <Controller
            name="body_part"
            control={control}
            render={({ field: { value, onChange } }) => {
              const selected =
                bodyPartOptions.find(
                  (option) => String(option.value) === String(value ?? '')
                ) ?? bodyPartOptions[0];

              return (
                <SelectBox
                  options={bodyPartOptions}
                  value={selected}
                  onChange={(option: SelectOption) =>
                    onChange(option?.value ? String(option.value) : '')
                  }
                  disabled={isLoadingFilterOptions}
                  label="Body part filter (optional)"
                  placeholder="Select body part"
                  error={errors.body_part?.message}
                  displayValue={(option: SelectOption) =>
                    option?.label ?? option?.name ?? ''
                  }
                />
              );
            }}
          />

          <Input
            label="Limit"
            type="number"
            {...register('limit')}
            error={errors.limit?.message}
          />

          <Controller
            name="skip_media"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Skip media download"
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="fresh"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Switch
                label="Fresh import (soft-delete existing public rows)"
                checked={Boolean(value)}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="rehabilitation_only"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div>
                <Switch
                  label="Import rehabilitation candidates only"
                  checked={Boolean(value)}
                  onChange={onChange}
                />
                <Text className="mt-1 text-xs text-gray-500">
                  Matching exercises are marked pending for clinical review;
                  they are not auto-approved.
                </Text>
              </div>
            )}
          />

          <div className="mt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Queue Import
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
