'use client';

import { PiArrowLineUpBold } from 'react-icons/pi';
import CreateButton from '@/app/shared/create-button';
import ReportsExportModal from './reports-export-modal';
import cn from '@/utils/class-names';

export default function DoctorTargetsExportButton({
  className,
}: {
  className?: string;
}) {
  return (
    <CreateButton
      label="Export Excel"
      icon={<PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />}
      view={<ReportsExportModal />}
      customSize="560px"
      variant="outline"
      className={cn('w-full @lg:w-auto', className)}
    />
  );
}
