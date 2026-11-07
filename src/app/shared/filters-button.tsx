'use client';
import {
  useDrawer,
  type DrawerPlacements,
} from '@/app/shared/drawer-views/use-drawer';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';
import { PiSliders } from 'react-icons/pi';

interface FiltersButtonProps {
  className?: string;
  modalView: React.ReactNode;
  placement: DrawerPlacements;
}

export default function FiltersButton({
  className,
  placement,
  modalView,
}: FiltersButtonProps) {
  const { openDrawer } = useDrawer();
  return (
    <Button
      className={cn(
        'mt-4 w-full cursor-pointer rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087] @lg:mt-0 @lg:w-auto dark:bg-white dark:text-gray-700',
        className
      )}
      onClick={() =>
        openDrawer({
          view: modalView,
          placement,
        })
      }
    >
      <PiSliders className="me-1 h-4 w-4 rotate-90" />
      Filters
    </Button>
  );
}
