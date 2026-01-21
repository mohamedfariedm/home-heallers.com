'use client';

import { PiXBold } from 'react-icons/pi';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Button } from '@/components/ui/button';
import DateCell from '@/components/ui/date-cell';

interface KanbanCardViewModalProps {
  item: any;
}

export default function KanbanCardViewModal({ item }: KanbanCardViewModalProps) {
  const { closeModal } = useModal();

  return (
    <div className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900">
      <div className="flex items-center justify-between">
        <Title as="h4" className="font-semibold">
          Lead Details
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
            {item?.name || '-'}
          </Text>
          <Text as="p" className="p-0 m-0">
            ID-{item?.id}
          </Text>
        </div>

        {/* Personal Information */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">First Name</Title>
          <Text as="p" className="leading-relaxed">
            {item?.first_name || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Middle Name</Title>
          <Text as="p" className="leading-relaxed">
            {item?.middle_name || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Last Name</Title>
          <Text as="p" className="leading-relaxed">
            {item?.last_name || '-'}
          </Text>
        </div>

        {/* Lead Information */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Offer</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.offer || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Agent Name</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.agent_name || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Lead Status</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.status || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Chief Comment</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.reason || '-'}
          </Text>
        </div>

        {/* Contact and Phone Details */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Mobile Phone</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.mobile_phone || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Booking Phone Number</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.booking_phone_number || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Home Phone</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.home_phone || '-'}
          </Text>
        </div>

        {/* Address Details */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Address</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.address_1 || '-'}
          </Text>
        </div>

        {/* Source Details */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Source</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.source_campaign || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Lead Source</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.lead_source || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Communication Channel</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.communication_channel || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Activity Code</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.activity_code || '-'}
          </Text>
        </div>

        {/* Call Results */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Call Sub Result</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.call_sub_result || '-'}
          </Text>
        </div>

        {item?.first_call_time && (
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">First Call Time</Title>
            <Text as="p" className="pb-2 text-start  leading-relaxed">
              <DateCell date={new Date(item?.first_call_time)} />
            </Text>
          </div>
        )}

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Last Call Result</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.last_call_result || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Call Duration (sec)</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.last_call_total_duration || '-'}
          </Text>
        </div>

        {/* Booking Details */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Booking Count</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.booking_count || 0}
          </Text>
        </div>

        {item?.reservation_date_1 && (
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Reservation Date</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              <DateCell date={new Date(item?.reservation_date_1)} />
            </Text>
          </div>
        )}

        {/* Doctors and Specialties */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Doctor</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.doctor1 || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Specialties</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {[item?.specialtie_1, item?.specialtie_2, item?.specialtie_3].filter(Boolean).join(', ') || '-'}
          </Text>
        </div>

        {/* Notes and Ads */}
        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Notes</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.notes || '-'}
          </Text>
        </div>

        <div>
          <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Ads</Title>
          <Text as="p" className="pb-2 leading-relaxed">
            {item?.ads || '-'}
          </Text>
        </div>

        {/* Dates */}
        {item?.created_at && (
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Created At</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {item?.created_at}
            </Text>
          </div>
        )}

        {item?.updated_at && (
          <div>
            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">Modified On</Title>
            <Text as="p" className="pb-2 leading-relaxed">
              {item?.updated_at}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
