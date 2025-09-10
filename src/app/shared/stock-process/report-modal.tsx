'use client';

import { PiXBold } from 'react-icons/pi';
import { ActionIcon } from '@/components/ui/action-icon';
import { Title, Text } from '@/components/ui/text';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useGetStockReport } from '@/framework/stock-process';
import Spinner from '@/components/ui/spinner';
import DateCell from '@/components/ui/date-cell';


// main category form component for create and update category
export default function UpdateCreateCity({ id }: {
    id: number
}) {
  const { closeModal } = useModal();
  const { data, isLoading: isReportLoading } = useGetStockReport(id)
 

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
                        {'Stock Details'}
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
                        sku_code
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.product?.sku_code}
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Date
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        <DateCell date={data?.data?.created_at} />
                        </Text>
                    </div>
                    <div>
                        <Title as="h6" className="mt-6 font-inter text-sm font-semibold">
                        Sales
                        </Title>
                        <Text as="p" className="pb-2 leading-relaxed">
                        {data?.data?.updated_quentity}
                        </Text>
                    </div>
                </div>
            </div>
        </>
    )}
    </>   
  );
}
