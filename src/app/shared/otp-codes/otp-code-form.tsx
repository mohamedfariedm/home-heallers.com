'use client';

import { useState } from 'react';
import { PiLockKey, PiClock, PiXBold } from 'react-icons/pi';
import type { SubmitHandler, FieldErrors } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ActionIcon } from 'rizzui';
import {
  ModalFormTabs,
  ModalFormTabPanel,
  ModalFormTabPanelCard,
  ModalFormTabsFooter,
  modalFormTabsClassName,
  type ModalFormTabItem,
} from '@/components/ui/modal-form-tabs';
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

type OtpTabId = 'otp' | 'expiration';

const OTP_TABS: {
  id: OtpTabId;
  label: string;
  icon: typeof PiLockKey;
}[] = [
  { id: 'otp', label: 'OTP', icon: PiLockKey },
  { id: 'expiration', label: 'Expiration', icon: PiClock },
];

function otpTabHasErrors(
  tabId: OtpTabId,
  errors: FieldErrors<UpdateOtpCodeInput> | Record<string, unknown>
): boolean {
  const has = (keys: string[]) =>
    keys.some((key) => Boolean((errors as Record<string, unknown>)?.[key]));

  switch (tabId) {
    case 'otp':
      return has(['otp']);
    case 'expiration':
      return has(['otp_expires_at']);
    default:
      return false;
  }
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
  const [activeTab, setActiveTab] = useState(0);

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

  const onInvalid = (formErrors: FieldErrors<UpdateOtpCodeInput>) => {
    const tabIndex = OTP_TABS.findIndex((tab) =>
      otpTabHasErrors(tab.id, formErrors)
    );
    if (tabIndex >= 0) setActiveTab(tabIndex);
  };

  const goToTab = (index: number) => {
    setActiveTab(Math.max(0, Math.min(OTP_TABS.length - 1, index)));
  };

  return (
    <Form<UpdateOtpCodeInput>
      onSubmit={onSubmit}
      onInvalid={onInvalid}
      validationSchema={updateOtpCodeSchema}
      useFormProps={{
        defaultValues: {
          otp: initValues?.otp || '',
          otp_expires_at: toDatetimeLocalValue(initValues?.otp_expires_at),
        },
      }}
      className={modalFormTabsClassName}
    >
      {({ register, formState: { errors } }) => {
        const tabsWithErrors: ModalFormTabItem[] = OTP_TABS.map((tab) => ({
          ...tab,
          hasError: otpTabHasErrors(tab.id, errors),
        }));

        return (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
                  <PiLockKey className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Edit OTP Code
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {displayName} · {initValues.type} #{initValues.entity_id}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {initValues.is_otp_verified
                      ? `Verified${
                          initValues.otp_verified_at
                            ? ` · ${new Date(initValues.otp_verified_at).toLocaleString()}`
                            : ''
                        }`
                      : 'Not verified (never logged in with OTP)'}
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
                    title="OTP code"
                    description="Update or clear the OTP value"
                    contentClassName="sm:grid-cols-1"
                  >
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
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>

              <ModalFormTabPanel>
                <div className="space-y-5">
                  <ModalFormTabPanelCard
                    title="Expiration"
                    description="Update or clear the expiration time"
                    contentClassName="sm:grid-cols-1"
                  >
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
                  </ModalFormTabPanelCard>
                </div>
              </ModalFormTabPanel>
            </ModalFormTabs>

            <ModalFormTabsFooter
              activeTab={activeTab}
              tabCount={OTP_TABS.length}
              onPrev={() => goToTab(activeTab - 1)}
              onNext={() => goToTab(activeTab + 1)}
              onCancel={closeModal}
              isLoading={isPending}
              disabled={isPending}
              submitLabel="Update OTP"
            />
          </>
        );
      }}
    </Form>
  );
}
