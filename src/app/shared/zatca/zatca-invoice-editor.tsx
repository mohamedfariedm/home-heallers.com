'use client';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import InvoiceForm from '@/app/shared/invoices/invoices-form';
import { useInvoice } from '@/framework/invoices';

function unwrapInvoiceRow(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as { data?: unknown };
  const inner = payload.data ?? data;
  if (Array.isArray(inner)) {
    const first = inner[0];
    return first && typeof first === 'object'
      ? (first as Record<string, unknown>)
      : null;
  }
  if (inner && typeof inner === 'object') {
    return inner as Record<string, unknown>;
  }
  return null;
}

export default function ZatcaInvoiceEditor({
  invoiceId,
  onSaved,
  onCancel,
}: {
  invoiceId: number | string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { data, isLoading, isError } = useInvoice(invoiceId);
  const invoice = unwrapInvoiceRow(data);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center p-6" dir="rtl">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-4 p-6" dir="rtl">
        <Text className="text-sm text-gray-700">تعذر تحميل الفاتورة.</Text>
        <Button variant="outline" onClick={onCancel}>
          رجوع
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-6 pt-4" dir="rtl">
        <Button variant="outline" size="sm" onClick={onCancel}>
          رجوع
        </Button>
      </div>
      <InvoiceForm initValues={invoice as never} onSaved={onSaved} />
    </div>
  );
}
