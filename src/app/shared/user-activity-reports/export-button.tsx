'use client';

import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { useSearchParams } from 'next/navigation';
import { useUserActivityReportExport } from '@/framework/user-activity-reports';
import { toKpiExportQuery } from '@/utils/kpi-export';

export default function UserActivityExportButton({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const searchParams = useSearchParams();
  const { mutate, isPending } = useUserActivityReportExport();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(toKpiExportQuery(params));
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
      Export Excel
    </Button>
  );
}
