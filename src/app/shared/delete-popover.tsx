'use client';

import { Title, Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Popover } from '@/components/ui/popover';
import { PiTrashFill } from 'react-icons/pi';
import { RefObject } from 'react';

interface DeletePopoverProps {
  title: string;
  description: string;
  onDelete: () => void;
  children: JSX.Element & { ref?: RefObject<any> | undefined };
}

export default function DeletePopover({
  title,
  description,
  onDelete,
  children,
}: DeletePopoverProps) {
  return (
    <Popover
      placement="left"
      className="z-50 rounded-2xl border border-gray-200 bg-white shadow-sm"
      content={({ setOpen }) => (
        <div className="w-60 p-1 text-left rtl:text-right">
          <Title
            as="h6"
            className="mb-1 flex items-start text-sm font-semibold text-gray-800 sm:items-center"
          >
            <PiTrashFill className="me-1.5 h-[17px] w-[17px] text-[#143087]" />{' '}
            {title}
          </Title>
          <Text className="mb-3 text-xs leading-relaxed text-gray-500">
            {description}
          </Text>
          <div className="flex items-center justify-end gap-1.5">
            <Button
              size="sm"
              className="h-8 rounded-xl bg-[#143087] px-3 text-white hover:bg-[#0F2466]"
              onClick={onDelete}
            >
              Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-xl border-gray-200 hover:border-[#143087]/40 hover:bg-blue-50 hover:text-[#143087]"
              onClick={() => setOpen(false)}
            >
              No
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </Popover>
  );
}
