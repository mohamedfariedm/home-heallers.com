'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useGetLaunchedModelReport } from '@/framework/launched-model';
import Spinner from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import DateCell from '@/components/ui/date-cell';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import Image from 'next/image';
import { useIeaModal } from '@/framework/inqueries';


// main category form component for create and update category
export default function Model({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useIeaModal(id)
console.log(data);

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
            <div className='flex flex-grow flex-col gap-5 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900 '>
                <div className="flex items-center justify-between">
                    <Title as="h4" className="font-semibold">
                        {'Inquerie Model Details'}
                    </Title>
                    <ActionIcon size="sm" variant="text" onClick={closeModal}>
                        <PiXBold className="h-auto w-5" />
                    </ActionIcon>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
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
                        Title
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.title}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Subject
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.subject}
                        </Text>
                    </div>

                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Feed Back
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.response}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Message
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.message}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Created 
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.created_at} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-4 font-inter text-sm font-semibold">
                        Last Update
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.updated_at} />
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
