'use client';

import { PiXBold } from 'react-icons/pi';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';
import Image from 'next/image';
import WidgetCard from '@/components/cards/widget-card';

// main category form component for create and update category
export default function JourneyDetails({ data }: {
    data: any
}) {
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState('');
  function handleTabClick(src: string) {
    setOpen(() => true);
    setModalData(src)
    // setActive(() => id);
  }

  return (
    <>
    {false ? (
        <div className="m-auto">
            <Spinner size="lg" />
        </div>
    ) : (
        <>
            <div className='flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900'>
                <div className="flex items-center justify-between">
                    <Title as="h4" className="font-semibold">
                        {'Journey Details'}
                    </Title>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        User Name
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.user?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Store Name
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.store?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.check_in_date}T${data?.check_in_time}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.check_out_date}T${data?.check_out_time}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In Comment
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.check_in_comment || 'no comment'}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out Comment
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.check_out_comment || 'no comment'}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check In Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.checkInPhoto)}>
                        <AvatarCard
                            src={data?.checkInPhoto}
                            name={''}
                            // description={`ID-${row?.user.id}`}
                        />
                        </button>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Check Out Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.checkOutPhoto)}>
                        <AvatarCard
                            src={data?.checkOutPhoto}
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
                    href={`https://www.google.com/maps/search/?api=1&query=${data?.map_in?.lat},${data?.map_in?.lng}`}
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
                    href={`https://www.google.com/maps/search/?api=1&query=${data?.map_out?.lat},${data?.map_in?.lng}`}
                    target="_blank"
                    >
                        {/* <Button variant="text" size="lg">
                            <PiMapPinLineDuotone />
                        </Button> */}
                        <AvatarCard
                            src={'/Simply-Styled-Google-Maps.png'}
                            name={''}
                        />
                    </a>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Status
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.status}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Priority
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.priority}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Type
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.type}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Created At
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.created_at} />
                        </Text>
                    </div>
                </div>
                {data?.journey_details?.map((jd: any, index: number) => (

                    <WidgetCard
                        key={index}
                        title={jd?.type}
                        >
                            <div className='mb-2'>
                                {jd?.note}
                            </div>
                            {jd?.images?.map((image: any, ix: number) => (

                            <button key={ix} onClick={() => handleTabClick(image?.path)}>
                            <AvatarCard
                                src={image?.path}
                                name={''}
                            />
                            </button>
                            ) )}
                            {jd?.type == 'after' ? 
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                                Todo List
                            </Title> : null}
                            <div className='flex gap-8'>
                            {jd?.type == 'after' ? jd?.to_do_list?.map((toDo: any) => (
                                <div key={toDo?.id}>
                                    Title: {toDo?.title}
                                </div>
                            )) : null}
                            </div>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                                Brands
                            </Title>
                            <div className='flex justify-between'>
                            { jd?.brands?.map((brand: any) => (
                                <div key={brand?.id}>
                                    {brand?.name}
                                </div>
                            ))}
                            </div>
                    </WidgetCard>
                ) )}
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
