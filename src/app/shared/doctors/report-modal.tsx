'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';
import Image from 'next/image';

export default function BenchmarkModal({ row }: { row: any }) {
  const { closeModal } = useModal();
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState('');

  function handleTabClick(src: string) {
    setOpen(true);
    setModalData(src);
  }

  return (
    <>
      <div className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900">
        <div className="flex items-center justify-between">
          <Title as="h4" className="font-semibold">
            {'Lead Details'}
          </Title>
          <Button onClick={closeModal}>
            <PiXBold className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          {/* User Information */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Full Name</Title>
            <Text as="p" className="leading-relaxed">
              {row?.name}
            </Text>
            <Text as="p" className="p-0 m-0">
              ID-{row?.id}
            </Text>
          </div>

          {/* Personal Information */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">First Name</Title>
            <Text as="p" className="leading-relaxed">
              {row?.first_name}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Middle Name</Title>
            <Text as="p" className="leading-relaxed">
              {row?.middle_name}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Last Name</Title>
            <Text as="p" className="leading-relaxed">
              {row?.last_name}
            </Text>
          </div>

          {/* Lead Information */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Offer</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.offer}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Agent Name</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.agent_name}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Lead Status</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.status}
            </Text>
          </div>

          {/* Contact and Phone Details */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Mobile Phone</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.mobile_phone}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Booking Phone Number</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.booking_phone_number}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Home Phone</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.home_phone}
            </Text>
          </div>

          {/* Address Details */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Address</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.address_1}
            </Text>
          </div>

          {/* Source Details */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Source Campaign</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.source_campaign}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Lead Source</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.lead_source}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Activity Code</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.activity_code}
            </Text>
          </div>

          {/* Call Results */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Call Sub Result</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.call_sub_result}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">First Call Time</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              <DateCell date={new Date(row?.first_call_time)} />
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Last Call Result</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.last_call_result}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Call Duration (sec)</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.last_call_total_duration}
            </Text>
          </div>

          {/* Booking Details */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Booking Count</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.booking_count}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Reservation Date</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              <DateCell date={new Date(row?.reservation_date_1)} />
            </Text>
          </div>

          {/* Doctors and Specialties */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Doctor</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.doctor1}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Specialties</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.specialtie_1}, {row?.specialtie_2}, {row?.specialtie_3}
            </Text>
          </div>

          {/* Notes and Ads */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Notes</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.notes}
            </Text>
          </div>

          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Ads</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {row?.ads}
            </Text>
          </div>

          {/* Modified Info */}
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Modified On</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              <DateCell date={new Date(row?.modified_on)} />
            </Text>
          </div>
        </div>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-lg"
        containerClassName="dark:bg-gray-100 max-w-[460px] rounded-md p-5 lg:p-6"
      >
        <div className="flex items-center justify-between pb-2 lg:pb-3">
          <Button
            variant="text"
            onClick={() => setOpen(false)}
            className="h-auto px-1 py-1"
          >
            <PiXBold className="h-5 w-5 text-base" />
          </Button>
        </div>
        {modalData && (
          <div className="flex w-full justify-around">
            <Image src={modalData} width={300} height={400} alt="Image" />
          </div>
        )}
      </Modal>
    </>
  );
}
