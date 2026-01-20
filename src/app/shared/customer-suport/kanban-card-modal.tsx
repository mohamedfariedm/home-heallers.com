'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import { ActionIcon } from 'rizzui';
import { PiXBold, PiUser, PiCalendarCheck } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';
import CreateOrUpdateCustomerSupport from './suport-form';
import CreateOrUpdateReservation from '@/app/shared/reservations/reservations-form';
import { useReservations } from '@/framework/reservations';
import Spinner from '@/components/ui/spinner';
import client from '@/framework/utils';
import cn from '@/utils/class-names';

interface KanbanCardModalProps {
  item: any;
}

export default function KanbanCardModal({ item }: KanbanCardModalProps) {
  const { closeModal } = useModal();
  const [activeTab, setActiveTab] = useState(0);
  const [reservationData, setReservationData] = useState<any>(null);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);

  // Fetch reservation if patient_id exists
  useEffect(() => {
    if (item?.patient_id) {
      setIsLoadingReservation(true);
      const params = new URLSearchParams();
      params.set('patient_id', String(item.patient_id));
      params.set('limit', '1');

      const fetchReservation = async () => {
        try {
          const response = await client.reservations.all(params.toString());
          if (response?.data?.data && response.data.data.length > 0) {
            setReservationData(response.data.data[0]);
          } else {
            setReservationData(null);
          }
        } catch (error) {
          console.error('Error fetching reservation:', error);
          setReservationData(null);
        } finally {
          setIsLoadingReservation(false);
        }
      };

      fetchReservation();
    } else {
      setReservationData(null);
      setIsLoadingReservation(false);
    }
  }, [item?.patient_id]);

  return (
    <div className="m-auto w-full  rounded-lg bg-white shadow-xl dark:bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <PiUser className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-900">
              {item?.name || 'Customer Details'}
            </h2>
            {item?.mobile_phone && (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {item.mobile_phone}
              </p>
            )}
          </div>
        </div>
        {/* <ActionIcon
          size="sm"
          variant="text"
          onClick={closeModal}
          className="hover:bg-gray-100 dark:hover:bg-gray-200"
        >
          <PiXBold className="h-auto w-5" />
        </ActionIcon> */}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <div className="border-b border-gray-200 px-6 dark:border-gray-700">
          <TabList className="inline-flex w-full justify-start space-x-1 rounded-lg border-0 p-0">
            <Tab
              className={({ selected }) =>
                cn(
                  'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all duration-200',
                  selected
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                )
              }
            >
              <PiUser className="h-4 w-4" />
              <span>Edit Customer Support</span>
            </Tab>
            <Tab
              className={({ selected }) =>
                cn(
                  'flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all duration-200',
                  selected
                    ? 'border-b-2 border-primary bg-primary/5 text-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                )
              }
            >
              <PiCalendarCheck className="h-4 w-4" />
              <span>Reservation</span>
            </Tab>
          </TabList>
        </div>

        <TabPanels>
          <TabPanel className="px-6 py-6">
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto pr-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-100/50">
                <CreateOrUpdateCustomerSupport
                  initValues={item}
                  type="operation"
                />
              </div>
            </div>
          </TabPanel>

          <TabPanel className="px-6 py-6">
            <div className="max-h-[calc(80vh-180px)] overflow-y-auto pr-2">
              {isLoadingReservation ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-100/50">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-100/50">
                  <CreateOrUpdateReservation initValues={reservationData} />
                </div>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
