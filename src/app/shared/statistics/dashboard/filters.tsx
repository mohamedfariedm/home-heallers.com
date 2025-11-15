'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { PiMagnifyingGlassBold, PiXBold } from 'react-icons/pi';
import cn from '@/utils/class-names';

export interface StatisticsFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
  client_id?: string;
  reservation_statuses?: number[];
  customer_support_types?: string[];
}

interface StatisticsFiltersProps {
  onFilter: (filters: StatisticsFilters) => void;
  className?: string;
}

const reservationStatusOptions = [
  { value: '1', label: 'Reviewing' },
  { value: '2', label: 'Awaiting Confirmation' },
  { value: '3', label: 'Confirmed' },
  { value: '4', label: 'Canceled' },
  { value: '5', label: 'Completed' },
  { value: '6', label: 'Failed' },
];

const customerSupportTypeOptions = [
  { value: 'operation', label: 'Operation' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
];

export default function StatisticsFiltersComponent({
  onFilter,
  className,
}: StatisticsFiltersProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [clientId, setClientId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>([]);
  
  // Doctors and Clients lists
  const [doctors, setDoctors] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [clients, setClients] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);

  // Fetch doctors and clients on component mount
  useEffect(() => {
    fetchDoctors();
    fetchClients();
  }, []);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch('/api/doctors/list');
      const result = await response.json();
      const doctorsData = result.data || result || [];
      
      // Ensure name is an object with ar and en
      const normalizedDoctors = doctorsData.map((doctor: any) => ({
        id: doctor.id,
        name: typeof doctor.name === 'object' 
          ? { ar: doctor.name.ar || '', en: doctor.name.en || '' }
          : { ar: '', en: doctor.name || '' }
      }));
      
      setDoctors(normalizedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/clients/list');
      const result = await response.json();
      const clientsData = result.data || result || [];
      
      // Ensure name is an object with ar and en
      const normalizedClients = clientsData.map((client: any) => ({
        id: client.id,
        name: typeof client.name === 'object' 
          ? { ar: client.name.ar || '', en: client.name.en || '' }
          : { ar: '', en: client.name || '' }
      }));
      
      setClients(normalizedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleApplyFilters = () => {
    const filters: StatisticsFilters = {};
    
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (doctorId) filters.doctor_id = doctorId;
    if (clientId) filters.client_id = clientId;
    if (selectedStatuses.length > 0) {
      filters.reservation_statuses = selectedStatuses.map(s => parseInt(s));
    }
    if (selectedSupportTypes.length > 0) {
      filters.customer_support_types = selectedSupportTypes;
    }

    onFilter(filters);
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setDoctorId('');
    setClientId('');
    setSelectedStatuses([]);
    setSelectedSupportTypes([]);
    onFilter({});
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleSupportType = (type: string) => {
    setSelectedSupportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-6', className)}>
      <h3 className="mb-4 text-base font-semibold text-gray-900">Filters</h3>
      
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4">
        {/* Date From */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date From
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Select date"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Date To
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Select date"
          />
        </div>

        {/* Doctor Dropdown */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            الدكتور / Doctor
          </label>
          <SelectBox
            value={doctorId}
            onChange={setDoctorId}
            options={[
              { value: '', name: loadingDoctors ? 'جاري التحميل...' : 'اختر دكتور / Select Doctor' },
              ...doctors.map(doctor => ({
                value: String(doctor.id),
                name: doctor.name?.ar || doctor.name?.en || `Doctor ${doctor.id}`
              }))
            ]}
            placeholder="اختر دكتور / Select Doctor"
          />
        </div>

        {/* Client Dropdown */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            المريض / Client
          </label>
          <SelectBox
            value={clientId}
            onChange={setClientId}
            options={[
              { value: '', name: loadingClients ? 'جاري التحميل...' : 'اختر مريض / Select Client' },
              ...clients.map(client => ({
                value: String(client.id),
                name: client.name?.ar || client.name?.en || `Client ${client.id}`
              }))
            ]}
            placeholder="اختر مريض / Select Client"
          />
        </div>
      </div>

      {/* Reservation Statuses */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Reservation Status
        </label>
        <div className="flex flex-wrap gap-2">
          {reservationStatusOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={selectedStatuses.includes(option.value) ? 'solid' : 'outline'}
              onClick={() => toggleStatus(option.value)}
              className={cn(
                'transition-all',
                selectedStatuses.includes(option.value)
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Customer Support Types */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Customer Support Type
        </label>
        <div className="flex flex-wrap gap-2">
          {customerSupportTypeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={selectedSupportTypes.includes(option.value) ? 'solid' : 'outline'}
              onClick={() => toggleSupportType(option.value)}
              className={cn(
                'transition-all',
                selectedSupportTypes.includes(option.value)
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <Button
          onClick={handleApplyFilters}
          className="flex-1 @lg:flex-none"
        >
          <PiMagnifyingGlassBold className="me-2 h-4 w-4" />
          Apply Filters
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 @lg:flex-none"
        >
          <PiXBold className="me-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}

