'use client';

import React from 'react';
import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Button } from '@/components/ui/button';
import { useModal } from '@/app/shared/modal-views/use-modal';
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '@/components/ui/admin-page-shell';
import cn from '@/utils/class-names';

type ModalFormHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export function ModalFormHeader({
  title,
  description,
  icon,
  className,
  onClose,
}: ModalFormHeaderProps) {
  const { closeModal } = useModal();
  const handleClose = onClose ?? closeModal;

  return (
    <div
      className={cn(
        '-mx-6 -mt-6 mb-2 border-b border-gray-100 bg-white',
        className
      )}
    >
      <div className="flex items-center gap-3 px-6 py-4">
        {icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <span className="flex h-5 w-5 items-center justify-center text-white [&>svg]:h-5 [&>svg]:w-5">
              {icon}
            </span>
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#143087] to-[#39519B] shadow">
            <span className="text-sm font-bold text-white">+</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-gray-900">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          ) : null}
        </div>
        <ActionIcon
          size="sm"
          variant="outline"
          onClick={handleClose}
          className="rounded-lg border-gray-200 text-gray-500 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
        >
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>
    </div>
  );
}

type ModalFormFooterProps = {
  submitLabel: React.ReactNode;
  cancelLabel?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  className?: string;
  submitType?: 'submit' | 'button';
  onSubmitClick?: () => void;
};

export function ModalFormFooter({
  submitLabel,
  cancelLabel = 'Cancel',
  isLoading,
  disabled,
  onCancel,
  className,
  submitType = 'submit',
  onSubmitClick,
}: ModalFormFooterProps) {
  const { closeModal } = useModal();
  const handleCancel = onCancel ?? closeModal;

  return (
    <div
      className={cn(
        '-mx-6 -mb-6 mt-2 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4',
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        onClick={handleCancel}
        className={cn(adminSecondaryButtonClass, 'w-full @xl:w-auto')}
      >
        {cancelLabel}
      </Button>
      <Button
        type={submitType}
        isLoading={isLoading}
        disabled={disabled}
        onClick={onSubmitClick}
        className={cn(adminPrimaryButtonClass, 'w-full @xl:w-auto')}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

/** Shared form body class for create/update modals */
export const modalFormClassName =
  'flex flex-grow flex-col gap-5 overflow-y-auto p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900 [&_input]:rounded-xl [&_textarea]:rounded-xl [&_select]:rounded-xl';
