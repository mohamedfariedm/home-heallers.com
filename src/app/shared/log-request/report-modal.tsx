'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import DateCell from '@/components/ui/date-cell';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Image from 'next/image';
import AvatarCard from '@/components/ui/avatar-card';
import { useIeaModal } from '@/framework/log-request';


// main category form component for create and update category
export default function IeaModale({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useIeaModal(id)
  const [open, setOpen] = useState(false);
  const [modalData, setModalData] = useState<{src: string, type: string}>();
  function handleTabClick(src: string, type: string) {
    setOpen(() => true);
    setModalData({src: src, type: type})
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
            <div className='flex flex-grow flex-col gap-2 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900'>
                <div className="flex items-center justify-between">
                    <Title as="h4" className="font-semibold">
                        {'Log Request Model Details'}
                    </Title>
                    <ActionIcon size="sm" variant="text" onClick={closeModal}>
                        <PiXBold className="h-auto w-5" />
                    </ActionIcon>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Log Date
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.date}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Time
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.time}
                        </Text>
                        </div>
                        <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Created At
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.created_at} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Updated At
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.updated_at} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Distance
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.distance/1000+"km"}
                        </Text>
                        </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        User Name
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.user?.name}
                        </Text>
                        </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        User Id
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.user?.id}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Type
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.type}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Store
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Store Location
                        </Title>
                        {data?.data?.store?.lat&&data?.data?.store?.lng?                 
                               <a
                                href={`https://www.google.com/maps/search/?api=1&query=${data?.data?.store?.lat},${data?.data?.store?.lng}`}
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
                            </a>:""}

                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        User Location
                        </Title>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${data?.data?.lat},${data?.data?.lng}`}
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
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Retailer
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.retailer?.name}
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
            {modalData && modalData?.type == 'image' ?
                <div className='flex w-full justify-around'>
                    <Image src={modalData?.src || ''} width={300} height={400} alt={'test'} />
                </div> : 
                <div>
                    <video autoPlay loop style={{ width: '400px', height: '400px' }}>
                        <source src={modalData?.src} />
                    </video>
                </div>
                }
            </Modal>
        </>
    )}
    </>   
  );
}
