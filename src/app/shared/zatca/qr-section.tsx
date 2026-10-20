'use client';

import { QRCodeSVG } from 'qrcode.react';
import { PiCopy } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ActionIcon } from '@/components/ui/action-icon';
import { Text } from '@/components/ui/text';
import Spinner from '@/components/ui/spinner';
import Table from '@/components/ui/table';
import { useZatcaQr } from '@/framework/zatca';
import toast from 'react-hot-toast';
import {
  decodedQrToRows,
  isLongQrValue,
  truncateQrValue,
} from '@/app/shared/zatca/qr-decoded-rows';

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

  const copyText = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const rows = decodedQrToRows(data.decoded);
  const tableData = Array.isArray(rows) ? rows : [];

  const columns = [
    { title: 'Tag', dataIndex: 'tag', key: 'tag', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => {
        const text = value ?? '';
        const long = isLongQrValue(text);
        return (
          <div className="flex items-center gap-2">
            <span className="break-all font-mono text-xs">
              {long ? truncateQrValue(text) : text}
            </span>
            {long ? (
              <ActionIcon
                size="sm"
                variant="outline"
                aria-label="Copy value"
                onClick={() => copyText(text, 'Value')}
              >
                <PiCopy className="h-4 w-4" />
              </ActionIcon>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <QRCodeSVG value={data.base64} size={200} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => copyText(data.base64, 'QR payload')}>
            Copy payload
          </Button>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <Text className="mb-2 font-medium">Decoded TLV</Text>
        <Table columns={columns} data={tableData} rowKey="key" />
      </div>
    </div>
  );
}
