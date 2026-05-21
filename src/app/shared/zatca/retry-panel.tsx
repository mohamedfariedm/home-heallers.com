'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import SelectBox from '@/components/ui/select';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  useZatcaSubmit,
  useZatcaRetry,
  useZatcaRevalidate,
  type ZatcaRevalidateResponse,
} from '@/framework/zatca';
import { useZatcaPolling } from '@/app/shared/zatca/use-zatca-polling';
import type { ZatcaInvoice, ZatcaMode } from '@/types/zatca';
import type { ZatcaPermissions as Perms } from '@/app/shared/zatca/permissions';

export default function RetryPanel({
  invoice,
  permissions,
  onRefetch,
}: {
  invoice: ZatcaInvoice;
  permissions: Perms;
  onRefetch?: () => void;
}) {
  const { openModal, closeModal } = useModal();
  const { mutate: submit, isPending: submitting } = useZatcaSubmit();
  const { mutate: retry, isPending: retrying } = useZatcaRetry();
  const { mutate: revalidate, isPending: revalidating } = useZatcaRevalidate();
  const [mode, setMode] = useState<ZatcaMode>(
    (invoice.last_submission?.mode as ZatcaMode) ?? 'reporting'
  );
  const [revalidateResult, setRevalidateResult] = useState<ZatcaRevalidateResponse | null>(
    null
  );
  const [pollStatus, setPollStatus] = useState(invoice.zatca_status);

  useZatcaPolling(invoice.id, pollStatus, {
    enabled: pollStatus === 'QUEUED' || pollStatus === 'SUBMITTING',
    onTerminal: () => onRefetch?.(),
  });

  const zs = invoice.zatca_status;
  const canSubmit =
    permissions.retry &&
    invoice.business_status === 'ISSUED' &&
    (!zs || zs === 'NOT_SUBMITTED' || zs === 'FAILED');

  const canRetry =
    permissions.retry &&
    zs &&
    ['REJECTED', 'FAILED', 'REPORTED_WITH_WARNINGS'].includes(zs);

  const canForceRetry =
    permissions.admin && zs && ['REPORTED', 'CLEARED'].includes(zs);

  const busy = submitting || retrying;

  const runAction = (action: 'submit' | 'retry', force = false) => {
    const fn = action === 'submit' ? submit : retry;
    fn(
      { id: invoice.id, mode, force },
      {
        onSuccess: (res) => {
          setPollStatus(res.data?.data?.zatca_status ?? 'QUEUED');
          closeModal();
        },
        onError: (err: any) => {
          if (err?.response?.status === 409) {
            setRevalidateResult({
              success: false,
              message: 'Submission already in progress',
              errors: [],
              warnings: [],
            });
          }
        },
      }
    );
  };

  const confirmModal = (action: 'submit' | 'retry', force = false) =>
    openModal({
      view: (
        <div className="p-6">
          <Text className="mb-4 text-lg font-semibold">
            {action === 'retry' ? 'Retry submission' : 'Submit to ZATCA'}
          </Text>
          <Text className="mb-4 text-gray-600">
            This will create attempt #{(invoice.submission_attempts ?? 0) + 1}. Continue?
          </Text>
          <SelectBox
            label="Mode"
            options={[
              { value: 'reporting', label: 'Reporting' },
              { value: 'clearance', label: 'Clearance' },
            ]}
            value={mode}
            onChange={(v: ZatcaMode) => setMode(v)}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button isLoading={busy} onClick={() => runAction(action, force)}>
              Confirm
            </Button>
          </div>
        </div>
      ),
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SelectBox
        options={[
          { value: 'reporting', label: 'Reporting' },
          { value: 'clearance', label: 'Clearance' },
        ]}
        value={mode}
        onChange={(v: ZatcaMode) => setMode(v)}
        className="w-36"
      />
      {canSubmit && permissions.submit && (
        <Button isLoading={submitting} disabled={busy} onClick={() => confirmModal('submit')}>
          Submit
        </Button>
      )}
      {canRetry && (
        <Button isLoading={retrying} disabled={busy} onClick={() => confirmModal('retry')}>
          Retry
        </Button>
      )}
      {canForceRetry && (
        <Button
          variant="outline"
          disabled={busy}
          onClick={() => confirmModal('retry', true)}
        >
          Force retry
        </Button>
      )}
      {permissions.revalidate && (
        <Button
          variant="outline"
          isLoading={revalidating}
          onClick={() =>
            revalidate(invoice.id, {
              onSuccess: (res) => {
                setRevalidateResult(res.data as ZatcaRevalidateResponse);
              },
            })
          }
        >
          Revalidate
        </Button>
      )}
      {revalidateResult && (
        <div
          className={`w-full rounded-md p-3 text-sm ${
            revalidateResult.success
              ? 'bg-green-50 text-green-800'
              : 'bg-amber-50 text-amber-900'
          }`}
        >
          <p className="font-medium">{revalidateResult.message}</p>
          {revalidateResult.errors?.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {revalidateResult.errors.map((e, i) => (
                <li key={i}>{e.message}</li>
              ))}
            </ul>
          )}
          {revalidateResult.warnings?.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {revalidateResult.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
