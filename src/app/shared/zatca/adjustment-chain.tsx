'use client';

import Link from 'next/link';
import { Text } from '@/components/ui/text';
import StatusBadge from '@/app/shared/zatca/status-badge';
import DateCell from '@/components/ui/date-cell';
import CreateCreditNoteButton from '@/app/shared/zatca/create-credit-note-modal';
import CreateDebitNoteButton from '@/app/shared/zatca/create-debit-note-modal';
import type { ZatcaInvoice } from '@/types/zatca';

export default function AdjustmentChain({ invoice }: { invoice: ZatcaInvoice }) {
  if (invoice.document_type !== 'INVOICE') {
    if (!invoice.parent) return null;
    return (
      <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        This is a{' '}
        <StatusBadge kind="document" value={invoice.document_type} className="mx-1" /> against
        invoice{' '}
        <Link href={`/invoices/${invoice.parent.id}`} className="font-semibold underline">
          {invoice.parent.invoice_number} ↗
        </Link>
      </div>
    );
  }

  if (!invoice.adjustments?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <Text className="mb-3 text-base font-semibold">Adjustments</Text>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pe-4">Number</th>
              <th className="py-2 pe-4">Type</th>
              <th className="py-2 pe-4">Amount</th>
              <th className="py-2 pe-4">ZATCA</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {invoice.adjustments.map((adj) => (
              <tr key={adj.id} className="border-b border-gray-100">
                <td className="py-2 pe-4">
                  <Link href={`/invoices/${adj.id}`} className="font-medium text-blue-600">
                    {adj.invoice_number}
                  </Link>
                </td>
                <td className="py-2 pe-4">
                  <StatusBadge kind="document" value={adj.document_type} />
                </td>
                <td className="py-2 pe-4">{adj.grand_total} ر.س</td>
                <td className="py-2 pe-4">
                  <StatusBadge kind="zatca" value={adj.zatca_status} />
                </td>
                <td className="py-2">
                  <DateCell date={adj.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <CreateCreditNoteButton invoice={invoice} />
        <CreateDebitNoteButton invoice={invoice} />
      </div>
    </div>
  );
}
