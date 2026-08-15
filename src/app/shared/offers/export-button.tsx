'use client';

import { useState } from 'react';
import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import client from '@/framework/utils';
import cn from '@/utils/class-names';

export default function OffersExportButton({
  className,
  total,
}: {
  className?: string;
  total?: number;
}) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (total && total > 500) {
      const confirmed = window.confirm(
        `This export includes ${total} offers with full rich-text bodies. Continue?`
      );
      if (!confirmed) return;
    }

    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit' && key !== 'per_page') {
        params.set(key, value);
      }
    });
    params.set('type', 'offer');
    params.set('export', '1');

    setLoading(true);
    const toastId = toast.loading('Preparing export…');
    try {
      const res = await client.packages.exportBlob(params.toString());
      const blob: Blob = res.data;
      const contentType = res.headers?.['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await blob.text();
        const json = JSON.parse(text) as { download_url?: string };
        if (json?.download_url) {
          window.open(json.download_url, '_blank');
          toast.success('Export ready', { id: toastId });
          return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'offers.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded', { id: toastId });
    } catch (error: any) {
      toast.error(error?.message || 'Export failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      isLoading={loading}
      className={cn('w-full @lg:w-auto', className)}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Export
    </Button>
  );
}
