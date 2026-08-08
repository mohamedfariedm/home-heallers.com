'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import type { SubmitHandler } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  type UpdateOtpCodeInput,
  updateOtpCodeSchema,
} from '@/utils/validators/otp-code-form.schema';
import { useUpdateOtpCode } from '@/framework/otp-codes';
import { resolveLocalizedNameOrFallback } from '@/utils/resolve-localized-name';
import type { OtpCodeTableRow } from '@/types/otp-codes';
import toast from 'react-hot-toast';

function toDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.trim();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export default function OtpCodeForm({
  initValues,
}: {
  initValues: OtpCodeTableRow;
}) {
  const { closeModal } = useModal();
  const { mutate, isPending } = useUpdateOtpCode();
  const [clearOtp, setClearOtp] = useState(false);
  const [clearExpires, setClearExpires] = useState(false);
  const [dirtyOtp, setDirtyOtp] = useState(false);
  const [dirtyExpires, setDirtyExpires] = useState(false);

  const displayName = resolveLocalizedNameOrFallback(initValues?.name);

  const onSubmit: SubmitHandler<UpdateOtpCodeInput> = (data) => {
    const payload: {
      type: OtpCodeTableRow['type'];
      id: number;
      otp?: string | null;
      otp_expires_at?: string | null;
    } = {
      type: initValues.type,
      id: initValues.entity_id,
    };

    if (clearOtp) {
      payload.otp = null;
    } else if (dirtyOtp) {
      payload.otp = data.otp?.trim() || null;
    }

    if (clearExpires) {
      payload.otp_expires_at = null;
    } else if (dirtyExpires) {
      payload.otp_expires_at = fromDatetimeLocalValue(data.otp_expires_at || '');
    }

    if (payload.otp === undefined && payload.otp_expires_at === undefined) {
      toast.error('Provide at least one field to update');
      return;
    }

    mutate(payload);
  };

  return (
    <Form<UpdateOtpCodeInput>
      onSubmit={onSubmit}
      validationSchema={updateOtpCodeSchema}
      useFormProps={{
        defaultValues: {
          otp: initValues?.otp || '',
          otp_expires_at: toDatetimeLocalValue(initValues?.otp_expires_at),
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <div>
              <Title as="h4" className="font-semibold">
                Edit OTP Code
              </Title>
              <Text className="mt-1 text-sm text-gray-500">
                {displayName} · {initValues.type} #{initValues.entity_id}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                {initValues.is_otp_verified
                  ? `Verified${
                      initValues.otp_verified_at
                        ? ` · ${new Date(initValues.otp_verified_at).toLocaleString()}`
                        : ''
                    }`
                  : 'Not verified (never logged in with OTP)'}
              </Text>
            </div>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Input
            label="OTP"
            placeholder="Enter OTP (max 10 chars)"
            disabled={clearOtp}
            {...register('otp', {
              onChange: () => setDirtyOtp(true),
            })}
            error={errors.otp?.message}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={clearOtp}
              onChange={(e) => setClearOtp(e.target.checked)}
            />
            Clear OTP (set to null)
          </label>

          <Input
            type="datetime-local"
            label="OTP Expires At"
            disabled={clearExpires}
            {...register('otp_expires_at', {
              onChange: () => setDirtyExpires(true),
            })}
            error={errors.otp_expires_at?.message}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={clearExpires}
              onChange={(e) => setClearExpires(e.target.checked)}
            />
            Clear expiration (set to null)
          </label>

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
              className="w-full @xl:w-auto"
            >
              Update OTP
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
