'use client';

import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { useSearchParams } from 'next/navigation';
import { useZatcaExport } from '@/framework/zatca';

export default function ZatcaExportButton({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const searchParams = useSearchParams();
  const { mutate, isPending } = useZatcaExport();

  const handleClick = () => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        params.set(key === 'limit' ? 'per_page' : key, value);
      }
    });
    if (!params.get('per_page')) params.set('per_page', searchParams.get('limit') ?? '25');
    mutate(params.toString());
  };

  return (
    <Button
      variant="outline"
      disabled={disabled || isPending}
      isLoading={isPending}
      onClick={handleClick}
      className={cn('w-full @lg:w-auto', className)}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Export CSV
    </Button>
  );
}
