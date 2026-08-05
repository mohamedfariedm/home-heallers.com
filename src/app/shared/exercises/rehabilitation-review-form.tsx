'use client';

import { Controller, SubmitHandler } from 'react-hook-form';
import { PiXBold } from 'react-icons/pi';
import { Textarea } from 'rizzui';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useRehabilitationCategories,
  useReviewExerciseRehabilitation,
} from '@/framework/exercises';
import {
  rehabilitationReviewSchema,
  type RehabilitationReviewFormInput,
} from '@/utils/validators/exercise-form.schema';
import type { Exercise } from '@/types/admin-exercises';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'approved', name: 'approved', label: 'Approve' },
  { value: 'rejected', name: 'rejected', label: 'Reject' },
];

const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: '', name: 'none', label: 'Not specified' },
  { value: 'beginner', name: 'beginner', label: 'Beginner' },
  { value: 'intermediate', name: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', name: 'advanced', label: 'Advanced' },
];

function selectedOption(options: SelectOption[], value?: string | null) {
  return (
    options.find((option) => String(option.value) === String(value ?? '')) ??
    options[0]
  );
}

export default function RehabilitationReviewForm({
  exercise,
}: {
  exercise: Exercise;
}) {
  const { closeModal } = useModal();
  const { data, isLoading: categoriesLoading } =
    useRehabilitationCategories();
  const { mutate: reviewExercise, isPending } =
    useReviewExerciseRehabilitation();

  const categoryOptions: SelectOption[] = [
    { value: '', name: 'none', label: 'Select rehabilitation category' },
    ...(data?.data ?? []).map((category) => ({
      value: String(category.id),
      name: String(category.id),
      label: category.name_en || category.name_ar,
    })),
  ];

  const onSubmit: SubmitHandler<RehabilitationReviewFormInput> = (values) => {
    reviewExercise({
      id: exercise.id,
      status: values.status,
      rehab_category_id: values.rehab_category_id
        ? Number(values.rehab_category_id)
        : null,
      difficulty: values.difficulty || null,
      clinical_notes: values.clinical_notes?.trim() || null,
      contraindications: values.contraindications?.trim() || null,
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
    <Form<RehabilitationReviewFormInput>
      onSubmit={onSubmit}
      validationSchema={rehabilitationReviewSchema}
      useFormProps={{
        defaultValues: {
          status:
            exercise.rehabilitation_review_status === 'rejected'
              ? 'rejected'
              : 'approved',
          rehab_category_id: exercise.rehab_category_id
            ? String(exercise.rehab_category_id)
            : '',
          difficulty: exercise.difficulty || 'beginner',
          clinical_notes: exercise.clinical_notes || '',
          contraindications: exercise.contraindications || '',
        },
      }}
      className="flex flex-grow flex-col gap-5 p-6"
    >
      {({ register, control, watch, formState: { errors } }) => {
        const status = watch('status');

        return (
          <>
            <div className="flex items-center justify-between">
              <div>
                <Title as="h4" className="font-semibold">
                  Rehabilitation Review
                </Title>
                <Text className="mt-1 text-sm text-gray-500">
                  {exercise.title?.en || exercise.title?.ar || `Exercise #${exercise.id}`}
                </Text>
              </div>
              <Button variant="text" onClick={closeModal}>
                <PiXBold className="h-4 w-4" />
              </Button>
            </div>

            <Controller
              name="status"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SelectBox
                  label="Decision"
                  options={STATUS_OPTIONS}
                  value={selectedOption(STATUS_OPTIONS, value)}
                  onChange={(option: SelectOption) =>
                    onChange(String(option.value))
                  }
                  error={errors.status?.message}
                  displayValue={(option: SelectOption) =>
                    option?.label ?? option?.name ?? ''
                  }
                />
              )}
            />

            {status === 'approved' && (
              <>
                <Controller
                  name="rehab_category_id"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      label="Rehabilitation category"
                      options={categoryOptions}
                      value={selectedOption(categoryOptions, value)}
                      onChange={(option: SelectOption) =>
                        onChange(option?.value ? String(option.value) : '')
                      }
                      disabled={categoriesLoading}
                      error={errors.rehab_category_id?.message}
                      displayValue={(option: SelectOption) =>
                        option?.label ?? option?.name ?? ''
                      }
                    />
                  )}
                />

                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <SelectBox
                      label="Difficulty"
                      options={DIFFICULTY_OPTIONS}
                      value={selectedOption(DIFFICULTY_OPTIONS, value)}
                      onChange={(option: SelectOption) =>
                        onChange(option?.value ? String(option.value) : '')
                      }
                      error={errors.difficulty?.message}
                      displayValue={(option: SelectOption) =>
                        option?.label ?? option?.name ?? ''
                      }
                    />
                  )}
                />

                <Textarea
                  label="Clinical notes"
                  rows={3}
                  {...register('clinical_notes')}
                  error={errors.clinical_notes?.message}
                />
                <Textarea
                  label="Contraindications"
                  rows={3}
                  {...register('contraindications')}
                  error={errors.contraindications?.message}
                />
              </>
            )}

            <div className="mt-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                color={status === 'rejected' ? 'danger' : 'primary'}
                isLoading={isPending}
              >
                {status === 'rejected' ? 'Reject Exercise' : 'Approve Exercise'}
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
