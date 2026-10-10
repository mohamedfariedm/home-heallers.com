'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { formatMoney } from '@/app/shared/doctor-targets/status-badge';
import {
  StatusBadge,
  TypeBadge,
  formatDateTime,
  formatPerformedBy,
} from './columns';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2 text-sm last:border-0">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="break-all text-end font-medium text-gray-800">
        {children ?? '—'}
      </span>
    </div>
  );
}

export default function TransactionDetailModal({
  transaction: t,
}: {
  transaction: any;
}) {
  const { closeModal } = useModal();
  const related = t?.related || {};
  const relatedRows = [
    ['Reservation', related.reservation_id],
    ['Market order', related.order_id],
    ['Withdrawal request', related.withdrawal_request_id],
    ['Doctor target', related.doctor_target_id],
  ].filter(([, v]) => v != null && v !== '');

  return (
    <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <Title as="h4" className="font-semibold">
            Transaction #{t?.id}
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            {formatDateTime(t?.created_at)}
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={closeModal}>
          <PiXBold className="h-auto w-5" />
        </ActionIcon>
      </div>

      <div>
        <Row label="Type">
          <TypeBadge type={t?.type} />
        </Row>
        <Row label="Status">
          <StatusBadge status={t?.status} />
        </Row>
        <Row label="Amount">{formatMoney(t?.amount)} SAR</Row>
        <Row label="Balance before">{formatMoney(t?.balance_before)} SAR</Row>
        <Row label="Balance after">{formatMoney(t?.balance_after)} SAR</Row>
        <Row label="Source">{t?.source_label}</Row>
        <Row label="Performed by">{formatPerformedBy(t?.performed_by)}</Row>
        <Row label="Reason / description">{t?.description || '—'}</Row>
        <Row label="Reference">{t?.transaction_reference || '—'}</Row>
        <Row label="Payment method">{t?.payment_method || '—'}</Row>
        <Row label="Payment gateway">{t?.payment_gateway || '—'}</Row>
        {relatedRows.map(([label, value]) => (
          <Row key={label as string} label={`${label} #`}>
            {String(value)}
          </Row>
        ))}
      </div>

      {t?.metadata && (
        <div>
          <Text className="mb-1 text-sm font-semibold">Metadata</Text>
          <pre className="max-h-56 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700">
            {JSON.stringify(t.metadata, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" onClick={closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
}
