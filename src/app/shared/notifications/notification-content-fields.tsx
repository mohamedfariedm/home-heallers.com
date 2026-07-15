'use client';

import { Controller, type Control, type FieldErrors, type FieldValues, type UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SelectBox from '@/components/ui/select';
import {
  LANG_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from '@/app/shared/notifications/constants';

type NotificationContentFieldsProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
};

export default function NotificationContentFields<T extends FieldValues>({
  register,
  control,
  errors,
}: NotificationContentFieldsProps<T>) {
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
                  onChange={onChange}
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

      <div className="grid gap-4 @xl:grid-cols-2">
        <Input
          label="Deep link (optional)"
          placeholder="offers/summer-sale"
          {...register('deep_link' as never)}
          error={errors.deep_link?.message as string}
        />
        <Input
          label="External URL (optional)"
          placeholder="https://homehealers.sa/offers/summer-sale"
          {...register('url' as never)}
          error={errors.url?.message as string}
        />
      </div>
    </>
  );
}
