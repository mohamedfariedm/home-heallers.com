'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { useModal } from './use-modal';
import cn from '@/utils/class-names';

export default function GlobalModal() {
  const { isOpen, view, closeModal, customSize } = useModal();
  const pathname = usePathname();
  useEffect(() => {
    closeModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (document.querySelector('[data-floating-datepicker]')) return;
        closeModal();
      }}
      customSize={customSize}
      overlayClassName="bg-slate-900/40 backdrop-blur-[2px] dark:bg-opacity-40 dark:backdrop-blur-lg"
      containerClassName={cn(
        'overflow-visible rounded-2xl border border-gray-200 bg-white shadow-xl dark:bg-gray-100',
        // Cascade Offers-style primary actions inside table create/update forms
        '[&_button[type=submit]]:bg-[#143087] [&_button[type=submit]]:text-white',
        '[&_button[type=submit]]:hover:bg-[#0F2466]',
        '[&_button[type=submit]]:dark:bg-[#143087] [&_button[type=submit]]:dark:text-white',
        '[&_button[type=submit]]:dark:hover:bg-[#0F2466]',
        // Focus rings
        '[&_input:focus]:ring-[#143087]/20 [&_textarea:focus]:ring-[#143087]/20'
      )}
    >
      {view}
    </Modal>
  );
}
