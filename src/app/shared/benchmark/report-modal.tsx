'use client';

import { PiMapPinLineDuotone, PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useGetBenchmarkReport } from '@/framework/benchmark';
import Spinner from '@/components/ui/spinner';
import DateCell from '@/components/ui/date-cell';
import AvatarCard from '@/components/ui/avatar-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useState } from 'react';
import Image from 'next/image';

// main category form component for create and update category
export default function BenchmarkModal({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useGetBenchmarkReport(id)
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
                        {'Benchmark Details'}
                    </Title>
                    <ActionIcon size="sm" variant="text" onClick={closeModal}>
                        <PiXBold className="h-auto w-5" />
                    </ActionIcon>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        User
                        </Title>
                        <Text as="p" className=" leading-relaxed">
                        {data?.data?.user?.name}
                        </Text>
                        <Text as="p" className="p-0 m-0">
                        ID-{data?.data?.user?.id}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Retailer
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.retailer?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Brand
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.brand?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        BG
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.category?.name}
                        {/* <DateCell date={new Date(`${data?.data?.check_in_date}T${data?.data?.check_in_time}`)} /> */}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        VCP
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.sub_category?.name}
                        {/* <DateCell date={new Date(`${data?.data?.check_out_date}T${data?.data?.check_out_time}`)} /> */}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        BU
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.sub_sub_category?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        SKU Code
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.sku_code}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Offer Date From
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.data?.offer_date_from}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Offer Date To
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={new Date(`${data?.data?.offer_date_to}`)} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Product Price
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.price}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Promotion Price
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.promotion_price}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        SKU Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.data?.skuPhoto)}>
                        <AvatarCard
                            src={data?.data?.skuPhoto}
                            name={''}
                        />
                        </button>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Price Tag
                        </Title>
                        <button onClick={() => handleTabClick(data?.data?.priceTagPhoto)}>
                        <AvatarCard
                            src={data?.data?.priceTagPhoto}
                            name={''}
                        />
                        </button>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Magazine Photo
                        </Title>
                        <button onClick={() => handleTabClick(data?.data?.magazinePhoto)}>
                        <AvatarCard
                            src={data?.data?.magazinePhoto}
                            name={''}
                        />
                        </button>
                    </div>
                    {data?.data?.features && data?.data?.features?.length > 0 ? data?.data?.features?.map((feature: any, index: number) => (
                        <div key={index}>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            {feature?.category?.name}
                            </Title>
                            <Text as="p" className="pb-2 leading-relaxed">
                            {feature?.name}
                            </Text>
                        </div>
                    )) : null}
                    
                    
                    
                    {/* <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Type
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.type}
                        </Text>
                    </div> */}
                    
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
