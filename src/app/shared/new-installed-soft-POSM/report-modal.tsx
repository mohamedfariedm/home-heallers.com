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
import { useGetNewInstalledSoftPOSMReport } from '@/framework/new-installed-soft-POSM';


// main category form component for create and update category
export default function UpdateCreateCity({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useGetNewInstalledSoftPOSMReport(id)  
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
                        {'New Installed Soft POSM'}
                    </Title>
                    <ActionIcon size="sm" variant="text" onClick={closeModal}>
                        <PiXBold className="h-auto w-5" />
                    </ActionIcon>
                </div>
                <div className='grid grid-cols-2 gap-x-4'>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Region
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.region?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        City
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.city?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Retailer
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.store?.retailer?.name}
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
                        POSM Types
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.posm_types.join("  ,  ")}
                        </Text>
                    </div>

                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        BG
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.category?.name}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        VCP
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.sub_category?.name}
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
                        Installation Date From
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.installation_date_from} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Installation Date To
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.installation_date_to} />
                        </Text>
                    </div>
                    
                    
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Comment
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.comment}
                        </Text>
                    </div>

                    {data?.data?.productPhoto && data?.data?.productPhoto?.length > 0 ? 
                    data?.data?.productPhoto?.map((photo: any, index: number) => (
                        <div key={index}>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Product Photo
                            </Title>
                            <button onClick={() => handleTabClick(photo?.path)}>
                            <AvatarCard
                                src={photo?.path}
                                name={''}
                                // description={`ID-${row?.user.id}`}
                            />
                            </button>
                        </div>
                    )) : null }


                    {data?.data?.priceTagPhoto && data?.data?.priceTagPhoto?.length > 0 ? 
                    data?.data?.priceTagPhoto?.map((photo: any, index: number) => (
                        <div key={index}>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Price
                            </Title>
                            <button onClick={() => handleTabClick(photo?.path)}>
                            <AvatarCard
                                src={photo?.path}
                                name={''}
                                // description={`ID-${row?.user.id}`}
                            />
                            </button>
                        </div>
                    )) : null }
                    <div className='col-span-2'>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Does This Brand Have Permanent Promoters In The Branch?
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.have_permanent_promoters ? 'Yes' : "No"}
                        </Text> 
                    </div>


                    {data?.data?.have_permanent_promoters ? (
                        <div className='col-span-2'>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Number Of Promoters
                            </Title>
                            <Text as="p" className="pb-2 leading-relaxed">
                            {data?.data?.permanent_promoters_number==null?0:data?.data?.permanent_promoters_number}
                            </Text> 
                        </div>
                    ) : null}
                    


{/*                     
                    <div className='col-span-2'>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Does This Brand Have Temporary Promoters In The Branch?
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.have_temporary_promoters ? 'Yes' : "No"}
                        </Text> 
                    </div>
                    {data?.data?.have_permanent_promoters ? (
                        <div className='col-span-2'>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Number Of Promoters
                            </Title>
                            <Text as="p" className="pb-2 leading-relaxed">
                            {data?.data?.temporary_promoters_number}
                            </Text> 
                        </div>
                    ) : null}
                    <div className='col-span-2'>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Does This Brand Have A Specific Promoters In The Branch For This Stand?
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.have_specific_promoters ? 'Yes' : "No"}
                        </Text> 
                    </div>
                    {data?.data?.have_permanent_promoters ? (
                        <div className='col-span-2'>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Number Of Promoters
                            </Title>
                            <Text as="p" className="pb-2 leading-relaxed">
                            {data?.data?.specific_promoters_number}
                            </Text> 
                        </div>
                    ) : null}
                    <div className='col-span-2'>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        What Are The Displayed Models In This Stand/Gondola?
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.displayed_models_gondola}
                        </Text> 
                    </div> */}
                    {/* {data?.data?.NewInstalledPOSMPhotos && data?.data?.NewInstalledPOSMPhotos?.length > 0 ? 
                    data?.data?.NewInstalledPOSMPhotos?.map((photo: any, index: number) => (
                        <div key={index}>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Photos
                            </Title>
                            <button onClick={() => handleTabClick(photo?.path, 'image')}>
                            <AvatarCard
                                src={photo?.path}
                                name={''}
                                // description={`ID-${row?.user.id}`}
                            />
                            </button>
                        </div>
                    )) : null }
                    {data?.data?.NewInstalledPOSMVideos && data?.data?.NewInstalledPOSMVideos?.length > 0 ? 
                    data?.data?.NewInstalledPOSMVideos?.map((photo: any, index: number) => (
                        <div key={index}>
                            <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                            Videos
                            </Title>
                            <button onClick={() => handleTabClick(photo?.path, 'video')}>
                            <AvatarCard
                                src={photo?.path}
                                name={''}
                                // description={`ID-${row?.user.id}`}
                            />
                            </button>
                        </div>
                    )) : null } */}
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
