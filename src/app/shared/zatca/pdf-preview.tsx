'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import client from '@/framework/utils';

export default function PdfPreview({
  invoiceId,
  enabled,
}: {
  invoiceId: number | string;
  enabled: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let objectUrl: string | null = null;
    setLoading(true);
    client.zatca
      .pdfBlob(invoiceId)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => setUrl(null))
      .finally(() => setLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [invoiceId, enabled]);

  const download = () => {
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      a.click();
    }
  };

  const printPdf = () => {
    iframeRef.current?.contentWindow?.print();
  };

  if (!enabled) return null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!url) {
    return <p className="text-sm text-gray-500">PDF could not be loaded.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={download}>
          Download
        </Button>
        <Button size="sm" variant="outline" onClick={printPdf}>
          Print
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        src={url}
        title="Invoice PDF"
        className="h-[600px] w-full rounded-md border border-gray-200"
      />
    </div>
  );
}
