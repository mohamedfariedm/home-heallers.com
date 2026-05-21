'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiLockSimple } from 'react-icons/pi';
import { Card } from '@/components/ui/card';
import { Text, Title } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import { useZatcaInvoice, useZatcaSubmissions } from '@/framework/zatca';
import { useZatcaPolling } from '@/app/shared/zatca/use-zatca-polling';
import { isActiveZatcaStatus } from '@/types/zatca';
import StatusBadge from '@/app/shared/zatca/status-badge';
import IssueButton from '@/app/shared/zatca/issue-button';
import CancelButton from '@/app/shared/zatca/cancel-button';
import RetryPanel from '@/app/shared/zatca/retry-panel';
import CreateCreditNoteButton from '@/app/shared/zatca/create-credit-note-modal';
import CreateDebitNoteButton from '@/app/shared/zatca/create-debit-note-modal';
import AdjustmentChain from '@/app/shared/zatca/adjustment-chain';
import XmlViewer from '@/app/shared/zatca/xml-viewer';
import QrSection from '@/app/shared/zatca/qr-section';
import PdfPreview from '@/app/shared/zatca/pdf-preview';
import SubmissionTimeline from '@/app/shared/zatca/submission-timeline';
import type { ZatcaPermissions } from '@/app/shared/zatca/permissions';
import type { ZatcaSubmission } from '@/types/zatca';
import DateCell from '@/components/ui/date-cell';

type TabKey = 'pdf' | 'qr' | 'xml';

export default function InvoiceDetailView({
  invoiceId,
  permissions,
}: {
  invoiceId: string;
  permissions: ZatcaPermissions;
}) {
  const { data, isLoading, refetch } = useZatcaInvoice(invoiceId);
  const invoice = data?.data;
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const { data: submissionsData } = useZatcaSubmissions(
    invoiceId,
    permissions.audit && Boolean(invoice)
  );

  useZatcaPolling(invoiceId, invoice?.zatca_status ?? null, {
    enabled: Boolean(invoice && isActiveZatcaStatus(invoice.zatca_status)),
    onTerminal: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return <Text>Invoice not found.</Text>;
  }

  const submissions = (submissionsData?.data ?? []) as ZatcaSubmission[];
  const lastSub = invoice.last_submission ?? submissions[0];

  const tabs: { key: TabKey; label: string; show: boolean }[] = [
    { key: 'pdf', label: 'PDF', show: permissions.view },
    { key: 'qr', label: 'QR', show: permissions.view },
    { key: 'xml', label: 'XML', show: permissions.audit },
  ];

  return (
    <div className="space-y-6">
      <AdjustmentChain invoice={invoice} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Title as="h2" className="text-xl">
              {invoice.invoice_number}
            </Title>
            <StatusBadge kind="document" value={invoice.document_type} />
            {invoice.is_locked && (
              <PiLockSimple className="h-5 w-5 text-gray-500" title="Locked" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge kind="business" value={invoice.business_status} />
            <StatusBadge kind="zatca" value={invoice.zatca_status} />
            <StatusBadge kind="validation" value={invoice.validation_status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/invoices">
            <span className="text-sm text-blue-600 hover:underline">← Back to list</span>
          </Link>
        </div>
      </div>

      {permissions.submit && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <IssueButton invoice={invoice} onRefetch={() => refetch()} />
          <CancelButton invoice={invoice} onSuccess={() => refetch()} />
          {(permissions.retry || permissions.revalidate) && (
            <RetryPanel
              invoice={invoice}
              permissions={permissions}
              onRefetch={() => refetch()}
            />
          )}
          {invoice.document_type === 'INVOICE' && (
            <>
              <CreateCreditNoteButton invoice={invoice} />
              <CreateDebitNoteButton invoice={invoice} />
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <Text className="mb-3 font-semibold">Invoice information</Text>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">UUID</dt>
              <dd className="max-w-[60%] truncate font-mono text-xs">{invoice.uuid ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Date</dt>
              <dd>{invoice.invoice_date}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Service</dt>
              <dd>{invoice.service_name ?? '—'}</dd>
            </div>
            {invoice.adjustment_reason && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Adjustment reason</dt>
                <dd className="max-w-[60%] text-end">{invoice.adjustment_reason}</dd>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <dt className="text-gray-500">Grand total</dt>
              <dd className="font-semibold">{invoice.grand_total} ر.س</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tax</dt>
              <dd>{invoice.tax_total ?? 0} ر.س</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <Text className="mb-3 font-semibold">Customer</Text>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd>{invoice.customer_name}</dd>
            </div>
            {invoice.national_id && (
              <div className="flex justify-between">
                <dt className="text-gray-500">National ID</dt>
                <dd>{invoice.national_id}</dd>
              </div>
            )}
            {invoice.client_id && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Client</dt>
                <dd>
                  <Link href={`/clients`} className="text-blue-600 hover:underline">
                    #{invoice.client_id}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {lastSub && (
        <Card className="p-4">
          <Text className="mb-3 font-semibold">Last submission</Text>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-gray-500">Attempt </span>
              {lastSub.attempt_number}
            </div>
            <div>
              <span className="text-gray-500">Mode </span>
              {lastSub.mode}
            </div>
            <div>
              <span className="text-gray-500">Hash </span>
              <span className="font-mono text-xs">{lastSub.invoice_hash ?? '—'}</span>
            </div>
            {lastSub.submitted_at && (
              <div>
                <span className="text-gray-500">Submitted </span>
                <DateCell date={lastSub.submitted_at} />
              </div>
            )}
          </dl>
          {(lastSub.warnings?.length || lastSub.errors?.length) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {lastSub.errors?.length ? (
                <div>
                  <Text className="mb-1 text-sm font-medium text-red-700">Errors</Text>
                  <ul className="list-disc pl-4 text-sm text-red-800">
                    {lastSub.errors.map((e, i) => (
                      <li key={i}>{e.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {lastSub.warnings?.length ? (
                <div>
                  <Text className="mb-1 text-sm font-medium text-amber-700">Warnings</Text>
                  <ul className="list-disc pl-4 text-sm text-amber-800">
                    {lastSub.warnings.map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Card>
      )}

      <Card className="p-4">
        <div className="mb-4 flex gap-2 border-b border-gray-200">
          {tabs
            .filter((t) => t.show)
            .map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-3 py-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>
        {activeTab === 'pdf' && (
          <PdfPreview invoiceId={invoiceId} enabled={activeTab === 'pdf'} />
        )}
        {activeTab === 'qr' && (
          <QrSection invoiceId={invoiceId} enabled={activeTab === 'qr'} />
        )}
        {activeTab === 'xml' && permissions.audit && (
          <XmlViewer
            invoiceId={invoiceId}
            invoiceNumber={invoice.invoice_number}
            lastSubmission={lastSub}
          />
        )}
        {!activeTab && (
          <Text className="text-sm text-gray-500">Select a tab to load PDF, QR, or XML.</Text>
        )}
      </Card>

      {permissions.audit && (
        <Card className="p-4">
          <Text className="mb-3 font-semibold">Submission history</Text>
          <SubmissionTimeline submissions={submissions} />
        </Card>
      )}
    </div>
  );
}
