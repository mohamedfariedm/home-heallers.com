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
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Determine type from item or default to 'operation'
  const supportType = item?.type || 'operation';

  // Function to fetch reservations
  const fetchReservations = async (forceRefresh = false) => {
    // If item already has reservations and we're not forcing refresh, use those
    if (!forceRefresh && item?.reservations && Array.isArray(item.reservations) && item.reservations.length > 0) {
      setReservations(item.reservations);
      setIsLoadingReservation(false);
      return;
    }

    if (!item?.patient_id && !item?.id) {
      setReservations([]);
      setIsLoadingReservation(false);
      return;
    }

    setIsLoadingReservation(true);
    const params = new URLSearchParams();
    
    // Try to fetch by lead_id first, then by patient_id
    if (item?.id) {
      params.set('lead_id', String(item.id));
    } else if (item?.patient_id) {
      params.set('patient_id', String(item.patient_id));
    }
    
    // Remove limit to get all reservations
    params.set('limit', '100');

    try {
      const response = await client.reservations.all(params.toString());
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setReservations(response.data.data);
      } else {
        // Fallback to item.reservations if API returns empty
        if (item?.reservations && Array.isArray(item.reservations)) {
          setReservations(item.reservations);
        } else {
          setReservations([]);
        }
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      // Fallback to item.reservations on error
      if (item?.reservations && Array.isArray(item.reservations)) {
        setReservations(item.reservations);
      } else {
        setReservations([]);
      }
    } finally {
      setIsLoadingReservation(false);
    }
  };

  // Use reservations from item if available (from API response) - prioritize this
  useEffect(() => {
    // Check if item has reservations array (even if empty, it means the data structure is there)
    if (item?.reservations !== undefined && Array.isArray(item.reservations)) {
      setReservations(item.reservations);
      setIsLoadingReservation(false);
    } else if (item?.patient_id || item?.id) {
      // Only fetch if reservations are not in the item
      fetchReservations();
    } else {
      setReservations([]);
      setIsLoadingReservation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.reservations, item?.patient_id, item?.id]);

  // Refetch reservations when switching to reservations tab (force refresh)
  useEffect(() => {
    if (activeTab === 1 && !selectedReservation && !isCreatingNew) {
      fetchReservations(true); // Force refresh when switching to tab
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSelectReservation = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setSelectedReservation(null);
    setIsCreatingNew(true);
  };

  const handleBackToList = () => {
    setSelectedReservation(null);
    setIsCreatingNew(false);
  };

  return (
    <div className="m-auto w-full h-[90vh] max-h-[90vh] flex flex-col rounded-lg bg-white shadow-xl dark:bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-50">
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
      <Tabs value={activeTab} onChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="flex-shrink-0 border-b border-gray-200 px-6 dark:border-gray-700">
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

        <TabPanels className="flex-1 min-h-0 overflow-y-auto">
          <TabPanel className="px-6 py-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-100/50">
              <CreateOrUpdateCustomerSupport
                initValues={item}
                type={supportType}
              />
            </div>
          </TabPanel>

          <TabPanel className="px-6 py-6">
            <div>
              {isLoadingReservation ? (
                <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-100/50">
                  <Spinner size="lg" />
                </div>
              ) : selectedReservation || isCreatingNew ? (
                <div className="space-y-4">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
                  >
                    <PiXBold className="h-4 w-4 rotate-45" />
                    <span>Back to Reservations List</span>
                  </button>
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-100/50">
                    <CreateOrUpdateReservation 
                      initValues={selectedReservation || null} 
                      leadData={item}
                      onSuccess={() => {
                        // Refresh reservations list after successful save (force refresh)
                        fetchReservations(true);
                        handleBackToList();
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reservations ({reservations.length})
                    </h3>
                    <button
                      onClick={handleCreateNew}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PiCalendarCheck className="h-4 w-4" />
                      <span>Create New Reservation</span>
                    </button>
                  </div>

                  {reservations.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <PiCalendarCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 mb-4">No reservations found for this lead</p>
                      <button
                        onClick={handleCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create First Reservation
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          onClick={() => handleSelectReservation(reservation)}
                          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">
                                  Reservation #{reservation.id}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  reservation.status === '1' || reservation.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  reservation.status === '2' || reservation.status === 2 ? 'bg-blue-100 text-blue-800' :
                                  reservation.status === '3' || reservation.status === 3 ? 'bg-green-100 text-green-800' :
                                  reservation.status === '4' || reservation.status === 4 ? 'bg-red-100 text-red-800' :
                                  reservation.status === '5' || reservation.status === 5 ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {reservation.status_label || 'Unknown'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium text-gray-700">Service:</span>
                                  <p className="text-gray-900">{reservation.service?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Doctor:</span>
                                  <p className="text-gray-900">{reservation.doctor?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Total Amount:</span>
                                  <p className="text-gray-900">{reservation.total_amount || '0'} SAR</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Sessions:</span>
                                  <p className="text-gray-900">{reservation.sessions_count || 0}</p>
                                </div>
                              </div>

                              {reservation.dates && reservation.dates.length > 0 && (
                                <div className="mt-2">
                                  <span className="font-medium text-gray-700 text-sm">Dates:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {reservation.dates.map((date: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                                      >
                                        {date.date ? new Date(date.date).toLocaleDateString() : 'N/A'} 
                                        {date.time_period && ` (${date.time_period})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="mt-2 text-xs text-gray-500">
                                Created: {reservation.created_at || 'N/A'}
                              </div>
                            </div>
                            <div className="ml-4">
                              <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                <PiCalendarCheck className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
