'use client';

import { PiMapPinLineDuotone, PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useGetReport } from '@/framework/checkin';
import Spinner from '@/components/ui/spinner';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';
import Image from 'next/image';

// main category form component for create and update category
export default function CheckInOutModal({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useGetReport(id)
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState('');
  function handleTabClick(src: string) {
    setOpen(() => true);
    setModalData(src)
    // setActive(() => id);
  }

  return (
    <>
    {isReportLoading ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
    ) : (
        <>
            <div className='flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900'>
                <div className="flex items-center justify-between">
                    <Title as="h4" className="font-semibold">
                        {'Check In Out Details'}
                    </Title>
                    <ActionIcon size="sm" variant="text" onClick={closeModal}>
                        <PiXBold className="h-auto w-5" />
                    </ActionIcon>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        User Name
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.user?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Store Name
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.data?.check_in_date}T${data?.data?.check_in_time}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.data?.check_out_date}T${data?.data?.check_out_time}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In Comment
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.check_in_comment || 'no comment'}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out Comment
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.check_out_comment || 'no comment'}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.data?.checkInPhoto)}>
                        <AvatarCard
                            src={data?.data?.checkInPhoto}
                            name={''}
                            // description={`ID-${row?.user.id}`}
                        />
                        </button>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.data?.checkOutPhoto)}>
                        <AvatarCard
                            src={data?.data?.checkOutPhoto}
                            name={''}
                            // description={`ID-${row?.user.id}`}
                        />
                        </button>
                    </div>
                    <div>
                    <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        map in
                    </Title>
                    <a
                    href={`https://www.google.com/maps/search/?api=1&query=${data?.data?.map_in?.lat},${data?.data?.map_in?.lng}`}
                    target="_blank"
                    >
                        {/* <Button variant="text" size="lg">
                            <PiMapPinLineDuotone />
                        </Button> */}
                        <AvatarCard
                            src={'/Simply-Styled-Google-Maps.png'}
                            name={''}
                            // description={`ID-${row?.user.id}`}
                        />
                    </a>
                    </div>
                    <div>
                    <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        map out
                    </Title>
                    <a
                    href={`https://www.google.com/maps/search/?api=1&query=${data?.data?.map_out?.lat},${data?.data?.map_in?.lng}`}
                    target="_blank"
                    >
                        {/* <Button variant="text" size="lg">
                            <PiMapPinLineDuotone />
                        </Button> */}
                        <AvatarCard
                            src={'/Simply-Styled-Google-Maps.png'}
                            name={''}
                            // description={`ID-${row?.user.id}`}
                        />
                    </a>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Status
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.status}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Priority
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.priority}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Type
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.type}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Created At
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.created_at} />
                        </Text>
                    </div>
                </div>
            </div>
            <Modal
            isOpen={open}
            onClose={() => {
            setOpen(false);
            //   setActive(() => 'posts');
            }}
            overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-lg"
            containerClassName="dark:bg-gray-100 max-w-[460px] rounded-md p-5 lg:p-6"
        >
            <div className="flex items-center justify-between pb-2 lg:pb-3">
            {/* <Title
                as="h3"
                className="text-lg font-semibold text-gray-900 xl:text-xl"
            >
                {'modalData.title'}
            </Title> */}
            <Button
                variant="text"
                onClick={() => {
                setOpen(false);
                //   setActive(() => 'posts');
                }}
                className="h-auto px-1 py-1"
            >
                <PiXBold className="h-5 w-5 text-base" />
            </Button>
            </div>
            {modalData && 
            <div className='flex w-full justify-around'>
                <Image src={modalData} width={300} height={400} alt={'test'} />
            </div>}
            </Modal>
        </>
    )}
    </>   
  );
}
