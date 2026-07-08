'use client';

import { Controller, type Control, type FieldErrors, type FieldValues, type UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SelectBox from '@/components/ui/select';
import FormGroup from '@/app/shared/form-group';
import { LANG_OPTIONS } from '@/app/shared/notifications/constants';

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

      <div className="grid gap-4 @xl:grid-cols-2">
        <FormGroup title="Language">
          <Controller
            control={control}
            name={'lang' as never}
            render={({ field: { value, onChange } }) => (
              <SelectBox
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
        </FormGroup>

        <Input
          label="Type (optional)"
          placeholder="promotion"
          {...register('type' as never)}
          error={errors.type?.message as string}
        />
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

      {/* Extra data (optional JSON) — hidden for now
      <div>
        <Textarea
          label="Extra data (optional JSON)"
          placeholder='{"campaign_id": "42"}'
          {...register('extra_data_json' as never)}
          error={errors.extra_data_json?.message as string}
        />
        <Text className="mt-1 text-xs text-gray-500">
          Values are stringified server-side before FCM delivery.
        </Text>
      </div>
      */}
    </>
  );
}
