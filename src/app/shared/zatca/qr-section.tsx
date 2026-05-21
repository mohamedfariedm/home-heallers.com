'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import Table from '@/components/ui/table';
import { useZatcaQr } from '@/framework/zatca';
import toast from 'react-hot-toast';

export default function QrSection({
  invoiceId,
  enabled,
}: {
  invoiceId: number | string;
  enabled: boolean;
}) {
  const { data, isLoading, isError } = useZatcaQr(invoiceId, enabled);

  if (!enabled) return null;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !data?.base64) {
    return (
      <Text className="text-sm text-gray-500">
        QR not yet available — submission has not completed.
      </Text>
    );
  }

  const copyBase64 = () => {
    navigator.clipboard.writeText(data.base64);
    toast.success('QR payload copied');
  };

  const columns = [
    { title: 'Tag', dataIndex: 'tag', key: 'tag', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Value', dataIndex: 'value', key: 'value' },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <QRCodeSVG value={data.base64} size={200} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copyBase64}>
            Copy payload
          </Button>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <Text className="mb-2 font-medium">Decoded TLV</Text>
        <Table columns={columns} data={data.decoded ?? []} />
      </div>
    </div>
  );
}
