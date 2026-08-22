'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import CreateButton from '@/app/shared/create-button';
import EditDoctorTargetForm from './edit-form';
import AdjustSessionsModal from './adjust-modal';
import RetargetModal from './retarget-modal';
import ApprovePreviewModal from './approve-preview-modal';
import TargetTimeline from './timeline';
import TargetStatusBadge, {
  doctorDisplayName,
  formatAchievement,
  formatMoney,
} from './status-badge';
import {
  getStatusActions,
  type DoctorTargetsPermissions,
} from './permissions';
import { useActivateDoctorTarget } from '@/framework/doctor-targets';
import { routes } from '@/config/routes';
import toast from 'react-hot-toast';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Text className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </Text>
      <Text className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </Text>
    </div>
  );
}

export default function DoctorTargetDetailView({
  target,
  permissions,
}: {
  target: any;
  permissions: DoctorTargetsPermissions;
}) {
  const actions = getStatusActions(target?.status, permissions);
  const { mutate: activate, isPending: activating } = useActivateDoctorTarget();

  const handleActivate = () => {
    if (!window.confirm('Activate this Draft target?')) return;
    activate(target.id, {
      onError: (error) => toast.error(error?.message || 'Activate failed'),
    });
  };

  const adjustments = Array.isArray(target?.adjustments)
    ? target.adjustments
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Title as="h2" className="text-xl font-semibold">
              Target #{target.id}
            </Title>
            <TargetStatusBadge status={target.status} />
          </div>
          <Text className="mt-1 text-sm text-gray-600">
            {target.doctor_id ? (
              <Link
                href={routes.doctors.detail(target.doctor_id)}
                className="hover:underline"
              >
                {doctorDisplayName(target.doctor, target.doctor_id)}
              </Link>
            ) : (
              doctorDisplayName(target.doctor, target.doctor_id)
            )}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.edit && (
            <CreateButton
              label="Edit"
              icon={null}
              view={<EditDoctorTargetForm initValues={target} />}
              className="h-9"
            />
          )}
          {actions.activate && (
            <Button
              className="h-9"
              isLoading={activating}
              onClick={handleActivate}
            >
              Activate
            </Button>
          )}
          {actions.adjust && (
            <CreateButton
              label="Adjust sessions"
              icon={null}
              view={<AdjustSessionsModal target={target} />}
              className="h-9"
            />
          )}
          {actions.retarget && (
            <CreateButton
              label="Retarget"
              icon={null}
              view={<RetargetModal target={target} />}
              className="h-9"
            />
          )}
          {(actions.preview || actions.approve) && (
            <CreateButton
              label="Preview & approve"
              icon={null}
              view={<ApprovePreviewModal targetId={target.id} />}
              customSize="560px"
              className="h-9"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-4 dark:border-gray-700 dark:bg-gray-900">
        <Field
          label="Date window"
          value={`${target.start_date?.slice?.(0, 10) || '—'} → ${target.end_date?.slice?.(0, 10) || '—'}`}
        />
        <Field
          label="Sessions"
          value={`${target.completed_sessions ?? 0} / ${target.required_sessions ?? 0} (remaining ${target.remaining_sessions ?? 0})`}
        />
        <Field
          label="Achievement"
          value={formatAchievement(target.achievement_percentage)}
        />
        <Field
          label="Incentive"
          value={formatMoney(target.incentive_amount)}
        />
        <Field
          label="Auto completed"
          value={target.auto_completed_sessions ?? 0}
        />
        <Field
          label="Adjustment offset"
          value={target.adjustment_offset ?? 0}
        />
        <Field
          label="Wallet transaction"
          value={
            target.wallet_transaction_id
              ? `#${target.wallet_transaction_id}`
              : '—'
          }
        />
        <Field
          label="Approved at"
          value={
            target.approved_at
              ? new Date(target.approved_at).toLocaleString()
              : '—'
          }
        />
      </div>

      {target.notes && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <Title as="h3" className="mb-2 text-sm font-semibold">
            Notes
          </Title>
          <Text className="text-sm text-gray-700">{target.notes}</Text>
        </div>
      )}

      {target.snapshot && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-800 dark:bg-amber-950/30">
          <Title as="h3" className="mb-2 text-sm font-semibold">
            Immutable approval snapshot
          </Title>
          <Text className="mb-3 text-xs text-gray-600">
            Incentive credited to wallet (ledger) — not a bank payment.
          </Text>
          {typeof target.snapshot === 'object' ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(target.snapshot).map(([key, value]) => (
                <Field
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={
                    value == null || value === ''
                      ? '—'
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)
                  }
                />
              ))}
            </div>
          ) : (
            <Text className="text-sm">{String(target.snapshot)}</Text>
          )}
        </div>
      )}

      {adjustments.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <Title as="h3" className="mb-3 text-sm font-semibold">
            Adjustments
          </Title>
          <ul className="space-y-2 text-sm">
            {adjustments.map((adj: any, index: number) => (
              <li
                key={adj?.id ?? index}
                className="rounded border border-gray-100 px-3 py-2 dark:border-gray-800"
              >
                <div className="font-medium">
                  Completed → {adj?.completed_sessions ?? adj?.new_value ?? '—'}
                </div>
                <div className="text-gray-600">{adj?.reason || '—'}</div>
                <div className="text-xs text-gray-400">
                  {adj?.created_at
                    ? new Date(adj.created_at).toLocaleString()
                    : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TargetTimeline targetId={target.id} />
    </div>
  );
}
