'use client';

import { PiPlusBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button, type ButtonProps } from '@/components/ui/button';
import { adminPrimaryButtonClass } from '@/components/ui/admin-page-shell';
import cn from '@/utils/class-names';

interface ModalButtonProps extends ButtonProps {
  label?: string;
  className?: string;
  customSize?: string;
  icon?: React.ReactNode;
  view: React.ReactNode;
}

export default function CreateButton({
  label = 'Add New',
  className,
  customSize = '500px',
  view,
  icon = <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />,
  ...rest
}: ModalButtonProps) {
  const { openModal } = useModal();
  const isIconOnly =
    !label ||
    className?.includes('bg-transparent') ||
    className?.includes('m-0');

  return (
    <Button
      className={cn(!isIconOnly && adminPrimaryButtonClass, className)}
      onClick={() =>
        openModal({
          view,
          customSize,
        })
      }
      {...rest}
    >
      {icon}
      {label}
    </Button>
  );
}
