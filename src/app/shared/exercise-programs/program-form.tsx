'use client';

import { useMemo, useState } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import {
  PiPlusBold,
  PiTrashDuotone,
  PiXBold,
  PiClipboardText,
  PiBarbell,
  PiGearSix,
} from 'react-icons/pi';
import { Switch, Textarea, Checkbox, ActionIcon } from 'rizzui';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import SelectBox, { type SelectOption } from '@/components/ui/select';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useDoctors } from '@/framework/doctors';
import {
  useCreateExerciseProgram,
  useExerciseProgramClients,
  useExerciseProgramExercises,
  useExerciseProgramSessions,
  useUpdateExerciseProgram,
} from '@/framework/exercise-programs';
import {
  EXERCISE_PROGRAM_DAYS,
  exerciseProgramFormSchema,
  type ExerciseProgramFormInput,
  type ExerciseProgramItemFormInput,
} from '@/utils/validators/exercise-program-form.schema';
import { resolveLocalizedName } from '@/utils/resolve-localized-name';
import type { ExerciseProgram } from '@/types/admin-exercise-programs';

type ProgramTabId = 'program' | 'exercises' | 'settings';

const PROGRAM_TABS: {
  id: ProgramTabId;
  label: string;
  icon: typeof PiClipboardText;
}[] = [
  { id: 'program', label: 'Program', icon: PiClipboardText },
  { id: 'exercises', label: 'Exercises', icon: PiBarbell },
  { id: 'settings', label: 'Settings', icon: PiGearSix },
];

const PROGRAM_ERROR_KEYS = [
  'doctor_id',
  'client_id',
  'reservation_date_id',
  'title',
  'instructions',
  'start_date',
  'end_date',
];
const EXERCISES_ERROR_KEYS = ['items'];
const SETTINGS_ERROR_KEYS = ['send_after_save'];

function programTabHasErrors(
  tabId: ProgramTabId,
  errors: FieldErrors<ExerciseProgramFormInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'program':
      return has(PROGRAM_ERROR_KEYS);
    case 'exercises':
      return has(EXERCISES_ERROR_KEYS);
    case 'settings':
      return has(SETTINGS_ERROR_KEYS);
    default:
      return false;
  }
}

function selectedOption(options: SelectOption[], value?: string | null) {
  return (
    options.find((option) => String(option.value) === String(value ?? '')) ??
    null
  );
}

function toNumberOrNull(value?: string | null) {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function exerciseLabel(exercise: any) {
  if (!exercise) return 'Exercise';
  return (
    resolveLocalizedName(exercise.title) ||
    resolveLocalizedName(exercise.name) ||
    `Exercise #${exercise.id}`
  );
}

function personLabel(person: any, fallbackPrefix: string) {
  return (
    resolveLocalizedName(person?.name) ||
    resolveLocalizedName(person?.full_name) ||
    resolveLocalizedName(person?.email) ||
    resolveLocalizedName(person?.phone) ||
    `${fallbackPrefix} #${person?.id}`
  );
}

function sessionLabel(session: any) {
  if (session?.label) return resolveLocalizedName(session.label);
  const date = session?.date || session?.reservation_date || '';
  const start = session?.start_time || '';
  const end = session?.end_time || '';
  const id = session?.id ?? session?.reservation_date_id;
  const time = [start, end].filter(Boolean).join(' - ');
  return (
    [String(date || ''), time || null, id ? `#${id}` : null]
      .filter(Boolean)
      .join(' · ') || 'Session'
  );
}

function emptyItem(): ExerciseProgramItemFormInput {
  return {
    exercise_id: '',
    sets: '',
    repetitions: '',
    duration_seconds: '',
    frequency_per_day: '',
    days: [],
    notes: '',
  };
}

function ProgramItemsEditor({
  control,
  register,
  errors,
  doctorId,
}: {
  control: Control<ExerciseProgramFormInput>;
  register: UseFormRegister<ExerciseProgramFormInput>;
  errors: FieldErrors<ExerciseProgramFormInput>;
  doctorId?: string;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const exercisesParam = doctorId ? `doctor_id=${doctorId}&limit=100` : '';
  const { data: exercisesData, isLoading: exercisesLoading } =
    useExerciseProgramExercises(exercisesParam, Boolean(doctorId));

  const exerciseOptions: SelectOption[] = useMemo(() => {
    const list = Array.isArray((exercisesData as any)?.data)
      ? (exercisesData as any).data
      : [];
    return list.map((exercise: any) => ({
      value: String(exercise.id),
      name: String(exercise.id),
      label: exerciseLabel(exercise),
    }));
  }, [exercisesData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Text className="text-sm font-semibold text-gray-900">
          Exercise items
        </Text>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append(emptyItem() as any)}
          disabled={!doctorId}
        >
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add item
        </Button>
      </div>

      {!doctorId && (
        <Text className="text-sm text-gray-500">
          Select a doctor to load attachable exercises.
        </Text>
      )}

      {typeof errors.items?.message === 'string' && (
        <Text className="text-sm text-red-500">{errors.items.message}</Text>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="space-y-3 rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <Text className="font-medium">Item {index + 1}</Text>
            {fields.length > 1 && (
              <Button
                type="button"
                size="sm"
                variant="text"
                onClick={() => remove(index)}
              >
                <PiTrashDuotone className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>

          <Controller
            name={`items.${index}.exercise_id`}
            control={control}
            render={({ field: itemField }) => (
              <SelectBox
                label="Exercise"
                placeholder="Select exercise"
                options={exerciseOptions}
                value={selectedOption(exerciseOptions, itemField.value)}
                onChange={(option: SelectOption) =>
                  itemField.onChange(option?.value ? String(option.value) : '')
                }
                disabled={!doctorId || exercisesLoading}
                error={errors.items?.[index]?.exercise_id?.message}
                displayValue={(option: SelectOption) =>
                  option?.label ?? option?.name ?? ''
                }
              />
            )}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Sets"
              type="number"
              {...register(`items.${index}.sets`)}
              error={errors.items?.[index]?.sets?.message}
            />
            <Input
              label="Repetitions"
              type="number"
              {...register(`items.${index}.repetitions`)}
              error={errors.items?.[index]?.repetitions?.message}
            />
            <Input
              label="Duration (seconds)"
              type="number"
              {...register(`items.${index}.duration_seconds`)}
              error={errors.items?.[index]?.duration_seconds?.message}
            />
            <Input
              label="Frequency / day"
              type="number"
              {...register(`items.${index}.frequency_per_day`)}
              error={errors.items?.[index]?.frequency_per_day?.message}
            />
          </div>

          <Controller
            name={`items.${index}.days`}
            control={control}
            render={({ field: daysField }) => {
              const selected = Array.isArray(daysField.value)
                ? daysField.value
                : [];
              return (
                <div>
                  <Text className="mb-2 text-sm font-medium text-gray-700">
                    Days
                  </Text>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {EXERCISE_PROGRAM_DAYS.map((day) => (
                      <Checkbox
                        key={day.value}
                        label={day.label}
                        checked={selected.includes(day.value)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            daysField.onChange([...selected, day.value]);
                          } else {
                            daysField.onChange(
                              selected.filter((item) => item !== day.value)
                            );
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            }}
          />

          <Textarea
            label="Notes"
            rows={2}
            {...register(`items.${index}.notes`)}
            error={errors.items?.[index]?.notes?.message}
          />
        </div>
      ))}
    </div>
  );
}

export default function CreateOrUpdateExerciseProgram({
  initValues,
}: {
  initValues?: ExerciseProgram;
}) {
  const { closeModal } = useModal();
  const { mutate: createProgram, isPending: isCreating } =
    useCreateExerciseProgram();
  const { mutate: updateProgram, isPending: isUpdating } =
    useUpdateExerciseProgram();
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors(
    'page=1&limit=200'
  );
  const [activeTab, setActiveTab] = useState(0);

  const [doctorId, setDoctorId] = useState(
    initValues?.doctor_id ? String(initValues.doctor_id) : ''
  );
  const [clientId, setClientId] = useState(
    initValues?.client_id ? String(initValues.client_id) : ''
  );

  const clientsParam = doctorId ? `doctor_id=${doctorId}&limit=100` : '';
  const sessionsParam =
    doctorId && clientId
      ? `doctor_id=${doctorId}&client_id=${clientId}`
      : '';

  const { data: clientsData, isLoading: clientsLoading } =
    useExerciseProgramClients(clientsParam, Boolean(doctorId));
  const { data: sessionsData, isLoading: sessionsLoading } =
    useExerciseProgramSessions(sessionsParam, Boolean(doctorId && clientId));

  const doctorOptions: SelectOption[] = useMemo(() => {
    const list = doctorsData?.data;
    if (!Array.isArray(list)) return [];
    return list.map((doctor: any) => {
      const label = personLabel(doctor, 'Doctor');
      return { value: String(doctor.id), name: label, label };
    });
  }, [doctorsData?.data]);

  const clientOptions: SelectOption[] = useMemo(() => {
    const list = clientsData?.data;
    if (!Array.isArray(list)) return [];
    return list.map((client: any) => {
      const label = personLabel(client, 'Patient');
      return { value: String(client.id), name: label, label };
    });
  }, [clientsData?.data]);

  const sessionOptions: SelectOption[] = useMemo(
    () =>
      (sessionsData?.data ?? []).map((session: any) => ({
        value: String(session.reservation_date_id ?? session.id),
        name: String(session.reservation_date_id ?? session.id),
        label: sessionLabel(session),
      })),
    [sessionsData?.data]
  );

  const onSubmit: SubmitHandler<ExerciseProgramFormInput> = (data) => {
    const payload = {
      doctor_id: Number(data.doctor_id),
      client_id: Number(data.client_id),
      reservation_date_id: Number(data.reservation_date_id),
      title: data.title.trim(),
      instructions: data.instructions?.trim() || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      items: data.items.map((item) => ({
        exercise_id: Number(item.exercise_id),
        sets: toNumberOrNull(item.sets),
        repetitions: toNumberOrNull(item.repetitions),
        duration_seconds: toNumberOrNull(item.duration_seconds),
        frequency_per_day: toNumberOrNull(item.frequency_per_day),
        days: item.days?.length ? (item.days as any) : null,
        notes: item.notes?.trim() || null,
      })),
    };

    if (initValues) {
      updateProgram({ id: initValues.id, ...payload });
    } else {
      createProgram({
        ...payload,
        send_after_save: Boolean(data.send_after_save),
      });
    }
  };

  const onInvalid = (formErrors: FieldErrors<ExerciseProgramFormInput>) => {
    const tabIndex = PROGRAM_TABS.findIndex((tab) =>
      programTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(PROGRAM_TABS.length - 1, index)));
  };

  return (
    <Form<ExerciseProgramFormInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={exerciseProgramFormSchema}
      useFormProps={{
        defaultValues: {
          doctor_id: initValues?.doctor_id
            ? String(initValues.doctor_id)
            : '',
          client_id: initValues?.client_id
            ? String(initValues.client_id)
            : '',
          reservation_date_id: initValues?.reservation_date_id
            ? String(initValues.reservation_date_id)
            : '',
          title: resolveLocalizedName(initValues?.title),
          instructions: initValues?.instructions || '',
          start_date: initValues?.start_date || '',
          end_date: initValues?.end_date || '',
          send_after_save: false,
          items: initValues?.items?.length
            ? initValues.items.map(
                (item): ExerciseProgramItemFormInput => ({
                  exercise_id: String(item.exercise_id),
                  sets: item.sets != null ? String(item.sets) : '',
                  repetitions:
                    item.repetitions != null ? String(item.repetitions) : '',
                  duration_seconds:
                    item.duration_seconds != null
                      ? String(item.duration_seconds)
                      : '',
                  frequency_per_day:
                    item.frequency_per_day != null
                      ? String(item.frequency_per_day)
                      : '',
                  days: item.days ?? [],
                  notes: item.notes || '',
                })
              )
            : [emptyItem()],
        },
      }}
      className={modalFormTabsClassName}
    >
      {({
        register,
        control,
        setValue,
        watch,
        formState: { errors },
      }: {
        register: UseFormRegister<ExerciseProgramFormInput>;
        control: Control<ExerciseProgramFormInput>;
        setValue: UseFormSetValue<ExerciseProgramFormInput>;
        watch: (name: keyof ExerciseProgramFormInput) => any;
        formState: { errors: FieldErrors<ExerciseProgramFormInput> };
      }) => {
        const watchedDoctorId = String(watch('doctor_id') || doctorId || '');
        const watchedClientId = String(watch('client_id') || clientId || '');
        const tabsWithErrors: ModalFormTabItem[] = PROGRAM_TABS.map((tab) => ({
          ...tab,
          hasError: programTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiClipboardText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {initValues
                      ? 'Update Exercise Program'
                      : 'Create Exercise Program'}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Fill each tab — save stays available on every step
                  </p>
                </div>
              </div>
              <ActionIcon
                size="sm"
                variant="outline"
                onClick={closeModal}
                className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              >
                <PiXBold className="h-4 w-4" />
              </ActionIcon>
            </div>

            <ModalFormTabs
              tabs={tabsWithErrors}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            >
              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Assignment"
                    description="Doctor, patient, and session"
                  >
                    <Controller
                      name="doctor_id"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          label="Doctor"
                          placeholder="Select doctor"
                          options={doctorOptions}
                          value={selectedOption(doctorOptions, value)}
                          onChange={(option: SelectOption) => {
                            const next = option?.value
                              ? String(option.value)
                              : '';
                            onChange(next);
                            setDoctorId(next);
                            if (!initValues) {
                              setClientId('');
                              setValue('client_id', '');
                              setValue('reservation_date_id', '');
                            }
                          }}
                          disabled={doctorsLoading || Boolean(initValues)}
                          error={errors.doctor_id?.message}
                          displayValue={(option: SelectOption) =>
                            option?.label ?? option?.name ?? ''
                          }
                        />
                      )}
                    />

                    <Controller
                      name="client_id"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          label="Patient"
                          placeholder={
                            watchedDoctorId
                              ? 'Select patient'
                              : 'Select a doctor first'
                          }
                          options={clientOptions}
                          value={selectedOption(clientOptions, value)}
                          onChange={(option: SelectOption) => {
                            const next = option?.value
                              ? String(option.value)
                              : '';
                            onChange(next);
                            setClientId(next);
                            if (!initValues) {
                              setValue('reservation_date_id', '');
                            }
                          }}
                          disabled={
                            !watchedDoctorId ||
                            clientsLoading ||
                            Boolean(initValues)
                          }
                          error={errors.client_id?.message}
                          displayValue={(option: SelectOption) =>
                            option?.label ?? option?.name ?? ''
                          }
                        />
                      )}
                    />

                    <Controller
                      name="reservation_date_id"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <SelectBox
                          label="Session"
                          placeholder={
                            watchedClientId
                              ? 'Select session'
                              : 'Select a patient first'
                          }
                          options={sessionOptions}
                          value={selectedOption(sessionOptions, value)}
                          onChange={(option: SelectOption) =>
                            onChange(
                              option?.value ? String(option.value) : ''
                            )
                          }
                          disabled={
                            !watchedClientId ||
                            sessionsLoading ||
                            Boolean(initValues)
                          }
                          error={errors.reservation_date_id?.message}
                          displayValue={(option: SelectOption) =>
                            option?.label ?? option?.name ?? ''
                          }
                        />
                      )}
                    />

                    <Input
                      label="Title"
                      {...register('title')}
                      error={errors.title?.message}
                    />
                  </ModalFormTabPanelCard>

                  <ModalFormTabPanelCard
                    title="Schedule & instructions"
                    description="Optional date range and program notes"
                    contentClassName="sm:grid-cols-2"
                  >
                    <div className="sm:col-span-2">
                      <Textarea
                        label="Instructions"
                        rows={3}
                        {...register('instructions')}
                        error={errors.instructions?.message}
                      />
                    </div>
                    <Input
                      label="Start date"
                      type="date"
                      {...register('start_date')}
                      error={errors.start_date?.message}
                    />
                    <Input
                      label="End date"
                      type="date"
                      {...register('end_date')}
                      error={errors.end_date?.message}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Exercises"
                    description="Add sets, reps, days, and notes per exercise"
                    contentClassName="sm:grid-cols-1"
                  >
                    <ProgramItemsEditor
                      control={control}
                      register={register}
                      errors={errors}
                      doctorId={watchedDoctorId}
                    />
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Delivery"
                    description="How the program is saved for the patient"
                    contentClassName="sm:grid-cols-1"
                  >
                    {!initValues ? (
                      <Controller
                        name="send_after_save"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <div>
                            <Switch
                              label="Send to patient now"
                              checked={Boolean(value)}
                              onChange={onChange}
                            />
                            <Text className="mt-1 text-xs text-gray-500">
                              Off saves as draft (patient cannot see it). On
                              creates and sends immediately.
                            </Text>
                          </div>
                        )}
                      />
                    ) : (
                      <Text className="text-sm text-gray-500">
                        Draft programs can be sent from the list after saving.
                      </Text>
                    )}
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={PROGRAM_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isCreating || isUpdating}
              submitLabel={initValues ? 'Update Program' : 'Create Program'}
            />
          </>
        );
      }}
    </Form>
  );
}
